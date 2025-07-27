/**
 * Quick Chart & Stock Analysis Webhook Test
 * Simple script to quickly test both chart and stock analysis webhooks
 */

const BASE_URL = 'http://localhost:3001';

async function quickChartTest() {
  console.log('📊 Quick Chart Webhook Test\n');
  
  // Test data
  const symbol = 'AAPL';
  const exchange = 'NASDAQ';
  
  console.log(`Testing Chart: ${symbol} on ${exchange}`);
  console.log(`URL: ${BASE_URL}/api/chart?symbol=${symbol}&exchange=${exchange}\n`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/api/chart?symbol=${symbol}&exchange=${exchange}`);
    const endTime = Date.now();
    
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Time: ${endTime - startTime}ms`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Chart Success!');
      console.log('\nChart Response Data:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success && data.url) {
        console.log(`\n📈 Chart URL: ${data.url}`);
      }
    } else {
      console.log('❌ Chart Error!');
      console.log(`Error: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log('❌ Chart Request Failed!');
    console.log(`Error: ${error.message}`);
  }
}

async function quickStockAnalysisTest() {
  console.log('\n🔍 Quick Stock Analysis Webhook Test\n');
  
  // Test data
  const symbol = 'AAPL';
  const payload = { symbol };
  
  console.log(`Testing Stock Analysis: ${symbol}`);
  console.log(`URL: ${BASE_URL}/api/stock-analysis`);
  console.log(`Payload: ${JSON.stringify(payload)}\n`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/api/stock-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const endTime = Date.now();
    
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Time: ${endTime - startTime}ms`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Stock Analysis Success!');
      console.log('\nStock Analysis Response Data:');
      console.log(JSON.stringify(data, null, 2));
      
      // Check for common analysis fields
      if (data.analysis) {
        console.log(`\n📊 Analysis: ${JSON.stringify(data.analysis)}`);
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
    } else {
      console.log('❌ Stock Analysis Error!');
      console.log(`Error: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log('❌ Stock Analysis Request Failed!');
    console.log(`Error: ${error.message}`);
  }
}

async function quickTest() {
  console.log('🚀 QUICK WEBHOOK TEST SUITE');
  console.log('============================');
  
  // Check server connectivity
  console.log('🔌 Checking server connectivity...');
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (response.ok) {
      console.log('✅ Server is accessible\n');
    } else {
      console.log('⚠️  Server responded with error\n');
    }
  } catch (error) {
    console.log('❌ Cannot connect to server');
    console.log(`Error: ${error.message}`);
    console.log('Make sure the backend server is running on http://localhost:3001\n');
    return;
  }
  
  // Run chart test
  await quickChartTest();
  
  // Wait 1 second between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Run stock analysis test
  await quickStockAnalysisTest();
  
  console.log('\n🏁 Quick tests completed!');
}

// Export functions for individual testing
module.exports = {
  quickChartTest,
  quickStockAnalysisTest,
  quickTest
};

// Run the test
if (require.main === module) {
  quickTest().catch(console.error);
}