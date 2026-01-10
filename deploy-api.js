#!/usr/bin/env node
/**
 * Deploy API to Cloud Run (Mumbai region)
 */
const { execSync } = require('child_process');
const path = require('path');

const PROJECT_ID = 'gen-lang-client-0803362165';
const REGION = 'asia-south1';
const SERVICE = 'whatsay-api';
const INGESTION_PLATFORM_DIR = path.join(__dirname, 'ingestion-platform');

console.log('🚀 Deploying API to Cloud Run (Mumbai)...\n');

// Check if ingestion-platform directory exists
try {
  require('fs').accessSync(INGESTION_PLATFORM_DIR);
} catch (error) {
  console.log('❌ ingestion-platform directory not found');
  process.exit(1);
}

// Change to ingestion-platform directory
process.chdir(INGESTION_PLATFORM_DIR);

console.log('📦 Building and deploying from source...\n');
console.log('⏱️  This will take 10-15 minutes...\n');

try {
  execSync(
    `gcloud run deploy ${SERVICE} ` +
    `--source . ` +
    `--region ${REGION} ` +
    `--platform managed ` +
    `--project ${PROJECT_ID} ` +
    `--add-cloudsql-instances ${PROJECT_ID}:${REGION}:whatsay-db ` +
    `--set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest ` +
    `--set-env-vars NODE_ENV=production ` +
    `--memory 512Mi ` +
    `--cpu 1 ` +
    `--max-instances 10 ` +
    `--timeout 300 ` +
    `--allow-unauthenticated ` +
    `--quiet`,
    {
      stdio: 'inherit',
      timeout: 900000 // 15 minutes
    }
  );

  console.log('\n✅ Deployment complete!\n');
  
  // Get the URL
  console.log('📡 Getting service URL...');
  const url = execSync(
    `gcloud run services describe ${SERVICE} --region ${REGION} --project ${PROJECT_ID} --format="value(status.url)"`,
    { encoding: 'utf8', timeout: 10000 }
  ).trim();

  if (url) {
    console.log(`\n✅ API URL: ${url}\n`);
    console.log('📋 Next steps:');
    console.log(`1. Update API URL: node update-api-url.js ${url}`);
    console.log('2. Test health: curl ' + url + '/health');
    console.log('3. Run migrations: node complete-deployment.js');
  }
} catch (error) {
  console.log('\n❌ Deployment failed:');
  console.log(`   ${error.message}`);
  console.log('\n📋 Check logs for details');
  process.exit(1);
}
