import { getPrismaClient } from './src/config/db';

async function checkStatus() {
    const prisma = getPrismaClient();

    console.log('--- Recent Ingestion Runs ---');
    const runs = await prisma.ingestionRun.findMany({
        orderBy: { startedAt: 'desc' },
        take: 10
    });
    console.table(runs.map(r => ({
        runId: r.runId,
        source: r.sourceId,
        category: r.category,
        status: r.status,
        startedAt: r.startedAt
    })));

    console.log('\n--- Pipeline Status ---');
    const stats = await prisma.contentItem.groupBy({
        by: ['enrichmentStatus', 'rewriteStatus', 'imageStatus'],
        _count: { id: true }
    });
    console.table(stats.map(s => ({
        enrichment: s.enrichmentStatus,
        rewrite: s.rewriteStatus,
        image: s.imageStatus,
        count: s._count.id
    })));

    console.log('\n--- Recent Content Items ---');
    const items = await prisma.contentItem.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            id: true,
            titleOriginal: true,
            enrichmentStatus: true,
            rewriteStatus: true,
            imageStatus: true,
            createdAt: true
        }
    });
    console.table(items);

    await prisma.$disconnect();
}

checkStatus().catch(console.error);
