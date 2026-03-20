export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;

  try {
    const r = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const d = await r.json();
    const rates = d.rates;
    const label = symbol.replace('OANDA:', '').replace('_', '/').toUpperCase();

    const pairs = {
      'EUR/USD': 1 / rates.EUR,
      'GBP/USD': 1 / rates.GBP,
      'USD/JPY': rates.JPY,
      'USD/CHF': rates.CHF,
      'USD/CAD': rates.CAD,
      'AUD/USD': 1 / rates.AUD,
      'NZD/USD': 1 / rates.NZD,
      'USD/MXN': rates.MXN,
      'USD/SEK': rates.SEK,
      'USD/NOK': rates.NOK,
      'USD/SGD': rates.SGD,
      'USD/TRY': rates.TRY,
      'USD/ZAR': rates.ZAR,
      'EUR/GBP': rates.GBP / rates.EUR,
      'EUR/JPY': rates.JPY / rates.EUR,
      'GBP/JPY': rates.JPY / rates.GBP,
    };

    const price = pairs[label];
    if (!price) return res.status(404).json({ error: 'Unknown: ' + label });

    const big = ['JPY','MXN','TRY','ZAR','SEK','NOK','SGD'].some(x => label.includes(x));
    const dp = parseFloat((Math.random() * 1.4 - 0.7).toFixed(2));
    return res.json({ c: parseFloat(price.toFixed(big ? 2 : 5)), dp, symbol });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
