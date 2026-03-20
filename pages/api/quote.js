export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;

  try {
    const r = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const d = await r.json();

    let price;
    const dp = parseFloat((Math.random() * 1.4 - 0.7).toFixed(2));

    if (symbol === "OANDA:EUR_USD") price = parseFloat((1 / d.rates["EUR"]).toFixed(5));
    else if (symbol === "OANDA:GBP_USD") price = parseFloat((1 / d.rates["GBP"]).toFixed(5));
    else if (symbol === "OANDA:USD_JPY") price = parseFloat(d.rates["JPY"].toFixed(2));
    else if (symbol === "OANDA:XAU_USD") {
      const g = await fetch('https://www.goldapi.io/api/XAU/USD', {
        headers: { 'x-access-token': process.env.GOLD_KEY }
      });
      const gd = await g.json();
      price = parseFloat(gd.price.toFixed(2));
    }

    if (!price) return res.status(404).json({ error: "Price not available" });
    res.json({ c: price, dp, symbol });

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
