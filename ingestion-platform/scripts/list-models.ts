
import axios from 'axios';
import { getEnv } from '../src/config/env';

async function listModels() {
    const env = getEnv() as any;
    const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;

    if (!key) {
        console.error('❌ No API key found');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        console.log('✅ Models found:', response.data.models.map((m: any) => m.name));
    } catch (e: any) {
        console.error('❌ Failed to list models:', e.response?.data || e.message);
    }
}

listModels();
