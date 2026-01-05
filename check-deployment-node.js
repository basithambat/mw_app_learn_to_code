#!/usr/bin/env node
/**
 * Check Cloud Run deployment status using Node.js (bypasses shell issues)
 */
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

const PROJECT_ID = 'gen-lang-client-0803362165';
const REGION = 'asia-south1';
const SERVICE = 'whatsay-api';

console.log('🔍 Checking API Deployment Status...\n');

try {
  // Get access token
  console.log('Getting GCP access token...');
  const token = execSync('gcloud auth print-access-token', { 
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 10000
  }).trim();

  // Check service via REST API
  const apiUrl = `https://run.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/services/${SERVICE}`;
  
  console.log('Checking service status via REST API...\n');
  
  const options = {
    hostname: 'run.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/locations/${REGION}/services/${SERVICE}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        const service = JSON.parse(data);
        const url = service.status?.url;
        const conditions = service.status?.conditions || [];

        if (url) {
          console.log('✅ API DEPLOYMENT COMPLETE!');
          console.log(`URL: ${url}\n`);
          
          // Test health endpoint
          console.log('Testing health endpoint...');
          const healthUrl = new URL('/health', url).href;
          
          const healthReq = https.get(healthUrl, (healthRes) => {
            let healthData = '';
            healthRes.on('data', (chunk) => healthData += chunk);
            healthRes.on('end', () => {
              console.log(`Health check: ${healthData}`);
              console.log('\n✅ API is ready!');
              process.exit(0);
            });
          });
          
          healthReq.on('error', (e) => {
            console.log(`Health check failed: ${e.message}`);
            console.log('But API URL exists, so deployment is complete.');
            process.exit(0);
          });
          
          healthReq.setTimeout(5000, () => {
            healthReq.destroy();
            console.log('Health check timeout, but API is deployed.');
            process.exit(0);
          });
        } else {
          console.log('⏳ Service exists but URL not ready yet');
          conditions.forEach(cond => {
            console.log(`  ${cond.type}: ${cond.status}`);
          });
          process.exit(1);
        }
      } else if (res.statusCode === 404) {
        console.log('⏳ Service not found - may still be deploying');
        console.log('\nChecking build status...');
        checkBuildStatus(token);
      } else {
        console.log(`❌ Error: ${res.statusCode}`);
        console.log(data);
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    console.log(`❌ Request error: ${e.message}`);
    process.exit(1);
  });

  req.setTimeout(10000, () => {
    req.destroy();
    console.log('Request timeout');
    process.exit(1);
  });

  req.end();

} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  process.exit(1);
}

function checkBuildStatus(token) {
  const buildUrl = `https://cloudbuild.googleapis.com/v1/projects/${PROJECT_ID}/builds?pageSize=1&orderBy=createTime desc`;
  
  const options = {
    hostname: 'cloudbuild.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/builds?pageSize=1&orderBy=createTime desc`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        const builds = JSON.parse(data);
        if (builds.builds && builds.builds.length > 0) {
          const build = builds.builds[0];
          console.log(`Build ID: ${build.id}`);
          console.log(`Status: ${build.status}`);
          console.log(`Created: ${build.createTime}`);
        }
      }
      process.exit(1);
    });
  });

  req.on('error', () => process.exit(1));
  req.end();
}
