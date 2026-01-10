#!/usr/bin/env node
/**
 * Update Production API URL in api/apiIngestion.ts
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_FILE = path.join(__dirname, 'api', 'apiIngestion.ts');
const PROJECT_ID = 'gen-lang-client-0803362165';
const REGION = 'asia-south1';
const SERVICE = 'whatsay-api';

console.log('🔄 Updating Production API URL...\n');

// Get API URL from GCP
let apiUrl;
try {
  console.log('📡 Getting API URL from GCP...');
  apiUrl = execSync(
    `gcloud run services describe ${SERVICE} --region ${REGION} --project ${PROJECT_ID} --format="value(status.url)"`,
    { encoding: 'utf8', timeout: 15000 }
  ).trim();

  if (!apiUrl || !apiUrl.startsWith('https://')) {
    throw new Error('Invalid API URL');
  }

  console.log(`✅ Found API URL: ${apiUrl}\n`);
} catch (error) {
  console.log('❌ Could not get API URL from GCP:');
  console.log(`   ${error.message}\n`);
  console.log('💡 Options:');
  console.log('1. Deploy API first: node complete-deployment.js');
  console.log('2. Or provide URL manually as argument:');
  console.log('   node update-api-url.js https://your-api-url.run.app');
  
  // Check if URL provided as argument
  if (process.argv[2]) {
    apiUrl = process.argv[2];
    console.log(`\n📋 Using provided URL: ${apiUrl}\n`);
  } else {
    process.exit(1);
  }
}

// Read current file
let content;
try {
  content = fs.readFileSync(API_FILE, 'utf8');
} catch (error) {
  console.log(`❌ Could not read ${API_FILE}`);
  process.exit(1);
}

// Update the URL
const oldPattern = /const PRODUCTION_API_URL = ['"]([^'"]+)['"]/;
const newLine = `const PRODUCTION_API_URL = '${apiUrl}';`;

if (oldPattern.test(content)) {
  content = content.replace(oldPattern, newLine);
  console.log('✅ Updated PRODUCTION_API_URL constant');
} else {
  // Try to find and replace the TODO comment
  const todoPattern = /const PRODUCTION_API_URL = 'https:\/\/whatsay-api-XXXXX-as\.a\.run\.app'; \/\/ TODO: Update after deployment/;
  if (todoPattern.test(content)) {
    content = content.replace(todoPattern, newLine + ' // Updated automatically');
    console.log('✅ Updated PRODUCTION_API_URL from TODO');
  } else {
    console.log('⚠️  Could not find PRODUCTION_API_URL pattern');
    console.log('   Please update manually in api/apiIngestion.ts');
    process.exit(1);
  }
}

// Write updated file
try {
  fs.writeFileSync(API_FILE, content, 'utf8');
  console.log(`✅ Updated ${API_FILE}\n`);
  
  console.log('📋 Next steps:');
  console.log('1. Verify the change in api/apiIngestion.ts');
  console.log('2. Test the app with production API');
  console.log('3. Build production app: eas build --platform android --profile production');
} catch (error) {
  console.log(`❌ Could not write ${API_FILE}`);
  console.log(`   ${error.message}`);
  process.exit(1);
}
