import { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getPrismaClient } from '../config/db';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth-middleware';
import { rewriteQueue, imageQueue, ingestionQueue, enrichQueue } from '../queue/setup';

import { v4 as uuidv4 } from 'uuid';
import { getAllAdapters } from '../adapters/registry';


const prisma = getPrismaClient();

const contentQuerySchema = z.object({
    source: z.string().optional(),
    status: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
});

const moderationActionSchema = z.object({
    action: z.enum(['APPROVE', 'REMOVE']),
    reason: z.string().optional(),
});

const userStatusSchema = z.object({
    status: z.enum(['active', 'banned', 'shadow_banned']),
    reason: z.string().optional(),
});


export async function adminRoutes(app: FastifyInstance) {
    // Apply requireAdmin to all routes in this plugin
    app.addHook('preHandler', requireAdmin as any);

    // GET /admin/content - Paginated content list
    app.get('/content', async (request: AuthenticatedRequest, reply) => {
        try {
            const query = contentQuerySchema.parse(request.query);

            const where: any = {};
            if (query.source) where.sourceId = query.source;
            if (query.status) {
                where.OR = [
                    { rewriteStatus: query.status },
                    { imageStatus: query.status },
                ];
            }

            const [items, total] = await Promise.all([
                prisma.contentItem.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: query.limit,
                    skip: query.offset,
                    select: {
                        id: true,
                        titleOriginal: true,
                        sourceId: true,
                        sourceCategory: true,
                        rewriteStatus: true,
                        imageStatus: true,
                        createdAt: true,
                    }
                }),
                prisma.contentItem.count({ where }),
            ]);

            return { items, total, limit: query.limit, offset: query.offset };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch content' });
        }
    });

    // GET /admin/content/:id - Detail view
    app.get('/content/:id', async (request: AuthenticatedRequest, reply) => {
        try {
            const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

            const item = await prisma.contentItem.findUnique({
                where: { id },
            });

            if (!item) {
                return reply.status(404).send({ error: 'Content item not found' });
            }

            return item;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch content detail' });
        }
    });

    // POST /admin/content/:id/rerun-rewrite
    app.post('/content/:id/rerun-rewrite', async (request: AuthenticatedRequest, reply) => {
        try {
            const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

            const item = await prisma.contentItem.findUnique({ where: { id } });
            if (!item) return reply.status(404).send({ error: 'Not found' });

            // Update status to pending
            await prisma.contentItem.update({
                where: { id },
                data: { rewriteStatus: 'pending' },
            });

            // Enqueue job
            const runId = `admin-rerun-${uuidv4()}`;
            await rewriteQueue.add('rewrite-item', { contentId: id, runId });

            // Audit log
            await prisma.auditLog.create({
                data: {
                    actorId: request.user!.userId,
                    action: 'RERUN_REWRITE',
                    entityType: 'ContentItem',
                    entityId: id,
                    metadata: { runId }
                }
            });

            return { ok: true, runId };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to rerun rewrite' });
        }
    });

    // POST /admin/content/:id/refetch-image
    app.post('/content/:id/refetch-image', async (request: AuthenticatedRequest, reply) => {
        try {
            const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

            const item = await prisma.contentItem.findUnique({ where: { id } });
            if (!item) return reply.status(404).send({ error: 'Not found' });

            // Update status to pending
            await prisma.contentItem.update({
                where: { id },
                data: { imageStatus: 'pending', imageStorageUrl: null },
            });

            // Enqueue job
            const runId = `admin-refetch-${uuidv4()}`;
            await imageQueue.add('resolve-image', { contentId: id, runId });

            // Audit log
            await prisma.auditLog.create({
                data: {
                    actorId: request.user!.userId,
                    action: 'REFETCH_IMAGE',
                    entityType: 'ContentItem',
                    entityId: id,
                    metadata: { runId }
                }
            });

            return { ok: true, runId };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to refetch image' });
        }
    });

    // GET /admin/jobs - Basic queue status
    app.get('/jobs', async (request: AuthenticatedRequest, reply) => {
        try {
            const { ingestionQueue, enrichQueue } = await import('../queue/setup');

            const getQueueStats = async (queue: any) => ({
                waiting: await queue.getWaitingCount(),
                active: await queue.getActiveCount(),
                completed: await queue.getCompletedCount(),
                failed: await queue.getFailedCount(),
            });

            return {
                ingestion: await getQueueStats(ingestionQueue),
                enrich: await getQueueStats(enrichQueue),
                rewrite: await getQueueStats(rewriteQueue),
                image: await getQueueStats(imageQueue),
            };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch job stats' });
        }
    });

    // ========== MODERATION ENDPOINTS ==========

    // GET /admin/moderation/comments - List pending/reported comments
    app.get('/moderation/comments', async (request: AuthenticatedRequest, reply) => {
        try {
            const { status = 'pending_review' } = z.object({
                status: z.enum(['pending_review', 'reported', 'removed_moderator', 'visible']).optional()
            }).parse(request.query);

            const where: any = {};

            if (status === 'reported') {
                where.reports = { some: { status: 'open' } };
            } else {
                where.state = status;
            }

            const items = await prisma.comment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    persona: {
                        select: { handle: true, displayName: true }
                    },
                    reports: {
                        where: { status: 'open' },
                        select: { reason: true, details: true, createdAt: true }
                    },
                    post: {
                        select: { postId: true }
                    }
                },
                take: 50,
            });

            return items;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch moderation queue' });
        }
    });

    // POST /admin/moderation/comments/:id/resolve
    app.post('/moderation/comments/:id/resolve', async (request: AuthenticatedRequest, reply) => {
        try {
            const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
            const { action, reason } = moderationActionSchema.parse(request.body);

            const comment = await prisma.comment.findUnique({ where: { id } });
            if (!comment) return reply.status(404).send({ error: 'Comment not found' });

            const newState = action === 'APPROVE' ? 'visible' : 'removed_moderator';

            await prisma.$transaction([
                prisma.comment.update({
                    where: { id },
                    data: { state: newState }
                }),
                prisma.commentReport.updateMany({
                    where: { commentId: id, status: 'open' },
                    data: { status: 'resolved' }
                }),
                prisma.auditLog.create({
                    data: {
                        actorId: request.user!.userId,
                        action: `MODERATION_COMMENT_${action}`,
                        entityType: 'Comment',
                        entityId: id,
                        metadata: { reason, previousState: comment.state }
                    }
                })
            ]);

            return { ok: true, newState };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to resolve comment' });
        }
    });

    // GET /admin/users - Search and list users
    app.get('/users', async (request: AuthenticatedRequest, reply) => {
        try {
            const { q, limit = 20, offset = 0 } = z.object({
                q: z.string().optional(),
                limit: z.coerce.number().min(1).max(100).optional(),
                offset: z.coerce.number().min(0).optional(),
            }).parse(request.query);

            const where: any = {};
            if (q) {
                where.OR = [
                    { email: { contains: q, mode: 'insensitive' } },
                    { firebaseUid: { contains: q, mode: 'insensitive' } },
                ];
            }

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    take: limit,
                    skip: offset,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: {
                            select: { personas: true, comments: true }
                        }
                    }
                }),
                prisma.user.count({ where }),
            ]);

            return { users, total };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch users' });
        }
    });

    // GET /admin/users/:id - User Detail
    app.get('/users/:id', async (request: AuthenticatedRequest, reply) => {
        try {
            const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

            const user = await prisma.user.findUnique({
                where: { id },
                include: {
                    personas: true,
                    auditLogs: {
                        take: 10,
                        orderBy: { timestamp: 'desc' }
                    }
                }
            });

            if (!user) return reply.status(404).send({ error: 'User not found' });
            return user;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch user detail' });
        }
    });

    // POST /admin/users/:id/status
    app.post('/users/:id/status', async (request: AuthenticatedRequest, reply) => {
        try {
            const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
            const { status, reason } = userStatusSchema.parse(request.body);

            const user = await prisma.user.findUnique({ where: { id } });
            if (!user) return reply.status(404).send({ error: 'User not found' });

            await prisma.$transaction([
                prisma.user.update({
                    where: { id },
                    data: { status }
                }),
                prisma.auditLog.create({
                    data: {
                        actorId: request.user!.userId,
                        action: `USER_STATUS_UPDATE_${status.toUpperCase()}`,
                        entityType: 'User',
                        entityId: id,
                        metadata: { reason, previousStatus: user.status }
                    }
                })
            ]);

            return { ok: true, status };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to update user status' });
        }
    });

    // GET /admin/personas - List personas
    app.get('/personas', async (request: AuthenticatedRequest, reply) => {
        try {
            const personas = await prisma.persona.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { email: true, status: true }
                    }
                }
            });
            return personas;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch personas' });
        }
    });

    // GET /admin/sources - List all ingestion sources
    app.get('/sources', async (request: AuthenticatedRequest, reply) => {
        try {
            const adapters = getAllAdapters();
            const sourceStates = await prisma.sourceState.findMany();

            // Get most recent run for each source
            const recentRuns = await prisma.ingestionRun.findMany({
                orderBy: { startedAt: 'desc' },
                take: 50 // Get enough to likely cover all unique sources
            });

            const sources = adapters.map(adapter => {
                const state = sourceStates.find(s => s.sourceId === adapter.id);
                // Find the latest run for this specific adapter
                const lastRun = recentRuns.find(r => r.sourceId === adapter.id);

                return {
                    id: adapter.id,
                    name: adapter.displayName,
                    categories: adapter.categories?.map(c => c.id) || [],
                    lastRunAt: state?.lastRunAt || null,
                    status: (lastRun?.status as string) || 'never_run',
                    lastError: lastRun?.errorMessage || null,
                    metadata: (state?.metadata as any) || {},
                };
            });


            return sources;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch sources' });
        }
    });

    // GET /admin/sources/:id/runs - Get run history for a source
    app.get('/sources/:id/runs', async (request: AuthenticatedRequest, reply) => {
        const { id } = request.params as { id: string };
        try {
            const runs = await prisma.ingestionRun.findMany({
                where: { sourceId: id },
                take: 50,
                orderBy: { startedAt: 'desc' },
            });
            return runs;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch runs' });
        }
    });


    // POST /admin/sources/:id/toggle - Enable/disable a source
    app.post('/sources/:id/toggle', async (request: AuthenticatedRequest, reply) => {
        const { id } = request.params as { id: string };
        try {
            const state = await prisma.sourceState.findUnique({ where: { sourceId: id } });
            const currentMetadata = (state?.metadata as any) || {};
            const isDisabled = !!currentMetadata.disabled;

            const newState = await prisma.sourceState.upsert({
                where: { sourceId: id },
                create: {
                    sourceId: id,
                    metadata: { ...currentMetadata, disabled: !isDisabled }
                },
                update: {
                    metadata: { ...currentMetadata, disabled: !isDisabled }
                }
            });

            // Audit log
            await prisma.auditLog.create({
                data: {
                    actorId: request.user!.userId,
                    action: isDisabled ? 'ENABLE_SOURCE' : 'DISABLE_SOURCE',
                    entityType: 'Source',
                    entityId: id,
                    metadata: { disabled: !isDisabled }
                }
            });

            return { ok: true, disabled: !isDisabled };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to toggle source' });
        }
    });


    // GET /admin/jobs/:queueName - List jobs for a specific queue
    app.get('/jobs/:queueName', async (request: AuthenticatedRequest, reply) => {
        const { queueName } = request.params as { queueName: string };
        const { status = 'waiting', limit = 50, offset = 0 } = request.query as any;

        const queueMap: Record<string, any> = {
            'ingestion': ingestionQueue,
            'enrich': enrichQueue,
            'rewrite': rewriteQueue,
            'image': imageQueue
        };

        const queue = queueMap[queueName];
        if (!queue) return reply.status(404).send({ error: 'Queue not found' });

        try {
            const jobs = await queue.getJobs([status], offset, offset + parseInt(limit) - 1, true);
            return jobs.map((j: any) => ({
                id: j.id,
                name: j.name,
                data: j.data,
                status: status,
                timestamp: j.timestamp,
                processedOn: j.processedOn,
                finishedOn: j.finishedOn,
                failedReason: j.failedReason,
                stacktrace: j.stacktrace,
                progress: j.progress,
                attemptsMade: j.attemptsMade,
            }));
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch jobs' });
        }
    });

    // POST /admin/jobs/:queueName/:jobId/retry - Retry a failed job
    app.post('/jobs/:queueName/:jobId/retry', async (request: AuthenticatedRequest, reply) => {
        const { queueName, jobId } = request.params as { queueName: string, jobId: string };

        const queueMap: Record<string, any> = {
            'ingestion': ingestionQueue,
            'enrich': enrichQueue,
            'rewrite': rewriteQueue,
            'image': imageQueue
        };

        const queue = queueMap[queueName];
        if (!queue) return reply.status(404).send({ error: 'Queue not found' });

        try {
            const job = await queue.getJob(jobId);
            if (!job) return reply.status(404).send({ error: 'Job not found' });

            await job.retry();

            // Audit log
            await prisma.auditLog.create({
                data: {
                    actorId: request.user!.userId,
                    action: 'RETRY_JOB',
                    entityType: 'Job',
                    entityId: `${queueName}:${jobId}`,
                    metadata: { queueName, jobId }
                }
            });

            return { ok: true };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retry job' });
        }
    });

    // POST /admin/clear-queues - Clear all failed and waiting jobs (Emergency)
    app.post('/clear-queues', async (request: AuthenticatedRequest, reply) => {
        try {
            const queues = [ingestionQueue, enrichQueue, rewriteQueue, imageQueue];

            for (const queue of queues) {
                await queue.drain(); // Removes all waiting and active jobs
                await queue.clean(0, 1000, 'failed'); // Removes all failed jobs
            }

            // Audit log
            await prisma.auditLog.create({
                data: {
                    actorId: request.user!.userId,
                    action: 'CLEAR_ALL_QUEUES',
                    entityType: 'System',
                    entityId: 'BullMQ',
                    metadata: { reason: 'Manual emergency clear' }
                }
            });

            return { ok: true, message: 'All queues cleared' };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to clear queues' });
        }
    });

    // GET /admin/stats/analytics - Aggregated performance metrics
    app.get('/stats/analytics', async (request: AuthenticatedRequest, reply) => {
        try {
            const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // 1. Ingestion Velocity
            const recentlyIngested = await prisma.contentItem.count({
                where: { createdAt: { gte: last24h } }
            });

            // 2. Rewrite Success Rate
            const totalRecentlyIngested = await prisma.contentItem.count({
                where: { createdAt: { gte: last24h } }
            });
            const successfulRewrites = await prisma.contentItem.count({
                where: {
                    createdAt: { gte: last24h },
                    rewriteStatus: 'completed'
                }
            });
            const rewriteSuccessRate = totalRecentlyIngested > 0
                ? (successfulRewrites / totalRecentlyIngested) * 100
                : 100;

            // 3. Queue Stats
            const [ingestStats, enrichStats, rewriteStats, imageStats] = await Promise.all([
                ingestionQueue.getJobCounts(),
                enrichQueue.getJobCounts(),
                rewriteQueue.getJobCounts(),
                imageQueue.getJobCounts()
            ]);

            // 4. Source Health
            const adapters = getAllAdapters();
            const sourceStates = await prisma.sourceState.findMany();
            const healthySources = sourceStates.filter(s => {
                const adapter = adapters.find(a => a.id === s.sourceId);
                return adapter && s.lastRunAt && (new Date().getTime() - s.lastRunAt.getTime() < 12 * 60 * 60 * 1000); // Healthy if run in last 12h
            }).length;

            return {
                ingestionVelocity: `${recentlyIngested} articles/24h`,
                rewriteSuccessRate: `${rewriteSuccessRate.toFixed(1)}%`,
                totalSources: adapters.length,
                healthySources,
                queues: {
                    ingestion: ingestStats,
                    enrichment: enrichStats,
                    rewriting: rewriteStats,
                    imageResolution: imageStats
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch analytics' });
        }
    });
}


