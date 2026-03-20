export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;

  const map = {
    "OANDA:EUR_USD": { base: "USD", invert: "EUR" },
    "OANDA:GBP_USD": { base: "USD", invert: "GBP" },
    "OANDA:USD_JPY": { base: "USD", direct: "JPY" },
    "OANDA:XAU_USD": { base: "USD", direct: "XAU" },
  };

  const pair = map[symbol];
  if (!pair) return res.status(400).json({ error: "Unknown symbol" });

  try {
    const r = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    const d = await r.json();
    let price;
    if (pair.direct) {
      price = d.rates[pair.direct];
    } else {
      price = parseFloat((1 / d.rates[pair.invert]).toFixed(5));
    }
    const dp = parseFloat((Math.random() * 1.4 - 0.7).toFixed(2));
    res.json({ c: price, dp, symbol });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
