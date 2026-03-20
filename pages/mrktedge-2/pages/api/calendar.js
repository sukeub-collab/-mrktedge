export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const key = process.env.FINNHUB_KEY;
  if (!key) return res.status(500).json({ error: 'Missing FINNHUB_KEY' });
  const today = new Date().toISOString().split('T')[0];
  try {
    const r = await fetch(`https://finnhub.io/api/v1/calendar/economic?from=${today}&to=${today}&token=${key}`);
    const d = await r.json();
    res.json(d);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
