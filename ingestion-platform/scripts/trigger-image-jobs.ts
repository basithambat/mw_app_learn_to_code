
import { getPrismaClient } from '../src/config/db';
import { imageQueue } from '../src/queue/setup';

const prisma = getPrismaClient();

async function triggerImageJobs() {
    console.log('🚀 Triggering image jobs for pending items...');

    const pendingItems = await prisma.contentItem.findMany({
        where: { imageStatus: 'pending' },
        select: { id: true, titleOriginal: true }
    });

    console.log(`Found ${pendingItems.length} pending items.`);

    let count = 0;
    for (const item of pendingItems) {
        // Enqueue directly to BullMQ
        await imageQueue.add('process-image', {
            contentId: item.id,
            runId: `manual-trigger-${Date.now()}`
        });
        count++;
        if (count % 10 === 0) process.stdout.write('.');
    }

    console.log(`\n✅ Enqueued ${count} jobs.`);
    await prisma.$disconnect();
    // We don't close the queue connection here to avoid dangling promise issues in script, 
    // simply exit after short delay to let Redis commands flush
    setTimeout(() => process.exit(0), 1000);
}

triggerImageJobs().catch(console.error);
