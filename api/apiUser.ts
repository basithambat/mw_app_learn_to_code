import APIService, { APICaller } from "./APIKit";

export const deletUser = async (userId: string) => {
    try {
        const res = await APICaller(APIService.delete(`/auth/user`));
        return { success: true, message: 'User deleted successfully' };
    } catch (error: any) {
        console.log("Fetching Error: ", error.message || error); // Log the error message
        throw new Error(error.message || error); // Re-throw with message for clarity
    }
}