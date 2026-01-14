import { getPrismaClient } from '../src/config/db';
import dotenv from 'dotenv';
dotenv.config();

const prisma = getPrismaClient();

async function main() {
    console.log('Checking latest ContentItems...');
    const items = await prisma.contentItem.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            id: true,
            titleOriginal: true,
            sourceId: true,
            createdAt: true,
            publishedAt: true,
        }
    });

    console.log('Latest Items:', JSON.stringify(items, null, 2));

    console.log('\nChecking latest IngestionRuns...');
    const runs = await prisma.ingestionRun.findMany({
        orderBy: { startedAt: 'desc' },
        take: 5
    });

    console.log('Latest Runs:', JSON.stringify(runs, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
