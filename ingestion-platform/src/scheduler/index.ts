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

    // Daily cleanup at 3:00 AM
    if (now.getHours() === 3 && now.getMinutes() === 0) {
      await runDailyCleanup();
    }
  });
}

async function runDailyCleanup() {
  console.log('Running daily cleanup job...');
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    // 1. Clean up old Ingestion Runs
    const deletedRuns = await prisma.ingestionRun.deleteMany({
      where: { startedAt: { lt: sevenDaysAgo } }
    });
    console.log(`Cleaned up ${deletedRuns.count} old ingestion runs.`);

    // 2. Clean up old Audit Logs
    const deletedAudit = await prisma.auditLog.deleteMany({
      where: { timestamp: { lt: thirtyDaysAgo } }
    });
    console.log(`Cleaned up ${deletedAudit.count} old audit logs.`);

    // 3. Clean up stalled content items (never left draft/rewrite after 48h)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const stalledContent = await prisma.contentItem.deleteMany({
      where: {
        createdAt: { lt: fortyEightHoursAgo },
        rewriteStatus: { in: ['queued', 'processing'] }
      }
    });
    console.log(`Cleaned up ${stalledContent.count} stalled content items.`);

  } catch (error) {
    console.error('Failed to run daily cleanup:', error);
  }
}

async function enqueueJob(sourceId: string, category?: string) {
  const runId = uuidv4();
  console.log(`Enqueuing job for ${sourceId} ${category ? `(${category})` : ''} - runId: ${runId}`);

  // 1. Create run record (status=running) BEFORE enqueuing
  await prisma.ingestionRun.create({
    data: {
      id: uuidv4(),
      runId,
      sourceId,
      category,
      status: 'running', // Mark as running immediately
    },
  });

  // 2. Enqueue job with runId
  await ingestionQueue.add('ingest-source', {
    sourceId,
    category,
    runId,
  });
}

// Allow running standalone
if (require.main === module) {
  startScheduler();
  // Keep process alive
  process.stdin.resume();
}
