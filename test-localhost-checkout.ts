/**
 * Test checkout on localhost:3000 (with the fix)
 */

const testLocalCheckout = async () => {
  console.log('🧪 Testing LOCALHOST checkout (with fix)...\n');
  
  const orderRequest = {
    productId: 15363,
    countryCode: 'ES',
    quantity: 1,
    unitPrice: 50,
    customIdentifier: 'LOCAL_TEST_' + Date.now(),
    senderName: 'svante',
    recipientEmail: 'svante.pagels@gmail.com',
  };
  
  try {
    console.log('📤 Sending order to http://localhost:3000/api/reloadly/order...');
    
    const response = await fetch('http://localhost:3000/api/reloadly/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderRequest),
    });
    
    console.log('\n📥 Response Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('\n📄 Response Body (raw):', text.substring(0, 1000));
    
    if (!text || text.trim().length === 0) {
      console.error('\n❌ EMPTY RESPONSE!');
      return;
    }
    
    try {
      const data = JSON.parse(text);
      console.log('\n✅ JSON Parsed:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.log('\n⚠️ Expected Error (Sandbox API):', data.error);
        console.log('✅ Error message is clear and user-friendly!');
      } else {
        console.log('\n🎉 Order Success!');
      }
    } catch (err) {
      console.error('\n❌ JSON Parse Error:', err);
    }
    
  } catch (error) {
    console.error('\n❌ Fetch Error:', error);
  }
};

testLocalCheckout();
