
import { getPrismaClient } from '../src/config/db';

const prisma = getPrismaClient();

async function fixUrls() {
    console.log('🔄 Checking for broken image URLs...');

    // Find items with localhost/minio URLs
    const brokenItems = await prisma.contentItem.findMany({
        where: {
            OR: [
                { imageStorageUrl: { contains: 'localhost' } },
                { imageStorageUrl: { contains: '192.168.' } }
            ]
        },
        select: { id: true, imageStorageUrl: true }
    });

    console.log(`Found ${brokenItems.length} broken items.`);

    const TARGET_BASE = 'https://storage.googleapis.com/whatsay-content';
    let fixed = 0;

    for (const item of brokenItems) {
        if (!item.imageStorageUrl) continue;

        let newUrl = item.imageStorageUrl;

        // Extract the key part (everything after the bucket name or last slash if complex)
        // Usually: http://localhost:9000/content-bucket/content/toi/xyz.jpg
        // We want: https://storage.googleapis.com/whatsay-content/content/toi/xyz.jpg

        // Remove the old base and bucket
        // Regex to capture "content/..."
        const match = item.imageStorageUrl.match(/content\/.*$/);

        if (match) {
            newUrl = `${TARGET_BASE}/${match[0]}`;
        } else {
            console.warn(`Could not parse key from ${item.imageStorageUrl}`);
            continue;
        }

        if (newUrl !== item.imageStorageUrl) {
            await prisma.contentItem.update({
                where: { id: item.id },
                data: { imageStorageUrl: newUrl }
            });
            fixed++;
        }
    }

    console.log(`✅ Fixed ${fixed} URLs.`);
    await prisma.$disconnect();
}

fixUrls().catch(console.error);
