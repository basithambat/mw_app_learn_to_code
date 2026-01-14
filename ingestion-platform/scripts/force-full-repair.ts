
import { processEnrichJob } from '../src/workers/enrich';
import { processRewriteJob } from '../src/workers/rewrite';
import { processImageJob } from '../src/workers/image';
import { getPrismaClient } from '../src/config/db';

async function forceRepair() {
    const prisma = getPrismaClient();

    console.log('🔍 Finding items needing repair...');
    const pending = await prisma.contentItem.findMany({
        where: {
            OR: [
                { rewriteStatus: 'pending' },
                { enrichmentStatus: 'pending' },
                { imageStatus: 'pending' }
            ],
            createdAt: { gt: new Date(Date.now() - 4 * 60 * 60 * 1000) } // Last 4 hours
        },
        orderBy: { createdAt: 'desc' },
        take: 40
    });

    console.log(`Found ${pending.length} items to repair.`);

    for (const item of pending) {
        console.log(`\n🛠 Repairing: ${item.titleOriginal.substring(0, 50)}...`);
        const jobMock = {
            id: 'force-repair',
            data: {
                contentId: item.id,
                runId: 'force-repair'
            }
        } as any;

        try {
            if (item.enrichmentStatus === 'pending') {
                console.log('  - Enricheeing metadata...');
                await processEnrichJob(jobMock);
            }

            // Fetch fresh state because enrichment might have updated it
            const freshItem = await prisma.contentItem.findUnique({ where: { id: item.id } });

            if (freshItem?.rewriteStatus === 'pending') {
                console.log('  - Rewriting content...');
                await processRewriteJob(jobMock);
            }

            if (freshItem?.imageStatus === 'pending') {
                console.log('  - Resolving image...');
                await processImageJob(jobMock);
            }

            console.log('✅ Success');
        } catch (e: any) {
            console.error('❌ Failed:', e.message);
        }
    }

    console.log('\n🏁 Full Repair Complete.');
}

forceRepair().then(() => process.exit(0));
