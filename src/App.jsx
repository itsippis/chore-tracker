import { useState, useEffect } from "react";

const CHORES = [
  { id: 1, name: "Dishes", icon: "🍽️", color: "#FF6B6B" },
  { id: 2, name: "Vacuum", icon: "🧹", color: "#4ECDC4" },
  { id: 3, name: "Laundry", icon: "👕", color: "#45B7D1" },
  { id: 4, name: "Trash", icon: "🗑️", color: "#96CEB4" },
  { id: 5, name: "Mop", icon: "🪣", color: "#FFEAA7" },
  { id: 6, name: "Groceries", icon: "🛒", color: "#DDA0DD" },
];

const T = {
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
  const [selectedDay, setSelectedDay] = useState(null);

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

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Georgia', serif", padding: "24px 16px", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .day-cell { transition: all 0.2s ease; cursor: pointer; }
        .day-cell:hover { transform: scale(1.04); z-index: 10; }
        .nav-btn { transition: all 0.2s; cursor: pointer; border: none; color: ${T.text}; border-radius: 50%; width: 40px; height: 40px; font-size: 18px; display: flex; align-items: center; justify-content: center; background: ${T.btnBg}; }
        .nav-btn:hover { opacity: 0.7; transform: scale(1.1); }
        .panel-slide { animation: slideIn 0.25s ease; }
        @keyframes slideIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .progress-fill { transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
        .clear-btn { transition: all 0.2s; cursor: pointer; border: 1px solid rgba(255,100,100,0.3); background: rgba(255,100,100,0.08); color: rgba(180,60,60,0.8); border-radius: 8px; padding: 5px 12px; font-size: 12px; font-family: 'DM Sans', sans-serif; }
        .clear-btn:hover { background: rgba(255,100,100,0.15); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 13, letterSpacing: 6, color: T.accent, textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Monthly Planner</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, margin: 0, background: `linear-gradient(90deg, ${T.text}, ${T.accent}, ${T.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Chore Tracker
          </h1>
          <div style={{ marginTop: 8, fontSize: 12, color: T.textMuted, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }}>
            💾 Progress auto-saved to this browser
          </div>
          <div style={{ marginTop: 12, maxWidth: 400, margin: "12px auto 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.accent, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>
              <span>{totalDone} completed</span><span>{totalPossible - totalDone} remaining</span>
            </div>
            <div style={{ height: 6, background: T.progressBg, borderRadius: 99, overflow: "hidden" }}>
              <div className="progress-fill" style={{ height: "100%", borderRadius: 99, background: T.progressFill, width: `${totalPossible ? (totalDone/totalPossible*100) : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 20 }}>
          <button className="nav-btn" onClick={prevMonth}>‹</button>
          <div style={{ textAlign: "center", minWidth: 200 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: T.text }}>{MONTHS[month]}</div>
            <div style={{ color: T.accent, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>{year}</div>
          </div>
          <button className="nav-btn" onClick={nextMonth}>›</button>
        </div>

        {/* Chore toggles */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 14 }}>
          {CHORES.map(c => (
            <button key={c.id} onClick={() => setActiveChores(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, border: `2px solid ${activeChores.includes(c.id) ? c.color : T.textMuted}`, background: activeChores.includes(c.id) ? `${c.color}22` : "transparent", color: activeChores.includes(c.id) ? T.text : T.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
              <span>{c.icon}</span><span>{c.name}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <button className="clear-btn" onClick={clearMonth}>🗑 Clear {MONTHS[month]}</button>
        </div>

        {/* Calendar */}
        <div style={{ background: T.card, borderRadius: 20, padding: "20px", border: `1px solid ${T.cardBorder}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: T.accent, letterSpacing: 2, padding: "4px 0", textTransform: "uppercase" }}>{d}</div>
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
                  style={{ borderRadius: 12, padding: "8px 4px", minHeight: 70, background: sel ? T.selBg : isToday(day) ? T.todayBg : T.dayBg, border: `1.5px solid ${sel ? T.selBorder : isToday(day) ? T.todayBorder : T.dayBorder}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                  <div style={{ fontSize: 13, fontWeight: isToday(day) ? 700 : 400, fontFamily: "'DM Sans', sans-serif", color: isToday(day) ? T.accent : T.text }}>
                    {day}
                    {isToday(day) && <span style={{ position: "absolute", top: 4, right: 6, width: 6, height: 6, borderRadius: "50%", background: T.accent, display: "block" }} />}
                  </div>
                  {activeChores.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", maxWidth: 48 }}>
                      {activeChores.map(id => {
                        const chore = CHORES.find(c => c.id === id);
                        const isDone = completed[`${year}-${month}-${day}-${id}`];
                        return <div key={id} title={chore.name} style={{ width: 8, height: 8, borderRadius: "50%", background: isDone ? chore.color : T.progressBg, border: `1px solid ${isDone ? chore.color : T.textMuted}`, transition: "all 0.2s" }} />;
                      })}
                    </div>
                  )}
                  {total > 0 && (
                    <div style={{ width: "80%", height: 3, background: T.progressBg, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct * 100}%`, background: allDone ? T.choreDoneFill : T.progressFill, borderRadius: 99, transition: "width 0.3s" }} />
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
          <div className="panel-slide" style={{ marginTop: 16, background: T.panelBg, borderRadius: 20, padding: "24px", border: `1px solid ${T.panelBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, color: T.text }}>
                {MONTHS[month]} {selectedDay}{isToday(selectedDay) ? " — Today" : ""}
              </h3>
              <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", color: T.accent, fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            {activeChores.length === 0 ? (
              <p style={{ color: T.textMuted, fontFamily: "'DM Sans', sans-serif" }}>No chores selected. Toggle chores above.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {activeChores.map(id => {
                  const chore = CHORES.find(c => c.id === id);
                  const done = !!completed[`${year}-${month}-${selectedDay}-${id}`];
                  return (
                    <button key={id} onClick={() => toggleChore(selectedDay, id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 14, background: done ? `${chore.color}28` : T.dayBg, border: `2px solid ${done ? chore.color : T.dayBorder}`, color: done ? T.text : T.textMuted, cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, textAlign: "left" }}>
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
    </div>
  );
}