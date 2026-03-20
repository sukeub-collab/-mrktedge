import { useState, useEffect, useRef } from "react";

const CALENDAR = [
  { id:1, time:"03:00", country:"CNY", impact:"high",   event:"PBoC Loan Prime Rate",         estimate:"3.45%", prev:"3.45%", actual:"3.45%" },
  { id:2, time:"05:00", country:"JPY", impact:"medium", event:"Trade Balance",                estimate:"-¥650B",prev:"-¥810B",actual:"-¥590B" },
  { id:3, time:"07:00", country:"EUR", impact:"medium", event:"German PPI m/m",               estimate:"0.2%",  prev:"-0.1%", actual:"0.3%" },
  { id:4, time:"08:30", country:"USD", impact:"high",   event:"Initial Jobless Claims",       estimate:"215K",  prev:"209K",  actual:null },
  { id:5, time:"08:30", country:"USD", impact:"high",   event:"Philadelphia Fed Index",       estimate:"5.5",   prev:"18.1",  actual:null },
  { id:6, time:"09:00", country:"EUR", impact:"high",   event:"ECB Lagarde Speech",           estimate:"—",     prev:"—",     actual:null },
  { id:7, time:"10:00", country:"USD", impact:"medium", event:"Existing Home Sales",          estimate:"3.95M", prev:"4.00M", actual:null },
  { id:8, time:"11:00", country:"USD", impact:"low",    event:"Crude Oil Inventories",        estimate:"-2.1M", prev:"-1.7M", actual:null },
  { id:9, time:"13:30", country:"GBP", impact:"medium", event:"BoE MPC Member Vote",          estimate:"—",     prev:"—",     actual:null },
  { id:10,time:"14:00", country:"USD", impact:"high",   event:"FOMC Member Williams Speech",  estimate:"—",     prev:"—",     actual:null },
];

const NEWS = [
  { id:1, cat:"FOMC",    src:"Reuters",   headline:"Fed's Williams reiterates data-dependent approach, no rush to cut rates", age:3 },
  { id:2, cat:"FOREX",   src:"Bloomberg", headline:"Dollar holds gains as Treasury yields climb on strong labor market signals", age:8 },
  { id:3, cat:"ENERGY",  src:"Reuters",   headline:"Oil prices rise 1.8% as OPEC+ supply cuts offset demand concerns", age:15 },
  { id:4, cat:"EQUITIES",src:"CNBC",      headline:"S&P 500 futures edge higher ahead of jobless claims data", age:22 },
  { id:5, cat:"ECB",     src:"FT",        headline:"Lagarde signals ECB caution on rate cuts amid persistent services inflation", age:31 },
  { id:6, cat:"CHINA",   src:"Bloomberg", headline:"China keeps lending rate steady as policymakers assess stimulus impact", age:45 },
  { id:7, cat:"GOLD",    src:"Reuters",   headline:"Gold edges up as safe-haven demand persists amid geopolitical uncertainty", age:58 },
  { id:8, cat:"BONDS",   src:"WSJ",       headline:"US 10-year yield climbs to 4.32% as rate-cut bets continue to unwind", age:72 },
];

const QUOTE_SYMS = [
  { sym:"OANDA:EUR_USD", label:"EUR/USD" },
  { sym:"OANDA:GBP_USD", label:"GBP/USD" },
  { sym:"OANDA:USD_JPY", label:"USD/JPY" },
  { sym:"OANDA:AUD_USD", label:"AUD/USD" },
  { sym:"OANDA:USD_CAD", label:"USD/CAD" },
  { sym:"OANDA:USD_CHF", label:"USD/CHF" },
  { sym:"OANDA:NZD_USD", label:"NZD/USD" },
  { sym:"OANDA:EUR_GBP", label:"EUR/GBP" },
  { sym:"OANDA:EUR_JPY", label:"EUR/JPY" },
  { sym:"OANDA:GBP_JPY", label:"GBP/JPY" },
];

function impLvl(v) {
  const s = String(v||"").toLowerCase();
  if (s==="high"||s==="3") return "high";
  if (s==="medium"||s==="2") return "medium";
  return "low";
}
function curCls(c) {
  const m={USD:"cur-USD",EUR:"cur-EUR",GBP:"cur-GBP",JPY:"cur-JPY",CNY:"cur-CNY"};
  return m[c]||"cur-X";
}
function fmtAgo(m) { return m<60?`${m}m ago`:`${Math.floor(m/60)}h ago`; }

function Dots({ imp }) {
  const n = imp==="high"?3:imp==="medium"?2:1;
  return <div className="dots">{[1,2,3].map(i=><div key={i} className={`dot ${i<=n?imp:""}`}/>)}</div>;
}

function Ticker({ quotes }) {
  if (!quotes.length) return null;
  const all = [...quotes, ...quotes];
  return (
    <div className="ticker">
      <div className="tk-track">
        {all.map((q,i) => (
          <div key={i} className="tk-item">
            <span className="tk-sym">{q.label}</span>
            <span>{typeof q.c==="number" ? q.c.toFixed(q.c>100?2:4) : "—"}</span>
            <span className={q.dp>=0?"up":"dn"}>{q.dp>=0?"+":""}{typeof q.dp==="number"?q.dp.toFixed(2):""} %</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Calendar({ onSelect, selected }) {
  const now = new Date();
  const nowMins = now.getHours()*60+now.getMinutes();
  return (
    <div className="card">
      <div className="card-hdr">
        <div className="card-title">📅 Economic Calendar</div>
        <span className="badge live">LIVE · {now.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
      </div>
      <div className="cal-hdr">
        {["TIME","CUR","IMP","EVENT","FORECAST","PREV","ACTUAL"].map(h=><div key={h} className="cal-h">{h}</div>)}
      </div>
      <div className="scroll">
        {CALENDAR.map(ev => {
          const [eh,em] = ev.time.split(":").map(Number);
          const isPast = eh*60+em < nowMins;
          const hasAct = ev.actual!=null && ev.actual!=="";
          const sur = hasAct&&ev.estimate ? (parseFloat(ev.actual)>parseFloat(ev.estimate)?"pos":parseFloat(ev.actual)<parseFloat(ev.estimate)?"neg":"") : "";
          const isSel = selected?.id===ev.id;
          return (
            <div key={ev.id} className={`cal-row${isPast?" past":""}${isSel?" sel":""}`} onClick={()=>onSelect(ev)}>
              <div className="c-time">{ev.time}</div>
              <div className={`cur ${curCls(ev.country)}`}>{ev.country}</div>
              <Dots imp={ev.impact}/>
              <div className="ev-name">{ev.event}</div>
              <div className="cv">{ev.estimate}</div>
              <div className="cv">{ev.prev}</div>
              <div className={`cv ${hasAct?sur||"":"pend"}`}>{ev.actual||"—"}</div>
            </div>
          );
        })}
      </div>
      <div className="hint">👆 Click any event for AI analysis</div>
    </div>
  );
}

function Chart({ quotes }) {
  const [asset, setAsset] = useState("EUR/USD");
  const [candles, setCandles] = useState([]);
  const assets = ["EUR/USD","GBP/USD","USD/JPY","AUD/USD"];

  useEffect(() => {
    const q = quotes.find(x=>x.label===asset);
    const base = q?.c || (asset==="USD/JPY"?151.82:asset==="XAU/USD"?2348:1.08);
    const spread = asset==="USD/JPY"?0.15:asset==="XAU/USD"?4:0.0008;
    const out=[]; let p=base;
    const now=Math.floor(Date.now()/1000);
    for(let i=18;i>=0;i--){
      const t=now-i*900;
      const move=(Math.random()-.48)*spread*3;
      const c=parseFloat((p+move).toFixed(5));
      const h=parseFloat((Math.max(p,c)+Math.random()*spread).toFixed(5));
      const l=parseFloat((Math.min(p,c)-Math.random()*spread).toFixed(5));
      out.push({t,o:p,h,l,c}); p=c;
    }
    setCandles(out);
  }, [asset, quotes.length]);

  const prices=candles.flatMap(c=>[c.h,c.l]);
  const minP=prices.length?Math.min(...prices):0;
  const maxP=prices.length?Math.max(...prices):1;
  const rng=maxP-minP||1;
  const toY=p=>((maxP-p)/rng)*155;
  const dec=asset==="USD/JPY"?2:asset==="XAU/USD"?1:4;

  return (
    <div className="card">
      <div className="card-hdr">
        <div className="card-title">🔍 What Moved The Market</div>
      </div>
      <div className="chart-wrap">
        <div className="a-sel">
          {assets.map(a=><button key={a} className={`a-btn${asset===a?" on":""}`} onClick={()=>setAsset(a)}>{a}</button>)}
        </div>
        {candles.length>0 && (
          <>
            <div className="chart-area">
              {candles.map((c,i)=>{
                const bull=c.c>=c.o;
                const bTop=toY(Math.max(c.o,c.c));
                const bH=Math.max(2,Math.abs(toY(c.o)-toY(c.c)));
                const wTop=toY(c.h);
                const wH=toY(c.l)-wTop;
                const t=new Date(c.t*1000).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});
                return (
                  <div key={i} className="c-col">
                    <div className="c-wick" style={{top:wTop,height:wH,left:"50%",transform:"translateX(-50%)"}}/>
                    <div className={`c-body ${bull?"bull":"bear"}`} style={{top:bTop,height:bH,left:"18%",right:"18%"}}/>
                    <div className="ctip">
                      <div className="ctip-t">{asset} · {t}</div>
                      <div>O: {c.o.toFixed(dec)} H: {c.h.toFixed(dec)}</div>
                      <div>L: {c.l.toFixed(dec)} C: {c.c.toFixed(dec)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function News() {
  const [age, setAge] = useState(0);
  useEffect(()=>{const id=setInterval(()=>setAge(a=>a+1),60000);return()=>clearInterval(id);},[]);
  return (
    <div className="card">
      <div className="card-hdr">
        <div className="card-title">📡 Live Headlines</div>
        <span className="badge live">LIVE</span>
      </div>
      <div className="n-list scroll" style={{maxHeight:310}}>
        {NEWS.map(n=>{
          const imp=["FOMC","ECB","ENERGY","BONDS"].includes(n.cat)?"h":"m";
          return (
            <div key={n.id} className="n-item">
              <div className="n-time">{fmtAgo(n.age+age)}</div>
              <div className={`n-tag ${imp}`}>{n.cat.slice(0,6)}</div>
              <div>
                <div className="n-head">{n.headline}</div>
                <div className="n-src">{n.src}</div>
              </div>
            </div>
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

  useEffect(()=>{
    if(!ev) return;
    if(lastId.current===ev.id) return;
    lastId.current=ev.id;
    analyze(ev);
  },[ev]);

  async function analyze(ev) {
    setBusy(true); setTxt(null); setBias(null);
    try {
      const hasAct = ev.actual!=null && ev.actual!=="";
      const prompt = `You are a sharp macro analyst. Analyze this economic event for a retail trader:

Event: ${ev.event}
Country: ${ev.country}
Impact: ${ev.impact}
Estimate: ${ev.estimate}
Previous: ${ev.prev}
Actual: ${hasAct?ev.actual:"Not yet released"}

Write exactly 3 punchy sentences:
1. What this data signals
2. How ${ev.country} currency should react
3. Key level or risk to watch

Then on a new line write one word: BULLISH, BEARISH, or NEUTRAL`;

      const res = await fetch("/api/analyze", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt})
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text||"";
      const lines = raw.trim().split("\n");
      const last = lines[lines.length-1].trim().toUpperCase();
      if(["BULLISH","BEARISH","NEUTRAL"].includes(last)){
        setBias(last); setTxt(lines.slice(0,-1).join("\n").trim());
      } else { setTxt(raw); setBias("NEUTRAL"); }
    } catch(e) { setTxt("Error: "+e.message); }
    setBusy(false);
  }

  return (
    <div className="card">
      <div className="card-hdr">
        <div className="card-title">🤖 AI Analysis</div>
        {busy&&<span className="badge ai">Analyzing...</span>}
        {!busy&&bias&&<span className="badge ai">Claude</span>}
      </div>
      {!ev&&<div className="ai-empty"><strong>Select an event</strong>Click any row in the calendar for instant macro analysis</div>}
      {busy&&<div className="ai-loading"><div className="spinner"/><div className="spinner-txt">Analyzing<br/><strong>{ev?.event}</strong></div></div>}
      {!busy&&txt&&(
        <div className="ai-result">
          <div className="ai-ev">{ev?.event}</div>
          <div className="ai-meta">
            <span>{ev?.country}</span><span>·</span>
            <span style={{textTransform:"capitalize"}}>{ev?.impact} impact</span><span>·</span>
            <span style={{color:ev?.actual?"var(--gr)":"var(--tx3)"}}>{ev?.actual?`Actual: ${ev.actual}`:"Upcoming"}</span>
          </div>
          <div className="ai-txt">{txt}</div>
          {bias&&<div className={`ai-bias b-${bias}`}>{bias==="BULLISH"?"▲":bias==="BEARISH"?"▼":"●"} {bias} {ev?.country}</div>}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [selEv, setSelEv] = useState(null);

  useEffect(()=>{
    loadQuotes();
    const id=setInterval(loadQuotes,10000);
    return()=>clearInterval(id);
  },[]);

  async function loadQuotes() {
    try {
      const results = await Promise.all(
        QUOTE_SYMS.map(({sym,label})=>
          fetch(`/api/quote?symbol=${sym}`).then(r=>r.json()).then(d=>({...d,label})).catch(()=>({label,c:null,dp:0}))
        )
      );
      setQuotes(results.filter(q=>q.c));
    } catch {}
  }

  const today = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  const eur = quotes.find(q=>q.label==="EUR/USD");
  const gbp = quotes.find(q=>q.label==="GBP/USD");
  const highCnt = CALENDAR.filter(e=>e.impact==="high").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#080b10;--sf:#0d1117;--sf2:#141b24;--sf3:#1c2535;--bd:#1e2d3d;--bd2:#243447;--ac:#00d4aa;--ac2:#0094ff;--tx:#e2e8f0;--tx2:#8899aa;--tx3:#4a5f72;--gr:#22c55e;--rd:#ef4444;--yw:#f59e0b;--mono:'Space Mono',monospace;--sans:'Syne',sans-serif;}
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
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
        .stat{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:13px 15px;}
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
        .n-list{display:flex;flex-direction:column;}
        .n-item{padding:10px 14px;border-bottom:1px solid var(--bd);display:flex;gap:9px;align-items:flex-start;transition:background .12s;}
        .n-item:hover{background:var(--sf2);}
        .n-time{font-family:var(--mono);font-size:10px;color:var(--tx3);min-width:36px;padding-top:2px;}
        .n-tag{font-family:var(--mono);font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;border:1px solid;white-space:nowrap;margin-top:1px;}
        .n-tag.h{color:var(--rd);border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.07);}
        .n-tag.m{color:var(--yw);border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.07);}
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
        <div className="logo"><div className="logo-hex"/><div className="logo-nm">MRKT<span>EDGE</span></div></div>
        <div className="live-pill"><div className="ldot"/>LIVE DATA</div>
        <div className="hdr-meta">{today}</div>
      </header>

      <Ticker quotes={quotes}/>

      <div className="main">
        <div className="content">
          <div className="stats">
            <div className="stat">
              <div className="stat-l">High Impact</div>
              <div className="stat-v" style={{color:"var(--rd)"}}>{highCnt}</div>
              <div className="stat-c" style={{color:"var(--tx3)"}}>events today</div>
            </div>
            <div className="stat">
              <div className="stat-l">EUR/USD</div>
              <div className="stat-v">{eur?.c?.toFixed(4)||"—"}</div>
              <div className={`stat-c ${eur?.dp>=0?"up":"dn"}`}>{eur?.dp>=0?"+":""}{eur?.dp?.toFixed(2)||""}%</div>
            </div>
            <div className="stat">
              <div className="stat-l">GBP/USD</div>
              <div className="stat-v">{gbp?.c?.toFixed(4)||"—"}</div>
              <div className={`stat-c ${gbp?.dp>=0?"up":"dn"}`}>{gbp?.dp>=0?"+":""}{gbp?.dp?.toFixed(2)||""}%</div>
            </div>
            <div className="stat">
              <div className="stat-l">AI Analysis</div>
              <div className="stat-v" style={{color:"var(--ac)"}}>✓ ON</div>
              <div className="stat-c" style={{color:"var(--tx3)"}}>Claude powered</div>
            </div>
          </div>
          <Calendar onSelect={setSelEv} selected={selEv}/>
          {typeof window !== "undefined" && <Chart quotes={quotes}/>}
        </div>
        <div className="sidebar">
          <AIPanel ev={selEv}/>
          <News/>
        </div>
      </div>
    </>
  );
}
