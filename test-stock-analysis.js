/**
 * Stock Analysis Webhook Test Suite
 * Comprehensive testing for the stock analysis API endpoint and n8n workflow
 */

const BASE_URL = 'http://localhost:3001';
const N8N_BASE_URL = 'http://localhost:5678';

// Test data samples for stock analysis
const stockAnalysisTestCases = [
  {
    name: "Apple Inc.",
    symbol: "AAPL",
    sector: "Technology",
    expectedFields: ["analysis", "recommendation", "sentiment"]
  },
  {
    name: "Microsoft Corporation",
    symbol: "MSFT",
    sector: "Technology",
    expectedFields: ["analysis", "recommendation", "sentiment"]
  },
  {
    name: "Tesla Inc.",
    symbol: "TSLA",
    sector: "Automotive",
    expectedFields: ["analysis", "recommendation", "sentiment"]
  },
  {
    name: "Amazon.com Inc.",
    symbol: "AMZN",
    sector: "E-commerce",
    expectedFields: ["analysis", "recommendation", "sentiment"]
  },
  {
    name: "Alphabet Inc.",
    symbol: "GOOGL",
    sector: "Technology",
    expectedFields: ["analysis", "recommendation", "sentiment"]
  }
];

// Advanced test payloads
const advancedTestPayloads = [
  {
    name: "Basic Analysis Request",
    payload: {
      symbol: "AAPL"
    }
  },
  {
    name: "Analysis with Time Period",
    payload: {
      symbol: "MSFT",
      period: "1Y",
      analysisType: "comprehensive"
    }
  },
  {
    name: "Analysis with Custom Parameters",
    payload: {
      symbol: "TSLA",
      includeNews: true,
      includeTechnical: true,
      includeFundamental: true
    }
  },
  {
    name: "Batch Analysis Request",
    payload: {
      symbols: ["AAPL", "MSFT", "GOOGL"],
      analysisType: "quick"
    }
  }
];

// Error test cases for stock analysis
const stockAnalysisErrorCases = [
  {
    name: "Empty Request Body",
    payload: {},
    expectedError: "symbol"
  },
  {
    name: "Missing Symbol",
    payload: {
      period: "1Y"
    },
    expectedError: "symbol"
  },
  {
    name: "Invalid Symbol Format",
    payload: {
      symbol: 123
    },
    expectedError: "symbol"
  },
  {
    name: "Empty Symbol String",
    payload: {
      symbol: ""
    },
    expectedError: "symbol"
  },
  {
    name: "Very Long Symbol",
    payload: {
      symbol: "VERYLONGINVALIDSYMBOL"
    },
    expectedError: "symbol"
  }
];

/**
 * Test stock analysis API endpoint
 */
async function testStockAnalysisAPI(payload) {
  const url = `${BASE_URL}/api/stock-analysis`;
  
  console.log(`🔍 Testing Stock Analysis API`);
  console.log(`   URL: ${url}`);
  console.log(`   Payload: ${JSON.stringify(payload, null, 2)}`);
  
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
 * Test direct n8n webhook endpoint
 */
async function testN8NWebhook(payload) {
  const url = `${N8N_BASE_URL}/webhook-test/stock-analysis`;
  
  console.log(`🔗 Testing Direct N8N Webhook`);
  console.log(`   URL: ${url}`);
  console.log(`   Payload: ${JSON.stringify(payload, null, 2)}`);
  
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
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }
    
    return {
      success: response.ok,
      status: response.status,
      responseTime,
      data,
      error: response.ok ? null : (typeof data === 'string' ? data : data.error)
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
 * Run basic stock analysis tests
 */
async function runBasicStockAnalysisTests() {
  console.log('\n🟢 === BASIC STOCK ANALYSIS TESTS ===\n');
  
  for (const testCase of stockAnalysisTestCases) {
    console.log(`📊 Testing: ${testCase.name} (${testCase.symbol})`);
    console.log(`   Sector: ${testCase.sector}`);
    
    const result = await testStockAnalysisAPI({ symbol: testCase.symbol });
    
    if (result.success) {
      console.log(`   ✅ SUCCESS - Status: ${result.status}, Response Time: ${result.responseTime}ms`);
      
      // Validate expected fields
      let fieldsFound = 0;
      for (const field of testCase.expectedFields) {
        if (result.data && result.data[field]) {
          console.log(`   📈 ${field}: Found`);
          fieldsFound++;
        }
      }
      
      if (fieldsFound === 0) {
        console.log(`   📄 Raw Response: ${JSON.stringify(result.data)}`);
      }
      
      console.log(`   📊 Fields Found: ${fieldsFound}/${testCase.expectedFields.length}`);
    } else {
      console.log(`   ❌ FAILED - Status: ${result.status}, Error: ${result.error}`);
    }
    
    console.log(''); // Empty line for readability
    
    // Wait 2 seconds between requests (n8n workflows might take longer)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * Run advanced stock analysis tests
 */
async function runAdvancedStockAnalysisTests() {
  console.log('\n🔵 === ADVANCED STOCK ANALYSIS TESTS ===\n');
  
  for (const testCase of advancedTestPayloads) {
    console.log(`🚀 Testing: ${testCase.name}`);
    
    const result = await testStockAnalysisAPI(testCase.payload);
    
    if (result.success) {
      console.log(`   ✅ SUCCESS - Status: ${result.status}, Response Time: ${result.responseTime}ms`);
      
      // Analyze response structure
      if (result.data) {
        const keys = Object.keys(result.data);
        console.log(`   📊 Response Keys: ${keys.join(', ')}`);
        
        // Check for common analysis fields
        if (result.data.analysis) {
          console.log(`   📈 Analysis: ${typeof result.data.analysis === 'object' ? 'Object' : result.data.analysis}`);
        }
        if (result.data.recommendation) {
          console.log(`   💡 Recommendation: ${result.data.recommendation}`);
        }
        if (result.data.sentiment) {
          console.log(`   😊 Sentiment: ${result.data.sentiment}`);
        }
        if (result.data.score) {
          console.log(`   📊 Score: ${result.data.score}`);
        }
      }
    } else {
      console.log(`   ❌ FAILED - Status: ${result.status}, Error: ${result.error}`);
    }
    
    console.log(''); // Empty line for readability
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * Run stock analysis error tests
 */
async function runStockAnalysisErrorTests() {
  console.log('\n🔴 === STOCK ANALYSIS ERROR TESTS ===\n');
  
  for (const testCase of stockAnalysisErrorCases) {
    console.log(`🚫 Testing Error: ${testCase.name}`);
    console.log(`   Payload: ${JSON.stringify(testCase.payload)}`);
    
    const result = await testStockAnalysisAPI(testCase.payload);
    
    if (!result.success) {
      if (result.error && result.error.toLowerCase().includes(testCase.expectedError.toLowerCase())) {
        console.log(`   ✅ EXPECTED ERROR - Status: ${result.status}, Error: ${result.error}`);
      } else {
        console.log(`   ⚠️  UNEXPECTED ERROR - Status: ${result.status}, Error: ${result.error}`);
        console.log(`   Expected error containing: ${testCase.expectedError}`);
      }
    } else {
      console.log(`   ❌ SHOULD HAVE FAILED - Status: ${result.status}`);
      console.log(`   Response: ${JSON.stringify(result.data)}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

/**
 * Test n8n workflow integration
 */
async function testN8NIntegration() {
  console.log('\n🔗 === N8N WORKFLOW INTEGRATION TESTS ===\n');
  
  const testSymbol = "AAPL";
  const payload = { symbol: testSymbol };
  
  console.log(`🔄 Testing N8N Workflow Integration for ${testSymbol}`);
  
  // Test 1: Direct n8n webhook
  console.log('\n1️⃣ Testing Direct N8N Webhook...');
  const n8nResult = await testN8NWebhook(payload);
  
  if (n8nResult.success) {
    console.log(`   ✅ N8N Direct Success - Status: ${n8nResult.status}, Time: ${n8nResult.responseTime}ms`);
    console.log(`   📊 N8N Response: ${JSON.stringify(n8nResult.data)}`);
  } else {
    console.log(`   ❌ N8N Direct Failed - Status: ${n8nResult.status}, Error: ${n8nResult.error}`);
  }
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: API endpoint (which calls n8n)
  console.log('\n2️⃣ Testing API Endpoint (via N8N)...');
  const apiResult = await testStockAnalysisAPI(payload);
  
  if (apiResult.success) {
    console.log(`   ✅ API Success - Status: ${apiResult.status}, Time: ${apiResult.responseTime}ms`);
    console.log(`   📊 API Response: ${JSON.stringify(apiResult.data)}`);
  } else {
    console.log(`   ❌ API Failed - Status: ${apiResult.status}, Error: ${apiResult.error}`);
  }
  
  // Compare results
  console.log('\n🔍 Comparing Results...');
  if (n8nResult.success && apiResult.success) {
    console.log('   ✅ Both endpoints working');
    
    // Check if responses are similar
    const n8nKeys = n8nResult.data ? Object.keys(n8nResult.data) : [];
    const apiKeys = apiResult.data ? Object.keys(apiResult.data) : [];
    
    console.log(`   📊 N8N Response Keys: ${n8nKeys.join(', ')}`);
    console.log(`   📊 API Response Keys: ${apiKeys.join(', ')}`);
  } else if (n8nResult.success && !apiResult.success) {
    console.log('   ⚠️  N8N works but API fails - Check API integration');
  } else if (!n8nResult.success && apiResult.success) {
    console.log('   ⚠️  API works but N8N fails - Check N8N webhook');
  } else {
    console.log('   ❌ Both endpoints failed');
  }
}

/**
 * Check service availability
 */
async function checkServices() {
  console.log('🔍 === CHECKING SERVICES ===\n');
  
  let apiOk = false;
  let n8nOk = false;
  
  // Check API server
  console.log('🖥️  Checking API Server...');
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (response.ok) {
      console.log('   ✅ API Server is running');
      apiOk = true;
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
    const response = await fetch(`${N8N_BASE_URL}/webhook-test/stock-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    
    if (response.status !== 404) {
      console.log('   ✅ N8N Server is accessible');
      n8nOk = true;
    } else {
      console.log('   ⚠️  N8N webhook endpoint not found (404)');
    }
  } catch (error) {
    console.log('   ❌ N8N Server is not accessible');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('');
  return { apiOk, n8nOk };
}

/**
 * Performance test
 */
async function runPerformanceTest() {
  console.log('\n⚡ === PERFORMANCE TEST ===\n');
  
  const testSymbol = "AAPL";
  const iterations = 3;
  const results = [];
  
  console.log(`🏃 Running ${iterations} performance tests for ${testSymbol}...`);
  
  for (let i = 1; i <= iterations; i++) {
    console.log(`\n🔄 Test ${i}/${iterations}`);
    
    const result = await testStockAnalysisAPI({ symbol: testSymbol });
    results.push(result);
    
    if (result.success) {
      console.log(`   ✅ Success - ${result.responseTime}ms`);
    } else {
      console.log(`   ❌ Failed - ${result.error}`);
    }
    
    // Wait 1 second between tests
    if (i < iterations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Calculate statistics
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const times = successfulResults.map(r => r.responseTime);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log('\n📊 Performance Statistics:');
    console.log(`   ✅ Success Rate: ${successfulResults.length}/${iterations} (${(successfulResults.length/iterations*100).toFixed(1)}%)`);
    console.log(`   ⚡ Average Response Time: ${avgTime.toFixed(0)}ms`);
    console.log(`   🚀 Fastest Response: ${minTime}ms`);
    console.log(`   🐌 Slowest Response: ${maxTime}ms`);
  } else {
    console.log('\n❌ No successful requests for performance analysis');
  }
}

/**
 * Main test runner
 */
async function runAllStockAnalysisTests() {
  console.log('🧪 STOCK ANALYSIS WEBHOOK TEST SUITE');
  console.log('=====================================');
  
  // Check services
  const { apiOk, n8nOk } = await checkServices();
  
  if (!apiOk) {
    console.log('❌ Cannot proceed - API server not accessible');
    return;
  }
  
  // Run basic tests
  await runBasicStockAnalysisTests();
  
  // Run advanced tests
  await runAdvancedStockAnalysisTests();
  
  // Run error tests
  await runStockAnalysisErrorTests();
  
  // Test n8n integration (if available)
  if (n8nOk) {
    await testN8NIntegration();
  } else {
    console.log('\n⚠️  Skipping N8N integration tests - N8N not accessible');
  }
  
  // Run performance test
  await runPerformanceTest();
  
  console.log('\n🏁 === STOCK ANALYSIS TESTS COMPLETED ===');
  console.log('Check the results above for any issues with the stock analysis workflow.');
}

// Export functions for individual testing
module.exports = {
  testStockAnalysisAPI,
  testN8NWebhook,
  runAllStockAnalysisTests,
  runBasicStockAnalysisTests,
  runAdvancedStockAnalysisTests,
  runStockAnalysisErrorTests,
  testN8NIntegration
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllStockAnalysisTests().catch(console.error);
}