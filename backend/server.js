import express from "express";
import cors from "cors";
import 'dotenv/config';
import algoliasearch from "algoliasearch";

const app = express();
const PORT = 3001;

const AV_API_KEY = process.env.AV_API_KEY;
const FH_API_KEY = process.env.FH_API_KEY
const TD_API_KEY = process.env.TD_API_KEY;
const ALGOLIA_APP_ID = "0DF61TE1XU";
const ALGOLIA_API_KEY = "29afca140e71ced66b571b7eed54a719"
const ALGOLIA_INDEX = "stock_name_types";
const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});


// -------------- MCP-Like Endpoints ----------------

app.post("/mcp/searchStocks", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });
    const results = await algoliaIndex.search(query);
    console.log(results)
    res.json({ results: results.hits });
  } catch (error) {
    console.error("Algolia search error:", error);
    res.status(500).json({ error: "Failed to search stocks" });
  }
});


app.post("/mcp/analyzeStock", async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    // Call n8n workflow (AI analysis + Chart)
    const n8nResponse = await fetch("http://localhost:5678/webhook/stock-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol })
    });

    const data = await n8nResponse.text();
    console.log(data);
    res.send(data);
    
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze stock" });
  }
});

app.post("/mcp/getChart", async (req, res) => {
  try {
    const { symbol, exchange } = req.body;

    if (!symbol || !exchange) {
      return res.status(400).json({ error: "Symbol and exchange are required" });
    }

    const url = 'http://localhost:5678/webhook/chart';

    // Create payload with symbol and exchange
    const payload = {
      symbol: `${exchange}:${symbol}`,
      theme: "dark",
      studies: [
        { name: "Bollinger Bands" },
        { name: "Volume" },
        { name: "Relative Strength Index" }
      ]
    };

    console.log("Sending payload to n8n:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("N8N webhook error:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/png"); // or PDF
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error("Chart API error:", error);
    res.status(500).json({ error: "Failed to fetch chart" });
  }
});

// ------------------  ------------------------

// Alpha Vantage price endpoint (existing)
app.get("/api/price", async (req, res) => {
  const { symbol } = req.query;

  if (!symbol || typeof symbol !== "string") {
    return res.status(400).json({ error: "Symbol is required" });
  }

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    if (!data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
      return res.status(404).json({
        error: data.Note || "No data found for this symbol (possibly rate-limited)"
      });
    }

    const quote = data["Global Quote"];
    const result = {
      symbol: quote["01. symbol"],
      open: quote["02. open"],
      high: quote["03. high"],
      low: quote["04. low"],
      price: quote["05. price"],
      volume: quote["06. volume"],
      latestDay: quote["07. latest trading day"],
      previousClose: quote["08. previous close"],
      change: quote["09. change"],
      percent: quote["10. change percent"],
    };

    res.json(result);

  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Something went wrong fetching stock data" });
  }
});

// New Twelve Data price endpoint
app.get("/api/price-twelve", async (req, res) => {
  try {
    const { symbol, interval, apikey } = req.query;

    // Validate required parameters
    if (!symbol || typeof symbol !== "string") {
      return res.status(400).json({ error: "Symbol parameter is required" });
    }

    console.log(`Fetching price data for ${symbol} using Twelve Data API`);

    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&apikey=${TD_API_KEY}&source=docs`;

    const response = await fetch(url);
    const data = await response.json();

    // Check for API errors
    if (data.status === "error") {
      return res.status(400).json({
        error: data.message || "Invalid request to Twelve Data API"
      });
    }

    // Check if we have time series data
    if (!data.values || !Array.isArray(data.values) || data.values.length === 0) {
      return res.status(404).json({
        error: "No price data found for this symbol"
      });
    }

    // Get the latest data point (first in array)
    const latestData = data.values[0];
    const previousData = data.values[1] || latestData;

    // Calculate change and percentage change
    const currentPrice = parseFloat(latestData.close);
    const previousPrice = parseFloat(previousData.close);
    const change = currentPrice - previousPrice;
    const percentChange = previousPrice !== 0 ? ((change / previousPrice) * 100).toFixed(2) : "0.00";

    // Format response to match expected structure
    const result = {
      symbol: data.meta.symbol,
      price: latestData.close,
      open: latestData.open,
      high: latestData.high,
      low: latestData.low,
      volume: latestData.volume,
      latestDay: latestData.datetime,
      previousClose: previousData.close,
      change: change.toFixed(2),
      percent: `${percentChange}%`,
      interval: data.meta.interval,
      currency: data.meta.currency || "USD",
      exchange: data.meta.exchange || "Unknown",
      timezone: data.meta.timezone || "UTC"
    };

    res.json(result);

  } catch (error) {
    console.error("Twelve Data API error:", error);
    res.status(500).json({ error: "Failed to fetch price data from Twelve Data API" });
  }
});

app.post("/api/stock-analysis", async (req, res) => {
  try {
    // const response = await fetch("http://localhost:5678/webhook-test/stock-analysis", {
    const response = await fetch("http://localhost:5678/webhook/stock-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch from n8n" });
  }
});

// Chart fetch endpoint - POST with query parameters
app.post("/api/chart", async (req, res) => {
  try {
    const { symbol, exchange } = req.query;
    console.log("Chart API called - Symbol:", symbol, "Exchange:", exchange);

    // Validate required parameters
    if (!symbol || typeof symbol !== "string" || symbol.length > 10) {
      return res.status(400).json({ error: "Invalid symbol provided" });
    }

    if (!exchange || typeof exchange !== "string") {
      return res.status(400).json({ error: "Invalid exchange provided" });
    }

    // const url = 'http://localhost:5678/webhook-test/chart';
    const url = 'http://localhost:5678/webhook/chart';

    // Create payload with symbol and exchange
    const payload = {
      symbol: `${exchange}:${symbol}`,
      theme: "dark",
      studies: [
        { name: "Bollinger Bands" },
        { name: "Volume" },
        { name: "Relative Strength Index" }
      ]
    };

    console.log("Sending payload to n8n:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("N8N webhook error:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/png"); // or PDF
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error("Chart API error:", error);
    res.status(500).json({ error: "Failed to fetch chart" });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Bun server running on http://localhost:${PORT}`);
});
