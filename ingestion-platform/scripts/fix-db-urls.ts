import { getPrismaClient } from '../src/config/db';

const prisma = getPrismaClient();

async function fixDatabaseUrls() {
    const OLD_IP = '192.168.0.101';
    const NEW_IP = '192.168.0.103';

    console.log(`\n🔧 Updating image URLs from ${OLD_IP} to ${NEW_IP}...`);

    const items = await prisma.contentItem.findMany({
        where: {
            imageStorageUrl: {
                contains: OLD_IP
            }
        }
    });

    console.log(`📦 Found ${items.length} items to update.`);

    for (const item of items) {
        if (item.imageStorageUrl) {
            const newUrl = item.imageStorageUrl.replace(OLD_IP, NEW_IP);
            await prisma.contentItem.update({
                where: { id: item.id },
                data: { imageStorageUrl: newUrl }
            });
        }
    }

    console.log('✅ All URLs updated successfully.');
    await prisma.$disconnect();
}

fixDatabaseUrls().catch(console.error);
