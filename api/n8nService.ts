import axios from "axios";

// TODO: Replace with your actual n8n webhook URL
// Example: https://midstride.app.n8n.cloud/webhook/test
const N8N_WEBHOOK_URL = "https://midstride.app.n8n.cloud/webhook/test";

const n8nService = axios.create({
    baseURL: N8N_WEBHOOK_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const testN8nConnection = async (data: any) => {
    try {
        // If your webhook URL already includes the path (e.g., /test), use empty string or specific path here
        const response = await n8nService.post("", data);
        return response.data;
    } catch (error) {
        console.error("n8n Connection Error:", error);
        throw error;
    }
};

export default n8nService;
