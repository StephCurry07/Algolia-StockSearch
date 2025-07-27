const axios = require('axios');

async function getStockData(symbol) {
    const url = `https://yfapi.net/v8/finance/chart/${symbol}`;
    const options = {
        headers: {
            'x-api-key': 'YOUR_API_KEY'
        }
    };

    try {
        const response = await axios.get(url, options);
        console.log(response.data);
    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

getStockData('AAPL');