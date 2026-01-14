import { getPrismaClient } from '../src/config/db';

const prisma = getPrismaClient();

async function checkErrors() {
    const failedItems = await prisma.contentItem.findMany({
        where: { imageStatus: 'failed' },
        select: {
            id: true,
            imageMetadata: true,
        },
        take: 5,
    });

    console.log('\n❌ Recent Failure Metadata:');
    console.log('-------------------------');
    failedItems.forEach((item) => {
        console.log(`  ID: ${item.id}`);
        console.log(`  Metadata: ${JSON.stringify(item.imageMetadata, null, 2)}`);
        console.log(' ---');
    });

    await prisma.$disconnect();
}

checkErrors().catch(console.error);
