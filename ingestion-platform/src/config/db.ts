import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { getEnv } from './env';

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const env = getEnv();
    const isProd = env.NODE_ENV === 'production';

    // P2-04 FIX: Explicit connection pooling for production stability
    let dbUrl = env.DATABASE_URL;
    if (isProd && !dbUrl.includes('connection_limit')) {
      const separator = dbUrl.includes('?') ? '&' : '?';
      dbUrl = `${dbUrl}${separator}connection_limit=10&pool_timeout=20`;
    }

    // Create pg pool with pooling settings
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);

    console.log('--- DB INIT: Configured PrismaPg adapter ---');

    prisma = new PrismaClient({
      adapter: adapter as any,
      log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

export async function disconnectDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}
