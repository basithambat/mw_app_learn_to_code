import { supabase } from "@/config/supabase";
import APIService, { APICaller } from "./APIKit";
import { getIngestionCategories, getIngestionArticlesByCategory } from "./apiIngestion";

export const getAllCategories = async () => {
    try {
        const { data: todos, error } = await supabase
            .from("categories")
            .select("*"); // Fetch all categories
        // Removed .order("order") as the column doesn't exist in Supabase
        // Categories are now managed by ingestion platform

        if (error) throw new Error(error.message);

        return todos || [];

        // Fallback to REST API if needed (commented out)
        // const res = await APICaller(APIService.get('/categories'))
        // return res.data;

    } catch (error: any) {
        console.log("Fetching Error: ", error.message || error); // Log the error message
        // Return empty array instead of throwing to prevent app crashes
        return [];
    }
}

// API function to fetch all categories that have associated articles
// Now uses ingestion platform instead of Supabase
export const getCategories = async (from: string, to: string, userId: string) => {
    try {
        console.log('[Categories] Fetching from ingestion platform...');
        // Use ingestion platform (imported at top of file)

        const categories = await getIngestionCategories();
        console.log(`[Categories] Got ${categories.length} categories`);

        if (categories.length === 0) {
            console.warn('[Categories] No categories found, returning empty array');
            return [];
        }

        // Fetch articles for each category and filter by date range
        const categoriesWithArticles = await Promise.all(
            categories.map(async (category: any) => {
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

        // Filter out categories with no articles
        const filtered = categoriesWithArticles.filter((category: any) =>
            category.articles && category.articles.length > 0
        );

        console.log(`[Categories] Returning ${filtered.length} categories with articles`);
        return filtered;

    } catch (error: any) {
        console.error("[Categories] Fetching Error: ", error.message || error);
        // Return empty array instead of throwing to prevent app from hanging
        console.warn("[Categories] Returning empty array due to error");
        return [];
    }
}

export const apiGetCategoriesWithPreferences = async (userId: string) => {
    try {
        const res = await APICaller(APIService.get(`/categoriesWithPreferences/${userId}`))
        return res.data;
    } catch (error: any) {
        console.log("Fetching Error: ", error.message || error); // Log the error message
        throw new Error(error.message || error); // Re-throw with message for clarity
    }
}

export const apiUpdateUserPreference = async (categoryIDs: string[], userId: string) => {
    try {
        const res = await APICaller(APIService.put(`/updateUserCategoriesPreferences/${userId}`, {
            categoryIDs
        }))
        return res;
    } catch (error: any) {
        console.log("Fetching Error: ", error.message || error); // Log the error message
        throw new Error(error.message || error); // Re-throw with message for clarity
    }
}