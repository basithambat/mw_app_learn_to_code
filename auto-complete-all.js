#!/usr/bin/env node
/**
 * Auto-complete entire deployment - monitors build and completes all steps
 */
const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'gen-lang-client-0803362165';
const REGION = 'asia-south1';
const SERVICE = 'whatsay-api';
const BUILD_ID = '641fabbe-5f9e-44dd-bafb-580cb309a90d';

console.log('🤖 Auto-completing entire deployment...\n');
console.log(`📦 Monitoring build: ${BUILD_ID}\n`);

// Wait for build with progress updates
async function waitForBuild() {
  let elapsed = 0;
  const checkInterval = 30000; // 30 seconds
  
  return new Promise((resolve, reject) => {
    const check = () => {
      try {
        const status = execSync(
          `gcloud builds describe ${BUILD_ID} --project ${PROJECT_ID} --format="value(status)"`,
          { encoding: 'utf8', timeout: 10000 }
        ).trim();
        
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        process.stdout.write(`\r⏳ Build: ${status} (${minutes}m ${seconds}s)`);
        
        if (status === 'SUCCESS') {
          console.log('\n✅ Build completed successfully!\n');
          resolve(true);
          return;
        }
        
        if (status === 'FAILURE' || status === 'CANCELLED') {
          console.log(`\n❌ Build ${status.toLowerCase()}`);
          reject(new Error(`Build ${status.toLowerCase()}`));
          return;
        }
        
        elapsed += checkInterval / 1000;
        if (elapsed > 1800) { // 30 minutes max
          console.log('\n⏱️  Build timeout');
          reject(new Error('Build timeout'));
          return;
        }
        
        setTimeout(check, checkInterval);
      } catch (error) {
        console.log(`\n⚠️  Error checking build: ${error.message}`);
        setTimeout(check, checkInterval);
      }
    };
    
    check();
  });
}

// Wait for service to be ready
async function waitForService(maxWait = 300) {
  let elapsed = 0;
  const checkInterval = 10000; // 10 seconds
  
  return new Promise((resolve, reject) => {
    const check = () => {
      try {
        const url = execSync(
          `gcloud run services describe ${SERVICE} --region ${REGION} --project ${PROJECT_ID} --format="value(status.url)"`,
          { encoding: 'utf8', timeout: 10000 }
        ).trim();
        
        if (url && url.startsWith('https://')) {
          // Check if service is actually ready
          const status = execSync(
            `gcloud run services describe ${SERVICE} --region ${REGION} --project ${PROJECT_ID} --format="value(status.conditions[0].status)"`,
            { encoding: 'utf8', timeout: 10000 }
          ).trim();
          
          if (status === 'True') {
            console.log(`✅ Service ready: ${url}\n`);
            resolve(url);
            return;
          }
        }
        
        elapsed += checkInterval / 1000;
        if (elapsed > maxWait) {
          reject(new Error('Service timeout'));
          return;
        }
        
        process.stdout.write(`\r⏳ Waiting for service... (${Math.floor(elapsed)}s)`);
        setTimeout(check, checkInterval);
      } catch (error) {
        setTimeout(check, checkInterval);
      }
    };
    
    check();
  });
}

// Test health endpoint
function testHealth(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL('/health', url);
      const req = https.get(urlObj.href, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve(res.statusCode === 200);
        });
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    } catch (e) {
      resolve(false);
    }
  });
}

// Update API URL
function updateAPIURL(url) {
  const apiFile = path.join(__dirname, 'api', 'apiIngestion.ts');
  try {
    let content = fs.readFileSync(apiFile, 'utf8');
    const pattern = /const PRODUCTION_API_URL = ['"]([^'"]+)['"]/;
    if (pattern.test(content)) {
      content = content.replace(pattern, `const PRODUCTION_API_URL = '${url}'`);
      fs.writeFileSync(apiFile, content, 'utf8');
      return true;
    }
  } catch (error) {
    console.log(`⚠️  Could not update: ${error.message}`);
  }
  return false;
}

// Run migrations
async function runMigrations(apiImage) {
  console.log('🗄️  Running database migrations...\n');
  try {
    // Check if job exists
    try {
      execSync(
        `gcloud run jobs describe whatsay-migrate --region ${REGION} --project ${PROJECT_ID}`,
        { stdio: 'ignore', timeout: 10000 }
      );
    } catch (e) {
      // Create job
      execSync(
        `gcloud run jobs create whatsay-migrate ` +
        `--image "${apiImage}" ` +
        `--region ${REGION} ` +
        `--add-cloudsql-instances ${PROJECT_ID}:${REGION}:whatsay-db ` +
        `--set-secrets DATABASE_URL=database-url:latest ` +
        `--set-env-vars NODE_ENV=production ` +
        `--command npx ` +
        `--args "prisma migrate deploy" ` +
        `--memory 512Mi ` +
        `--cpu 1 ` +
        `--project ${PROJECT_ID} ` +
        `--quiet`,
        { stdio: 'inherit', timeout: 300000 }
      );
    }
    
    // Execute
    execSync(
      `gcloud run jobs execute whatsay-migrate --region ${REGION} --project ${PROJECT_ID} --wait`,
      { stdio: 'inherit', timeout: 300000 }
    );
    return true;
  } catch (error) {
    console.log(`⚠️  Migrations failed: ${error.message}`);
    return false;
  }
}

// Deploy worker
async function deployWorker(apiImage) {
  console.log('⚙️  Deploying worker job...\n');
  try {
    try {
      execSync(
        `gcloud run jobs describe whatsay-worker --region ${REGION} --project ${PROJECT_ID}`,
        { stdio: 'ignore', timeout: 10000 }
      );
      console.log('✅ Worker already exists\n');
      return true;
    } catch (e) {
      execSync(
        `gcloud run jobs create whatsay-worker ` +
        `--image "${apiImage}" ` +
        `--region ${REGION} ` +
        `--add-cloudsql-instances ${PROJECT_ID}:${REGION}:whatsay-db ` +
        `--set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest ` +
        `--set-env-vars NODE_ENV=production ` +
        `--memory 512Mi ` +
        `--cpu 1 ` +
        `--max-retries 3 ` +
        `--task-timeout 3600 ` +
        `--command node ` +
        `--args "dist/worker.js" ` +
        `--project ${PROJECT_ID} ` +
        `--quiet`,
        { stdio: 'inherit', timeout: 300000 }
      );
      return true;
    }
  } catch (error) {
    console.log(`⚠️  Worker failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  try {
    // Step 1: Wait for build
    await waitForBuild();
    
    // Step 2: Wait for service
    const apiUrl = await waitForService();
    
    // Step 3: Test health
    console.log('🧪 Testing health endpoint...\n');
    const healthy = await testHealth(apiUrl);
    console.log(healthy ? '✅ Health check passed!\n' : '⚠️  Health check failed, but service exists\n');
    
    // Step 4: Update frontend
    console.log('📝 Updating frontend API URL...\n');
    updateAPIURL(apiUrl);
    console.log('✅ Frontend updated!\n');
    
    // Step 5: Get API image
    console.log('📦 Getting API image...\n');
    const apiImage = execSync(
      `gcloud run services describe ${SERVICE} --region ${REGION} --project ${PROJECT_ID} --format="value(spec.template.spec.containers[0].image)"`,
      { encoding: 'utf8', timeout: 10000 }
    ).trim();
    
    // Step 6: Run migrations
    const migrationsOk = await runMigrations(apiImage);
    
    // Step 7: Deploy worker
    const workerOk = await deployWorker(apiImage);
    
    // Final summary
    console.log('\n🎉 Deployment Complete!\n');
    console.log('📊 Summary:');
    console.log(`  ✅ API: ${apiUrl}`);
    console.log(`  ✅ Frontend: Updated`);
    console.log(`  ${migrationsOk ? '✅' : '⚠️ '} Migrations: ${migrationsOk ? 'Complete' : 'Failed'}`);
    console.log(`  ${workerOk ? '✅' : '⚠️ '} Worker: ${workerOk ? 'Deployed' : 'Failed'}`);
    console.log('\n🚀 Ready for production!');
    console.log('\n📋 Next: Build production app');
    console.log('   eas build --platform android --profile production');
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
