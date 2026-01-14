
import { LLMService } from '../src/services/llm';

async function testLocalLLM() {
    const llm = new LLMService();

    // Force delete API keys to trigger local fallback path directly
    (llm as any).googleApiKey = undefined;
    (llm as any).mistralApiKey = undefined;
    (llm as any).openaiKey = undefined;

    console.log('🧪 Testing local Mini-LLM (LaMini-Flan-T5)...');
    console.log('Note: This will download a ~500MB model on first run.');

    const title = "Scientists discover water on a distant planet";
    const summary = "A team of international astronomers has found evidence of liquid water in the atmosphere of a rocky planet orbiting a star 100 light-years away from Earth.";

    try {
        const start = Date.now();
        const result = await llm.rewriteContent(title, summary);
        const duration = (Date.now() - start) / 1000;

        console.log('\n✅ Success in', duration, 'seconds');
        console.log('Original Title:', title);
        console.log('Rewritten Title:', result.rewrittenTitle);
        console.log('Rewritten Summary:', result.rewrittenSubtext);
    } catch (e: any) {
        console.error('\n❌ Local LLM Failed:', e.message);
    }
}

testLocalLLM().then(() => process.exit(0));
