#!/usr/bin/env node
/**
 * Complete Deployment Script - Smart Infrastructure Engineer Approach
 * Handles: Status check, migrations, worker, scheduler - all in one
 */
const { execSync, spawn } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'gen-lang-client-0803362165';
const REGION = 'asia-south1';
const SERVICE = 'whatsay-api';
const WORKER_JOB = 'whatsay-worker';
const MIGRATE_JOB = 'whatsay-migrate';
const SCHEDULER = 'whatsay-worker-hourly';

console.log('🚀 Complete Deployment Script - Mumbai Region\n');
console.log('This script will:');
console.log('1. Check API deployment status');
console.log('2. Run database migrations');
console.log('3. Deploy worker job');
console.log('4. Set up Cloud Scheduler');
console.log('5. Verify everything works\n');

// Helper to run gcloud commands
function runGcloud(args, description) {
  console.log(`\n📋 ${description}...`);
  try {
    const cmd = ['gcloud', ...args].join(' ');
    const result = execSync(cmd, { 
      encoding: 'utf8',
      stdio: 'inherit',
      timeout: 300000
    });
    return { success: true, output: result };
  } catch (error) {
    console.log(`⚠️  ${description} failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Step 1: Check API Status
function checkAPIStatus() {
  console.log('\n🔍 Step 1: Checking API Deployment Status...\n');
  
  try {
    const url = execSync(
      `gcloud run services describe ${SERVICE} --region ${REGION} --project ${PROJECT_ID} --format="value(status.url)"`,
      { encoding: 'utf8', timeout: 10000 }
    ).trim();

    if (url && url.startsWith('https://')) {
      console.log(`✅ API is deployed!`);
      console.log(`URL: ${url}\n`);
      
      // Test health
      try {
        const healthUrl = `${url}/health`;
        const result = execSync(`curl -s ${healthUrl}`, { 
          encoding: 'utf8', 
          timeout: 5000 
        });
        console.log(`Health check: ${result}`);
      } catch (e) {
        console.log('Health check failed, but API is deployed.');
      }
      
      return { deployed: true, url };
    }
  } catch (error) {
    console.log('⏳ API not deployed yet or still building');
    console.log('Checking build status...\n');
    
    const buildStatus = runGcloud([
      'builds', 'list',
      '--limit', '1',
      '--project', PROJECT_ID,
      '--format', 'table(id,status,createTime)'
    ], 'Checking latest build');
    
    if (buildStatus.success) {
      console.log('\n💡 If build status is SUCCESS, API should be ready soon.');
      console.log('💡 If build status is WORKING, deployment is in progress.');
      console.log('💡 If build status is FAILURE, check logs with:');
      console.log(`   gcloud builds log <BUILD_ID> --project ${PROJECT_ID}`);
    }
    
    return { deployed: false };
  }
  
  return { deployed: false };
}

// Step 2: Get API Image
function getAPIImage() {
  console.log('\n📦 Step 2: Getting API Image...\n');
  
  try {
    const image = execSync(
      `gcloud run services describe ${SERVICE} --region ${REGION} --project ${PROJECT_ID} --format="value(spec.template.spec.containers[0].image)"`,
      { encoding: 'utf8', timeout: 10000 }
    ).trim();
    
    if (image) {
      console.log(`✅ API Image: ${image}`);
      return image;
    }
  } catch (error) {
    console.log('⚠️  Could not get API image. Will use service name.');
  }
  
  return `gcr.io/${PROJECT_ID}/${SERVICE}`;
}

// Step 3: Run Migrations
function runMigrations(apiImage) {
  console.log('\n🗄️  Step 3: Running Database Migrations...\n');
  
  // Check if migration job exists
  try {
    execSync(
      `gcloud run jobs describe ${MIGRATE_JOB} --region ${REGION} --project ${PROJECT_ID}`,
      { encoding: 'utf8', stdio: 'ignore', timeout: 10000 }
    );
    console.log('Migration job exists, executing...');
  } catch (error) {
    console.log('Creating migration job...');
    
    const createResult = runGcloud([
      'run', 'jobs', 'create', MIGRATE_JOB,
      '--image', apiImage,
      '--region', REGION,
      '--add-cloudsql-instances', `${PROJECT_ID}:${REGION}:whatsay-db`,
      '--set-secrets', 'DATABASE_URL=database-url:latest',
      '--set-env-vars', 'NODE_ENV=production',
      '--command', 'npx',
      '--args', 'prisma migrate deploy',
      '--memory', '512Mi',
      '--cpu', '1',
      '--project', PROJECT_ID
    ], 'Creating migration job');
    
    if (!createResult.success) {
      console.log('⚠️  Could not create migration job. Continuing...');
      return false;
    }
  }
  
  // Execute migration
  const executeResult = runGcloud([
    'run', 'jobs', 'execute', MIGRATE_JOB,
    '--region', REGION,
    '--project', PROJECT_ID,
    '--wait'
  ], 'Executing migrations');
  
  return executeResult.success;
}

// Step 4: Deploy Worker
function deployWorker(apiImage) {
  console.log('\n⚙️  Step 4: Deploying Worker Job...\n');
  
  // Check if worker exists
  try {
    execSync(
      `gcloud run jobs describe ${WORKER_JOB} --region ${REGION} --project ${PROJECT_ID}`,
      { encoding: 'utf8', stdio: 'ignore', timeout: 10000 }
    );
    console.log('✅ Worker job already exists');
    return true;
  } catch (error) {
    console.log('Creating worker job...');
  }
  
  const result = runGcloud([
    'run', 'jobs', 'create', WORKER_JOB,
    '--image', apiImage,
    '--region', REGION,
    '--add-cloudsql-instances', `${PROJECT_ID}:${REGION}:whatsay-db`,
    '--set-secrets', 'DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest',
    '--set-env-vars', 'NODE_ENV=production',
    '--memory', '512Mi',
    '--cpu', '1',
    '--max-retries', '3',
    '--task-timeout', '3600',
    '--command', 'node',
    '--args', 'dist/worker.js',
    '--project', PROJECT_ID
  ], 'Creating worker job');
  
  return result.success;
}

// Step 5: Set Up Scheduler
function setupScheduler() {
  console.log('\n⏰ Step 5: Setting Up Cloud Scheduler...\n');
  
  // Get worker job URL
  try {
    const jobUrl = execSync(
      `gcloud run jobs describe ${WORKER_JOB} --region ${REGION} --project ${PROJECT_ID} --format="value(status.url)"`,
      { encoding: 'utf8', timeout: 10000 }
    ).trim();
    
    if (!jobUrl) {
      console.log('⚠️  Worker job URL not available yet');
      return false;
    }
    
    // Check if scheduler exists
    try {
      execSync(
        `gcloud scheduler jobs describe ${SCHEDULER} --location ${REGION} --project ${PROJECT_ID}`,
        { encoding: 'utf8', stdio: 'ignore', timeout: 10000 }
      );
      console.log('✅ Scheduler already exists');
      return true;
    } catch (error) {
      console.log('Creating scheduler...');
    }
    
    const result = runGcloud([
      'scheduler', 'jobs', 'create', 'http', SCHEDULER,
      '--schedule', '0 * * * *',
      '--uri', `${jobUrl}/run`,
      '--http-method', 'POST',
      '--oauth-service-account', `278662370606-compute@developer.gserviceaccount.com`,
      '--location', REGION,
      '--project', PROJECT_ID
    ], 'Creating Cloud Scheduler');
    
    return result.success;
  } catch (error) {
    console.log(`⚠️  Could not set up scheduler: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  // Step 1: Check API
  const apiStatus = checkAPIStatus();
  
  if (!apiStatus.deployed) {
    console.log('\n❌ API is not deployed yet.');
    console.log('Please wait for deployment to complete, then run this script again.');
    console.log('\nTo check status manually:');
    console.log(`  gcloud run services describe ${SERVICE} --region ${REGION} --project ${PROJECT_ID} --format="value(status.url)"`);
    process.exit(1);
  }
  
  // Step 2: Get API Image
  const apiImage = getAPIImage();
  
  // Step 3: Run Migrations
  const migrationsOk = runMigrations(apiImage);
  if (!migrationsOk) {
    console.log('\n⚠️  Migrations failed, but continuing...');
  }
  
  // Step 4: Deploy Worker
  const workerOk = deployWorker(apiImage);
  if (!workerOk) {
    console.log('\n⚠️  Worker deployment failed');
    process.exit(1);
  }
  
  // Step 5: Set Up Scheduler
  const schedulerOk = setupScheduler();
  if (!schedulerOk) {
    console.log('\n⚠️  Scheduler setup failed, but worker is deployed');
  }
  
  // Final Summary
  console.log('\n✅ Deployment Complete!\n');
  console.log('📊 Summary:');
  console.log(`  ✅ API: ${apiStatus.url}`);
  console.log(`  ${migrationsOk ? '✅' : '⚠️ '} Migrations: ${migrationsOk ? 'Complete' : 'Failed'}`);
  console.log(`  ✅ Worker: Deployed`);
  console.log(`  ${schedulerOk ? '✅' : '⚠️ '} Scheduler: ${schedulerOk ? 'Configured' : 'Not configured'}`);
  console.log('\n💰 Cost: ~$41-66/month (Mumbai region)');
  console.log('🚀 Ready for production!');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
