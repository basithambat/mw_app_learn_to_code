/**
 * Abuse Detection Service
 * Implements spam detection, link detection, and abuse scoring
 */

import { getPrismaClient } from '../config/db';

const prisma = getPrismaClient();

/**
 * Detect URLs in text
 */
export function detectLinks(text: string): boolean {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,})/i;
  return urlRegex.test(text);
}

/**
 * Sanitize comment content
 */
export function sanitizeContent(text: string): string {
  // Remove control characters
  let sanitized = text.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Max length
  const MAX_LENGTH = 500;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized;
}

/**
 * Calculate abuse/spam score (0-1)
 */
export async function calculateAbuseScore(
  userId: string,
  body: string,
  deviceInstallId?: string
): Promise<number> {
  let score = 0;

  // 1) Check for repeated content
  const recentComments = await prisma.comment.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      },
    },
    select: { body: true },
    take: 10,
  });

  const similarCount = recentComments.filter(c => {
    const similarity = calculateSimilarity(c.body, body);
    return similarity > 0.8;
  }).length;

  if (similarCount > 0) {
    score += 0.3 * Math.min(similarCount / 3, 1);
  }

  // 2) Check for ALL CAPS
  const capsRatio = (body.match(/[A-Z]/g) || []).length / body.length;
  if (capsRatio > 0.5 && body.length > 20) {
    score += 0.2;
  }

  // 3) Check for emoji spam
  const emojiCount = (body.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  if (emojiCount > 5) {
    score += 0.2;
  }

  // 4) Check device risk score
  if (deviceInstallId) {
    const device = await prisma.userDevice.findFirst({
      where: {
        deviceInstallId,
        userId,
      },
    });
    if (device && device.riskScore > 70) {
      score += 0.3;
    }
  }

  // 5) Check user status
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (user && user.status === 'shadow_banned') {
    score = 1.0; // Max score for shadow banned
  }

  return Math.min(score, 1.0);
}

/**
 * Simple string similarity (Jaccard-like)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Update device risk score
 */
export async function updateDeviceRiskScore(
  deviceInstallId: string,
  userId: string,
  increment: number
): Promise<void> {
  await prisma.userDevice.upsert({
    where: {
      userId_deviceInstallId: {
        userId,
        deviceInstallId,
      },
    },
    create: {
      userId,
      deviceInstallId,
      riskScore: Math.min(increment, 100),
      lastSeenAt: new Date(),
    },
    update: {
      riskScore: {
        increment: Math.min(increment, 100),
      },
      lastSeenAt: new Date(),
    },
  });
}
