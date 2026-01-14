
import axios from 'axios';
import { getEnv } from '../src/config/env';

async function testGemini() {
    const env = getEnv() as any;
    const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;

    if (!key) {
        console.error('❌ No API key found');
        return;
    }

    console.log(`Using key ending in ...${key.substring(key.length - 4)}`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: 'Say "Ready to rewrite"' }] }]
        }, { timeout: 10000 });

        console.log('✅ Response:', response.data.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (e: any) {
        console.error('❌ Failed:', e.response?.data || e.message);
    }
}

testGemini();
