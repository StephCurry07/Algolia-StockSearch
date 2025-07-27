/**
 * Chart & Stock Analysis Webhook Test Suite
 * Tests both chart API and stock analysis endpoints with various scenarios
 */

const BASE_URL = 'http://localhost:3001';
const N8N_BASE_URL = 'http://localhost:5678';

// Test data samples
const testCases = [
  {
    name: "Apple Stock - NASDAQ",
    symbol: "AAPL",
    exchange: "NASDAQ"
  },
  {
    name: "Microsoft Stock - NASDAQ",
    symbol: "MSFT",
    exchange: "NASDAQ"
  },
  {
    name: "Tesla Stock - NASDAQ",
    symbol: "TSLA",
    exchange: "NASDAQ"
  },
  {
    name: "Google Stock - NASDAQ",
    symbol: "GOOGL",
    exchange: "NASDAQ"
  },
  {
    name: "Amazon Stock - NASDAQ",
    symbol: "AMZN",
    exchange: "NASDAQ"
  }
];

// Error test cases for chart API
const chartErrorTestCases = [
  {
    name: "Missing Symbol",
    symbol: "",
    exchange: "NASDAQ",
    expectedError: "Invalid symbol provided"
  },
  {
    name: "Missing Exchange",
    symbol: "AAPL",
    exchange: "",
    expectedError: "Invalid exchange provided"
  },
  {
    name: "Invalid Symbol (too long)",
    symbol: "VERYLONGSYMBOL",
    exchange: "NASDAQ",
    expectedError: "Invalid symbol provided"
  },
  {
    name: "Non-string Symbol",
    symbol: 123,
    exchange: "NASDAQ",
    expectedError: "Invalid symbol provided"
  }
];

// Error test cases for stock analysis API
const analysisErrorTestCases = [
  {
    name: "Empty Payload",
    payload: {},
    expectedError: "symbol"
  },
  {
    name: "Missing Symbol",
    payload: { data: "test" },
    expectedError: "symbol"
  },
  {
    name: "Invalid Symbol Type",
    payload: { symbol: 123 },
    expectedError: "symbol"
  },
  {
    name: "Empty Symbol",
    payload: { symbol: "" },
    expectedError: "symbol"
  }
];

/**
 * Test the chart API endpoint
 */
async function testChartAPI(symbol, exchange) {
  const url = `${BASE_URL}/api/chart?symbol=${symbol}&exchange=${exchange}`;

  console.log(`🔍 Testing: ${url}`);

  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      responseTime,
      data,
      error: response.ok ? null : data.error
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      responseTime: 0,
      data: null,
      error: error.message
    };
  }
}

/**
 * Test the stock analysis API endpoint
 */
async function testStockAnalysisAPI(symbol, additionalData = {}) {
  const url = `${BASE_URL}/api/stock-analysis`;
  const payload = { symbol, ...additionalData };

  console.log(`🔍 Testing Stock Analysis: ${url}`);
  console.log(`   Payload: ${JSON.stringify(payload)}`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      responseTime,
      data,
      error: response.ok ? null : data.error
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      responseTime: 0,
      data: null,
      error: error.message
    };
  }
}

/**
 * Run all chart success test cases
 */
async function runChartSuccessTests() {
  console.log('\n🟢 === CHART SUCCESS TEST CASES ===\n');

  for (const testCase of testCases) {
    console.log(`📊 Testing Chart: ${testCase.name}`);
    console.log(`   Symbol: ${testCase.symbol}, Exchange: ${testCase.exchange}`);

    const result = await testChartAPI(testCase.symbol, testCase.exchange);

    if (result.success) {
      console.log(`   ✅ SUCCESS - Status: ${result.status}, Response Time: ${result.responseTime}ms`);

      // Check if we got chart data
      if (result.data && result.data.success && result.data.url) {
        console.log(`   📈 Chart URL received: ${result.data.url.substring(0, 50)}...`);
      } else if (result.data && result.data.error) {
        console.log(`   ⚠️  Chart API returned error: ${result.data.error}`);
      } else {
        console.log(`   ⚠️  Unexpected response format:`, result.data);
      }
    } else {
      console.log(`   ❌ FAILED - Status: ${result.status}, Error: ${result.error}`);
    }

    console.log(''); // Empty line for readability

    // Wait 1 second between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Run all stock analysis success test cases
 */
async function runStockAnalysisSuccessTests() {
  console.log('\n🟢 === STOCK ANALYSIS SUCCESS TEST CASES ===\n');

  for (const testCase of testCases) {
    console.log(`🔍 Testing Stock Analysis: ${testCase.name}`);
    console.log(`   Symbol: ${testCase.symbol}`);

    const result = await testStockAnalysisAPI(testCase.symbol);

    if (result.success) {
      console.log(`   ✅ SUCCESS - Status: ${result.status}, Response Time: ${result.responseTime}ms`);

      // Check if we got analysis data
      if (result.data) {
        console.log(`   📊 Analysis data received`);
        if (result.data.analysis) {
          console.log(`   📈 Analysis: ${JSON.stringify(result.data.analysis).substring(0, 100)}...`);
        }
        if (result.data.recommendation) {
          console.log(`   💡 Recommendation: ${result.data.recommendation}`);
        }
        if (result.data.sentiment) {
          console.log(`   😊 Sentiment: ${result.data.sentiment}`);
        }
      } else {
        console.log(`   ⚠️  No analysis data received`);
      }
    } else {
      console.log(`   ❌ FAILED - Status: ${result.status}, Error: ${result.error}`);
    }

    console.log(''); // Empty line for readability

    // Wait 2 seconds between requests (n8n workflows might take longer)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * Run chart error test cases
 */
async function runChartErrorTests() {
  console.log('\n🔴 === CHART ERROR TEST CASES ===\n');

  for (const testCase of chartErrorTestCases) {
    console.log(`🚫 Testing Chart Error: ${testCase.name}`);
    console.log(`   Symbol: "${testCase.symbol}", Exchange: "${testCase.exchange}"`);

    const result = await testChartAPI(testCase.symbol, testCase.exchange);

    if (!result.success && result.error && result.error.includes(testCase.expectedError)) {
      console.log(`   ✅ EXPECTED ERROR - Status: ${result.status}, Error: ${result.error}`);
    } else if (!result.success) {
      console.log(`   ⚠️  UNEXPECTED ERROR - Status: ${result.status}, Error: ${result.error}`);
      console.log(`   Expected: ${testCase.expectedError}`);
    } else {
      console.log(`   ❌ SHOULD HAVE FAILED - Status: ${result.status}`);
    }

    console.log(''); // Empty line for readability
  }
}

/**
 * Run stock analysis error test cases
 */
async function runStockAnalysisErrorTests() {
  console.log('\n🔴 === STOCK ANALYSIS ERROR TEST CASES ===\n');

  for (const testCase of analysisErrorTestCases) {
    console.log(`🚫 Testing Analysis Error: ${testCase.name}`);
    console.log(`   Payload: ${JSON.stringify(testCase.payload)}`);

    const url = `${BASE_URL}/api/stock-analysis`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.payload)
      });

      const data = await response.json();

      if (!response.ok && (data.error && data.error.toLowerCase().includes(testCase.expectedError.toLowerCase()))) {
        console.log(`   ✅ EXPECTED ERROR - Status: ${response.status}, Error: ${data.error}`);
      } else if (!response.ok) {
        console.log(`   ⚠️  UNEXPECTED ERROR - Status: ${response.status}, Error: ${data.error}`);
        console.log(`   Expected error containing: ${testCase.expectedError}`);
      } else {
        console.log(`   ❌ SHOULD HAVE FAILED - Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log(`   ⚠️  REQUEST FAILED - Error: ${error.message}`);
    }

    console.log(''); // Empty line for readability
  }
}

/**
 * Test server connectivity
 */
async function testServerConnectivity() {
  console.log('🔌 === SERVER CONNECTIVITY TEST ===\n');

  try {
    const response = await fetch(`${BASE_URL}/`);
    const text = await response.text();

    if (response.ok) {
      console.log('✅ Server is running and accessible');
      console.log(`   Response: ${text}`);
    } else {
      console.log('❌ Server responded with error');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Cannot connect to server');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure the backend server is running on http://localhost:3001');
    return false;
  }

  console.log('');
  return true;
}

/**
 * Test a specific webhook scenario
 */
async function testWebhookScenario(symbol, exchange) {
  console.log(`\n🎯 === WEBHOOK SCENARIO TEST ===`);
  console.log(`Testing webhook for ${symbol} on ${exchange}\n`);

  // Step 1: Test the API endpoint
  console.log('Step 1: Testing API endpoint...');
  const result = await testChartAPI(symbol, exchange);

  if (result.success) {
    console.log('✅ API endpoint working');

    // Step 2: Analyze the response
    console.log('\nStep 2: Analyzing response...');
    if (result.data && result.data.success && result.data.url) {
      console.log('✅ Chart URL received successfully');
      console.log(`   Chart URL: ${result.data.url}`);

      // Step 3: Test if the chart URL is accessible
      console.log('\nStep 3: Testing chart URL accessibility...');
      try {
        const chartResponse = await fetch(result.data.url, { method: 'HEAD' });
        if (chartResponse.ok) {
          console.log('✅ Chart image is accessible');
        } else {
          console.log('⚠️  Chart image may not be accessible');
          console.log(`   Status: ${chartResponse.status}`);
        }
      } catch (error) {
        console.log('⚠️  Could not test chart URL accessibility');
        console.log(`   Error: ${error.message}`);
      }
    } else {
      console.log('❌ Invalid response format');
      console.log('   Response:', result.data);
    }
  } else {
    console.log('❌ API endpoint failed');
    console.log(`   Error: ${result.error}`);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🧪 CHART WEBHOOK TEST SUITE');
  console.log('============================');

  // Test server connectivity first
  const serverOk = await testServerConnectivity();
  if (!serverOk) {
    console.log('❌ Cannot proceed with tests - server not accessible');
    return;
  }

  // Run chart success tests
  await runChartSuccessTests();

  // Run stock analysis success tests
  await runStockAnalysisSuccessTests();

  // Run chart error tests
  await runChartErrorTests();

  // Run stock analysis error tests
  await runStockAnalysisErrorTests();

  // Run a specific webhook scenario
  await testWebhookScenario('AAPL', 'NASDAQ');

  console.log('\n🏁 === TEST SUITE COMPLETED ===');
  console.log('Check the results above for any issues.');
}

// Export functions for individual testing
module.exports = {
  testChartAPI,
  testStockAnalysisAPI,
  testWebhookScenario,
  runChartSuccessTests,
  runStockAnalysisSuccessTests,
  runChartErrorTests,
  runStockAnalysisErrorTests,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}