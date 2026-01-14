/**
 * Smart Fallback Image Service
 * Provides topic-aware fallback images using Unsplash.
 * 
 * Fallback Chain:
 * 1. Original Image (from API)
 * 2. Topic-Specific Unsplash Image
 * 3. Category-Based Fallback (Picsum)
 */

import { extractTopics, buildSearchQuery } from './topicExtractor';
import { searchUnsplashImage } from '../services/unsplashClient';
import { getCategoryFallbackImage, isValidImageUrl } from './categoryFallbackImages';

/**
 * Get a smart fallback image for an article.
 * 
 * @param originalUrl - The original image URL from the API
 * @param title - Article title (used for topic extraction)
 * @param categoryId - Category ID (used for final fallback)
 * @returns Promise<string> - The best available image URL
 */
export async function getSmartFallbackImage(
    originalUrl: string | null | undefined,
    title: string,
    categoryId: string | null | undefined
): Promise<string> {
    // 1. If original URL is valid, use it
    if (isValidImageUrl(originalUrl)) {
        return originalUrl!;
    }

    // 2. Try topic-specific Unsplash image
    try {
        const topics = extractTopics(title);
        if (topics.length > 0) {
            const searchQuery = buildSearchQuery(topics, categoryId || undefined);
            const unsplashUrl = await searchUnsplashImage(searchQuery);

            if (unsplashUrl) {
                return unsplashUrl;
            }
        }
    } catch (error) {
        console.warn('[SmartFallback] Unsplash lookup failed:', error);
    }

    // 3. Fall back to category-based image
    return getCategoryFallbackImage(categoryId);
}

/**
 * Synchronous version for use in map functions.
 * Uses cached Unsplash images or falls back immediately to category.
 * 
 * NOTE: This is a simplified version. For full topic-aware fallbacks,
 * use the async `getSmartFallbackImage` function.
 */
export function getSmartFallbackImageSync(
    originalUrl: string | null | undefined,
    categoryId: string | null | undefined
): string {
    if (isValidImageUrl(originalUrl)) {
        return originalUrl!;
    }
    return getCategoryFallbackImage(categoryId);
}
