import { useState, useEffect } from "react";

const CHORES = [
  { id: 1, name: "Dishes", icon: "🍽️", color: "#FF6B6B" },
  { id: 2, name: "Vacuum", icon: "🧹", color: "#4ECDC4" },
  { id: 3, name: "Laundry", icon: "👕", color: "#45B7D1" },
  { id: 4, name: "Trash", icon: "🗑️", color: "#96CEB4" },
  { id: 5, name: "Mop", icon: "🪣", color: "#FFEAA7" },
  { id: 6, name: "Groceries", icon: "🛒", color: "#DDA0DD" },
];

const THEMES = {
  cosmic: {
    name: "Cosmic", emoji: "🌌",
    bg: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    card: "rgba(255,255,255,0.04)", cardBorder: "rgba(255,255,255,0.08)",
    accent: "#a78bfa", accent2: "#60a5fa", text: "#ffffff",
    textMuted: "rgba(255,255,255,0.4)", panelBg: "rgba(255,255,255,0.06)",
    panelBorder: "rgba(167,139,250,0.3)", dayBg: "rgba(255,255,255,0.04)",
    dayBorder: "rgba(255,255,255,0.07)", todayBg: "rgba(167,139,250,0.12)",
    todayBorder: "rgba(167,139,250,0.5)", selBg: "rgba(167,139,250,0.2)",
    selBorder: "#a78bfa", progressBg: "rgba(255,255,255,0.1)",
    progressFill: "linear-gradient(90deg, #a78bfa, #60a5fa)",
    choreDoneFill: "#4ECDC4", btnBg: "rgba(255,255,255,0.1)",
  },
  forest: {
    name: "Forest", emoji: "🌿",
    bg: "linear-gradient(135deg, #1a2f1a, #2d4a2d, #1a3320)",
    card: "rgba(255,255,255,0.05)", cardBorder: "rgba(100,200,100,0.1)",
    accent: "#6ddb6d", accent2: "#a8e6a8", text: "#e8f5e8",
    textMuted: "rgba(200,240,200,0.45)", panelBg: "rgba(100,200,100,0.07)",
    panelBorder: "rgba(109,219,109,0.3)", dayBg: "rgba(255,255,255,0.04)",
    dayBorder: "rgba(100,200,100,0.1)", todayBg: "rgba(109,219,109,0.12)",
    todayBorder: "rgba(109,219,109,0.5)", selBg: "rgba(109,219,109,0.2)",
    selBorder: "#6ddb6d", progressBg: "rgba(255,255,255,0.1)",
    progressFill: "linear-gradient(90deg, #6ddb6d, #a8e6a8)",
    choreDoneFill: "#52c97a", btnBg: "rgba(100,200,100,0.15)",
  },
  sunset: {
    name: "Sunset", emoji: "🌅",
    bg: "linear-gradient(135deg, #2d1b00, #4a2800, #3d1a0f)",
    card: "rgba(255,255,255,0.04)", cardBorder: "rgba(255,160,50,0.1)",
    accent: "#ffaa44", accent2: "#ff7744", text: "#fff4e6",
    textMuted: "rgba(255,220,170,0.45)", panelBg: "rgba(255,160,50,0.07)",
    panelBorder: "rgba(255,170,68,0.3)", dayBg: "rgba(255,255,255,0.04)",
    dayBorder: "rgba(255,160,50,0.1)", todayBg: "rgba(255,170,68,0.12)",
    todayBorder: "rgba(255,170,68,0.5)", selBg: "rgba(255,170,68,0.2)",
    selBorder: "#ffaa44", progressBg: "rgba(255,255,255,0.1)",
    progressFill: "linear-gradient(90deg, #ffaa44, #ff7744)",
    choreDoneFill: "#ffcc44", btnBg: "rgba(255,160,50,0.15)",
  },
  ocean: {
    name: "Ocean", emoji: "🌊",
    bg: "linear-gradient(135deg, #001a2e, #003355, #001f3f)",
    card: "rgba(255,255,255,0.04)", cardBorder: "rgba(50,180,220,0.1)",
    accent: "#38bdf8", accent2: "#22d3ee", text: "#e0f4ff",
    textMuted: "rgba(180,230,255,0.45)", panelBg: "rgba(50,180,220,0.07)",
    panelBorder: "rgba(56,189,248,0.3)", dayBg: "rgba(255,255,255,0.04)",
    dayBorder: "rgba(50,180,220,0.1)", todayBg: "rgba(56,189,248,0.12)",
    todayBorder: "rgba(56,189,248,0.5)", selBg: "rgba(56,189,248,0.2)",
    selBorder: "#38bdf8", progressBg: "rgba(255,255,255,0.1)",
    progressFill: "linear-gradient(90deg, #38bdf8, #22d3ee)",
    choreDoneFill: "#34d399", btnBg: "rgba(50,180,220,0.15)",
  },
  rose: {
    name: "Rose", emoji: "🌸",
    bg: "linear-gradient(135deg, #f9f0f3, #fce4ec, #f3e5f5)",
    card: "rgba(0,0,0,0.03)", cardBorder: "rgba(200,100,130,0.12)",
    accent: "#e05c8a", accent2: "#c2185b", text: "#2d1a22",
    textMuted: "rgba(100,50,70,0.5)", panelBg: "rgba(200,100,130,0.06)",
    panelBorder: "rgba(224,92,138,0.25)", dayBg: "rgba(0,0,0,0.02)",
    dayBorder: "rgba(200,100,130,0.1)", todayBg: "rgba(224,92,138,0.1)",
    todayBorder: "rgba(224,92,138,0.45)", selBg: "rgba(224,92,138,0.15)",
    selBorder: "#e05c8a", progressBg: "rgba(0,0,0,0.08)",
    progressFill: "linear-gradient(90deg, #e05c8a, #c2185b)",
    choreDoneFill: "#e05c8a", btnBg: "rgba(200,100,130,0.12)",
  },
  slate: {
    name: "Slate", emoji: "🪨",
    bg: "linear-gradient(135deg, #f1f5f9, #e2e8f0, #f8fafc)",
    card: "rgba(0,0,0,0.03)", cardBorder: "rgba(100,116,139,0.12)",
    accent: "#475569", accent2: "#334155", text: "#0f172a",
    textMuted: "rgba(71,85,105,0.55)", panelBg: "rgba(100,116,139,0.06)",
    panelBorder: "rgba(71,85,105,0.2)", dayBg: "rgba(0,0,0,0.02)",
    dayBorder: "rgba(100,116,139,0.1)", todayBg: "rgba(71,85,105,0.1)",
    todayBorder: "rgba(71,85,105,0.4)", selBg: "rgba(71,85,105,0.12)",
    selBorder: "#475569", progressBg: "rgba(0,0,0,0.08)",
    progressFill: "linear-gradient(90deg, #475569, #334155)",
    choreDoneFill: "#475569", btnBg: "rgba(100,116,139,0.12)",
  },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getDaysInMonth(m, y) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(m, y) { return new Date(y, m, 1).getDay(); }

function useLocalStorage(key, init) {
  const [value, setValue] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

export default function ChoreTracker() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [completed, setCompleted] = useLocalStorage("chore-completed", {});
  const [activeChores, setActiveChores] = useLocalStorage("chore-active", [1, 4]);
  const [themeKey, setThemeKey] = useLocalStorage("chore-theme", "cosmic");
  const [selectedDay, setSelectedDay] = useState(null);
  const [showThemes, setShowThemes] = useState(false);

  const t = THEMES[themeKey] || THEMES.cosmic;
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDay(month, year);

  const toggleChore = (day, choreId) => {
    const key = `${year}-${month}-${day}-${choreId}`;
    setCompleted(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getDayProgress = (day) => {
    const done = activeChores.filter(id => completed[`${year}-${month}-${day}-${id}`]).length;
    return { done, total: activeChores.length };
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); setSelectedDay(null); };
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const totalDone = Array.from({length: daysInMonth}, (_,i) => i+1)
    .flatMap(day => activeChores.map(id => completed[`${year}-${month}-${day}-${id}`] ? 1 : 0))
    .reduce((a,b) => a+b, 0);
  const totalPossible = daysInMonth * activeChores.length;

  const clearMonth = () => {
    const prefix = `${year}-${month}-`;
    setCompleted(prev => { const n = {...prev}; Object.keys(n).forEach(k => { if (k.startsWith(prefix)) delete n[k]; }); return n; });
  };

  const isDark = !["rose","slate"].includes(themeKey);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Georgia', serif", padding: "24px 16px", color: t.text, transition: "background 0.4s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .day-cell { transition: all 0.2s ease; cursor: pointer; }
        .day-cell:hover { transform: scale(1.04); z-index: 10; }
        .nav-btn { transition: all 0.2s; cursor: pointer; border: none; color: ${t.text}; border-radius: 50%; width: 40px; height: 40px; font-size: 18px; display: flex; align-items: center; justify-content: center; background: ${t.btnBg}; }
        .nav-btn:hover { opacity: 0.8; transform: scale(1.1); }
        .panel-slide { animation: slideIn 0.25s ease; }
        @keyframes slideIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .progress-fill { transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
        .theme-btn { transition: all 0.2s; cursor: pointer; }
        .theme-btn:hover { transform: scale(1.08); }
        .clear-btn { transition: all 0.2s; cursor: pointer; border: 1px solid rgba(255,100,100,0.3); background: rgba(255,100,100,0.08); color: rgba(255,150,150,0.8); border-radius: 8px; padding: 5px 12px; font-size: 12px; font-family: 'DM Sans', sans-serif; }
        .clear-btn:hover { background: rgba(255,100,100,0.2); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, letterSpacing: 6, color: t.accent, textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Monthly Planner</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, margin: 0, background: `linear-gradient(90deg, ${t.text}, ${t.accent}, ${t.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Chore Tracker
          </h1>
          <div style={{ marginTop: 8, fontSize: 12, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }}>
            💾 Progress auto-saved to this browser
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 12, maxWidth: 400, margin: "12px auto 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: t.accent, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>
              <span>{totalDone} completed</span><span>{totalPossible - totalDone} remaining</span>
            </div>
            <div style={{ height: 6, background: t.progressBg, borderRadius: 99, overflow: "hidden" }}>
              <div className="progress-fill" style={{ height: "100%", borderRadius: 99, background: t.progressFill, width: `${totalPossible ? (totalDone/totalPossible*100) : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Theme picker */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <button className="theme-btn" onClick={() => setShowThemes(p => !p)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 99, border: `1.5px solid ${t.accent}44`, background: t.btnBg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer" }}>
              <span>{t.emoji}</span><span>{t.name}</span><span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
            </button>
            {showThemes && (
              <div className="panel-slide" style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: isDark ? "#1e1e2e" : "#fff", border: `1px solid ${t.accent}44`, borderRadius: 16, padding: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, zIndex: 100, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", minWidth: 260 }}>
                {Object.entries(THEMES).map(([key, th]) => (
                  <button key={key} className="theme-btn" onClick={() => { setThemeKey(key); setShowThemes(false); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 8px", borderRadius: 12, border: `2px solid ${themeKey === key ? th.accent : "transparent"}`, background: themeKey === key ? `${th.accent}18` : "transparent", cursor: "pointer", color: isDark ? "#fff" : "#1a1a2e", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                    <span style={{ fontSize: 22 }}>{th.emoji}</span>
                    <span>{th.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 20 }}>
          <button className="nav-btn" onClick={prevMonth}>‹</button>
          <div style={{ textAlign: "center", minWidth: 200 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: t.text }}>{MONTHS[month]}</div>
            <div style={{ color: t.accent, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>{year}</div>
          </div>
          <button className="nav-btn" onClick={nextMonth}>›</button>
        </div>

        {/* Chore toggles */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 14 }}>
          {CHORES.map(c => (
            <button key={c.id} onClick={() => setActiveChores(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, border: `2px solid ${activeChores.includes(c.id) ? c.color : t.textMuted}`, background: activeChores.includes(c.id) ? `${c.color}22` : "transparent", color: activeChores.includes(c.id) ? t.text : t.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
              <span>{c.icon}</span><span>{c.name}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <button className="clear-btn" onClick={clearMonth}>🗑 Clear {MONTHS[month]}</button>
        </div>

        {/* Calendar */}
        <div style={{ background: t.card, borderRadius: 20, padding: "20px", backdropFilter: "blur(10px)", border: `1px solid ${t.cardBorder}`, transition: "background 0.4s" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: t.accent, letterSpacing: 2, padding: "4px 0", textTransform: "uppercase" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const { done, total } = getDayProgress(day);
              const pct = total ? done / total : 0;
              const allDone = total > 0 && done === total;
              const sel = selectedDay === day;
              return (
                <div key={day} className="day-cell" onClick={() => setSelectedDay(sel ? null : day)}
                  style={{ borderRadius: 12, padding: "8px 4px", minHeight: 70, background: sel ? t.selBg : isToday(day) ? t.todayBg : t.dayBg, border: `1.5px solid ${sel ? t.selBorder : isToday(day) ? t.todayBorder : t.dayBorder}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", transition: "background 0.3s, border 0.3s" }}>
                  <div style={{ fontSize: 13, fontWeight: isToday(day) ? 700 : 400, fontFamily: "'DM Sans', sans-serif", color: isToday(day) ? t.accent : t.text }}>
                    {day}
                    {isToday(day) && <span style={{ position: "absolute", top: 4, right: 6, width: 6, height: 6, borderRadius: "50%", background: t.accent, display: "block" }} />}
                  </div>
                  {activeChores.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", maxWidth: 48 }}>
                      {activeChores.map(id => {
                        const chore = CHORES.find(c => c.id === id);
                        const done = completed[`${year}-${month}-${day}-${id}`];
                        return <div key={id} title={chore.name} style={{ width: 8, height: 8, borderRadius: "50%", background: done ? chore.color : t.progressBg, border: `1px solid ${done ? chore.color : t.textMuted}`, transition: "all 0.2s" }} />;
                      })}
                    </div>
                  )}
                  {total > 0 && (
                    <div style={{ width: "80%", height: 3, background: t.progressBg, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct * 100}%`, background: allDone ? t.choreDoneFill : t.progressFill, borderRadius: 99, transition: "width 0.3s" }} />
                    </div>
                  )}
                  {allDone && <span style={{ fontSize: 10 }}>✅</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day panel */}
        {selectedDay && (
          <div className="panel-slide" style={{ marginTop: 16, background: t.panelBg, borderRadius: 20, padding: "24px", border: `1px solid ${t.panelBorder}`, backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, color: t.text }}>
                {MONTHS[month]} {selectedDay}{isToday(selectedDay) ? " — Today" : ""}
              </h3>
              <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", color: t.accent, fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            {activeChores.length === 0 ? (
              <p style={{ color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>No chores selected. Toggle chores above.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {activeChores.map(id => {
                  const chore = CHORES.find(c => c.id === id);
                  const done = !!completed[`${year}-${month}-${selectedDay}-${id}`];
                  return (
                    <button key={id} onClick={() => toggleChore(selectedDay, id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 14, background: done ? `${chore.color}28` : t.dayBg, border: `2px solid ${done ? chore.color : t.dayBorder}`, color: done ? t.text : t.textMuted, cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, textAlign: "left" }}>
                      <span style={{ fontSize: 22 }}>{chore.icon}</span>
                      <span style={{ flex: 1 }}>{chore.name}</span>
                      <span style={{ fontSize: 16 }}>{done ? "✓" : "○"}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close theme picker on outside click */}
      {showThemes && <div onClick={() => setShowThemes(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
    </div>
  );
}