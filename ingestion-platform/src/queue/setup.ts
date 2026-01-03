import { Queue, Worker, QueueOptions, Processor } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { IngestionJobData } from './types';

export const INGESTION_QUEUE_NAME = 'ingest-source';
export const ENRICH_QUEUE_NAME = 'enrich-item';
export const REWRITE_QUEUE_NAME = 'rewrite-item';
export const IMAGE_QUEUE_NAME = 'resolve-image';

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

export function createWorker<T>(
  name: string,
  processor: Processor<T>
): Worker<T> {
  return new Worker<T>(
    name,
    processor,
    {
      connection: getRedisClient(),
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );
}
