import { getPrismaClient } from '../src/config/db';
import { processImageJob } from '../src/workers/image';
import { Job } from 'bullmq';

const prisma = getPrismaClient();

async function processAllImages() {
    const items = await prisma.contentItem.findMany({
        where: {
            OR: [
                { imageStatus: 'failed' },
                { imageStatus: 'pending', imageStorageUrl: null }
            ]
        },
        select: { id: true, titleOriginal: true }
    });

    if (items.length === 0) {
        console.log('No pending/failed items found to process.');
        process.exit(0);
    }

    console.log(`\n🚀 Processing ${items.length} items with new 6-tier hierarchy...`);
    console.log('--------------------------------------------------\n');

    for (const item of items) {
        console.log(`\n👉 Processing: ${item.titleOriginal} (${item.id})`);

        // Reset status to allow re-processing in current flow
        await prisma.contentItem.update({
            where: { id: item.id },
            data: { imageStatus: 'pending', imageStorageUrl: null }
        });

        // Mock a BullMQ Job
        const mockJob = {
            data: {
                contentId: item.id,
                runId: `manual-${Date.now()}`
            },
            id: `manual-job-${item.id}`
        } as Job;

        try {
            await processImageJob(mockJob);
            console.log(`✅ Success for: ${item.id}`);
        } catch (error) {
            console.error(`❌ Failed for: ${item.id}`);
            console.error(error instanceof Error ? error.message : String(error));
        }
    }

    console.log('\n✨ Batch processing complete.');
    await prisma.$disconnect();
    process.exit(0);
}

processAllImages().catch(console.error);
