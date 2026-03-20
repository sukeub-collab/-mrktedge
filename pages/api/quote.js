export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const key = process.env.FINNHUB_KEY;
  if (!key) return res.status(500).json({ error: 'Missing FINNHUB_KEY' });
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`);
    const d = await r.json();
    res.json({ ...d, symbol });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
