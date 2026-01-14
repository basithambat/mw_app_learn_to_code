import { getRedisClient } from '../config/redis';
import { v4 as uuidv4 } from 'uuid';

/**
 * Redis-based semaphore for global concurrency limiting.
 * Prevents connection pool exhaustion by capping concurrent DB-heavy work.
 */
export class DbSemaphore {
    private redis;
    private semaphoreKey = 'semaphore:db-heavy';
    private countKey = 'semaphore:db-heavy:count';
    private maxConcurrent: number;

    constructor(maxConcurrent: number = 4) {
        this.redis = getRedisClient();
        this.maxConcurrent = maxConcurrent;
    }

    /**
     * Acquire a semaphore slot. Blocks until available or timeout.
     * @param timeoutMs Maximum time to wait for a slot (default: 30s)
     * @returns token to use for release
     */
    async acquire(timeoutMs: number = 30000): Promise<string> {
        const token = uuidv4();
        const deadline = Date.now() + timeoutMs;
        const pollInterval = 100; // Check every 100ms

        while (Date.now() < deadline) {
            // Try to increment count
            const count = await this.redis.incr(this.countKey);

            if (count <= this.maxConcurrent) {
                // Success! We got a slot
                // Store token with TTL for auto-cleanup
                await this.redis.setex(`${this.semaphoreKey}:${token}`, 300, '1'); // 5 min TTL
                return token;
            } else {
                // Undo the increment
                await this.redis.decr(this.countKey);

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
        }

        throw new Error(`DbSemaphore: Failed to acquire slot within ${timeoutMs}ms (max: ${this.maxConcurrent})`);
    }

    /**
     * Release a semaphore slot.
     * @param token The token returned by acquire()
     */
    async release(token: string): Promise<void> {
        try {
            // Delete the token
            await this.redis.del(`${this.semaphoreKey}:${token}`);

            // Decrement count
            const count = await this.redis.decr(this.countKey);

            // Ensure count doesn't go negative
            if (count < 0) {
                await this.redis.set(this.countKey, '0');
            }
        } catch (error) {
            console.error('[DbSemaphore] Error releasing token:', error);
            // Still try to decrement count even if token deletion fails
            await this.redis.decr(this.countKey).catch(() => { });
        }
    }

    /**
     * Get current semaphore stats for monitoring
     */
    async getStats(): Promise<{ active: number; max: number; available: number }> {
        const count = await this.redis.get(this.countKey);
        const active = count ? parseInt(count, 10) : 0;

        return {
            active,
            max: this.maxConcurrent,
            available: Math.max(0, this.maxConcurrent - active)
        };
    }

    /**
     * Reset semaphore (for admin/debugging)
     */
    async reset(): Promise<void> {
        await this.redis.set(this.countKey, '0');
        const keys = await this.redis.keys(`${this.semaphoreKey}:*`);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
}

// Singleton instance
let dbSemaphore: DbSemaphore;

export function getDbSemaphore(maxConcurrent?: number): DbSemaphore {
    if (!dbSemaphore) {
        dbSemaphore = new DbSemaphore(maxConcurrent);
    }
    return dbSemaphore;
}
