
import { getPrismaClient } from '../src/config/db';

const prisma = getPrismaClient();

async function resetImages() {
    console.log('🔄 resetting image status for broken files...');

    // Find items with storage.googleapis.com but are actually broken (404s)
    // We assume mostly ALL recent ones are broken because they were pointing to localhost originally

    // Let's reset ALL items created in the last 24 hours that are not 'pending'
    const result = await prisma.contentItem.updateMany({
        where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            // Only reset if they have a URL (meaning we thought they were done)
            imageStorageUrl: { not: null }
        },
        data: {
            imageStatus: 'pending',
            imageStorageUrl: null // Clear the bad URL
        }
    });

    console.log(`✅ Reset ${result.count} items to 'pending'. The worker should pick them up shortly.`);
    await prisma.$disconnect();
}

resetImages().catch(console.error);
