import { getPrismaClient } from '../src/config/db';

const prisma = getPrismaClient();

async function checkUrls() {
    const items = await prisma.contentItem.findMany({
        where: { imageStatus: 'generated' },
        select: { id: true, imageStorageUrl: true },
        take: 5
    });

    console.log('\n🔗 Sample Generated URLs:');
    console.log('------------------------');
    items.forEach(item => {
        console.log(`  ID: ${item.id}`);
        console.log(`  URL: ${item.imageStorageUrl}`);
    });

    await prisma.$disconnect();
}

checkUrls().catch(console.error);
