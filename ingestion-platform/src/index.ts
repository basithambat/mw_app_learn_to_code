import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { getEnv, assertProdFirebaseConfig, isMediaEnabled } from './config/env';
import { getPrismaClient } from './config/db';
import { getRedisClient } from './config/redis';
import { ingestionQueue } from './queue/setup';
import { getAllAdapters, getAdapter } from './adapters/registry';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { startScheduler } from './scheduler';
import { generateTodayEdition, MAX_DAILY_ADDITIONS } from './services/edition-generator';
import { generateExploreSections } from './services/explore-generator';
import { updateUserProfile, uploadProfilePicture } from './services/profile-service';
import { MediaService } from './media/media-service';
import multipart from '@fastify/multipart';
import { initFirebaseAdmin, verifyFirebaseToken } from './config/firebase-admin';
import { upsertUserAndPersonas, deleteUserAndPersonas } from './services/persona-service';
import {
  createComment,
  getComments,
  voteComment,
  editComment,
  deleteComment,
  reportComment,
  blockUser,
} from './services/comment-service';
import { requireAuth, AuthenticatedRequest } from './middleware/auth-middleware';
import { adminRoutes } from './routes/admin';
import { registerFallbackImageRoute } from './routes/fallback-image';




const app = Fastify({
  logger: true,
  trustProxy: true,
});

console.log('--- DEPLOYMENT VERIFICATION ID: 1768407400 ---');

// Register CORS
app.register(fastifyCors, {
  origin: process.env.NODE_ENV === 'production'
    ? [
      'https://whatsay.app',
      'https://studio.whatsay.app',
      'https://whatsay-app-three.vercel.app',
      'http://localhost:8081',  // Expo web dev server
      'http://localhost:8082',  // Alternative dev server port
    ]
    : true,
  credentials: true,
});

// P1-07 FIX: Enforce Rate Limiting (Redis-backed, Fail-open)
const env = getEnv();
app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
  redis: getRedisClient(),
  // Cloud Run proxy correctness - use X-Forwarded-For
  keyGenerator: (req) => {
    const xff = req.headers['x-forwarded-for'];
    const ip = Array.isArray(xff) ? xff[0] : xff?.toString().split(',')[0]?.trim();
    return ip || req.ip;
  },
  continueExceeding: true,
  skipOnError: true, // Fail-open (Staff requirement)
});



const prisma = getPrismaClient();

// Schemas
const jobRunSchema = z.object({
  sourceId: z.string(),
  category: z.string().optional(),
});

const feedQuerySchema = z.object({
  source: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  cursor: z.string().optional(),
});

// Routes

// Health check endpoint - P1-05: Now includes scheduler and media status
app.get('/health', async () => {
  const currentEnv = getEnv();
  const isProd = currentEnv.NODE_ENV === 'production';
  const schedulerEnabled = isProd ? true : process.env.ENABLE_SCHEDULER !== 'false';
  const mediaEnabled = isMediaEnabled(currentEnv);

  try {
    // Quick DB check
    await prisma.$queryRaw`SELECT 1`;

    // P1-05: Get last run stats for visibility
    const lastRuns = await prisma.sourceState.findMany({
      select: {
        sourceId: true,
        lastRunAt: true,
      }
    });

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      scheduler: {
        enabled: schedulerEnabled,
        sources: lastRuns,
      },
      mediaEnabled,
      environment: currentEnv.NODE_ENV,
    };
  } catch (error) {
    app.log.error({ err: error }, 'Health check failed');
    throw new Error('Unhealthy');
  }
});

// GET /api/sources
app.get('/api/sources', async () => {
  const adapters = getAllAdapters();
  return {
    sources: adapters.map((a) => ({
      id: a.id,
      displayName: a.displayName,
      categories: a.categories || [],
    })),
  };
});

// ADMIN: Reset Semaphore (Temporary for stabilization)
app.post('/api/admin/system/reset-semaphore', async (request, reply) => {
  const { getDbSemaphore } = require('./lib/dbSemaphore');
  const dbSemaphore = getDbSemaphore();
  await dbSemaphore.reset();
  return { status: 'success', message: 'DbSemaphore reset' };
});

// POST /api/jobs/run
app.post('/api/jobs/run', async (request, reply) => {
  try {
    const body = jobRunSchema.parse(request.body);
    const adapter = getAdapter(body.sourceId);

    if (!adapter) {
      return reply.status(404).send({ error: 'Source not found' });
    }

    const runId = uuidv4();

    await ingestionQueue.add('ingest-source', {
      sourceId: body.sourceId,
      category: body.category,
      runId,
    });

    // Create initial run record (upsert to avoid duplicates)
    await prisma.ingestionRun.upsert({
      where: { runId },
      create: {
        id: uuidv4(),
        runId,
        sourceId: body.sourceId,
        category: body.category,
        status: 'queued',
      },
      update: {
        status: 'queued', // Reset if re-queued
      },
    });

    return { runId, status: 'queued' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Validation error', details: error.errors });
    }
    throw error;
  }
});

// GET /api/health
app.get('/api/health', async (request, reply) => {
  try {
    // Check DB
    await prisma.$queryRaw`SELECT 1`;
    // Check Redis
    const redis = getRedisClient();
    await redis.ping();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        server: 'online'
      }
    };
  } catch (error) {
    app.log.error(error);
    return reply.status(503).send({
      status: 'error',
      message: 'Service Unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/feed
app.get('/api/feed', async (request, reply) => {
  try {
    const query = feedQuerySchema.parse(request.query);

    // Disable caching for feed
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const where: any = {};
    if (query.source && query.source !== 'all') {
      where.sourceId = query.source;
    }
    if (query.category && query.category !== 'all') {
      where.sourceCategory = query.category;
    }

    // Cursor pagination
    let skip = 0;
    let cursorObj = undefined;

    if (query.cursor) {
      skip = 1;
      cursorObj = { id: query.cursor };
    }

    const items = await prisma.contentItem.findMany({
      take: query.limit + 1, // Get one more to check for next page
      skip,
      cursor: cursorObj,
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        titleOriginal: true,
        summaryOriginal: true,
        titleRewritten: true,
        summaryRewritten: true,
        sourceId: true,
        sourceCategory: true,
        sourceUrl: true,
        publishedAt: true,
        imageStorageUrl: true,
        ogImageUrl: true,
        imageSelectedUrl: true,
        imageStatus: true,
        createdAt: true,
      },
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > query.limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return {
      items: items.map(item => ({
        id: item.id,
        title: item.titleRewritten || item.titleOriginal,
        subtext: item.summaryRewritten || item.summaryOriginal,
        source_id: item.sourceId,
        category: item.sourceCategory, // Map to 'category' for app compatibility
        source_category: item.sourceCategory,
        source_url: item.sourceUrl,
        image_url: item.imageStorageUrl || item.ogImageUrl || item.imageSelectedUrl || null,
        image_storage_url: item.imageStorageUrl,
        og_image_url: item.ogImageUrl,
        published_at: item.publishedAt || item.createdAt,
        is_rewritten: !!item.titleRewritten,
      })),
      nextCursor,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Validation error', details: error.errors });
    }
    throw error;
  }
});

// Register Admin Routes
app.register(adminRoutes, { prefix: '/api/admin' });

// Register Smart Fallback Image Route
registerFallbackImageRoute(app);



// ========== Better Inshorts: v2 Discover API ==========

const bootstrapQuerySchema = z.object({
  timezone: z.string().default('Asia/Kolkata'),
});

// GET /v2/discover/bootstrap
app.get('/v2/discover/bootstrap', async (request, reply) => {
  try {
    const query = bootstrapQuerySchema.parse(request.query);
    const userId = (request.headers['x-user-id'] as string) || 'anonymous';

    // Get today's date in user's timezone
    const now = new Date();
    const dateLocal = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Generate or get Today Edition
    const editionResult = await generateTodayEdition(userId, query.timezone, dateLocal);

    // Get edition record
    const edition = await prisma.edition.findUnique({
      where: { editionId: editionResult.editionId },
    });

    if (!edition) {
      return reply.status(500).send({ error: 'Failed to create edition' });
    }

    // Get user preferences
    const preferences = await prisma.categoryPreference.findMany({
      where: { userId },
      orderBy: { manualOrder: 'asc' },
    });

    // Get category signals
    const categorySignals = await prisma.categoryRankingSignal.findMany({
      where: { userId },
    });

    // Generate Explore sections
    const categoryIds = preferences
      .filter(p => p.enabled)
      .map(p => p.categoryId);

    const exploreSections = await generateExploreSections(categoryIds);

    // Calculate section order (manual + auto hybrid)
    const sectionOrder = calculateSectionOrder(preferences, categorySignals);

    return {
      edition: {
        editionId: edition.editionId,
        dateLocal: edition.dateLocal,
        timezone: edition.timezone,
        publishedAt: edition.publishedAt.getTime(),
        cutoffAt: edition.cutoffAt.getTime(),
        mode: edition.mode,
        version: edition.version,
      },
      today: {
        stories: editionResult.stories.map(mapStory),
        editionStories: editionResult.editionStories,
      },
      explore: {
        sections: exploreSections.map((s: { categoryId: string; items: any[] }) => ({
          categoryId: s.categoryId,
          items: s.items.map(mapStory),
        })),
        sectionOrder,
      },
      preferences: preferences.map(p => ({
        categoryId: p.categoryId,
        enabled: p.enabled,
        manualOrder: p.manualOrder,
        lockOrder: p.lockOrder,
      })),
      categorySignals: categorySignals.map(s => ({
        categoryId: s.categoryId,
        autoScore: s.autoScore,
        lastUpdatedAt: s.lastUpdatedAt.getTime(),
      })),
      serverTime: Date.now(),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Validation error', details: error.errors });
    }
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

const refreshQuerySchema = z.object({
  editionId: z.string(),
  since: z.coerce.number().optional(),
  editionVersion: z.coerce.number().optional(),
});

// GET /v2/discover/refresh
app.get('/v2/discover/refresh', async (request, reply) => {
  try {
    const query = refreshQuerySchema.parse(request.query);
    const userId = (request.headers['x-user-id'] as string) || 'anonymous';

    const edition = await prisma.edition.findUnique({
      where: { editionId: query.editionId },
      include: {
        editionStories: {
          include: { story: true },
          orderBy: { rank: 'asc' },
        },
      },
    });

    if (!edition) {
      return reply.status(404).send({ error: 'Edition not found' });
    }

    // Check for breaking additions (simplified: check for new high-importance items)
    const since = query.since ? new Date(query.since) : edition.publishedAt;
    const newBreakingItems = await prisma.contentItem.findMany({
      where: {
        sourceId: 'inshorts',
        createdAt: { gt: since },
        // In real implementation, filter by importance >= BREAKING_THRESHOLD
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Add breaking items to edition (if not already present)
    const addedStories: any[] = [];
    const addedEditionStories: any[] = [];

    for (const item of newBreakingItems.slice(0, MAX_DAILY_ADDITIONS)) {
      const exists = edition.editionStories.some(es => es.storyId === item.id);
      if (!exists) {
        const maxRank = Math.max(...edition.editionStories.map(es => es.rank), 0);
        await prisma.editionStory.create({
          data: {
            editionId: query.editionId,
            storyId: item.id,
            rank: maxRank + 1,
            addedAt: new Date(),
            reason: 'breaking',
            updateCount: 0,
            lastUpdatedAt: new Date(),
          },
        });
        addedStories.push(mapStory(item));
        addedEditionStories.push({
          storyId: item.id,
          rank: maxRank + 1,
          reason: 'breaking',
        });
      }
    }

    // Check for story updates (simplified)
    const updatedStories: any[] = [];
    const updatedEditionStories: any[] = [];

    // Refresh Explore sections
    const preferences = await prisma.categoryPreference.findMany({
      where: { userId, enabled: true },
    });
    const categoryIds = preferences.map(p => p.categoryId);
    const exploreSections = await generateExploreSections(categoryIds);
    const sectionOrder = calculateSectionOrder(
      preferences,
      await prisma.categoryRankingSignal.findMany({ where: { userId } })
    );

    // Increment version if breaking additions
    const newVersion = addedStories.length > 0 ? edition.version + 1 : edition.version;
    if (newVersion > edition.version) {
      await prisma.edition.update({
        where: { editionId: query.editionId },
        data: { version: newVersion },
      });
    }

    return {
      editionId: query.editionId,
      editionVersion: newVersion,
      today: {
        added: {
          stories: addedStories,
          editionStories: addedEditionStories,
        },
        updated: {
          stories: updatedStories,
          editionStories: updatedEditionStories,
        },
        removed: [], // Never remove silently
      },
      explore: {
        sections: exploreSections.map((s: { categoryId: string; items: any[] }) => ({
          categoryId: s.categoryId,
          items: s.items.map(mapStory),
        })),
      },
      sectionOrder,
      serverTime: Date.now(),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Validation error', details: error.errors });
    }
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Helper functions
function mapStory(item: any) {
  return {
    storyId: item.id,
    canonicalKey: item.hash,
    title: item.titleRewritten || item.titleOriginal,
    summary: item.summaryRewritten || item.summaryOriginal,
    imageUrl: item.imageStorageUrl || null,
    category: item.sourceCategory || 'general',
    importance: 50, // Default, should be calculated
    sourceName: item.sourceId,
    sourceUrl: item.sourceUrl,
    publishedAt: item.publishedAt?.getTime() || item.createdAt.getTime(),
  };
}

function calculateSectionOrder(
  preferences: Array<{ categoryId: string; manualOrder: number; lockOrder: boolean }>,
  signals: Array<{ categoryId: string; autoScore: number }>
): string[] {
  // Manual wins if lockOrder is true
  const locked = preferences.filter(p => p.lockOrder);
  if (locked.length > 0) {
    return locked.sort((a, b) => a.manualOrder - b.manualOrder).map(p => p.categoryId);
  }

  // Hybrid: manual weight 0.85 if user customized, else 0.3
  const hasCustomized = preferences.some(p => p.manualOrder !== 999);
  const wManual = hasCustomized ? 0.85 : 0.3;
  const wAuto = 1 - wManual;

  const scored = preferences.map(pref => {
    const signal = signals.find(s => s.categoryId === pref.categoryId);
    const autoScore = signal?.autoScore || 0;
    const manualScore = 1000 - pref.manualOrder; // Higher order = higher score
    const finalScore = wManual * manualScore + wAuto * autoScore;
    return { categoryId: pref.categoryId, score: finalScore };
  });

  return scored.sort((a, b) => b.score - a.score).map(s => s.categoryId);
}

// ========== Profile API Endpoints ==========

const profileUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  timezone: z.string().optional(),
});

// GET /v2/user/profile
app.get('/v2/user/profile', async (request, reply) => {
  try {
    const userId = (request.headers['x-user-id'] as string) || 'anonymous';

    // Get user preferences
    const preferences = await prisma.categoryPreference.findMany({
      where: { userId },
      orderBy: { manualOrder: 'asc' },
    });

    // Get category signals
    const signals = await prisma.categoryRankingSignal.findMany({
      where: { userId },
    });

    return {
      userId,
      preferences: preferences.map(p => ({
        categoryId: p.categoryId,
        enabled: p.enabled,
        manualOrder: p.manualOrder,
        lockOrder: p.lockOrder,
      })),
      categorySignals: signals.map(s => ({
        categoryId: s.categoryId,
        autoScore: s.autoScore,
        lastUpdatedAt: s.lastUpdatedAt.getTime(),
      })),
    };
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// PUT /v2/user/profile
app.put('/v2/user/profile', async (request, reply) => {
  try {
    const userId = (request.headers['x-user-id'] as string) || 'anonymous';
    const body = profileUpdateSchema.parse(request.body);

    // Update profile (in real implementation, sync with Supabase)
    await updateUserProfile(userId, body);

    return { success: true, userId };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Validation error', details: error.errors });
    }
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// POST /v2/user/profile-picture
app.post('/v2/user/profile-picture', async (request, reply) => {
  try {
    const userId = (request.headers['x-user-id'] as string) || 'anonymous';

    // Handle multipart form data
    const data = await (request as any).file();

    if (!data) {
      return reply.status(400).send({ error: 'No file provided' });
    }

    const buffer = Buffer.from(await data.toBuffer());
    const contentType = data.mimetype || 'image/jpeg';
    const extension = contentType.split('/')[1] || 'jpg';

    // Upload to S3
    const storageUrl = await uploadProfilePicture(userId, buffer, contentType, extension);

    return {
      success: true,
      profilePictureUrl: storageUrl,
    };
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// POST /v2/user/preferences (Save category preferences)
app.post('/v2/user/preferences', async (request, reply) => {
  try {
    const userId = (request.headers['x-user-id'] as string) || 'anonymous';
    const body = z.object({
      timezone: z.string().optional(),
      categories: z.array(z.object({
        categoryId: z.string(),
        enabled: z.boolean(),
        manualOrder: z.number(),
        lockOrder: z.boolean().optional(),
      })),
    }).parse(request.body);

    // Upsert preferences
    for (const cat of body.categories) {
      await prisma.categoryPreference.upsert({
        where: {
          userId_categoryId: {
            userId: userId,
            categoryId: cat.categoryId,
          },
        },
        create: {
          userId,
          categoryId: cat.categoryId,
          enabled: cat.enabled,
          manualOrder: cat.manualOrder,
          lockOrder: cat.lockOrder || false,
        },
        update: {
          enabled: cat.enabled,
          manualOrder: cat.manualOrder,
          lockOrder: cat.lockOrder || false,
        },
      });
    }

    return {
      ok: true,
      appliesFrom: 'next_refresh_and_tomorrow',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Validation error', details: error.errors });
    }
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

const activityQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
});

// GET /v2/user/activity
app.get('/v2/user/activity', async (request, reply) => {
  try {
    const userId = (request.headers['x-user-id'] as string) || 'anonymous';
    const query = activityQuerySchema.parse(request.query);
    const limit = query.limit || 50;

    // For now, return empty - this should come from Supabase comments table
    // In future, we can track article interactions in ingestion platform
    return {
      activities: [],
      limit,
    };
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// ========== Authentication Endpoints ==========

// POST /auth/verify - Verify Firebase token and create/update user + personas
app.post('/auth/verify', async (request, reply) => {
  try {
    const authHeader = (request.headers.authorization as string) || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return reply.status(401).send({ ok: false, error: 'Missing Bearer token' });
    }

    // Verify Firebase token
    const decoded = await verifyFirebaseToken(token);

    // Upsert user and create personas
    const result = await upsertUserAndPersonas(decoded);

    return {
      ok: true,
      user: {
        id: result.user.id,
        firebaseUid: result.user.firebaseUid,
        email: result.user.email,
        phone: result.user.phone,
        emailVerified: result.user.emailVerified,
        phoneVerified: result.user.phoneVerified,
      },
      personas: result.personas.map(p => ({
        id: p.id,
        type: p.type,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        badge: p.badge,
        isDefault: p.isDefault,
      })),
    };
  } catch (error: any) {
    app.log.error(error);
    return reply.status(401).send({ ok: false, error: error.message || 'Unauthorized' });
  }
});

// DELETE /auth/user - Delete user account (requires auth)
app.delete('/auth/user', async (request, reply) => {
  try {
    const authHeader = (request.headers.authorization as string) || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return reply.status(401).send({ error: 'Missing Bearer token' });
    }

    const decoded = await verifyFirebaseToken(token);

    // Find user by Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    await deleteUserAndPersonas(user.id);

    return { success: true };
  } catch (error: any) {
    app.log.error(error);
    return reply.status(500).send({ error: error.message || 'Internal server error' });
  }
});

// GET /auth/personas - Get user's personas (requires auth)
app.get('/auth/personas', async (request, reply) => {
  try {
    const authHeader = (request.headers.authorization as string) || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return reply.status(401).send({ error: 'Missing Bearer token' });
    }

    const decoded = await verifyFirebaseToken(token);

    // Find user by Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const personas = await prisma.persona.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return {
      personas: personas.map(p => ({
        id: p.id,
        type: p.type,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        badge: p.badge,
        isDefault: p.isDefault,
      })),
    };
  } catch (error: any) {
    app.log.error(error);
    return reply.status(401).send({ error: error.message || 'Unauthorized' });
  }
});

// ========== Comment Endpoints ==========

const createCommentSchema = z.object({
  personaId: z.string(),
  body: z.string().min(1).max(500),
  parentId: z.string().optional(),
});

// POST /v1/posts/:postId/comments - Create comment
app.post<{ Params: { postId: string }; Body: any }>(
  '/v1/posts/:postId/comments',
  async (request: AuthenticatedRequest, reply) => {
    try {
      await requireAuth(request, reply);
      if (reply.sent) return;

      const postId = (request.params as any).postId;
      const body = createCommentSchema.parse(request.body);
      const userId = request.user!.userId;
      const deviceInstallId = (request.headers['x-device-install-id'] as string) || undefined;

      const comment = await createComment({
        postId,
        userId,
        personaId: body.personaId,
        body: body.body,
        parentId: body.parentId,
        deviceInstallId,
      });

      return {
        ok: true,
        comment,
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      app.log.error(error);
      return reply.status(400).send({ error: error.message || 'Failed to create comment' });
    }
  }
);

const listCommentsQuerySchema = z.object({
  sort: z.enum(['new', 'top']).default('new'),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// GET /v1/posts/:postId/comments - List comments
app.get<{ Params: { postId: string }; Querystring: any }>(
  '/v1/posts/:postId/comments',
  async (request: AuthenticatedRequest, reply) => {
    try {
      const postId = (request.params as any).postId;
      const query = listCommentsQuerySchema.parse(request.query);

      // Get userId if authenticated (for filtering blocked users)
      let userId: string | undefined;
      const authHeader = (request.headers.authorization as string) || '';
      if (authHeader.startsWith('Bearer ')) {
        try {
          await requireAuth(request, reply);
          if (!reply.sent && request.user) {
            userId = request.user.userId;
          }
        } catch {
          // Not authenticated - that's OK for reading comments
        }
      }

      const result = await getComments(postId, {
        sort: query.sort,
        cursor: query.cursor,
        limit: query.limit,
        userId,
      });

      return {
        ok: true,
        comments: result.comments,
        nextCursor: result.nextCursor,
      };
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch comments' });
    }
  }
);

const voteSchema = z.object({
  vote: z.enum(['up', 'down', 'none']),
});

// POST /v1/comments/:commentId/vote - Vote comment
app.post<{ Params: { commentId: string }; Body: any }>(
  '/v1/comments/:commentId/vote',
  async (request: AuthenticatedRequest, reply) => {
    try {
      await requireAuth(request, reply);
      if (reply.sent) return;

      const commentId = (request.params as any).commentId;
      const body = voteSchema.parse(request.body);
      const userId = request.user!.userId;

      const result = await voteComment(commentId, userId, body.vote);

      return {
        ok: true,
        ...result,
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      app.log.error(error);
      return reply.status(400).send({ error: error.message || 'Failed to vote' });
    }
  }
);

const editCommentSchema = z.object({
  body: z.string().min(1).max(500),
});

// PATCH /v1/comments/:commentId - Edit comment
app.patch<{ Params: { commentId: string }; Body: any }>(
  '/v1/comments/:commentId',
  async (request: AuthenticatedRequest, reply) => {
    try {
      await requireAuth(request, reply);
      if (reply.sent) return;

      const commentId = (request.params as any).commentId;
      const body = editCommentSchema.parse(request.body);
      const userId = request.user!.userId;

      const comment = await editComment(commentId, userId, body.body);

      return {
        ok: true,
        comment,
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      app.log.error(error);
      return reply.status(400).send({ error: error.message || 'Failed to edit comment' });
    }
  }
);

// DELETE /v1/comments/:commentId - Delete comment
app.delete<{ Params: { commentId: string } }>(
  '/v1/comments/:commentId',
  async (request: AuthenticatedRequest, reply) => {
    try {
      await requireAuth(request, reply);
      if (reply.sent) return;

      const commentId = (request.params as any).commentId;
      const userId = request.user!.userId;

      await deleteComment(commentId, userId);

      return {
        ok: true,
      };
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({ error: error.message || 'Failed to delete comment' });
    }
  }
);

const reportSchema = z.object({
  reason: z.enum(['spam', 'hate', 'harassment', 'misinfo', 'other']),
  details: z.string().optional(),
});

// POST /v1/comments/:commentId/report - Report comment
app.post<{ Params: { commentId: string }; Body: any }>(
  '/v1/comments/:commentId/report',
  async (request: AuthenticatedRequest, reply) => {
    try {
      await requireAuth(request, reply);
      if (reply.sent) return;

      const commentId = (request.params as any).commentId;
      const body = reportSchema.parse(request.body);
      const userId = request.user!.userId;

      await reportComment(commentId, userId, body.reason, body.details);

      return {
        ok: true,
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      app.log.error(error);
      return reply.status(400).send({ error: error.message || 'Failed to report comment' });
    }
  }
);

// POST /v1/users/:userId/block - Block user
app.post<{ Params: { userId: string } }>(
  '/v1/users/:userId/block',
  async (request: AuthenticatedRequest, reply) => {
    try {
      await requireAuth(request, reply);
      if (reply.sent) return;

      const blockedUserId = (request.params as any).userId;
      const blockerUserId = request.user!.userId;

      await blockUser(blockerUserId, blockedUserId);

      return {
        ok: true,
      };
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({ error: error.message || 'Failed to block user' });
    }
  }
);

// Start server
const start = async () => {
  const env = getEnv();
  try {
    // P1-02 FIX: Fail fast if Firebase credentials missing in production
    assertProdFirebaseConfig(env);

    // Initialize Firebase Admin
    initFirebaseAdmin();

    // Log media status at startup
    const mediaEnabled = isMediaEnabled(env);
    if (!mediaEnabled) {
      console.warn('⚠️  Media/S3 not configured. Image processing disabled. source_image_url will be used.');
    } else {
      console.log('✅ Media/S3 configured and enabled.');
    }

    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`✅ API Server listening on port ${env.PORT}`);
    console.log(`📡 Feed endpoint: http://localhost:${env.PORT}/api/feed`);
    console.log(`📋 Sources endpoint: http://localhost:${env.PORT}/api/sources`);

    // P1-05 FIX: Scheduler always on in production, optional in dev/test
    const isProd = env.NODE_ENV === 'production';
    const schedulerEnabled = isProd ? true : process.env.ENABLE_SCHEDULER !== 'false';

    if (!schedulerEnabled) {
      console.warn('⚠️  Scheduler disabled (non-prod only). Set ENABLE_SCHEDULER=true to enable.');
    } else {
      startScheduler();
      console.log(`⏰ Scheduler enabled - jobs will run hourly`);
    }

    // Start Workers (Monolith mode - background processing)
    // Pass false to disable inner health check server as Fastify is handling it
    const { startWorkers } = require('./worker');
    startWorkers(false).then(() => {
      app.log.info('Background workers started successfully');
    }).catch((err: any) => {
      app.log.error(err, 'Failed to start background workers');
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
