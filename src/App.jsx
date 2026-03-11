import { useState, useEffect, useCallback } from "react";

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

const USER_COLORS = ["#e05c8a","#4ECDC4","#FF6B6B","#45B7D1","#f59e0b","#6366f1","#10b981","#f97316"];

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

function Avatar({ name, color, size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
      flexShrink: 0, border: "2px solid white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
    }}>
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

export default function ChoreTracker() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [activeChores, setActiveChores] = useLocalStorage("chore-active", [1, 4]);
  const [selectedDay, setSelectedDay] = useState(null);

  // Shared state (all users)
  const [sharedData, setSharedData] = useState(null); // { completed: {key: [userId,...]}, users: {id: {name, color}} }
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Current user (local only)
  const [currentUser, setCurrentUser] = useLocalStorage("chore-user", null);
  const [setupName, setSetupName] = useState("");
  const [setupError, setSetupError] = useState("");

  // Load shared data
  const loadShared = useCallback(async () => {
    try {
      const result = await window.storage.get("chore-shared", true);
      if (result) {
        setSharedData(JSON.parse(result.value));
      } else {
        setSharedData({ completed: {}, users: {} });
      }
      setLastSync(Date.now());
    } catch {
      setSharedData({ completed: {}, users: {} });
    } finally {
      setLoading(false);
    }
  }, []);

  // Save shared data
  const saveShared = useCallback(async (data) => {
    setSyncing(true);
    try {
      await window.storage.set("chore-shared", JSON.stringify(data), true);
      setLastSync(Date.now());
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => { loadShared(); }, [loadShared]);

  // Poll for updates every 8 seconds
  useEffect(() => {
    const interval = setInterval(loadShared, 8000);
    return () => clearInterval(interval);
  }, [loadShared]);

  const handleSetup = () => {
    const name = setupName.trim();
    if (!name) { setSetupError("Please enter a name."); return; }
    if (name.length > 20) { setSetupError("Name must be 20 characters or less."); return; }
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    const user = { id, name, color };
    setCurrentUser(user);
    // Register user in shared data
    const updated = {
      ...sharedData,
      users: { ...(sharedData?.users || {}), [id]: { name, color } }
    };
    setSharedData(updated);
    saveShared(updated);
  };

  const toggleChore = async (day, choreId) => {
    if (!currentUser || !sharedData) return;
    const key = `${year}-${month}-${day}-${choreId}`;
    const current = sharedData.completed[key] || [];
    const alreadyDone = current.includes(currentUser.id);
    const updated = {
      ...sharedData,
      completed: {
        ...sharedData.completed,
        [key]: alreadyDone ? current.filter(id => id !== currentUser.id) : [...current, currentUser.id]
      }
    };
    setSharedData(updated);
    await saveShared(updated);
  };

  const getDayProgress = (day) => {
    if (!sharedData) return { done: 0, total: activeChores.length, completedBy: {} };
    const completedBy = {};
    let doneCount = 0;
    activeChores.forEach(id => {
      const key = `${year}-${month}-${day}-${id}`;
      const users = sharedData.completed[key] || [];
      if (users.length > 0) { completedBy[id] = users; doneCount++; }
    });
    return { done: doneCount, total: activeChores.length, completedBy };
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); setSelectedDay(null); };
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDay(month, year);

  const totalDone = Array.from({length: daysInMonth}, (_,i) => i+1)
    .flatMap(day => activeChores.map(id => ((sharedData?.completed[`${year}-${month}-${day}-${id}`] || []).length > 0) ? 1 : 0))
    .reduce((a,b) => a+b, 0);
  const totalPossible = daysInMonth * activeChores.length;

  const clearMonth = async () => {
    if (!sharedData) return;
    const prefix = `${year}-${month}-`;
    const updated = {
      ...sharedData,
      completed: Object.fromEntries(Object.entries(sharedData.completed).filter(([k]) => !k.startsWith(prefix)))
    };
    setSharedData(updated);
    await saveShared(updated);
  };

  const allUsers = sharedData?.users || {};

  // Setup screen
  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap'); * { box-sizing: border-box; }`}</style>
        <div style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", maxWidth: 380, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.10)", border: `1px solid ${T.cardBorder}`, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧹</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, margin: "0 0 8px", color: T.text }}>Welcome</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: T.textMuted, fontSize: 14, marginBottom: 28 }}>Enter your name to start tracking chores with your household.</p>
          <input
            value={setupName}
            onChange={e => { setSetupName(e.target.value); setSetupError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSetup()}
            placeholder="Your name"
            maxLength={20}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${setupError ? "#ef4444" : T.cardBorder}`, fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: T.text, outline: "none", marginBottom: 8, background: "#f8fafc" }}
          />
          {setupError && <div style={{ color: "#ef4444", fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>{setupError}</div>}
          <button onClick={handleSetup} style={{ width: "100%", padding: "12px", borderRadius: 12, background: T.accent, color: "#fff", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 4 }}>
            Join Tracker
          </button>
          {Object.keys(allUsers).length > 0 && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.cardBorder}` }}>
              <div style={{ fontSize: 12, color: T.textMuted, fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>Already tracking</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {Object.values(allUsers).map((u, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: T.dayBg, borderRadius: 99, padding: "4px 10px", border: `1px solid ${T.cardBorder}` }}>
                    <Avatar name={u.name} color={u.color} size={20} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.text }}>{u.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", color: T.textMuted, fontSize: 16 }}>Loading…</div>
      </div>
    );
  }

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
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, letterSpacing: 6, color: T.accent, textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Monthly Planner</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, margin: 0, background: `linear-gradient(90deg, ${T.text}, ${T.accent}, ${T.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Chore Tracker
          </h1>

          {/* Current user + household */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 99, padding: "5px 12px", border: `1px solid ${T.cardBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <Avatar name={currentUser.name} color={currentUser.color} size={22} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.text, fontWeight: 500 }}>{currentUser.name}</span>
              <button onClick={() => setCurrentUser(null)} title="Switch user" style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 14, padding: "0 0 0 4px", lineHeight: 1 }}>⇄</button>
            </div>
            {Object.entries(allUsers).filter(([id]) => id !== currentUser.id).map(([id, u]) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.65 }}>
                <Avatar name={u.name} color={u.color} size={20} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: T.textMuted }}>{u.name}</span>
              </div>
            ))}
          </div>

          {/* Sync status */}
          <div style={{ marginTop: 8, fontSize: 11, color: T.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
            {syncing ? "⏳ Saving…" : lastSync ? `✓ Synced ${new Date(lastSync).toLocaleTimeString()}` : ""}
          </div>

          {/* Progress */}
          <div style={{ marginTop: 10, maxWidth: 400, margin: "10px auto 0" }}>
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
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>{MONTHS[month]}</div>
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

              // Collect unique user avatars who did anything this day
              const activeUserIds = new Set();
              activeChores.forEach(id => {
                (sharedData?.completed[`${year}-${month}-${day}-${id}`] || []).forEach(uid => activeUserIds.add(uid));
              });

              return (
                <div key={day} className="day-cell" onClick={() => setSelectedDay(sel ? null : day)}
                  style={{ borderRadius: 12, padding: "8px 4px 6px", minHeight: 75, background: sel ? T.selBg : isToday(day) ? T.todayBg : T.dayBg, border: `1.5px solid ${sel ? T.selBorder : isToday(day) ? T.todayBorder : T.dayBorder}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}>
                  <div style={{ fontSize: 13, fontWeight: isToday(day) ? 700 : 400, fontFamily: "'DM Sans', sans-serif", color: isToday(day) ? T.accent : T.text }}>
                    {day}
                    {isToday(day) && <span style={{ position: "absolute", top: 4, right: 5, width: 5, height: 5, borderRadius: "50%", background: T.accent, display: "block" }} />}
                  </div>
                  {total > 0 && (
                    <div style={{ width: "80%", height: 3, background: T.progressBg, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct * 100}%`, background: allDone ? T.choreDoneFill : T.progressFill, borderRadius: 99, transition: "width 0.3s" }} />
                    </div>
                  )}
                  {/* User avatars on this day */}
                  {activeUserIds.size > 0 && (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      {[...activeUserIds].slice(0, 3).map((uid, idx) => {
                        const u = allUsers[uid];
                        if (!u) return null;
                        return <div key={uid} style={{ marginLeft: idx > 0 ? -6 : 0, zIndex: idx }}><Avatar name={u.name} color={u.color} size={16} /></div>;
                      })}
                      {activeUserIds.size > 3 && <div style={{ marginLeft: -4, width: 16, height: 16, borderRadius: "50%", background: T.accent, color: "#fff", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", border: "2px solid white" }}>+{activeUserIds.size - 3}</div>}
                    </div>
                  )}
                  {allDone && <span style={{ fontSize: 9 }}>✅</span>}
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {activeChores.map(id => {
                  const chore = CHORES.find(c => c.id === id);
                  const choreKey = `${year}-${month}-${selectedDay}-${id}`;
                  const completedByIds = sharedData?.completed[choreKey] || [];
                  const iDid = completedByIds.includes(currentUser.id);
                  return (
                    <div key={id} style={{ borderRadius: 14, border: `2px solid ${completedByIds.length > 0 ? chore.color : T.dayBorder}`, background: completedByIds.length > 0 ? `${chore.color}18` : T.dayBg, overflow: "hidden", transition: "all 0.2s" }}>
                      <button onClick={() => toggleChore(selectedDay, id)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "transparent", border: "none", color: completedByIds.length > 0 ? T.text : T.textMuted, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, textAlign: "left" }}>
                        <span style={{ fontSize: 22 }}>{chore.icon}</span>
                        <span style={{ flex: 1 }}>{chore.name}</span>
                        <span style={{ fontSize: 15, color: iDid ? chore.color : T.textMuted }}>{iDid ? "✓" : "○"}</span>
                      </button>
                      {/* Who completed it */}
                      {completedByIds.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px 10px", flexWrap: "wrap" }}>
                          {completedByIds.map(uid => {
                            const u = allUsers[uid];
                            if (!u) return null;
                            return (
                              <div key={uid} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.6)", borderRadius: 99, padding: "2px 8px" }}>
                                <Avatar name={u.name} color={u.color} size={14} />
                                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: T.text }}>{u.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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