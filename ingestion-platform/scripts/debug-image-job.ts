import { getPrismaClient } from '../src/config/db';
import { processImageJob } from '../src/workers/image';
import { Job } from 'bullmq';

const prisma = getPrismaClient();

async function debugSingleImage() {
    // Find a failed item
    const item = await prisma.contentItem.findFirst({
        where: { imageStatus: 'failed' },
        select: { id: true, titleOriginal: true }
    });

    if (!item) {
        console.log('No failed items found to debug.');
        process.exit(0);
    }

    console.log(`\n🛠 Debugging Image Resolution for Item: ${item.id}`);
    console.log(`Title: ${item.titleOriginal}`);
    console.log('--------------------------------------------------\n');

    // Reset status to allow re-processing
    await prisma.contentItem.update({
        where: { id: item.id },
        data: { imageStatus: 'pending', imageStorageUrl: null }
    });

    // Mock a BullMQ Job
    const mockJob = {
        data: {
            contentId: item.id,
            runId: `debug-${Date.now()}`
        },
        id: 'debug-job'
    } as Job;

    try {
        await processImageJob(mockJob);
        console.log('\n✅ Debug Process Complete.');
    } catch (error) {
        console.error('\n❌ Debug Process Failed:');
        console.error(error);
    }

    await prisma.$disconnect();
    process.exit(0);
}

debugSingleImage().catch(console.error);
