/**
 * Test the LATEST Vercel deployment (4min ago)
 */

const testLatest = async () => {
  console.log('🧪 Testing LATEST deployment (4min old)...\n');
  
  const url = 'https://gifted-project-j0ljyjggl-svantes-projects-c99d7f85.vercel.app/api/reloadly/order';
  
  const orderRequest = {
    productId: 15363,
    countryCode: 'ES',
    quantity: 1,
    unitPrice: 50,
    customIdentifier: 'LATEST_TEST_' + Date.now(),
    senderName: 'svante',
    recipientEmail: 'svante.pagels@gmail.com',
  };
  
  try {
    console.log('📤 Testing:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderRequest),
    });
    
    console.log('\n📥 Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('Response Length:', text.length);
    console.log('Response:', text.substring(0, 1000));
    
    if (!text || text.trim().length === 0) {
      console.error('\n❌ EMPTY RESPONSE - BUG STILL EXISTS!');
    } else {
      try {
        const data = JSON.parse(text);
        console.log('\n✅ JSON Parsed Successfully!');
        console.log(data);
      } catch (err) {
        console.error('\n❌ JSON Parse Error:', err);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
};

testLatest();
