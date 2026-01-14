import { Queue, Worker, QueueOptions, Processor, Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { IngestionJobData } from './types';

export const INGESTION_QUEUE_NAME = 'ingest-source';
export const ENRICH_QUEUE_NAME = 'enrich-item';
export const REWRITE_QUEUE_NAME = 'rewrite-item';
export const IMAGE_QUEUE_NAME = 'resolve-image';
export const DLQ_NAME = 'dead-letter-queue';

const queueOptions: QueueOptions = {
  connection: getRedisClient(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // 7 days
    },
  },
};

export const ingestionQueue = new Queue<IngestionJobData>(
  INGESTION_QUEUE_NAME,
  queueOptions
);

export const enrichQueue = new Queue<{ contentId: string; runId: string }>(
  ENRICH_QUEUE_NAME,
  queueOptions
);

export const rewriteQueue = new Queue<{ contentId: string; runId: string }>(
  REWRITE_QUEUE_NAME,
  queueOptions
);

export const imageQueue = new Queue<{ contentId: string; runId: string }>(
  IMAGE_QUEUE_NAME,
  queueOptions
);

/**
 * P2-01 FIX: Dead Letter Queue for failed jobs
 * Jobs that exhaust all retries are moved here for forensic analysis
 */
export const dlq = new Queue(DLQ_NAME, {
  connection: getRedisClient(),
  defaultJobOptions: {
    removeOnComplete: {
      age: 30 * 24 * 3600, // Keep 30 days for forensics
    },
  },
});

/**
 * Helper to get queue by name (used for requeuing from DLQ)
 */
export function getQueueByName(name: string): Queue | null {
  const queueMap: Record<string, Queue> = {
    [INGESTION_QUEUE_NAME]: ingestionQueue,
    [ENRICH_QUEUE_NAME]: enrichQueue,
    [REWRITE_QUEUE_NAME]: rewriteQueue,
    [IMAGE_QUEUE_NAME]: imageQueue,
  };
  return queueMap[name] || null;
}

/**
 * Add job to DLQ after all retries exhausted
 * Call this from worker.on('failed') handlers
 */
export async function addToDlq(job: Job, error: Error): Promise<void> {
  await dlq.add('failed-job', {
    originalQueue: job.queueName,
    originalJobId: job.id,
    jobName: job.name,
    originalData: job.data,
    failedReason: error.message,
    stacktrace: job.stacktrace,
    attemptsMade: job.attemptsMade,
    timestamp: Date.now(),
  });
}

export function createWorker<T>(
  name: string,
  processor: Processor<T>
): Worker<T> {
  return new Worker<T>(
    name,
    processor,
    {
      connection: getRedisClient(),
      concurrency: 1, // Set to 1 for stability. Cloud Run instances handle jobs serially to avoid pool exhaustion.
      lockDuration: 300000, // 5 minutes
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );
}
