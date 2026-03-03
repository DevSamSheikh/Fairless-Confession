// Auth Error Handler - Demonstration & Manual Testing
// This file demonstrates how to test the auth error handler manually

import { handleAuthError, addAuthErrorCallback, removeAuthErrorCallback, resetLogoutFlag } from './authErrorHandler';

// Manual Testing Functions
export async function runAuthErrorTests() {
  console.log('🧪 Starting Auth Error Handler Tests...\n');

  // Reset before each test
  resetLogoutFlag();

  // Test 1: Detect unauthorized errors
  console.log('Test 1: Detect unauthorized errors');
  try {
    const error = new Error('Unauthorized: Invalid or expired token');
    const result = await handleAuthError(error);
    console.log('✅ Result:', result ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ Error:', error);
  }

  // Reset before next test
  resetLogoutFlag();

  // Test 2: Detect 401 status errors
  console.log('\nTest 2: Detect 401 status errors');
  try {
    const error = new Error('Some error');
    (error as any).status = 401;
    const result = await handleAuthError(error);
    console.log('✅ Result:', result ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ Error:', error);
  }

  // Reset before next test
  resetLogoutFlag();

  // Test 3: Should not handle non-auth errors
  console.log('\nTest 3: Should not handle non-auth errors');
  try {
    const error = new Error('Network error');
    const result = await handleAuthError(error);
    console.log('✅ Result:', !result ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ Error:', error);
  }

  // Reset before next test
  resetLogoutFlag();

  // Test 4: Callback functionality
  console.log('\nTest 4: Callback functionality');
  try {
    let callbackCalled = false;
    const callback = () => { callbackCalled = true; };
    
    addAuthErrorCallback(callback);
    
    const error = new Error('Unauthorized: Invalid token');
    await handleAuthError(error);
    
    console.log('✅ Result:', callbackCalled ? 'PASS' : 'FAIL');
    
    removeAuthErrorCallback(callback);
  } catch (error) {
    console.log('❌ Error:', error);
  }

  // Reset before next test
  resetLogoutFlag();

  // Test 5: Prevent multiple logout attempts
  console.log('\nTest 5: Prevent multiple logout attempts');
  try {
    const error = new Error('Unauthorized: Invalid token');
    
    // First call should return true
    const result1 = await handleAuthError(error);
    
    // Second call should return false (already logging out)
    const result2 = await handleAuthError(error);
    
    const pass = result1 && !result2;
    console.log('✅ Result:', pass ? 'PASS' : 'FAIL');
    console.log('   First call:', result1);
    console.log('   Second call:', result2);
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n🎉 Auth Error Handler Tests Complete!');
}

// Example usage in development:
// import { runAuthErrorTests } from './authErrorHandler.test';
// runAuthErrorTests();

// Test Scenarios for Manual Verification:
export const testScenarios = {
  unauthorizedMessage: {
    description: 'Error message contains "Unauthorized"',
    error: new Error('Unauthorized: Invalid or expired token'),
    expected: true
  },
  
  expiredTokenMessage: {
    description: 'Error message contains "expired token"',
    error: new Error('Token expired. Please log in again.'),
    expected: true
  },
  
  status401: {
    description: 'Error has status 401',
    error: Object.assign(new Error('Request failed'), { status: 401 }),
    expected: true
  },
  
  networkError: {
    description: 'Regular network error',
    error: new Error('Network timeout'),
    expected: false
  },
  
  genericError: {
    description: 'Generic error message',
    error: new Error('Something went wrong'),
    expected: false
  }
};

// Manual test runner
export async function testScenario(scenario: keyof typeof testScenarios) {
  const test = testScenarios[scenario];
  console.log(`Testing: ${test.description}`);
  
  resetLogoutFlag();
  const result = await handleAuthError(test.error);
  
  const passed = result === test.expected;
  console.log(`Expected: ${test.expected}, Got: ${result} - ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  return passed;
}
