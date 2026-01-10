#!/usr/bin/env node
/**
 * Check latest build logs
 */
const { execSync } = require('child_process');

const PROJECT_ID = 'gen-lang-client-0803362165';

console.log('🔍 Checking latest build logs...\n');

try {
  // Get latest build ID
  const buildId = execSync(
    `gcloud builds list --limit 1 --project ${PROJECT_ID} --format="value(id)"`,
    { encoding: 'utf8', timeout: 10000 }
  ).trim();

  if (!buildId) {
    console.log('❌ No builds found');
    process.exit(1);
  }

  console.log(`📋 Build ID: ${buildId}\n`);
  console.log('📜 Build logs (last 100 lines):\n');
  console.log('─'.repeat(80));

  // Get build logs
  execSync(
    `gcloud builds log ${buildId} --project ${PROJECT_ID}`,
    { stdio: 'inherit', timeout: 30000 }
  );
} catch (error) {
  console.log('❌ Error checking logs:');
  console.log(`   ${error.message}`);
  process.exit(1);
}
