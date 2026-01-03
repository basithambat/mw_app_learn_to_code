import cron from 'node-cron';
import { ingestionQueue } from '../queue/setup';
import { v4 as uuidv4 } from 'uuid';
import { getPrismaClient } from '../config/db';

const prisma = getPrismaClient();

// Registry of scheduled jobs
// Ideally this would be a separate file or DB table
const SCHEDULE_REGISTRY = [
  { sourceId: "inshorts", categories: ["all", "business", "sports", "technology"], intervalMins: 60 }
];

export function startScheduler() {
  console.log('Starting scheduler...');

  // Simple implementation: check every minute if we need to run something
  cron.schedule('* * * * *', async () => {
      const now = new Date();
      // For a real production system, we'd track last run time per source/category in DB
      // Here we just check if minute matches 0 for hourly jobs
      
      if (now.getMinutes() === 0) {
          console.log('Hourly trigger...');
          for (const config of SCHEDULE_REGISTRY) {
              if (config.intervalMins === 60) {
                  for (const category of config.categories) {
                       await enqueueJob(config.sourceId, category === 'all' ? undefined : category);
                  }
              }
          }
      }
  });
}

async function enqueueJob(sourceId: string, category?: string) {
  const runId = uuidv4();
  console.log(`Enqueuing job for ${sourceId} ${category ? `(${category})` : ''} - runId: ${runId}`);

  await ingestionQueue.add('ingest-source', {
    sourceId,
    category,
    runId,
  });

  // Create run record
  await prisma.ingestionRun.create({
    data: {
      id: uuidv4(),
      runId,
      sourceId,
      category,
      status: 'queued',
    },
  });
}

// Allow running standalone
if (require.main === module) {
    startScheduler();
    // Keep process alive
    process.stdin.resume();
}
