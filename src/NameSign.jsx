import { useState, useEffect, useRef, useCallback } from "react";

// Target: 800×480 (Raspberry Pi)
const BREAK_DURATION = 30 * 60;

const C = {
  blue:    "#0057A8",
  blueMid: "#0068cc",
  blueNav: "#003f80",
  dark:    "#00274D",
  lime:    "#78BE20",
  yellow:  "#F5C400",
  white:   "#FFFFFF",
  slate:   "#C8DCEF",
  muted:   "#7AAED4",
};

const STATUSES = [
  { label:"On Route",       code:"ON ROUTE",       color:C.lime,    key:"1" },
  { label:"Delay",          code:"DELAY",           color:C.yellow,  key:"2" },
  { label:"Detour",         code:"DETOUR",          color:"#FF8C00", key:"3" },
  { label:"Time Point",     code:"TIME POINT",      color:"#29C5F6", key:"4", hasTimer:true },
  { label:"Out of Service", code:"OUT OF SERVICE",  color:"#E53935", key:"5" },
];
const AVAILABLE = STATUSES[0];

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function LeftPanel({ status, breakSecs, open, onToggle }) {
  const isBreak = status.code === "TIME POINT" && breakSecs > 0;
  const r = 102, circ = 2 * Math.PI * r;
  const offset = isBreak ? circ * (1 - breakSecs / BREAK_DURATION) : 0;
  const mins = String(Math.floor(breakSecs / 60)).padStart(2, "0");
  const secs = String(breakSecs % 60).padStart(2, "0");
  const sz = 260;

  return (
    <div id="badge-panel" onClick={onToggle} style={{
      width: 268, flexShrink: 0, height: 438,
      background: `linear-gradient(170deg,${C.blueNav} 0%,${C.dark} 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: "pointer", position: "relative",
      borderRight: `3px solid ${C.lime}`, userSelect: "none",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`, backgroundSize: "26px 26px", pointerEvents: "none" }} />
      <svg style={{ position: "absolute", inset: 0, width: 268, height: 438, pointerEvents: "none", opacity: 0.16 }}>
        <line x1="0" y1="438" x2="268" y2="100" stroke={C.lime} strokeWidth="1"/>
        <line x1="0" y1="340" x2="180" y2="0" stroke={C.yellow} strokeWidth="0.8" opacity="0.55"/>
      </svg>

      <div style={{ position: "relative", width: sz, height: sz }}>
        {open && <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `3px solid ${status.color}`, animation: "ringPulse 1s ease-in-out infinite", pointerEvents: "none" }} />}
        <svg width={sz} height={sz} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
          <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={isBreak ? 10 : 0}/>
          {isBreak && <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={status.color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }}/>}
        </svg>
        <div style={{
          position: "absolute",
          top: isBreak ? 16 : 6, left: isBreak ? 16 : 6, right: isBreak ? 16 : 6, bottom: isBreak ? 16 : 6,
          borderRadius: "50%", background: status.color,
          boxShadow: open ? `0 0 50px ${status.color}aa,0 0 90px ${status.color}44` : `0 0 28px ${status.color}66,0 0 56px ${status.color}22`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          transition: "background 0.4s, box-shadow 0.4s, top 0.28s, left 0.28s, right 0.28s, bottom 0.28s",
          animation: "colorGlow 3s ease-in-out infinite",
        }}>
          {isBreak ? (
            <>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 44, fontWeight: 700, color: C.dark, lineHeight: 1, letterSpacing: "-0.02em" }}>{mins}:{secs}</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: "0.25em", color: "rgba(0,39,77,0.5)", textTransform: "uppercase", marginTop: 4 }}>TIME PT</span>
            </>
          ) : (
            <>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: "0.28em", color: "rgba(0,39,77,0.38)", textTransform: "uppercase" }}>STOP</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 96, fontWeight: 900, lineHeight: 0.82, color: "rgba(0,39,77,0.62)" }}>M</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(0,39,77,0.28)", textTransform: "uppercase", marginTop: 4 }}>
                {open ? "▲ CLOSE" : "▼ SELECT"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionsOverlay({ status, open, onSelect, onCancelBreak, breakSecs }) {
  const isBreak = status.code === "TIME POINT" && breakSecs > 0;
  return (
    <div id="opt-overlay" style={{
      position: "absolute", top: 0, left: 268, right: 0, height: 438,
      background: `${C.dark}f0`, zIndex: 50,
      display: "flex", flexDirection: "column",
      transform: open ? "translateX(0)" : "translateX(100%)",
      transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
      borderLeft: `3px solid ${C.lime}`,
    }}>
      <div style={{ padding: "12px 22px 8px", borderBottom: "1px solid rgba(255,255,255,0.09)" }}>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: "0.28em", color: C.muted, textTransform: "uppercase" }}>SELECT STATUS</span>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {STATUSES.map((s, i) => {
          const isActive = status.code === s.code;
          const isLast = i === STATUSES.length - 1;
          return (
            <div key={s.code} onClick={() => onSelect(s)}
              style={{ gridColumn: isLast ? "1/-1" : "auto", display: "flex", alignItems: "center", gap: 14, padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", borderRight: !isLast && i % 2 === 0 ? "1px solid rgba(255,255,255,0.07)" : "none", cursor: "pointer", background: isActive ? `${s.color}18` : "transparent", transition: "background 0.15s", position: "relative" }}
              onMouseEnter={e => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = isActive ? `${s.color}18` : "transparent")}>
              {isActive && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: s.color, borderRadius: "0 3px 3px 0" }} />}
              <div style={{ width: 15, height: 15, borderRadius: "50%", background: s.color, boxShadow: isActive ? `0 0 12px ${s.color}` : undefined, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 21, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: isActive ? s.color : C.slate }}>{s.label}</div>
                {s.hasTimer && <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 1 }}>30-min auto-return</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {isActive && <span style={{ color: s.color, fontSize: 15 }}>✓</span>}
                {isActive && isBreak && (
                  <button onClick={e => { e.stopPropagation(); onCancelBreak(); }}
                    style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: C.muted, background: "transparent", border: "1px solid rgba(255,255,255,0.18)", padding: "3px 8px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.07em" }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = C.white; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}>End</button>
                )}
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: C.muted, border: "1px solid rgba(255,255,255,0.14)", padding: "2px 6px" }}>{s.key}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RightPanel({ status, breakSecs }) {
  const isBreak = status.code === "TIME POINT" && breakSecs > 0;
  return (
    <div style={{
      flex: 1, height: 438,
      background: `linear-gradient(140deg,${C.blue} 0%,${C.blueMid} 55%,${C.blueNav} 100%)`,
      display: "flex", flexDirection: "column",
      padding: "24px 28px 20px 28px",
      position: "relative", overflow: "hidden",
    }}>
      <svg style={{ position: "absolute", right: -50, top: -50, opacity: 0.06, pointerEvents: "none", overflow: "visible" }}>
        <circle cx="200" cy="190" r="170" fill="none" stroke={C.white} strokeWidth="1"/>
        <circle cx="200" cy="190" r="130" fill="none" stroke={C.white} strokeWidth="1"/>
        <circle cx="200" cy="190" r="90"  fill="none" stroke={C.white} strokeWidth="1"/>
      </svg>
      <svg width="48" height="48" viewBox="0 0 120 120" style={{ position: "absolute", top: 16, right: 22, opacity: 0.22, pointerEvents: "none" }}>
        <circle cx="60" cy="60" r="52" fill="none" stroke={C.white} strokeWidth="1.5" strokeDasharray="5 4"/>
        <circle cx="60" cy="60" r="36" fill={C.blueNav} opacity="0.9"/>
        <text x="60" y="69" textAnchor="middle" fontFamily="'Barlow Condensed',sans-serif" fontSize="26" fontWeight="900" fill={C.yellow} letterSpacing="1">CM</text>
      </svg>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
        <div style={{ fontSize: 90, fontWeight: 900, lineHeight: 0.82, letterSpacing: "-0.025em", color: C.white, textTransform: "uppercase", textShadow: "0 3px 20px rgba(0,0,0,0.22)" }}>
          Marc<br/><span style={{ color: C.yellow }}>Heldal</span>
        </div>
        <div style={{ marginTop: 14, paddingLeft: 13, borderLeft: `4px solid ${C.lime}`, lineHeight: 1.55 }}>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.88)" }}>Support Specialist II</div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Customer &amp; External Relations</div>
        </div>

        {/* Status pill — the sign label */}
        <div key={status.code} style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 12, animation: "statusIn 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: `${status.color}22`, border: `2px solid ${status.color}`, padding: "6px 18px 6px 12px", borderRadius: 2 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: status.color, boxShadow: `0 0 10px ${status.color}`, flexShrink: 0, display: "inline-block" }}/>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: status.color, lineHeight: 1 }}>
              {isBreak
                ? `${String(Math.floor(breakSecs/60)).padStart(2,"0")}:${String(breakSecs%60).padStart(2,"0")} · ${status.label}`
                : status.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomBar() {
  const now = useClock();
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const date = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const items = ["CapMetro BikeShare", "Customer & External Relations", "Support Specialist II · Marc Heldal", date];
  const rep = [...items, ...items];
  return (
    <div style={{ height: 42, background: C.blueNav, borderTop: `3px solid ${C.yellow}`, display: "flex", alignItems: "center", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ flexShrink: 0, padding: "0 16px", height: "100%", display: "flex", alignItems: "center", background: `${C.dark}cc`, borderRight: "1px solid rgba(255,255,255,0.14)" }}>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 19, color: C.white, letterSpacing: "0.06em", fontWeight: 700 }}>{time}</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden", height: "100%", display: "flex", alignItems: "center" }}>
        <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "ticker 26s linear infinite" }}>
          {rep.map((item, i) => (
            <span key={i} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.72)", padding: "0 26px", textTransform: "uppercase" }}>
              {item}<span style={{ color: C.yellow, margin: "0 0 0 26px" }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NameSign() {
  const [status, setStatus] = useState(AVAILABLE);
  const [open, setOpen] = useState(false);
  const [breakSecs, setBreakSecs] = useState(0);
  const timerRef = useRef(null);

  const clearBreak = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setBreakSecs(0);
  }, []);

  const startBreak = useCallback(() => {
    clearBreak(); setBreakSecs(BREAK_DURATION);
    timerRef.current = setInterval(() => {
      setBreakSecs(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); timerRef.current = null; setStatus(AVAILABLE); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [clearBreak]);

  const handleSelect = useCallback((s) => {
    if (s.code !== "TIME POINT") clearBreak();
    setStatus(s); setOpen(false);
    if (s.hasTimer) startBreak();
  }, [clearBreak, startBreak]);

  useEffect(() => {
    const h = e => {
      if (!open) return;
      const overlay = document.getElementById("opt-overlay");
      const badge = document.getElementById("badge-panel");
      if (overlay && !overlay.contains(e.target) && badge && !badge.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => {
    const h = e => {
      const s = STATUSES.find(s => s.key === e.key);
      if (s) handleSelect(s);
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [handleSelect]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;600;700&family=Share+Tech+Mono&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html,body{width:800px;height:480px;overflow:hidden;background:#0057A8}
        body{font-family:'Barlow Condensed',sans-serif;color:#fff;cursor:none}
        @keyframes colorGlow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.2)}}
        @keyframes ringPulse{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes statusIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .anim{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
      `}</style>

      <div className="anim" style={{ width: 800, height: 480, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", background: C.blue }}>
        <div style={{ display: "flex", flexDirection: "row", height: 438, position: "relative" }}>
          <LeftPanel status={status} breakSecs={breakSecs} open={open} onToggle={() => setOpen(o => !o)}/>
          <RightPanel status={status} breakSecs={breakSecs}/>
          <OptionsOverlay status={status} open={open} onSelect={handleSelect} onCancelBreak={() => { clearBreak(); setStatus(AVAILABLE); }} breakSecs={breakSecs}/>
        </div>
        <BottomBar/>
      </div>
    </>
  );
}
