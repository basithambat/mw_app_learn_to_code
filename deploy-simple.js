#!/usr/bin/env node
/**
 * Simplified deployment - try without some options
 */
const { execSync } = require('child_process');
const path = require('path');

const PROJECT_ID = 'gen-lang-client-0803362165';
const REGION = 'asia-south1';
const SERVICE = 'whatsay-api';
const INGESTION_PLATFORM_DIR = path.join(__dirname, 'ingestion-platform');

console.log('🚀 Simplified Deployment Method...\n');

process.chdir(INGESTION_PLATFORM_DIR);

// Try minimal deployment first
console.log('📦 Attempting minimal deployment (no Cloud SQL first)...\n');

try {
  // Step 1: Deploy without Cloud SQL connection first
  execSync(
    `gcloud run deploy ${SERVICE} ` +
    `--source . ` +
    `--region ${REGION} ` +
    `--platform managed ` +
    `--project ${PROJECT_ID} ` +
    `--set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest ` +
    `--set-env-vars NODE_ENV=production ` +
    `--memory 512Mi ` +
    `--cpu 1 ` +
    `--allow-unauthenticated ` +
    `--no-traffic`,
    {
      stdio: 'inherit',
      timeout: 900000
    }
  );

  console.log('\n✅ Initial deployment successful!\n');
  
  // Step 2: Add Cloud SQL connection
  console.log('🔗 Adding Cloud SQL connection...\n');
  execSync(
    `gcloud run services update ${SERVICE} ` +
    `--region ${REGION} ` +
    `--project ${PROJECT_ID} ` +
    `--add-cloudsql-instances ${PROJECT_ID}:${REGION}:whatsay-db`,
    {
      stdio: 'inherit',
      timeout: 60000
    }
  );

  // Step 3: Send traffic
  console.log('\n🚦 Sending traffic to new revision...\n');
  execSync(
    `gcloud run services update-traffic ${SERVICE} ` +
    `--region ${REGION} ` +
    `--project ${PROJECT_ID} ` +
    `--to-latest`,
    {
      stdio: 'inherit',
      timeout: 30000
    }
  );

  // Get URL
  const url = execSync(
    `gcloud run services describe ${SERVICE} --region ${REGION} --project ${PROJECT_ID} --format="value(status.url)"`,
    { encoding: 'utf8', timeout: 10000 }
  ).trim();

  console.log(`\n✅ Deployment complete! API URL: ${url}\n`);
  console.log('📋 Next steps:');
  console.log(`   node update-api-url.js ${url}`);

} catch (error) {
  console.log('\n❌ Deployment failed:');
  console.log(`   ${error.message}`);
  console.log('\n💡 Trying Cloud Build method instead...');
  console.log('   node deploy-with-cloudbuild.js');
  process.exit(1);
}
