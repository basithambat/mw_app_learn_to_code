// Quick script to check if Expo server is running
const http = require('http');

function checkServer() {
  const options = {
    hostname: 'localhost',
    port: 8081,
    path: '/status',
    method: 'GET',
    timeout: 2000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Expo server is running! Status: ${res.statusCode}`);
    process.exit(0);
  });

  req.on('error', (e) => {
    console.log(`❌ Server not responding: ${e.message}`);
    console.log('💡 Try running: npm start');
    process.exit(1);
  });

  req.on('timeout', () => {
    req.destroy();
    console.log('⏱️  Request timeout - server may still be starting');
    process.exit(1);
  });

  req.end();
}

checkServer();
