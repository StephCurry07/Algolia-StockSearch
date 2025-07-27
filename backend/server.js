import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

const AV_API_KEY = process.env.AV_API_KEY;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/price/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
      return res.status(404).json({ error: "Symbol not found or invalid" });
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

app.post("/api/stock-analysis", async (req, res) => {
  try {
    const response = await fetch("http://localhost:5678/webhook-test/stock-analysis", {
      // const response = await fetch("http://localhost:5678/webhook/stock-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.text();
    res.json(data);
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

    const url = 'http://localhost:5678/webhook-test/chart';
    // const url = 'http://localhost:5678/webhook/chart';

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
