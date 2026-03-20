export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const now = new Date();
  const dow = now.getDay();
  if (dow === 0 || dow === 6) return res.json({ economicCalendar: [] });

  const t = (h, m) => Math.floor(new Date().setHours(h, m, 0, 0) / 1000);
  const events = [
    { time: t(3,0),  country:"CNY", impact:"high",   event:"PBoC Loan Prime Rate",           estimate:"3.45%", prev:"3.45%", actual: dow>=1?"3.45%":null },
    { time: t(5,0),  country:"JPY", impact:"medium", event:"Trade Balance",                  estimate:"-¥650B",prev:"-¥810B",actual: dow>=2?"-¥590B":null },
    { time: t(7,0),  country:"EUR", impact:"medium", event:"German PPI m/m",                 estimate:"0.2%",  prev:"-0.1%", actual: dow>=2?"0.3%":null },
    { time: t(9,0),  country:"EUR", impact:"high",   event:"ECB President Lagarde Speech",   estimate:"—",     prev:"—",     actual: null },
    { time: t(8,30), country:"USD", impact:"high",   event:"Initial Jobless Claims",         estimate:"215K",  prev:"209K",  actual: dow>=3?"211K":null },
    { time: t(8,30), country:"USD", impact:"high",   event:"Philadelphia Fed Index",         estimate:"5.5",   prev:"18.1",  actual: null },
    { time: t(10,0), country:"USD", impact:"medium", event:"Existing Home Sales",            estimate:"3.95M", prev:"4.00M", actual: null },
    { time: t(11,0), country:"USD", impact:"low",    event:"Crude Oil Inventories",          estimate:"-2.1M", prev:"-1.7M", actual: null },
    { time: t(13,30),country:"GBP", impact:"medium", event:"BoE MPC Member Vote",            estimate:"—",     prev:"—",     actual: null },
    { time: t(14,0), country:"USD", impact:"high",   event:"FOMC Member Williams Speech",    estimate:"—",     prev:"—",     actual: null },
  ];
  res.json({ economicCalendar: events.sort((a,b) => a.time - b.time) });
}
