/**
 * Explore Pool Generator
 * Creates dynamic category rails from recent + trending content
 */

import { getPrismaClient } from '../config/db';
import { ContentItem } from '@prisma/client';

const prisma = getPrismaClient();
const EXPLORE_PER_CATEGORY = 20;

export interface ExploreSection {
  categoryId: string;
  items: ContentItem[];
}

/**
 * Generate Explore Pool sections for categories
 */
export async function generateExploreSections(
  categoryIds: string[],
  limit: number = EXPLORE_PER_CATEGORY
): Promise<ExploreSection[]> {
  const sections: ExploreSection[] = [];

  for (const categoryId of categoryIds) {
    // Fetch recent + trending items for this category
    const items = await prisma.contentItem.findMany({
      where: {
        sourceId: 'inshorts',
        sourceCategory: categoryId,
        imageStorageUrl: { not: null }, // Only items with images
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 2, // Get more to score
    });

    // Score items (simplified: use recency + image quality)
    const scored = items.map(item => ({
      item,
      score: calculateScore(item),
    }));

    // Sort by score and take top N
    scored.sort((a, b) => b.score - a.score);
    const topItems = scored.slice(0, limit).map(s => s.item);

    // Cache in explore_items table
    await cacheExploreItems(categoryId, topItems);

    sections.push({
      categoryId,
      items: topItems,
    });
  }

  return sections;
}

function calculateScore(item: ContentItem): number {
  // Simplified scoring: recency + image quality
  const ageHours = (Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - ageHours * 2); // Decay over time
  
  const imageScore = item.imageStorageUrl ? 20 : 0;
  
  return recencyScore + imageScore;
}

async function cacheExploreItems(categoryId: string, items: ContentItem[]) {
  // Clear old items for this category
  await prisma.exploreItem.deleteMany({
    where: { category: categoryId },
  });

  // Insert new items
  await prisma.exploreItem.createMany({
    data: items.map((item, index) => ({
      storyId: item.id,
      category: categoryId,
      score: 100 - index, // Simple ranking
      fetchedAt: new Date(),
      source: 'recent',
    })),
  });
}
