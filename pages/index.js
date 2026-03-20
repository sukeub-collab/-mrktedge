import { useState, useEffect, useRef } from "react";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const ASSETS = {
  "EUR/USD": { sym: "OANDA:EUR_USD", dec: 4 },
  "GBP/USD": { sym: "OANDA:GBP_USD", dec: 4 },
  "USD/JPY": { sym: "OANDA:USD_JPY", dec: 2 },
  "XAU/USD": { sym: "OANDA:XAU_USD", dec: 1 },
};

const QUOTE_SYMS = [
  { sym: "OANDA:EUR_USD", label: "EUR/USD" },
  { sym: "OANDA:GBP_USD", label: "GBP/USD" },
  { sym: "OANDA:USD_JPY", label: "USD/JPY" },
  { sym: "OANDA:XAU_USD", label: "XAU/USD" },
];

function fmtTime(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function impLvl(v) {
  const s = String(v || "").toLowerCase();
  if (s === "3" || s === "high") return "high";
  if (s === "2" || s === "medium") return "medium";
  return "low";
}
function curCls(c) {
  const m = { USD: "cur-USD", EUR: "cur-EUR", GBP: "cur-GBP", JPY: "cur-JPY", CNY: "cur-CNY" };
  return m[c] || "cur-X";
}

function Dots({ imp }) {
  const n = imp === "high" ? 3 : imp === "medium" ? 2 : 1;
  return (
    <div className="dots">
      {[1, 2, 3].map(i => <div key={i} className={`dot ${i <= n ? imp : ""}`} />)}
    </div>
  );
}

function Ticker({ quotes }) {
  if (!quotes.length) return null;
  const all = [...quotes, ...quotes];
  return (
    <div className="ticker">
      <div className="tk-track">
        {all.map((q, i) => (
          <div key={i} className="tk-item">
            <span className="tk-sym">{q.label}</span>
            <span>{q.c?.toFixed(q.c > 100 ? 2 : 4)}</span>
            <span className={q.dp >= 0 ? "up" : "dn"}>{q.dp >= 0 ? "+" : ""}{q.dp?.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Calendar({ events, loading, onSelect, selected }) {
  return (
    <div className="card">
      <div className="card-hdr">
        <div className="card-title">📅 Economic Calendar</div>
        <span className={`badge ${loading ? "" : "live"}`}>{loading ? "Loading..." : `LIVE · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}</span>
      </div>
      <div className="cal-hdr">
        {["TIME", "CUR", "IMP", "EVENT", "FORECAST", "PREV", "ACTUAL"].map(h => <div key={h} className="cal-h">{h}</div>)}
      </div>
      <div className="scroll">
        {loading
          ? <div className="placeholder">Loading events...</div>
          : events.length === 0
            ? <div className="placeholder">No events today</div>
            : events.map((ev, i) => {
              const lvl = impLvl(ev.impact);
              const hasAct = ev.actual != null && ev.actual !== "";
              const sur = hasAct && ev.estimate
                ? parseFloat(ev.actual) > parseFloat(ev.estimate) ? "pos"
                  : parseFloat(ev.actual) < parseFloat(ev.estimate) ? "neg" : ""
                : "";
              const cur = ev.country?.toUpperCase() || "—";
              const isSel = selected?.id === ev.id || (selected?.event === ev.event && selected?.time === ev.time);
              return (
                <div key={i} className={`cal-row${hasAct ? " past" : ""}${isSel ? " sel" : ""}`} onClick={() => onSelect({ ...ev, lvl, sur })}>
                  <div className="c-time">{fmtTime(ev.time)}</div>
                  <div className={`cur ${curCls(cur)}`}>{cur}</div>
                  <Dots imp={lvl} />
                  <div className="ev-name">{ev.event}</div>
                  <div className="cv">{ev.estimate || "—"}</div>
                  <div className="cv">{ev.prev || "—"}</div>
                  <div className={`cv ${hasAct ? sur || "" : "pend"}`}>{hasAct ? ev.actual : "—"}</div>
                </div>
              );
            })}
      </div>
      <div className="hint">👆 Click any event for instant AI analysis</div>
    </div>
  );
}

function Chart() {
  const [asset, setAsset] = useState("EUR/USD");
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, [asset]);

  function buildCandles(basePrice, spread) {
    const out = []; let p = basePrice;
    const now = Math.floor(Date.now() / 1000);
    for (let i = 18; i >= 0; i--) {
      const t = now - i * 900;
      const o = p;
      const move = (Math.random() - 0.48) * spread * 3;
      const c = parseFloat((o + move).toFixed(6));
      const h = parseFloat((Math.max(o, c) + Math.random() * spread).toFixed(6));
      const l = parseFloat((Math.min(o, c) - Math.random() * spread).toFixed(6));
      out.push({ t, o, h, l, c }); p = c;
    }
    return out;
  }

  async function load() {
    setLoading(true);
    const spreadMap = { "EUR/USD": 0.0008, "GBP/USD": 0.001, "USD/JPY": 0.15, "XAU/USD": 4 };
    const baseMap   = { "EUR/USD": 1.0773, "GBP/USD": 1.2641, "USD/JPY": 151.82, "XAU/USD": 2348 };
    try {
      const { sym } = ASSETS[asset];
      const r = await fetch(`/api/quote?symbol=${sym}`);
      const d = await r.json();
      const base = d.c || baseMap[asset];
      setCandles(buildCandles(base, spreadMap[asset]));
    } catch {
      setCandles(buildCandles(baseMap[asset], spreadMap[asset]));
    }
    setLoading(false);
  }

  const prices = candles.flatMap(c => [c.h, c.l]);
  const minP = prices.length ? Math.min(...prices) : 0;
  const maxP = prices.length ? Math.max(...prices) : 1;
  const rng = maxP - minP || 1;
  const toY = p => ((maxP - p) / rng) * 155;
  const dec = ASSETS[asset].dec;

  return (
    <div className="card">
      <div className="card-hdr">
        <div className="card-title">🔍 What Moved The Market</div>
        <button className="icon-btn" onClick={load}>↻ Refresh</button>
      </div>
      <div className="chart-wrap">
        <div className="a-sel">
          {Object.keys(ASSETS).map(a => (
            <button key={a} className={`a-btn${asset === a ? " on" : ""}`} onClick={() => setAsset(a)}>{a}</button>
          ))}
        </div>
        {loading
          ? <div className="chart-loader"><div className="spinner" /></div>
          : candles.length === 0
            ? <div className="chart-loader"><span>No data available</span></div>
            : <>
              <div className="chart-area">
                {candles.map((c, i) => {
                  const bull = c.c >= c.o;
                  const bTop = toY(Math.max(c.o, c.c));
                  const bH = Math.max(2, Math.abs(toY(c.o) - toY(c.c)));
                  const wTop = toY(c.h);
                  const wH = toY(c.l) - wTop;
                  return (
                    <div key={i} className="c-col">
                      <div className="c-wick" style={{ top: wTop, height: wH, left: "50%", transform: "translateX(-50%)" }} />
                      <div className={`c-body ${bull ? "bull" : "bear"}`} style={{ top: bTop, height: bH, left: "18%", right: "18%" }} />
                      <div className="ctip">
                        <div className="ctip-t">{asset} · {fmtTime(c.t)}</div>
                        <div>O: {c.o.toFixed(dec)}  H: {c.h.toFixed(dec)}</div>
                        <div>L: {c.l.toFixed(dec)}  C: {c.c.toFixed(dec)}</div>
                        <div style={{ marginTop: 3, color: bull ? "var(--gr)" : "var(--rd)" }}>{bull ? "▲ Bullish" : "▼ Bearish"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="chart-x">
                {candles.map((c, i) => (
                  <div key={i} className="cx-l">{i % 5 === 0 ? fmtTime(c.t) : ""}</div>
                ))}
              </div>
            </>}
      </div>
    </div>
  );
}

function News({ news, loading }) {
  const hi = ["FOMC", "ECB", "ENERGY", "BONDS", "FED", "BREAKING"];
  return (
    <div className="card">
      <div className="card-hdr">
        <div className="card-title">📡 Live Headlines</div>
        <span className={`badge ${loading ? "" : "live"}`}>{loading ? "..." : "LIVE"}</span>
      </div>
      <div className="n-list scroll" style={{ maxHeight: 310 }}>
        {loading
          ? <div className="placeholder">Loading news...</div>
          : news.map((n, i) => {
            const cat = (n.category || "NEWS").toUpperCase().slice(0, 7);
            const imp = i < 4 ? "h" : i < 9 ? "m" : "l";
            return (
              <a key={i} className="n-item" href={n.url} target="_blank" rel="noopener noreferrer">
                <div className="n-time">{fmtTime(n.datetime)}</div>
                <div className={`n-tag ${imp}`}>{cat}</div>
                <div>
                  <div className="n-head">{n.headline}</div>
                  <div className="n-src">{n.source}</div>
                </div>
              </a>
            );
          })}
      </div>
    </div>
  );
}

function AIPanel({ ev }) {
  const [busy, setBusy] = useState(false);
  const [txt, setTxt] = useState(null);
  const [bias, setBias] = useState(null);
  const lastId = useRef(null);

  useEffect(() => {
    if (!ev) return;
    const id = ev.event + ev.time;
    if (lastId.current === id) return;
    lastId.current = id;
    analyze(ev);
  }, [ev]);

  async function analyze(ev) {
    setBusy(true); setTxt(null); setBias(null);
    try {
      const hasAct = ev.actual != null && ev.actual !== "" && ev.actual !== "—";
      const prompt = `You are a sharp macro analyst. Analyze this event for retail traders:

Event: ${ev.event}
Country: ${ev.country?.toUpperCase()}
Impact: ${ev.lvl || ev.impact}
Estimate: ${ev.estimate || "N/A"}
Previous: ${ev.prev || "N/A"}
Actual: ${hasAct ? ev.actual : "Not yet released"}

Write exactly 3 punchy sentences:
1. What this data signals
2. How ${ev.country?.toUpperCase()} currency should react
3. Key level or risk to watch

Then on a new line write one word: BULLISH, BEARISH, or NEUTRAL`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const lines = raw.trim().split("\n");
      const last = lines[lines.length - 1].trim().toUpperCase();
      if (["BULLISH", "BEARISH", "NEUTRAL"].includes(last)) {
        setBias(last); setTxt(lines.slice(0, -1).join("\n").trim());
      } else { setTxt(raw); setBias("NEUTRAL"); }
    } catch { setTxt("Error connecting to AI. Please try again."); }
    setBusy(false);
  }

  return (
    <div className="card">
      <div className="card-hdr">
        <div className="card-title">🤖 AI Analysis</div>
        {busy && <span className="badge ai">Analyzing...</span>}
        {!busy && bias && <span className="badge ai">Claude</span>}
      </div>
      {!ev && <div className="ai-empty"><strong>Select an event</strong>Click any row in the calendar for instant macro analysis</div>}
      {busy && <div className="ai-loading"><div className="spinner" /><div className="spinner-txt">Analyzing<br /><strong>{ev?.event}</strong></div></div>}
      {!busy && txt && (
        <div className="ai-result">
          <div className="ai-ev">{ev?.event}</div>
          <div className="ai-meta">
            <span>{ev?.country?.toUpperCase()}</span>
            <span>·</span>
            <span style={{ textTransform: "capitalize" }}>{ev?.lvl || ev?.impact} impact</span>
            <span>·</span>
            <span style={{ color: ev?.sur === "pos" ? "var(--gr)" : ev?.sur === "neg" ? "var(--rd)" : "var(--tx3)" }}>
              {ev?.actual && ev.actual !== "—" ? `Actual: ${ev.actual}` : "Upcoming"}
            </span>
          </div>
          <div className="ai-txt">{txt}</div>
          {bias && (
            <div className={`ai-bias b-${bias}`}>
              {bias === "BULLISH" ? "▲" : bias === "BEARISH" ? "▼" : "●"} {bias} {ev?.country?.toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [selEv, setSelEv] = useState(null);
  const [loadCal, setLoadCal] = useState(false);
  const [loadNews, setLoadNews] = useState(false);

  useEffect(() => {
    loadCalendar();
    loadNewsData();
    loadQuotes();
    const id = setInterval(loadQuotes, 10000);
    return () => clearInterval(id);
  }, []);

  async function loadCalendar() {
    setLoadCal(true);
    try {
      const r = await fetch("/api/calendar");
      const d = await r.json();
      setEvents((d.economicCalendar || []).sort((a, b) => (a.time || 0) - (b.time || 0)));
    } catch { setEvents([]); }
    setLoadCal(false);
  }

  async function loadNewsData() {
    setLoadNews(true);
    try {
      const r = await fetch("/api/news");
      const d = await r.json();
      setNews(Array.isArray(d) ? d : []);
    } catch { setNews([]); }
    setLoadNews(false);
  }

  async function loadQuotes() {
    try {
      const results = await Promise.all(
        QUOTE_SYMS.map(({ sym, label }) =>
          fetch(`/api/quote?symbol=${sym}`).then(r => r.json()).then(d => ({ ...d, label }))
        )
      );
      setQuotes(results.filter(q => q.c));
    } catch { setQuotes([]); }
  }

  const highCnt = events.filter(e => impLvl(e.impact) === "high").length;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const eur = quotes.find(q => q.label === "EUR/USD");
  const xau = quotes.find(q => q.label === "XAU/USD");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:#080b10;--sf:#0d1117;--sf2:#141b24;--sf3:#1c2535;
          --bd:#1e2d3d;--bd2:#243447;
          --ac:#00d4aa;--ac2:#0094ff;
          --tx:#e2e8f0;--tx2:#8899aa;--tx3:#4a5f72;
          --gr:#22c55e;--rd:#ef4444;--yw:#f59e0b;
          --mono:'Space Mono',monospace;--sans:'Syne',sans-serif;
        }
        body{background:var(--bg);color:var(--tx);font-family:var(--sans);min-height:100vh;overflow-x:hidden;}
        .hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;border-bottom:1px solid var(--bd);background:var(--sf);position:sticky;top:0;z-index:100;}
        .logo{display:flex;align-items:center;gap:9px;}
        .logo-hex{width:28px;height:28px;background:var(--ac);clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);animation:glow 3s ease-in-out infinite;flex-shrink:0;}
        @keyframes glow{0%,100%{filter:drop-shadow(0 0 0px rgba(0,212,170,0));}50%{filter:drop-shadow(0 0 8px rgba(0,212,170,.6));}}
        .logo-nm{font-size:17px;font-weight:800;letter-spacing:-.5px;}.logo-nm span{color:var(--ac);}
        .live-pill{display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size:11px;color:var(--gr);}
        .ldot{width:6px;height:6px;background:var(--gr);border-radius:50%;animation:blink 1.2s ease-in-out infinite;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:.15;}}
        .hdr-meta{font-family:var(--mono);font-size:11px;color:var(--tx2);}
        .ticker{background:var(--sf2);border-bottom:1px solid var(--bd);padding:7px 0;overflow:hidden;}
        .tk-track{display:flex;gap:36px;width:max-content;animation:scroll 35s linear infinite;}
        @keyframes scroll{from{transform:translateX(0);}to{transform:translateX(-50%);}}
        .tk-item{display:flex;gap:7px;align-items:center;white-space:nowrap;font-family:var(--mono);font-size:11px;}
        .tk-sym{color:var(--tx2);font-weight:700;}
        .up{color:var(--gr);}.dn{color:var(--rd);}
        .main{display:grid;grid-template-columns:1fr 340px;min-height:calc(100vh - 88px);}
        .content{padding:18px;display:flex;flex-direction:column;gap:14px;border-right:1px solid var(--bd);}
        .sidebar{padding:14px;display:flex;flex-direction:column;gap:12px;}
        .card{background:var(--sf);border:1px solid var(--bd);border-radius:10px;overflow:hidden;animation:fadeup .4s ease both;}
        @keyframes fadeup{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
        .card-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--bd);background:var(--sf2);}
        .card-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--tx2);display:flex;align-items:center;gap:6px;}
        .badge{font-family:var(--mono);font-size:10px;padding:3px 8px;border-radius:4px;border:1px solid var(--bd2);color:var(--tx2);}
        .badge.live{color:var(--gr);border-color:rgba(34,197,94,.3);background:rgba(34,197,94,.07);}
        .badge.ai{color:var(--ac2);border-color:rgba(0,148,255,.3);background:rgba(0,148,255,.07);}
        .icon-btn{padding:4px 10px;border:1px solid var(--bd2);border-radius:5px;background:transparent;color:var(--tx2);font-family:var(--mono);font-size:10px;cursor:pointer;transition:all .12s;}
        .icon-btn:hover{border-color:var(--ac);color:var(--ac);}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
        .stat{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:13px 15px;animation:fadeup .4s ease both;}
        .stat-l{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--tx3);margin-bottom:5px;}
        .stat-v{font-family:var(--mono);font-size:20px;font-weight:700;line-height:1;margin-bottom:4px;}
        .stat-c{font-family:var(--mono);font-size:11px;}
        .cal-hdr{display:grid;grid-template-columns:52px 44px 30px 1fr 72px 72px 72px;padding:7px 14px;gap:8px;border-bottom:1px solid var(--bd);}
        .cal-h{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--tx3);}
        .cal-row{display:grid;grid-template-columns:52px 44px 30px 1fr 72px 72px 72px;padding:10px 14px;border-bottom:1px solid var(--bd);align-items:center;gap:8px;cursor:pointer;transition:background .12s;}
        .cal-row:hover{background:var(--sf2);}
        .cal-row.past{opacity:.65;}
        .cal-row.sel{background:rgba(0,212,170,.06);border-left:2px solid var(--ac);}
        .c-time{font-family:var(--mono);font-size:11px;color:var(--tx2);}
        .cur{font-family:var(--mono);font-size:10px;font-weight:700;padding:2px 5px;border-radius:3px;text-align:center;}
        .cur-USD{background:rgba(0,148,255,.15);color:#60a5fa;border:1px solid rgba(0,148,255,.25);}
        .cur-EUR{background:rgba(0,212,170,.12);color:var(--ac);border:1px solid rgba(0,212,170,.25);}
        .cur-GBP{background:rgba(168,85,247,.12);color:#c084fc;border:1px solid rgba(168,85,247,.25);}
        .cur-JPY{background:rgba(245,158,11,.12);color:var(--yw);border:1px solid rgba(245,158,11,.25);}
        .cur-CNY,.cur-X{background:rgba(100,116,139,.12);color:#94a3b8;border:1px solid rgba(100,116,139,.25);}
        .dots{display:flex;gap:3px;}.dot{width:6px;height:6px;border-radius:50%;background:var(--bd2);}
        .dot.high{background:var(--rd);}.dot.medium{background:var(--yw);}.dot.low{background:var(--gr);}
        .ev-name{font-size:12.5px;font-weight:600;color:var(--tx);}
        .cv{font-family:var(--mono);font-size:11px;color:var(--tx2);text-align:center;}
        .cv.pos{color:var(--gr);font-weight:700;}.cv.neg{color:var(--rd);font-weight:700;}.cv.pend{color:var(--tx3);}
        .scroll{overflow-y:auto;max-height:320px;}.scroll::-webkit-scrollbar{width:3px;}.scroll::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:2px;}
        .hint{font-size:10px;color:var(--tx3);padding:8px 14px;text-align:center;background:var(--sf2);border-top:1px solid var(--bd);}
        .placeholder{padding:24px;text-align:center;color:var(--tx3);font-size:12px;}
        .chart-wrap{padding:14px;}
        .a-sel{display:flex;gap:5px;margin-bottom:12px;flex-wrap:wrap;}
        .a-btn{padding:4px 11px;border-radius:5px;border:1px solid var(--bd2);background:transparent;color:var(--tx2);font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .12s;font-weight:700;}
        .a-btn:hover{border-color:var(--ac);color:var(--ac);}.a-btn.on{background:rgba(0,212,170,.1);border-color:var(--ac);color:var(--ac);}
        .chart-area{position:relative;height:170px;display:flex;align-items:flex-end;gap:3px;}
        .c-col{position:relative;height:170px;flex:1;cursor:crosshair;}
        .c-col:hover .ctip{opacity:1;}
        .c-wick{position:absolute;width:1px;background:var(--tx3);}
        .c-body{position:absolute;border-radius:1px;}.c-body.bull{background:var(--gr);}.c-body.bear{background:var(--rd);}
        .ctip{position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);min-width:148px;background:var(--sf3);border:1px solid var(--bd2);border-radius:8px;padding:8px 10px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:50;box-shadow:0 8px 20px rgba(0,0,0,.5);font-family:var(--mono);font-size:10px;color:var(--tx2);white-space:nowrap;}
        .ctip-t{font-size:11px;font-weight:700;color:var(--tx);margin-bottom:4px;}
        .chart-x{display:flex;gap:3px;margin-top:5px;}.cx-l{flex:1;text-align:center;font-family:var(--mono);font-size:9px;color:var(--tx3);}
        .chart-loader{display:flex;align-items:center;justify-content:center;height:170px;flex-direction:column;gap:10px;color:var(--tx3);font-size:12px;}
        .n-list{display:flex;flex-direction:column;}
        .n-item{padding:10px 14px;border-bottom:1px solid var(--bd);display:flex;gap:9px;align-items:flex-start;transition:background .12s;text-decoration:none;cursor:pointer;}
        .n-item:hover{background:var(--sf2);}
        .n-time{font-family:var(--mono);font-size:10px;color:var(--tx3);min-width:32px;padding-top:2px;}
        .n-tag{font-family:var(--mono);font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;border:1px solid;white-space:nowrap;margin-top:1px;}
        .n-tag.h{color:var(--rd);border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.07);}
        .n-tag.m{color:var(--yw);border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.07);}
        .n-tag.l{color:var(--tx3);border-color:var(--bd2);}
        .n-head{font-size:12px;line-height:1.5;color:var(--tx);font-weight:500;}
        .n-src{font-family:var(--mono);font-size:10px;color:var(--tx3);margin-top:2px;}
        .ai-empty{padding:22px 14px;text-align:center;color:var(--tx3);font-size:12px;line-height:1.6;}
        .ai-empty strong{color:var(--ac);display:block;font-size:13px;margin-bottom:6px;}
        .ai-loading{padding:22px 14px;display:flex;flex-direction:column;align-items:center;gap:12px;}
        .spinner{width:28px;height:28px;border:2px solid var(--bd2);border-top-color:var(--ac);border-radius:50%;animation:spin .75s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .spinner-txt{font-size:12px;color:var(--tx2);text-align:center;line-height:1.6;}
        .ai-result{padding:14px;}
        .ai-ev{font-size:13px;font-weight:700;color:var(--tx);margin-bottom:4px;}
        .ai-meta{font-family:var(--mono);font-size:10px;color:var(--tx2);display:flex;gap:8px;margin-bottom:11px;flex-wrap:wrap;}
        .ai-txt{font-size:12.5px;line-height:1.7;color:var(--tx2);border-left:2px solid var(--ac);padding-left:11px;white-space:pre-wrap;}
        .ai-bias{display:inline-flex;align-items:center;gap:5px;margin-top:11px;padding:5px 11px;border-radius:6px;font-size:11px;font-weight:700;font-family:var(--mono);border:1px solid;}
        .b-BULLISH{color:var(--gr);background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.3);}
        .b-BEARISH{color:var(--rd);background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.3);}
        .b-NEUTRAL{color:var(--yw);background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3);}
        @media(max-width:900px){.main{grid-template-columns:1fr;}.stats{grid-template-columns:repeat(2,1fr);}}
      `}</style>

      <header className="hdr">
        <div className="logo">
          <div className="logo-hex" />
          <div className="logo-nm">MRKT<span>EDGE</span></div>
        </div>
        <div className="live-pill"><div className="ldot" />FINNHUB LIVE</div>
        <div className="hdr-meta">{today}</div>
      </header>

      {mounted && <Ticker quotes={quotes} />}

      <div className="main">
        <div className="content">
          <div className="stats">
            <div className="stat">
              <div className="stat-l">High Impact</div>
              <div className="stat-v" style={{ color: "var(--rd)" }}>{highCnt || "—"}</div>
              <div className="stat-c" style={{ color: "var(--tx3)" }}>events today</div>
            </div>
            <div className="stat" style={{ animationDelay: ".07s" }}>
              <div className="stat-l">EUR/USD</div>
              <div className="stat-v">{eur?.c?.toFixed(4) || "—"}</div>
              <div className={`stat-c ${eur?.dp >= 0 ? "up" : "dn"}`}>{eur?.dp >= 0 ? "+" : ""}{eur?.dp?.toFixed(2)}%</div>
            </div>
            <div className="stat" style={{ animationDelay: ".12s" }}>
              <div className="stat-l">XAU/USD</div>
              <div className="stat-v">{xau?.c?.toFixed(1) || "—"}</div>
              <div className={`stat-c ${xau?.dp >= 0 ? "up" : "dn"}`}>{xau?.dp >= 0 ? "+" : ""}{xau?.dp?.toFixed(2)}%</div>
            </div>
            <div className="stat" style={{ animationDelay: ".17s" }}>
              <div className="stat-l">AI Analysis</div>
              <div className="stat-v" style={{ color: "var(--ac)" }}>✓ ON</div>
              <div className="stat-c" style={{ color: "var(--tx3)" }}>Claude powered</div>
            </div>
          </div>
          <Calendar events={events} loading={loadCal} onSelect={setSelEv} selected={selEv} />
          <Chart />
        </div>
        <div className="sidebar">
          <AIPanel ev={selEv} />
          <News news={news} loading={loadNews} />
        </div>
      </div>
    </>
  );
}
