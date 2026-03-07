// Test API Endpoints Script
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`Testing ${method} ${endpoint}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${endpoint} - SUCCESS`);
      if (Array.isArray(data)) {
        console.log(`   Returned ${data.length} items`);
      } else if (data) {
        console.log(`   Returned data: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
      }
    } else {
      console.log(`❌ ${endpoint} - FAILED: ${data.error || response.statusText}`);
    }
    console.log('---');
    
    return response.ok;
  } catch (error) {
    console.log(`❌ ${endpoint} - ERROR: ${error.message}`);
    console.log('---');
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Society API Endpoints...\n');
  
  const tests = [
    { endpoint: '/health', method: 'GET' },
    { endpoint: '/api/societies', method: 'GET' },
    { endpoint: '/api/societies/discover', method: 'GET' },
    { endpoint: '/api/societies/joined', method: 'GET' },
    { endpoint: '/api/societies/you', method: 'GET' },
    { endpoint: '/api/societies/confessions', method: 'GET' },
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.method);
    if (success) passed++;
  }

  console.log(`\n📊 Results: ${passed}/${total} endpoints working`);
  
  if (passed === total) {
    console.log('🎉 All endpoints are working correctly!');
  } else {
    console.log('⚠️  Some endpoints are failing. Check the server logs.');
  }
}

// Check if server is running first
testEndpoint('/health').then(isRunning => {
  if (isRunning) {
    runTests();
  } else {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   cd server && npm start');
  }
});
