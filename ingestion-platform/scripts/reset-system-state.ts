import { getRedisClient } from '../src/config/redis';
import { getDbSemaphore } from '../src/lib/dbSemaphore';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log('Resetting Ingestion Stabilization State...');

    const redis = getRedisClient();
    const semaphore = getDbSemaphore();

    // 1. Reset Semaphore
    console.log('Resetting DbSemaphore...');
    await semaphore.reset();

    // 2. Clear Ingestion Locks
    console.log('Clearing ingestion locks...');
    const keys = await redis.keys('ingest:lock:*');
    if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`Cleared ${keys.length} locks.`);
    }

    // 3. Clear Rate Limit state (optional but clean)
    console.log('Clearing rate limit keys...');
    const rlKeys = await redis.keys('ip-rate-limit:*');
    if (rlKeys.length > 0) {
        await redis.del(...rlKeys);
    }

    console.log('✅ System state reset successfully.');
}

main()
    .catch(console.error)
    .finally(() => process.exit(0));
