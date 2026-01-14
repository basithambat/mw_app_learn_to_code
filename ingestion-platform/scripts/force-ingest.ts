
import { IngestionProcessor } from '../src/ingestion/processor';
import { getPrismaClient } from '../src/config/db';

async function forceIngest() {
    const processor = new IngestionProcessor();
    const sources = ['toi', 'hindustantimes', 'inshorts'];

    console.log('🚀 Starting Forced Ingestion...');

    for (const sourceId of sources) {
        console.log(`\nProcessing source: ${sourceId}`);
        try {
            const stats = await processor.process({
                sourceId,
                runId: `force-${Date.now()}-${sourceId}`,
                jobId: 'force-local',
            } as any);
            console.log(`✅ ${sourceId} Stats:`, stats);
        } catch (e) {
            console.error(`❌ ${sourceId} Failed:`, e);
        }
    }

    console.log('\n🏁 Forced Ingestion Complete.');
}

forceIngest().then(() => process.exit(0));
