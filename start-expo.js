#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Expo development server...\n');

const logFile = path.join(__dirname, 'expo-server-output.log');
const logStream = fs.createWriteStream(logFile, { flags: 'w' });

const expo = spawn('npx', ['expo', 'start', '--dev-client'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

expo.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  logStream.write(output);
});

expo.stderr.on('data', (data) => {
  const output = data.toString();
  process.stderr.write(output);
  logStream.write(output);
});

expo.on('close', (code) => {
  console.log(`\n\nExpo process exited with code ${code}`);
  logStream.end();
  process.exit(code);
});

expo.on('error', (err) => {
  console.error('Failed to start Expo:', err);
  logStream.write(`Error: ${err.message}\n`);
  logStream.end();
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\nStopping Expo server...');
  expo.kill();
  logStream.end();
  process.exit(0);
});

console.log('📝 Logs are being written to: expo-server-output.log');
console.log('💡 Press Ctrl+C to stop the server\n');
