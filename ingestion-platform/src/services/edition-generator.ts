/**
 * Today Edition Generator
 * Creates stable daily editions with 12-15 stories based on must-know + preferences
 */

import { getPrismaClient } from '../config/db';
import { ContentItem } from '@prisma/client';

const prisma = getPrismaClient();

export const DAILY_EDITION_SIZE = 12;
export const MUST_KNOW_COUNT = 5;
export const BREAKING_THRESHOLD = 85;
export const MAX_DAILY_ADDITIONS = 5;

export interface EditionGenerationResult {
  editionId: string;
  stories: ContentItem[];
  editionStories: Array<{
    storyId: string;
    rank: number;
    reason: string;
  }>;
}

/**
 * Generate Today Edition for a user
 */
export async function generateTodayEdition(
  userId: string,
  timezone: string,
  dateLocal: string
): Promise<EditionGenerationResult> {
  const editionId = dateLocal; // "YYYY-MM-DD"
  
  // Check if edition already exists
  const existing = await prisma.edition.findUnique({
    where: { editionId },
  });

  if (existing && existing.mode === 'fixed') {
    // Return existing edition
    return getExistingEdition(editionId);
  }

  // Get user preferences
  const preferences = await prisma.categoryPreference.findMany({
    where: { userId, enabled: true },
    orderBy: { manualOrder: 'asc' },
  });

  // Get must-know stories (importance >= 85, top 5)
  const mustKnowStories = await prisma.contentItem.findMany({
    where: {
      sourceId: 'inshorts',
      // We'll calculate importance from existing data
      // For now, use recent high-quality items
    },
    orderBy: { createdAt: 'desc' },
    take: MUST_KNOW_COUNT * 2, // Get more to filter
  });

  // Filter and rank must-know (simplified - use recent important items)
  const selectedMustKnow = mustKnowStories.slice(0, MUST_KNOW_COUNT);

  // Allocate remaining slots by category preferences
  const remainingSlots = DAILY_EDITION_SIZE - MUST_KNOW_COUNT;
  const categoryQuotas = calculateCategoryQuotas(preferences, remainingSlots);

  const categoryStories: ContentItem[] = [];
  
  for (const pref of preferences.slice(0, 7)) { // Top 7 categories
    const quota = categoryQuotas[pref.categoryId] || 0;
    if (quota > 0) {
      const stories = await prisma.contentItem.findMany({
        where: {
          sourceId: 'inshorts',
          sourceCategory: pref.categoryId,
        },
        orderBy: { createdAt: 'desc' },
        take: quota * 2, // Get more to filter
      });
      categoryStories.push(...stories.slice(0, quota));
    }
  }

  // Combine and dedupe
  const allStories = [...selectedMustKnow, ...categoryStories];
  const uniqueStories = Array.from(
    new Map(allStories.map(s => [s.id, s])).values()
  ).slice(0, DAILY_EDITION_SIZE);

  // Create edition
  const cutoffAt = new Date(dateLocal);
  cutoffAt.setHours(23, 59, 59, 999);

  await prisma.edition.upsert({
    where: { editionId },
    create: {
      editionId,
      dateLocal,
      timezone,
      publishedAt: new Date(),
      cutoffAt,
      mode: 'semi_live',
      version: 1,
    },
    update: {},
  });

  // Create edition stories
  const editionStories = uniqueStories.map((story, index) => ({
    editionId,
    storyId: story.id,
    rank: index + 1,
    addedAt: new Date(),
    reason: index < MUST_KNOW_COUNT ? 'must_know' : 'personalized',
    updateCount: 0,
    lastUpdatedAt: new Date(),
  }));

  await prisma.editionStory.createMany({
    data: editionStories,
    skipDuplicates: true,
  });

  return {
    editionId,
    stories: uniqueStories,
    editionStories: editionStories.map(es => ({
      storyId: es.storyId,
      rank: es.rank,
      reason: es.reason,
    })),
  };
}

function calculateCategoryQuotas(
  preferences: Array<{ categoryId: string; manualOrder: number }>,
  totalSlots: number
): Record<string, number> {
  const quotas: Record<string, number> = {};
  
  // Top 3 categories: 2 each
  // Next 4: 1 each
  // Remainder: distribute
  
  for (let i = 0; i < Math.min(3, preferences.length); i++) {
    quotas[preferences[i].categoryId] = 2;
  }
  
  for (let i = 3; i < Math.min(7, preferences.length); i++) {
    quotas[preferences[i].categoryId] = 1;
  }
  
  return quotas;
}

async function getExistingEdition(editionId: string): Promise<EditionGenerationResult> {
  const edition = await prisma.edition.findUnique({
    where: { editionId },
    include: {
      editionStories: {
        include: { story: true },
        orderBy: { rank: 'asc' },
      },
    },
  });

  if (!edition) {
    throw new Error(`Edition ${editionId} not found`);
  }

  return {
    editionId,
    stories: edition.editionStories.map(es => es.story),
    editionStories: edition.editionStories.map(es => ({
      storyId: es.storyId,
      rank: es.rank,
      reason: es.reason,
    })),
  };
}
