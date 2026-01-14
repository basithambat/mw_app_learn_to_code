
import { processImageJob } from '../src/workers/image';
import { getPrismaClient } from '../src/config/db';

async function forceImages() {
    const prisma = getPrismaClient();

    console.log('🔍 Finding pending images...');
    const pending = await prisma.contentItem.findMany({
        where: {
            imageStatus: 'pending',
            createdAt: { gt: new Date(Date.now() - 2 * 60 * 60 * 1000) } // Last 2 hours
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    console.log(`Found ${pending.length} pending items.`);

    for (const item of pending) {
        console.log(`Processing image for: ${item.titleOriginal.substring(0, 50)}...`);
        try {
            await processImageJob({
                id: 'force-local',
                data: {
                    contentId: item.id,
                    runId: 'force-local'
                }
            } as any);
            console.log('✅ Success');
        } catch (e: any) {
            console.error('❌ Failed:', e.message);
        }
    }
}

forceImages().then(() => process.exit(0));
