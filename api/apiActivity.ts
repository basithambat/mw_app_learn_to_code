import APIService, { APICaller } from "./APIKit";

export const getUserActivities = async (userId: string | undefined) => {
    try {
        const res = await APICaller(APIService.get(`/userActivity/${userId}`))
        return res.data;
    } catch (error: any) {
        console.log("Fetching Error: ", error.message || error); // Log the error message
        throw new Error(error.message || error); // Re-throw with message for clarity
    }
}