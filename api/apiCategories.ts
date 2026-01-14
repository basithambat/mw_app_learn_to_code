import AsyncStorage from '@react-native-async-storage/async-storage';
import APIService, { APICaller } from "./APIKit";
import { getIngestionCategories, getIngestionArticlesByCategory } from './apiIngestion';
import { logger } from '../utils/logger';
import { AppCategory } from '@/types/api';

// API function to fetch all categories that have associated articles
// Now uses ingestion platform instead of Supabase
export const getCategories = async (from: string, to: string, userId?: string): Promise<AppCategory[]> => {
    try {
        logger.info('Fetching categories for user:', userId);

        // 1. Fetch user preferences (includes order and isPreferred flag)
        let categoriesToFetch: AppCategory[] = [];
        if (userId) {
            try {
                const preferred = await apiGetCategoriesWithPreferences(userId);
                if (preferred && preferred.length > 0) {
                    // Filter for only preferred categories and maintain the order from backend
                    categoriesToFetch = preferred.filter((cat: AppCategory) => cat.isPreferred);
                    logger.info(`Found ${categoriesToFetch.length} preferred categories`);
                }
            } catch (err) {
                console.warn('[Categories] Failed to fetch preferences, falling back to default', err);
            }
        }

        // 2. If no preferences or not logged in, fetch all default categories
        if (categoriesToFetch.length === 0) {
            categoriesToFetch = await getIngestionCategories();
            logger.info(`Using ${categoriesToFetch.length} default categories`);
        }

        if (categoriesToFetch.length === 0) {
            throw new Error("No categories found. Please try again later.");
        }

        // 3. Fetch articles for each category in the specific order
        const categoriesWithArticles = await Promise.all(
            categoriesToFetch.map(async (category: AppCategory) => {
                try {
                    const articles = await getIngestionArticlesByCategory(category.id, from, to);
                    return {
                        ...category,
                        articles: articles,
                    };
                } catch (error) {
                    console.error(`[Categories] Error fetching articles for category ${category.id}:`, error);
                    return {
                        ...category,
                        articles: [],
                    };
                }
            })
        );

        // 4. Filter categories that actually have content, but keep user order
        const filtered = categoriesWithArticles.filter((category: AppCategory) =>
            category.articles && category.articles.length > 0
        );

        console.log(`[Categories] Returning ${filtered.length} categories with articles in preferred order`);
        return filtered;

    } catch (error: any) {
        console.error("[Categories] Fetching Error: ", error.message || error);
        throw new Error(error.message || "Failed to load news categories");
    }
}

export const apiGetCategoriesWithPreferences = async (userId: string) => {
    if (userId === 'dev-staff-123' || userId === 'mock-dev-token') {
        const categories = await getIngestionCategories();
        const savedPrefs = await AsyncStorage.getItem(`dev_prefs_${userId}`);

        if (savedPrefs) {
            const parsedPrefs: string[] = JSON.parse(savedPrefs);
            // Reconstruct the list based on saved order and selection
            // Categories in parsedPrefs are preferred and come first in that order
            const preferredOnes = parsedPrefs.map((id: string, index: number) => {
                const found = categories.find((c: any) => c.id === id);
                return found ? { ...found, isPreferred: true, order: index } : null;
            }).filter(Boolean);

            const remainingOnes = categories
                .filter((c: any) => !parsedPrefs.includes(c.id))
                .map((c: any, index: number) => ({ ...c, isPreferred: false, order: preferredOnes.length + index }));

            return [...preferredOnes, ...remainingOnes];
        }

        return categories.map((cat: any, index: number) => ({
            ...cat,
            isPreferred: index < 5,
            order: index
        }));
    }
    try {
        const res = await APICaller(APIService.get(`/categoriesWithPreferences/${userId}`))
        return res.data;
    } catch (error: any) {
        console.log("Fetching Error: ", error.message || error);
        throw new Error(error.message || error);
    }
}

export const apiUpdateUserPreference = async (categoryIDs: string[], userId: string) => {
    if (userId === 'dev-staff-123' || userId === 'mock-dev-token') {
        await AsyncStorage.setItem(`dev_prefs_${userId}`, JSON.stringify(categoryIDs));
        return { status: 200, data: { success: true } };
    }
    try {
        const res = await APICaller(APIService.put(`/updateUserCategoriesPreferences/${userId}`, {
            categoryIDs
        }))
        return res;
    } catch (error: any) {
        console.log("Fetching Error: ", error.message || error);
        throw new Error(error.message || error);
    }
}