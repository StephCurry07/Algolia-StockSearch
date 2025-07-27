/**
 * Interactive Chart & Stock Analysis Webhook Test
 * Allows you to test both chart and stock analysis for specific stocks interactively
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const BASE_URL = 'http://localhost:3001';

/**
 * Test chart API for a specific stock
 */
async function testChart(symbol, exchange) {
  console.log(`\n📊 Testing Chart for ${symbol} on ${exchange}...`);
  
  try {
    const url = `${BASE_URL}/api/chart?symbol=${symbol}&exchange=${exchange}`;
    console.log(`Request URL: ${url}`);
    
    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();
    
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Response Time: ${endTime - startTime}ms`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ CHART SUCCESS!');
      
      if (data.success && data.url) {
        console.log(`📈 Chart URL: ${data.url}`);
        console.log(`🎨 Theme: ${data.theme || 'dark'}`);
        console.log(`📊 Studies: ${data.studies ? data.studies.length : 0} indicators`);
      } else if (data.error) {
        console.log(`⚠️  API Error: ${data.error}`);
      } else {
        console.log('📄 Raw Response:');
        console.log(JSON.stringify(data, null, 2));
      }
    } else {
      console.log('\n❌ CHART FAILED!');
      console.log(`Error: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log('\n❌ CHART REQUEST FAILED!');
    console.log(`Error: ${error.message}`);
  }
}

/**
 * Test stock analysis API for a specific stock
 */
async function testStockAnalysis(symbol) {
  console.log(`\n🔍 Testing Stock Analysis for ${symbol}...`);
  
  try {
    const url = `${BASE_URL}/api/stock-analysis`;
    const payload = { symbol };
    
    console.log(`Request URL: ${url}`);
    console.log(`Payload: ${JSON.stringify(payload)}`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const endTime = Date.now();
    
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Response Time: ${endTime - startTime}ms`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ STOCK ANALYSIS SUCCESS!');
      
      // Display analysis results
      if (data.analysis) {
        console.log(`📊 Analysis: ${JSON.stringify(data.analysis)}`);
      }
      if (data.recommendation) {
        console.log(`💡 Recommendation: ${data.recommendation}`);
      }
      if (data.sentiment) {
        console.log(`😊 Sentiment: ${data.sentiment}`);
      }
      if (data.score) {
        console.log(`📈 Score: ${data.score}`);
      }
      if (data.summary) {
        console.log(`📝 Summary: ${data.summary}`);
      }
      
      // Show raw response if no specific fields found
      if (!data.analysis && !data.recommendation && !data.sentiment && !data.score && !data.summary) {
        console.log('📄 Raw Analysis Response:');
        console.log(JSON.stringify(data, null, 2));
      }
    } else {
      console.log('\n❌ STOCK ANALYSIS FAILED!');
      console.log(`Error: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log('\n❌ STOCK ANALYSIS REQUEST FAILED!');
    console.log(`Error: ${error.message}`);
  }
}

/**
 * Test both chart and stock analysis for a stock
 */
async function testStock(symbol, exchange) {
  console.log(`\n🎯 Testing ${symbol} on ${exchange}...`);
  console.log('=' .repeat(50));
  
  // Test chart
  await testChart(symbol, exchange);
  
  // Wait 1 second between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test stock analysis
  await testStockAnalysis(symbol);
}

/**
 * Show popular stock suggestions
 */
function showSuggestions() {
  console.log('\n💡 Popular stocks to test:');
  console.log('   AAPL (Apple) - NASDAQ');
  console.log('   MSFT (Microsoft) - NASDAQ');
  console.log('   GOOGL (Google) - NASDAQ');
  console.log('   TSLA (Tesla) - NASDAQ');
  console.log('   AMZN (Amazon) - NASDAQ');
  console.log('   NVDA (NVIDIA) - NASDAQ');
  console.log('   META (Meta) - NASDAQ');
  console.log('   NFLX (Netflix) - NASDAQ');
}

/**
 * Ask user for input
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Main interactive loop
 */
async function interactiveTest() {
  console.log('🎯 INTERACTIVE CHART WEBHOOK TESTER');
  console.log('===================================');
  console.log('Test chart webhooks for any stock symbol!');
  
  showSuggestions();
  
  while (true) {
    console.log('\n' + '='.repeat(50));
    
    const symbol = await askQuestion('\n📊 Enter stock symbol (or "quit" to exit): ');
    
    if (symbol.toLowerCase() === 'quit' || symbol.toLowerCase() === 'q') {
      console.log('\n👋 Goodbye!');
      break;
    }
    
    if (!symbol) {
      console.log('⚠️  Please enter a valid stock symbol');
      continue;
    }
    
    const exchange = await askQuestion('🏢 Enter exchange (default: NASDAQ): ');
    const finalExchange = exchange || 'NASDAQ';
    
    await testStock(symbol.toUpperCase(), finalExchange.toUpperCase());
    
    const continueTest = await askQuestion('\n🔄 Test another stock? (y/n): ');
    if (continueTest.toLowerCase() !== 'y' && continueTest.toLowerCase() !== 'yes') {
      console.log('\n👋 Goodbye!');
      break;
    }
  }
  
  rl.close();
}

/**
 * Quick batch test
 */
async function batchTest() {
  console.log('🚀 BATCH TEST MODE');
  console.log('==================');
  
  const stocks = [
    { symbol: 'AAPL', exchange: 'NASDAQ' },
    { symbol: 'MSFT', exchange: 'NASDAQ' },
    { symbol: 'GOOGL', exchange: 'NASDAQ' }
  ];
  
  for (const stock of stocks) {
    await testStock(stock.symbol, stock.exchange);
    console.log('\n' + '-'.repeat(30));
    
    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🏁 Batch test completed!');
}

/**
 * Check if server is running
 */
async function checkServer() {
  console.log('🔍 Checking server status...');
  
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (response.ok) {
      console.log('✅ Server is running and accessible');
      return true;
    } else {
      console.log('⚠️  Server responded with error');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure the backend server is running on http://localhost:3001');
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  // Check if server is running first
  const serverOk = await checkServer();
  if (!serverOk) {
    console.log('\n❌ Cannot proceed - server not accessible');
    process.exit(1);
  }
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--batch')) {
    await batchTest();
  } else if (args.length >= 2) {
    // Direct test mode: node interactive-chart-test.js AAPL NASDAQ
    const symbol = args[0].toUpperCase();
    const exchange = args[1].toUpperCase();
    await testStock(symbol, exchange);
  } else {
    // Interactive mode
    await interactiveTest();
  }
}

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testStock, interactiveTest, batchTest };