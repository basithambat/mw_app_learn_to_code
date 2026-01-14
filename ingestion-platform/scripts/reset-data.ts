
import { getPrismaClient } from '../src/config/db';

async function resetData() {
    const prisma = getPrismaClient();

    console.log('⚠️  WARNING: Starting full data purge...');

    try {
        // Order matters due to potential foreign keys (though not strictly enforced in Prsima schemas usually, good practice)
        console.log('🗑  Deleting ContentItems...');
        const contentDelete = await prisma.contentItem.deleteMany({});
        console.log(`✅ Deleted ${contentDelete.count} items.`);

        console.log('🗑  Deleting IngestionRuns...');
        const runDelete = await prisma.ingestionRun.deleteMany({});
        console.log(`✅ Deleted ${runDelete.count} runs.`);

        console.log('🗑  Deleting ImageSearchCache...');
        const cacheDelete = await prisma.imageSearchCache.deleteMany({});
        console.log(`✅ Deleted ${cacheDelete.count} cache entries.`);

        console.log('\n✨ Database is now clean.');
    } catch (e: any) {
        console.error('❌ Reset failed:', e.message);
    }
}

resetData().then(() => process.exit(0));
