import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to enable pgvector extension...');
        await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('Successfully enabled pgvector extension (or it already existed).');
    } catch (error) {
        console.error('Failed to enable pgvector extension:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
