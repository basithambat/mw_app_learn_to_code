import APIService, { APICaller } from "./APIKit";
import * as Device from 'expo-device';
import { truncateTo60Words } from "@/utils/textHelper";
import { getImageUrlWithFallback } from "@/utils/categoryFallbackImages";

// Ingestion Platform API Base URL
// For local development, use your computer's IP address for physical devices
// For simulator/emulator, localhost works
// For production, uses GCP Cloud Run URL (Mumbai region)

// Production API URL - GCP Cloud Run (Mumbai/asia-south1)
// This will be set automatically when API is deployed
// Production API URL - GCP Cloud Run (Mumbai/asia-south1)
// This will be set automatically when API is deployed
const PRODUCTION_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://whatsay-api-278662370606.asia-south1.run.app';

export const getIngestionApiBase = () => {
  if (__DEV__) {
    // If running on a physical device, prefer Production API
    // This avoids "Network Error" when trying to hit localhost from a phone
    if (Device.isDevice) {
      console.log('[Ingestion] Physical Device in Dev mode -> Using Production API');
      return PRODUCTION_API_URL;
    }

    // Using adb reverse proxy for reliable local development
    // Run: adb reverse tcp:3002 tcp:3002
    // This maps device's localhost:3002 to computer's localhost:3002
    return 'http://localhost:3002';
  }
  // Production: Use GCP Cloud Run URL
  // If URL contains 'XXXXX', it means deployment is pending
  if (PRODUCTION_API_URL.includes('XXXXX')) {
    console.warn('[Ingestion] Production API URL not set. Run: node get-production-api-url.js');
    // Fallback to localhost for now (will fail in production, but allows build)
    return 'http://localhost:3000';
  }
  return PRODUCTION_API_URL;
};

const INGESTION_API_BASE = getIngestionApiBase();
console.log('[Ingestion] API Base URL:', INGESTION_API_BASE);
console.log('[Ingestion] __DEV__ mode:', __DEV__);

/**
 * Map Inshorts categories to UI category names
 */
const CATEGORY_MAP: Record<string, string> = {
  'all': 'Curated for you',
  'business': 'Business',
  'sports': 'Sports',
  'technology': 'Technology',
  'entertainment': 'Entertainment',
  'science': 'Science',
  'health': 'Health',
  'world': 'World',
};

/**
 * Category icon mapping - using SVG icons
 * Maps category IDs to icon identifiers that match the SVG file names
 */
const CATEGORY_ICON_IDS: Record<string, string> = {
  'all': 'curated-for-you',
  'business': 'business',
  'sports': 'sports',
  'technology': 'technology',
  'tech': 'technology',
  'entertainment': 'entertainment',
  'science': 'science',
  'health': 'health',
  'world': 'world',
  'automobile': 'automobile',
  'international': 'international-news',
  'breaking-news': 'breaking-news',
  'breaking': 'breaking-news',
  'finance': 'finance',
  'lifestyle': 'lifestyle',
  'opinions': 'opinions',
  'politics': 'politics',
  'startup': 'startup',
  'travel': 'travel',
};

/**
 * Get feed items from ingestion platform
 */
export const getIngestionFeed = async (category?: string, limit: number = 20) => {
  try {
    const params = new URLSearchParams();
    params.append('source', 'inshorts');
    if (category && category !== 'all') {
      params.append('category', category);
    }
    params.append('limit', limit.toString());

    console.log(`[Ingestion] Fetching feed from: ${INGESTION_API_BASE}/api/feed?${params.toString()}`);

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${INGESTION_API_BASE}/api/feed?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ingestion API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Ingestion] Received ${data.items?.length || 0} items`);
    return data.items || [];
  } catch (error: any) {
    console.error('[Ingestion] Error fetching feed:', error);
    console.error('[Ingestion] Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      apiBase: INGESTION_API_BASE,
      category,
      limit
    });
    // Return empty array instead of throwing
    return [];
  }
};

/**
 * Get categories from ingestion platform sources
 * Maps to UI category format
 */
export const getIngestionCategories = async () => {
  try {
    const response = await fetch(`${INGESTION_API_BASE}/api/sources`);

    if (!response.ok) {
      throw new Error(`Ingestion API error: ${response.status}`);
    }

    const data = await response.json();
    const sources = data.sources || [];

    // For now, we only support Inshorts
    const inshortsSource = sources.find((s: any) => s.id === 'inshorts');

    if (!inshortsSource) {
      return [];
    }

    // Map Inshorts categories to UI category format
    const categories = (inshortsSource.categories || []).map((cat: any, index: number) => ({
      id: cat.id,
      name: CATEGORY_MAP[cat.id] || cat.name,
      description: `News from ${cat.name}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: index,
      icon_url: CATEGORY_ICON_IDS[cat.id] || 'curated-for-you', // SVG icon identifier
      active: true,
      index: index,
    }));

    return categories;
  } catch (error: any) {
    console.error('Error fetching ingestion categories:', error);
    throw new Error(error.message || 'Failed to fetch categories from ingestion platform');
  }
};

/**
 * Get articles for a category from ingestion platform
 * Maps to UI article format
 */
export const getIngestionArticlesByCategory = async (
  categoryId: string,
  from: string,
  to: string
) => {
  try {
    console.log(`[Ingestion] Fetching articles for category: ${categoryId}`);
    const limit = 20;
    const items = await getIngestionFeed(categoryId === 'all' ? undefined : categoryId, limit);

    // Filter by date range
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const filteredItems = items
      .map((item: any) => {
        const rawSummary = item.subtext || item.summary_rewritten || item.summary_original || '';
        const originalImageUrl = item.image_url || item.image_storage_url || null;
        // Use fallback image if original is not available
        const imageUrl = getImageUrlWithFallback(originalImageUrl, categoryId);

        return {
          id: item.id,
          title: item.title || item.title_original || '',
          summary: truncateTo60Words(rawSummary), // Enforce 60-word limit
          image_url: imageUrl, // Always provide an image (original or fallback)
          published_at: item.published_at || item.created_at,
          source_url: item.source_url,
          category_id: categoryId,
        };
      });

    console.log(`[Ingestion] Returning ${filteredItems.length} articles`);
    return filteredItems;
  } catch (error: any) {
    console.error('[Ingestion] Error fetching articles:', error);
    // Return empty array instead of throwing to prevent app from hanging
    console.warn('[Ingestion] Returning empty articles array due to error');
    return [];
  }
};
