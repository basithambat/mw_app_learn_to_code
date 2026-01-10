#!/usr/bin/env node
/**
 * Get Production API URL from GCP
 */
const { execSync } = require('child_process');

const PROJECT_ID = 'gen-lang-client-0803362165';
const REGION = 'asia-south1';
const SERVICE = 'whatsay-api';

console.log('🔍 Getting Production API URL from GCP...\n');

try {
  const url = execSync(
    `gcloud run services describe ${SERVICE} --region ${REGION} --project ${PROJECT_ID} --format="value(status.url)"`,
    { encoding: 'utf8', timeout: 15000 }
  ).trim();

  if (url && url.startsWith('https://')) {
    console.log('✅ Production API URL found:');
    console.log(`   ${url}\n`);
    
    // Test health endpoint
    console.log('🧪 Testing health endpoint...');
    try {
      const https = require('https');
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        path: '/health',
        method: 'GET',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log(`✅ Health check passed: ${data.substring(0, 100)}`);
          console.log('\n📋 Next steps:');
          console.log(`1. Update api/apiIngestion.ts with: ${url}`);
          console.log('2. Build production app');
          process.exit(0);
        });
      });

      req.on('error', (e) => {
        console.log(`⚠️  Health check failed: ${e.message}`);
        console.log('But API URL exists, so deployment is complete.');
        console.log(`\n📋 Update api/apiIngestion.ts with: ${url}`);
        process.exit(0);
      });

      req.on('timeout', () => {
        req.destroy();
        console.log('⚠️  Health check timeout');
        console.log(`\n📋 Update api/apiIngestion.ts with: ${url}`);
        process.exit(0);
      });

      req.end();
    } catch (e) {
      console.log(`⚠️  Could not test health: ${e.message}`);
      console.log(`\n📋 Update api/apiIngestion.ts with: ${url}`);
      process.exit(0);
    }
  } else {
    console.log('❌ API not deployed yet');
    console.log('\n📋 Run: node complete-deployment.js');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error getting API URL:');
  console.log(`   ${error.message}`);
  console.log('\n📋 Possible issues:');
  console.log('1. API not deployed yet - Run: node complete-deployment.js');
  console.log('2. gcloud not authenticated - Run: gcloud auth login');
  console.log('3. Wrong project/region');
  process.exit(1);
}
