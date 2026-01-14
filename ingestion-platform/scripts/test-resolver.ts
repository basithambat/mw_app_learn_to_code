import { ImageResolverService } from '../src/services/image-resolver';
import dotenv from 'dotenv';
import path from 'path';

// Load env from ingestion-platform directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testResolver() {
    const resolver = new ImageResolverService();

    const testTitle = "ksjdlfksjdlfksjdlfksjdlfksjdlfksjdlfksjdlfksjdlfksjdlf ksdjlfksdjl fksjdlfksdjlkfsjdlkfjsdlkfjsdlkfj sldkfjlsdkf";
    const testCategory = "other";
    const testSummary = "Random characters that should never return a search result.";

    console.log('\n🧪 Testing ImageResolverService Hierarchy:');
    console.log('-----------------------------------------');

    try {
        const result = await resolver.resolveImage(
            testTitle,
            testCategory,
            'test-source',
            testSummary
        );

        console.log('\n✅ Result:');
        console.log(`  Source: ${result.source}`);
        console.log(`  URL: ${result.url.substring(0, 100)}${result.url.length > 100 ? '...' : ''}`);
        console.log(`  Model: ${result.metadata?.model}`);
        console.log(`  Metadata: ${JSON.stringify(result.metadata, null, 2)}`);

    } catch (error) {
        console.error('\n❌ Test Failed:');
        console.error(error);
    }
}

testResolver().catch(console.error);
