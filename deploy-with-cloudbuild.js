#!/usr/bin/env node
/**
 * Deploy using Cloud Build (alternative method)
 */
const { execSync } = require('child_process');
const path = require('path');

const PROJECT_ID = 'gen-lang-client-0803362165';
const REGION = 'asia-south1';
const INGESTION_PLATFORM_DIR = path.join(__dirname, 'ingestion-platform');

console.log('🚀 Deploying using Cloud Build (Alternative Method)...\n');

process.chdir(INGESTION_PLATFORM_DIR);

console.log('📦 Submitting build to Cloud Build...\n');
console.log('⏱️  This will take 15-20 minutes...\n');

try {
  // Submit build using cloudbuild.yaml
  const buildId = execSync(
    `gcloud builds submit --config cloudbuild.yaml --project ${PROJECT_ID}`,
    {
      encoding: 'utf8',
      stdio: 'inherit',
      timeout: 1200000 // 20 minutes
    }
  );

  console.log('\n✅ Build submitted successfully!\n');
  console.log('📋 Monitor progress:');
  console.log(`   https://console.cloud.google.com/cloud-build/builds?project=${PROJECT_ID}\n`);
  
  // Wait a bit and check status
  console.log('⏳ Waiting 30 seconds, then checking status...\n');
  setTimeout(() => {
    try {
      const url = execSync(
        `gcloud run services describe whatsay-api --region ${REGION} --project ${PROJECT_ID} --format="value(status.url)"`,
        { encoding: 'utf8', timeout: 10000 }
      ).trim();
      
      if (url) {
        console.log(`✅ API deployed! URL: ${url}\n`);
        console.log('📋 Next steps:');
        console.log(`   node update-api-url.js ${url}`);
      } else {
        console.log('⏳ Deployment still in progress...');
        console.log('   Check status: gcloud run services list --region asia-south1');
      }
    } catch (e) {
      console.log('⏳ Service not ready yet. Check Cloud Build console for progress.');
    }
  }, 30000);

} catch (error) {
  console.log('\n❌ Build submission failed:');
  console.log(`   ${error.message}`);
  console.log('\n📋 Check Cloud Build console for details:');
  console.log(`   https://console.cloud.google.com/cloud-build/builds?project=${PROJECT_ID}`);
  process.exit(1);
}
