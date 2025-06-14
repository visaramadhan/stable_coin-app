const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = 5000;

// Allow CORS for local frontend (optional, biar aman)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Untuk dev, production sebaiknya spesifik domain
  next();
});

app.get("/ethprice", async (req, res) => {
  try {
    const apiRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: "API error" });
    }
    const data = await apiRes.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Error proxy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
});
