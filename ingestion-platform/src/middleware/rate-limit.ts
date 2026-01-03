/**
 * Rate Limiting Middleware
 * Implements multi-layer rate limiting (user, device, IP)
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { getPrismaClient } from '../config/db';
import { AuthenticatedRequest } from './auth-middleware';

const prisma = getPrismaClient();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RateLimitRule {
  endpoint: string;
  method: string;
  newUser: RateLimitConfig;
  regular: RateLimitConfig;
  perIP: RateLimitConfig;
}

// Rate limit rules for different endpoints
const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  'POST:/v1/posts/:postId/comments': {
    endpoint: 'comment_create',
    method: 'POST',
    newUser: {
      windowMs: 20 * 1000, // 20 seconds
      maxRequests: 1,
      message: 'New accounts can post 1 comment per 20 seconds. Max 5 per day.',
    },
    regular: {
      windowMs: 10 * 1000, // 10 seconds
      maxRequests: 1,
      message: 'You can post 1 comment per 10 seconds. Max 30 per day.',
    },
    perIP: {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      maxRequests: 50,
      message: 'IP rate limit exceeded. Max 50 comments per day per IP.',
    },
  },
  'POST:/v1/comments/:commentId/vote': {
    endpoint: 'comment_vote',
    method: 'POST',
    newUser: {
      windowMs: 10 * 1000,
      maxRequests: 10,
    },
    regular: {
      windowMs: 10 * 1000,
      maxRequests: 10,
    },
    perIP: {
      windowMs: 24 * 60 * 60 * 1000,
      maxRequests: 500,
    },
  },
  'POST:/v1/comments/:commentId/report': {
    endpoint: 'comment_report',
    method: 'POST',
    newUser: {
      windowMs: 30 * 1000,
      maxRequests: 1,
    },
    regular: {
      windowMs: 30 * 1000,
      maxRequests: 1,
    },
    perIP: {
      windowMs: 24 * 60 * 60 * 1000,
      maxRequests: 20,
    },
  },
};

/**
 * Get client IP address
 */
function getClientIP(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return request.ip || request.socket.remoteAddress || 'unknown';
}

/**
 * Check if user is new (< 24 hours old)
 */
async function isNewUser(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (!user) return true;
    const age = Date.now() - user.createdAt.getTime();
    return age < 24 * 60 * 60 * 1000; // < 24 hours
  } catch {
    return true; // Assume new if we can't check
  }
}

/**
 * Check rate limit using Postgres (simple in-memory approach for MVP)
 * For production, use Redis
 */
async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  // Simple in-memory store (for MVP)
  // In production, use Redis with TTL
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // For MVP, we'll use a simple approach:
  // Store rate limit data in a table or use Postgres
  // For now, return allowed (implement Redis later)
  
  // TODO: Implement Redis-based rate limiting
  // For now, return allowed
  return {
    allowed: true,
    remaining: config.maxRequests,
    resetAt: new Date(now + config.windowMs),
  };
}

/**
 * Rate limiting middleware factory
 */
export function createRateLimit(routeKey: string) {
  return async (request: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const rule = RATE_LIMIT_RULES[routeKey];
    if (!rule) {
      return; // No rate limit for this route
    }

    const userId = request.user?.userId;
    const deviceInstallId = (request.headers['x-device-install-id'] as string) || undefined;
    const clientIP = getClientIP(request);

    // Determine if user is new
    const isNew = userId ? await isNewUser(userId) : true;
    const userConfig = isNew ? rule.newUser : rule.regular;

    // Check user-level rate limit
    if (userId) {
      const userKey = `user:${userId}:${rule.endpoint}`;
      const userLimit = await checkRateLimit(userKey, userConfig);
      if (!userLimit.allowed) {
        return reply.status(429).send({
          error: userConfig.message || 'Rate limit exceeded',
          retryAfter: Math.ceil((userLimit.resetAt.getTime() - Date.now()) / 1000),
        });
      }
    }

    // Check device-level rate limit
    if (deviceInstallId) {
      const deviceKey = `device:${deviceInstallId}:${rule.endpoint}`;
      const deviceLimit = await checkRateLimit(deviceKey, userConfig);
      if (!deviceLimit.allowed) {
        return reply.status(429).send({
          error: userConfig.message || 'Rate limit exceeded',
          retryAfter: Math.ceil((deviceLimit.resetAt.getTime() - Date.now()) / 1000),
        });
      }
    }

    // Check IP-level rate limit
    const ipKey = `ip:${clientIP}:${rule.endpoint}`;
    const ipLimit = await checkRateLimit(ipKey, rule.perIP);
    if (!ipLimit.allowed) {
      return reply.status(429).send({
        error: rule.perIP.message || 'IP rate limit exceeded',
        retryAfter: Math.ceil((ipLimit.resetAt.getTime() - Date.now()) / 1000),
      });
    }

    // All checks passed
    return;
  };
}

/**
 * Simple rate limit check (for use in services)
 * Returns true if allowed, false if rate limited
 */
export async function checkCommentRateLimit(
  userId: string,
  deviceInstallId?: string,
  clientIP?: string
): Promise<{ allowed: boolean; reason?: string }> {
  const rule = RATE_LIMIT_RULES['POST:/v1/posts/:postId/comments'];
  if (!rule) {
    return { allowed: true };
  }

  const isNew = await isNewUser(userId);
  const userConfig = isNew ? rule.newUser : rule.regular;

  // Check daily limit for new users
  if (isNew) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCommentCount = await prisma.comment.count({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    if (todayCommentCount >= 5) {
      return {
        allowed: false,
        reason: 'New accounts limited to 5 comments per day',
      };
    }
  } else {
    // Check daily limit for regular users
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCommentCount = await prisma.comment.count({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    if (todayCommentCount >= 30) {
      return {
        allowed: false,
        reason: 'Daily comment limit reached (30 comments)',
      };
    }
  }

  // Check recent comment (10s for regular, 20s for new)
  const recentWindow = isNew ? 20 * 1000 : 10 * 1000;
  const recentComment = await prisma.comment.findFirst({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - recentWindow),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (recentComment) {
    return {
      allowed: false,
      reason: isNew
        ? 'Please wait 20 seconds between comments'
        : 'Please wait 10 seconds between comments',
    };
  }

  return { allowed: true };
}
