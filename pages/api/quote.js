export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;

  // Map Finnhub symbols to currency pairs
  const map = {
    "OANDA:EUR_USD": { from:"EUR", to:"USD" },
    "OANDA:GBP_USD": { from:"GBP", to:"USD" },
    "OANDA:USD_JPY": { from:"USD", to:"JPY" },
    "OANDA:XAU_USD": { from:"XAU", to:"USD" },
  };

  const pair = map[symbol];
  if (!pair) return res.status(400).json({ error: "Unknown symbol" });

  try {
    const r = await fetch(`https://api.exchangerate-api.com/v4/latest/${pair.from}`);
    const d = await r.json();
    const price = d.rates[pair.to];
    // Simulate small daily change
    const dp = (Math.random() * 1.4 - 0.7).toFixed(2);
    res.json({ c: price, dp: parseFloat(dp), symbol });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
