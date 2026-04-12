/**
 * Test the exact checkout scenario from the bug report
 * Product: Netflix €50
 * Email: svante.pagels@gmail.com
 */

const testCheckout = async () => {
  console.log('🧪 Testing checkout flow with Netflix €50...\n');
  
  const orderRequest = {
    productId: 15363, // Netflix ES from the catalog
    countryCode: 'ES',
    quantity: 1,
    unitPrice: 50,
    customIdentifier: 'TEST_ORDER_' + Date.now(),
    senderName: 'svante',
    recipientEmail: 'svante.pagels@gmail.com',
  };
  
  try {
    console.log('📤 Sending order request...');
    console.log('Request:', JSON.stringify(orderRequest, null, 2));
    
    const response = await fetch('https://gifted-project-blue.vercel.app/api/reloadly/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderRequest),
    });
    
    console.log('\n📥 Response Status:', response.status);
    console.log('Response Headers:', {
      'content-type': response.headers.get('content-type'),
      'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
      'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
    });
    
    // Read response as text first (to detect empty responses)
    const text = await response.text();
    console.log('\n📄 Response Body (raw text):', text.substring(0, 500));
    
    if (!text || text.trim().length === 0) {
      console.error('❌ EMPTY RESPONSE - This would cause "Unexpected end of JSON input"!');
      return;
    }
    
    // Try to parse JSON
    try {
      const data = JSON.parse(text);
      console.log('\n✅ JSON Parsed Successfully:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.log('\n⚠️ Order Error:', data.error);
      } else if (data.transactionId) {
        console.log('\n🎉 Order Success! Transaction ID:', data.transactionId);
        console.log('Status:', data.status);
      }
    } catch (parseError) {
      console.error('\n❌ JSON PARSE ERROR:', parseError);
      console.error('This is the bug! Response was:', text);
    }
    
  } catch (error) {
    console.error('\n❌ Fetch Error:', error);
  }
};

testCheckout();
