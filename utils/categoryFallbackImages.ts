/**
 * Category fallback images
 * These images are used when the original article image is not available.
 * Each category has a unique fallback image that can repeat for all cards in that category.
 */

// Using Picsum Photos with seed-based approach for consistent category images
// Format: https://picsum.photos/seed/{seed}/{width}/{height}
const PICSUM_BASE = 'https://picsum.photos/seed';

/**
 * Category-specific seed numbers for consistent images
 * Each category gets a unique seed so the same image is always returned
 */
const CATEGORY_SEEDS: Record<string, number> = {
  'all': 1000,
  'business': 2000,
  'sports': 3000,
  'technology': 4000,
  'tech': 4000,
  'entertainment': 5000,
  'science': 6000,
  'health': 7000,
  'world': 8000,
  'automobile': 9000,
  'international': 8000,
  'breaking-news': 10000,
  'breaking': 10000,
  'finance': 11000,
  'lifestyle': 12000,
  'opinions': 13000,
  'politics': 14000,
  'startup': 15000,
  'travel': 16000,
};

/**
 * Get fallback image URL for a category
 * @param categoryId - The category ID
 * @param width - Image width (default: 800)
 * @param height - Image height (default: 600)
 * @returns Fallback image URL
 */
export const getCategoryFallbackImage = (
  categoryId: string | null | undefined,
  width: number = 800,
  height: number = 600
): string => {
  const safeCategoryId = (categoryId || 'all').toLowerCase();
  const seed = CATEGORY_SEEDS[safeCategoryId] || CATEGORY_SEEDS['all'];
  
  // Use Picsum Photos with seed-based approach
  // This ensures the same image is always returned for the same category
  return `${PICSUM_BASE}/${seed}/${width}/${height}`;
};

/**
 * Check if an image URL is valid (not null/empty)
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  return !!url && typeof url === 'string' && url.trim().length > 0;
};

/**
 * Get image URL with fallback
 * @param originalUrl - Original image URL from API
 * @param categoryId - Category ID for fallback
 * @param width - Fallback image width
 * @param height - Fallback image height
 * @returns Image URL (original or fallback)
 */
export const getImageUrlWithFallback = (
  originalUrl: string | null | undefined,
  categoryId: string | null | undefined,
  width: number = 800,
  height: number = 600
): string => {
  if (isValidImageUrl(originalUrl)) {
    return originalUrl;
  }
  return getCategoryFallbackImage(categoryId, width, height);
};
