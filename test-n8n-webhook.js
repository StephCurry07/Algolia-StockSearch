/**
 * N8N Webhook Test for Charts
 * Tests the n8n webhook integration for chart data
 */

const N8N_BASE_URL = 'http://localhost:5678';
const API_BASE_URL = 'http://localhost:3001';

// Test configurations
const testConfigs = [
  {
    name: "Direct N8N Webhook Test",
    url: `${N8N_BASE_URL}/webhook-test/chart`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      symbol: "NASDAQ:AAPL",
      theme: "dark",
      studies: [
        { name: "Bollinger Bands" },
        { name: "Volume" },
        { name: "Relative Strength Index" }
      ]
    }
  },
  {
    name: "API Endpoint Test",
    url: `${API_BASE_URL}/api/chart?symbol=AAPL&exchange=NASDAQ`,
    method: "GET",
    headers: {},
    body: null
  }
];

/**
 * Test a webhook endpoint
 */
async function testWebhook(config) {
  console.log(`\n🔗 Testing: ${config.name}`);
  console.log(`   URL: ${config.url}`);
  console.log(`   Method: ${config.method}`);
  
  try {
    const options = {
      method: config.method,
      headers: config.headers
    };
    
    if (config.body) {
      options.body = JSON.stringify(config.body);
      console.log(`   Body: ${JSON.stringify(config.body, null, 2)}`);
    }
    
    const startTime = Date.now();
    const response = await fetch(config.url, options);
    const endTime = Date.now();
    
    console.log(`\n   Status: ${response.status}`);
    console.log(`   Response Time: ${endTime - startTime}ms`);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }
    
    if (response.ok) {
      console.log(`   ✅ SUCCESS`);
      console.log(`   Response:`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    } else {
      console.log(`   ❌ FAILED`);
      console.log(`   Error:`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    }
    
    return { success: response.ok, status: response.status, data };
    
  } catch (error) {
    console.log(`   ❌ REQUEST FAILED`);
    console.log(`   Error: ${error.message}`);
    return { success: false, status: 0, error: error.message };
  }
}

/**
 * Test webhook with different stock symbols
 */
async function testMultipleStocks() {
  console.log('\n📊 === TESTING MULTIPLE STOCKS ===');
  
  const stocks = [
    { symbol: "AAPL", exchange: "NASDAQ", name: "Apple" },
    { symbol: "MSFT", exchange: "NASDAQ", name: "Microsoft" },
    { symbol: "GOOGL", exchange: "NASDAQ", name: "Google" },
    { symbol: "TSLA", exchange: "NASDAQ", name: "Tesla" }
  ];
  
  for (const stock of stocks) {
    console.log(`\n🏢 Testing ${stock.name} (${stock.symbol})`);
    
    const config = {
      name: `${stock.name} Chart`,
      url: `${API_BASE_URL}/api/chart?symbol=${stock.symbol}&exchange=${stock.exchange}`,
      method: "GET",
      headers: {},
      body: null
    };
    
    await testWebhook(config);
    
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Test webhook payload formats
 */
async function testWebhookPayloads() {
  console.log('\n📦 === TESTING WEBHOOK PAYLOADS ===');
  
  const payloads = [
    {
      name: "Standard Payload",
      body: {
        symbol: "NASDAQ:AAPL",
        theme: "dark",
        studies: [
          { name: "Bollinger Bands" },
          { name: "Volume" },
          { name: "Relative Strength Index" }
        ]
      }
    },
    {
      name: "Light Theme Payload",
      body: {
        symbol: "NASDAQ:MSFT",
        theme: "light",
        studies: [
          { name: "Moving Average" },
          { name: "MACD" }
        ]
      }
    },
    {
      name: "Minimal Payload",
      body: {
        symbol: "NASDAQ:GOOGL",
        theme: "dark"
      }
    }
  ];
  
  for (const payload of payloads) {
    const config = {
      name: payload.name,
      url: `${N8N_BASE_URL}/webhook-test/chart`,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: payload.body
    };
    
    await testWebhook(config);
    
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Check if services are running
 */
async function checkServices() {
  console.log('🔍 === CHECKING SERVICES ===');
  
  // Check API server
  console.log('\n🖥️  Checking API Server...');
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    if (response.ok) {
      console.log('   ✅ API Server is running');
    } else {
      console.log('   ⚠️  API Server responded with error');
    }
  } catch (error) {
    console.log('   ❌ API Server is not accessible');
    console.log(`   Error: ${error.message}`);
  }
  
  // Check N8N server
  console.log('\n🔗 Checking N8N Server...');
  try {
    const response = await fetch(`${N8N_BASE_URL}/webhook-test/chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    
    if (response.status !== 404) {
      console.log('   ✅ N8N Server is accessible');
    } else {
      console.log('   ⚠️  N8N webhook endpoint not found (404)');
    }
  } catch (error) {
    console.log('   ❌ N8N Server is not accessible');
    console.log(`   Error: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runWebhookTests() {
  console.log('🎯 N8N WEBHOOK TEST SUITE');
  console.log('=========================');
  
  // Check if services are running
  await checkServices();
  
  // Test all configurations
  console.log('\n🧪 === RUNNING WEBHOOK TESTS ===');
  for (const config of testConfigs) {
    await testWebhook(config);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test multiple stocks
  await testMultipleStocks();
  
  // Test different payloads (if N8N is available)
  await testWebhookPayloads();
  
  console.log('\n🏁 === WEBHOOK TESTS COMPLETED ===');
}

// Export for use in other files
module.exports = {
  testWebhook,
  runWebhookTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runWebhookTests().catch(console.error);
}