import { supabase } from "@/config/supabase";
import APIService, { APICaller } from "./APIKit";
import { getIngestionArticlesByCategory } from "./apiIngestion";

export const getAllArticlesByCategories = async (categoryId: string,from:string, to:string) => {
    try {
        if (!categoryId) throw new Error("Category ID Missing!");

        // Use ingestion platform instead of Supabase (imported at top)
        return await getIngestionArticlesByCategory(categoryId, from, to);

        // Fallback to REST API if needed (commented out)
        // const res = await APICaller(APIService.get(`/newsByCategory?id=${categoryId}&&from=${from}&&to=${to}`))
        // return res.data;

    } catch (error: any) {
        console.log("Fetching Error: ", error.message || error); // Log the error message
        throw new Error(error.message || error); // Re-throw with message for clarity
    }
}