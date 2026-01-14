import { getPrismaClient } from '../src/config/db';

const prisma = getPrismaClient();

async function checkDetails() {
    const items = await prisma.contentItem.findMany({
        where: { imageStatus: 'failed' },
        select: {
            id: true,
            imageStatus: true,
            imageModel: true,
            imageMetadata: true,
        },
        take: 10,
    });

    console.log('\n🔍 Failed Item Details:');
    console.log('----------------------');
    items.forEach((item) => {
        console.log(`  ID: ${item.id}`);
        console.log(`  Status: ${item.imageStatus}`);
        console.log(`  Model: ${item.imageModel}`);
        console.log(`  Metadata: ${JSON.stringify(item.imageMetadata)}`);
        console.log(' ---');
    });

    await prisma.$disconnect();
}

checkDetails().catch(console.error);
