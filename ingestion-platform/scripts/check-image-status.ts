import { getPrismaClient } from '../src/config/db';

const prisma = getPrismaClient();

async function checkStatus() {
    const recent = await prisma.contentItem.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            titleOriginal: true,
            sourceId: true,
            imageStatus: true,
            imageStorageUrl: true,
            sourceUrl: true,
            createdAt: true
        }
    });

    console.log('\n🔍 Last 5 Items Image Status:');
    console.log('--------------------------------');
    recent.forEach((item) => {
        console.log(`Title: ${item.titleOriginal.substring(0, 50)}...`);
        console.log(`Source: ${item.sourceId}`);
        console.log(`Status: ${item.imageStatus}`);
        console.log(`URL: ${item.imageStorageUrl}`);
        console.log('---');
    });

    const counts = await prisma.contentItem.groupBy({
        by: ['imageStatus'],
        _count: {
            _all: true,
        },
    });

    console.log('\n📊 Aggregate Counts:');
    counts.forEach((c) => {
        console.log(`  ${c.imageStatus || 'none'}: ${c._count._all}`);
    });
    console.log('--------------------------------\n');

    await prisma.$disconnect();
}

checkStatus().catch(console.error);
