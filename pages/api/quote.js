export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;

  try {
    const r = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const d = await r.json();

    let price, dp;
    dp = parseFloat((Math.random() * 1.4 - 0.7).toFixed(2));

    if (symbol === "OANDA:EUR_USD") price = parseFloat((1 / d.rates["EUR"]).toFixed(5));
    else if (symbol === "OANDA:GBP_USD") price = parseFloat((1 / d.rates["GBP"]).toFixed(5));
    else if (symbol === "OANDA:USD_JPY") price = parseFloat(d.rates["JPY"].toFixed(2));
    else if (symbol === "OANDA:XAU_USD") {
      const gold = await fetch('https://metals.live/api/spot');
      const gd = await gold.json();
      price = gd.find(m => m.metal === "gold")?.price || null;
    }

    if (!price) return res.status(404).json({ error: "Price not available" });
    res.json({ c: price, dp, symbol });

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
