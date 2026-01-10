import axios, { AxiosResponse } from "axios";
import { getIngestionApiBase } from "./apiIngestion";

let APIService = axios.create({
    baseURL: `${getIngestionApiBase()}/api`,
    timeout: 10000, // Reduced to 10s as per P0 plan (fail fast)
    headers: {
        "Content-Type": "application/json",
    },
});

APIService.interceptors.response.use(
    response => response,
    error => {
        console.error("Detailed Network Error:", error.toJSON ? error.toJSON() : error);
        return Promise.reject(error);
    }
);

export async function APICaller<Type>(apiCall: Promise<AxiosResponse<Type>>): Promise<Type | undefined> {
    try {
        const response = await apiCall;

        if ([200, 201, 204].includes(response.status)) {
            return response.data;
        }
        return undefined;
    } catch (error) {
        console.error("API call error:", error);

        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
                throw new Error("Connection timeout or network error. Please check your network and try again.");
            }
            throw new Error(`API error: ${error.message}`);
        }
        throw new Error(`Unexpected error: ${error}`);
    }
}

export default APIService;
