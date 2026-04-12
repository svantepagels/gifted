#!/usr/bin/env npx tsx

/**
 * Test script to verify production checkout fix
 * Tests that the API returns valid JSON instead of empty 500
 */

const PRODUCTION_URL = 'https://gifted-project-blue.vercel.app';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const results: TestResult[] = [];

async function testCheckoutEndpoint() {
  console.log('\n🧪 Testing Production Checkout Fix\n');
  console.log('Production URL:', PRODUCTION_URL);
  console.log('=' .repeat(60));
  
  // Test 1: Verify endpoint returns valid JSON (not empty 500)
  console.log('\n📝 Test 1: Valid JSON Response');
  console.log('-'.repeat(60));
  
  try {
    const orderData = {
      productId: 15363,
      countryCode: 'ES',
      quantity: 1,
      unitPrice: 50,
      recipientEmail: 'test@example.com',
      senderName: 'Test User',
      customIdentifier: 'TEST_' + Date.now(),
    };
    
    const response = await fetch(`${PRODUCTION_URL}/api/reloadly/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Content-Length: ${response.headers.get('content-length')}`);
    
    // Get response text first
    const responseText = await response.text();
    console.log(`Response Body: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    
    // Verify we got SOME response (not empty 500)
    if (response.status === 500 && responseText.length === 0) {
      results.push({
        test: 'Empty 500 Check',
        status: 'FAIL',
        details: '❌ Still returning empty 500 response',
      });
      console.log('\n❌ FAIL: Empty 500 response detected');
    } else if (responseText.length === 0) {
      results.push({
        test: 'Empty Response Check',
        status: 'FAIL',
        details: `❌ Empty response with status ${response.status}`,
      });
      console.log('\n❌ FAIL: Empty response');
    } else {
      results.push({
        test: 'Non-Empty Response',
        status: 'PASS',
        details: `✅ Got response with ${responseText.length} bytes`,
      });
      console.log('\n✅ PASS: Got non-empty response');
    }
    
    // Verify JSON is parseable
    try {
      const data = JSON.parse(responseText);
      results.push({
        test: 'Valid JSON',
        status: 'PASS',
        details: '✅ Response is valid JSON',
      });
      console.log('✅ PASS: Valid JSON response');
      
      // Log the response structure
      console.log('\nResponse structure:', JSON.stringify(data, null, 2).substring(0, 300));
      
      // Check if it's an error or success
      if (data.error) {
        console.log(`\n⚠️ Got error response (expected in sandbox): ${data.error}`);
        if (data.details) {
          console.log(`   Details: ${data.details}`);
        }
      } else if (data.transactionId) {
        console.log(`\n✅ Got successful order response!`);
        console.log(`   Transaction ID: ${data.transactionId}`);
        console.log(`   Status: ${data.status}`);
      }
    } catch (parseError) {
      results.push({
        test: 'JSON Parsing',
        status: 'FAIL',
        details: `❌ Response is not valid JSON: ${parseError}`,
      });
      console.log('\n❌ FAIL: Response is not valid JSON');
    }
    
  } catch (error) {
    results.push({
      test: 'API Request',
      status: 'FAIL',
      details: `❌ Request failed: ${error}`,
    });
    console.log('\n❌ FAIL: Request error:', error);
  }
  
  // Test 2: Verify rate limiting headers are present
  console.log('\n📝 Test 2: Rate Limiting Headers');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/reloadly/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 15363,
        countryCode: 'ES',
        quantity: 1,
        unitPrice: 50,
        recipientEmail: 'test@example.com',
        senderName: 'Test',
        customIdentifier: 'TEST_RL_' + Date.now(),
      }),
    });
    
    const rateLimit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');
    
    console.log(`X-RateLimit-Limit: ${rateLimit}`);
    console.log(`X-RateLimit-Remaining: ${remaining}`);
    console.log(`X-RateLimit-Reset: ${reset}`);
    
    if (rateLimit && remaining && reset) {
      results.push({
        test: 'Rate Limit Headers',
        status: 'PASS',
        details: `✅ Rate limiting active (limit: ${rateLimit}, remaining: ${remaining})`,
      });
      console.log('\n✅ PASS: Rate limiting headers present');
    } else {
      results.push({
        test: 'Rate Limit Headers',
        status: 'FAIL',
        details: '❌ Missing rate limit headers',
      });
      console.log('\n❌ FAIL: Missing rate limit headers');
    }
    
  } catch (error) {
    console.log('\n⚠️ Could not test rate limiting headers:', error);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`\n${icon} ${result.test}`);
    console.log(`   ${result.details}`);
  });
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${passed}/${total} tests passed`);
  console.log('='.repeat(60));
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Production fix verified.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Review the output above.');
    process.exit(1);
  }
}

testCheckoutEndpoint();
