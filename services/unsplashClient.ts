/**
 * Smart Fallback Image Client
 * Fetches topic-specific images from backend proxy (protects API keys).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Production API URL
const PRODUCTION_API_URL = 'https://whatsay-api-278662370606.asia-south1.run.app';

// Cache configuration
const CACHE_KEY_PREFIX = 'fallback_img_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
    url: string;
    expires: number;
}

/**
 * Get API base URL (same logic as apiIngestion.ts)
 */
function getApiBaseUrl(): string {
    if (__DEV__) {
        // Physical device in dev mode → use production API
        if (Device.isDevice) {
            return PRODUCTION_API_URL;
        }
        // Simulator/emulator → use localhost
        return 'http://localhost:3002';
    }
    return PRODUCTION_API_URL;
}

/**
 * Fetch smart fallback image from backend.
 * Results are cached locally for 7 days.
 */
export async function searchUnsplashImage(query: string): Promise<string | null> {
    const cacheKey = `${CACHE_KEY_PREFIX}${query.toLowerCase().replace(/\s+/g, '_')}`;

    try {
        // Check cache first
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            const entry: CacheEntry = JSON.parse(cached);
            if (entry.expires > Date.now()) {
                return entry.url;
            }
        }

        // Fetch from backend proxy
        const baseUrl = getApiBaseUrl();
        const response = await fetch(
            `${baseUrl}/api/fallback-image?topic=${encodeURIComponent(query)}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.warn(`[FallbackImage] API error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const imageUrl = data.url;

        if (imageUrl) {
            // Cache the result
            const entry: CacheEntry = {
                url: imageUrl,
                expires: Date.now() + CACHE_TTL_MS,
            };
            await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
        }

        return imageUrl;
    } catch (error) {
        console.warn('[FallbackImage] Request failed:', error);
        return null;
    }
}

/**
 * Clear all cached fallback images.
 */
export async function clearUnsplashCache(): Promise<void> {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX));
        await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
        console.warn('[FallbackImage] Cache clear failed:', error);
    }
}
