export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const key = process.env.FINNHUB_KEY;
  if (!key) return res.status(500).json({ error: 'Missing FINNHUB_KEY' });
  try {
    const r = await fetch(`https://finnhub.io/api/v1/news?category=general&minId=0&token=${key}`);
    const d = await r.json();
    res.json(d.slice(0, 20));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
