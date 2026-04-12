#!/usr/bin/env npx tsx

import { safeJsonParse } from './lib/utils/safe-json.js';

async function testSafeJson() {
  console.log('🧪 Testing safe-json utility...\n');

  // Test 1: Valid JSON
  const validResponse = new Response(JSON.stringify({ test: 'data' }), {
    headers: { 'content-type': 'application/json' }
  });
  console.log('✅ Test 1: Valid JSON');
  const result1 = await safeJsonParse(validResponse, 'test1');
  console.log('  Result:', result1);

  // Test 2: Empty response
  const emptyResponse = new Response('', {
    headers: { 'content-type': 'application/json' }
  });
  console.log('\n✅ Test 2: Empty response (should throw)');
  try {
    await safeJsonParse(emptyResponse, 'test2');
    console.log('  ❌ Should have thrown!');
  } catch (e: any) {
    console.log('  ✅ Caught:', e.message);
  }

  // Test 3: Reloadly custom content-type
  const reloadlyResponse = new Response(JSON.stringify({ status: 'SUCCESSFUL' }), {
    headers: { 'content-type': 'application/com.reloadly.giftcards-v1+json' }
  });
  console.log('\n✅ Test 3: Reloadly custom content-type');
  const result3 = await safeJsonParse(reloadlyResponse, 'test3');
  console.log('  Result:', result3);

  // Test 4: HTML error page
  const htmlResponse = new Response('<!DOCTYPE html><html>Error</html>', {
    headers: { 'content-type': 'text/html' }
  });
  console.log('\n✅ Test 4: HTML error page (should throw)');
  try {
    await safeJsonParse(htmlResponse, 'test4');
    console.log('  ❌ Should have thrown!');
  } catch (e: any) {
    console.log('  ✅ Caught:', e.message);
  }

  // Test 5: Malformed JSON
  const malformedResponse = new Response('{ invalid json }', {
    headers: { 'content-type': 'application/json' }
  });
  console.log('\n✅ Test 5: Malformed JSON (should throw)');
  try {
    await safeJsonParse(malformedResponse, 'test5');
    console.log('  ❌ Should have thrown!');
  } catch (e: any) {
    console.log('  ✅ Caught:', e.message);
  }

  console.log('\n🎉 All safe-json tests passed!');
}

testSafeJson().catch(console.error);
