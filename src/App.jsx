import { useState, useEffect, useCallback } from "react";
import { useState, useEffect, useCallback, useRef } from "react";

const DEFAULT_CHORES = [
  { id: 1, name: "Dishes", icon: "🍽️", color: "#FF6B6B" },
  { id: 2, name: "Vacuum", icon: "🧹", color: "#4ECDC4" },
  { id: 3, name: "Laundry", icon: "👕", color: "#45B7D1" },
  { id: 4, name: "Trash", icon: "🗑️", color: "#96CEB4" },
  { id: 5, name: "Mop", icon: "🪣", color: "#FFEAA7" },
  { id: 6, name: "Groceries", icon: "🛒", color: "#DDA0DD" },
];

const CHORE_COLORS = ["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#FFB347","#87CEEB","#98FB98","#F0E68C","#DEB887","#E6E6FA"];
const CHORE_ICONS = ["🍽️","🧹","👕","🗑️","🪣","🛒","🧺","🧼","🪥","🌿","🐾","🪴","🧽","🪟","🚿","🛁","🧻","🍳","🥘","🧊"];

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
const DAYS_FULL = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS_SHORT = ["S","M","T","W","T","F","S"];

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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

function Avatar({ name, color, size = 24 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", flexShrink: 0, border: "2px solid white", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)", border: `1px solid ${T.cardBorder}` }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: T.cardBorder, margin: "0 auto 20px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 20, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: T.textMuted, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DayPanel({ day, month, year, chores, sharedData, currentUser, allUsers, isToday, onClose, onToggle, isMobile }) {
  const MONTHS_LOCAL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return (
    <div className="panel-slide" style={{ marginTop: 12, background: T.panelBg, borderRadius: isMobile ? 16 : 20, padding: isMobile ? "16px" : "24px", border: `1px solid ${T.panelBorder}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 18 : 22, color: T.text }}>
          {MONTHS_LOCAL[month]} {day}{isToday ? " — Today" : ""}
        </h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.accent, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
        {chores.map(chore => {
          const choreKey = `${year}-${month}-${day}-${chore.id}`;
          const completedByIds = sharedData?.completed[choreKey] || [];
          const iDid = completedByIds.includes(currentUser.id);
          return (
            <div key={chore.id} style={{ borderRadius: 12, border: `2px solid ${completedByIds.length > 0 ? chore.color : T.dayBorder}`, background: completedByIds.length > 0 ? `${chore.color}18` : T.dayBg, overflow: "hidden", transition: "all 0.2s" }}>
              <button onClick={() => onToggle(day, chore.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: isMobile ? "12px" : "14px 16px", background: "transparent", border: "none", color: completedByIds.length > 0 ? T.text : T.textMuted, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 13 : 15, fontWeight: 500, textAlign: "left" }}>
                <span style={{ fontSize: isMobile ? 18 : 22 }}>{chore.icon}</span>
                <span style={{ flex: 1 }}>{chore.name}</span>
                <span style={{ fontSize: 15, color: iDid ? chore.color : T.textMuted }}>{iDid ? "✓" : "○"}</span>
              </button>
              {completedByIds.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 12px 10px", flexWrap: "wrap" }}>
                  {completedByIds.map(uid => { const u = allUsers[uid]; if (!u) return null; return (
                    <div key={uid} style={{ display: "flex", alignItems: "center", gap: 3, background: "rgba(255,255,255,0.7)", borderRadius: 99, padding: "2px 7px" }}>
                      <Avatar name={u.name} color={u.color} size={13} />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: T.text }}>{u.name}</span>
                    </div>
                  ); })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ChoreTracker() {
  const today = new Date();
  const isMobile = useIsMobile();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [activeChores, setActiveChores] = useLocalStorage("chore-active", [1, 4]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showManage, setShowManage] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🧹");
  const [newColor, setNewColor] = useState(CHORE_COLORS[0]);
  const [newError, setNewError] = useState("");
  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [currentUser, setCurrentUser] = useLocalStorage("chore-user", null);
  const [setupName, setSetupName] = useState("");
  const [setupError, setSetupError] = useState("");

const isSaving = useRef(false);

const loadShared = useCallback(async () => {
  if (isSaving.current) return;
  try {
    const result = await window.storage.get("chore-shared", true);
    if (result) setSharedData(JSON.parse(result.value));
    else setSharedData({ completed: {}, users: {}, chores: DEFAULT_CHORES, nextId: DEFAULT_CHORES.length + 1 });
    setLastSync(Date.now());
  } catch { setSharedData({ completed: {}, users: {}, chores: DEFAULT_CHORES, nextId: DEFAULT_CHORES.length + 1 }); }
  finally { setLoading(false); }
}, []);

const saveShared = useCallback(async (data) => {
    isSaving.current = true;
    setSyncing(true);
    try { await window.storage.set("chore-shared", JSON.stringify(data), true); setLastSync(Date.now()); }
    catch (e) { console.error(e); }
    finally { setSyncing(false); isSaving.current = false; }
  }, []);

  useEffect(() => { loadShared(); }, [loadShared]);
  useEffect(() => { const i = setInterval(loadShared, 8000); return () => clearInterval(i); }, [loadShared]);

  const chores = sharedData?.chores || DEFAULT_CHORES;

  const handleSetup = () => {
    const name = setupName.trim();
    if (!name) { setSetupError("Please enter a name."); return; }
    if (name.length > 20) { setSetupError("Max 20 characters."); return; }
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    const user = { id, name, color };
    setCurrentUser(user);
    const updated = { ...sharedData, users: { ...(sharedData?.users || {}), [id]: { name, color } } };
    setSharedData(updated); saveShared(updated);
  };

  const addChore = async () => {
    const name = newName.trim();
    if (!name) { setNewError("Enter a chore name."); return; }
    const currentChores = sharedData?.chores ?? DEFAULT_CHORES;
    if (currentChores.find(c => c.name.toLowerCase() === name.toLowerCase())) { setNewError("Already exists."); return; }
    const nextId = sharedData?.nextId ?? (currentChores.length + 1);
    const newChore = { id: nextId, name, icon: newIcon, color: newColor };
    const updated = {
      ...sharedData,
      chores: [...currentChores, newChore],
      nextId: nextId + 1,
      completed: sharedData?.completed ?? {},
      users: sharedData?.users ?? {},
    };
    setSharedData(updated);
    await saveShared(updated);
    setActiveChores(prev => [...prev, newChore.id]);
    setNewName(""); setNewIcon("🧹"); setNewColor(CHORE_COLORS[0]); setNewError("");
  };

  const removeChore = async (choreId) => {
    const currentChores = sharedData?.chores ?? DEFAULT_CHORES;
    const updated = {
      ...sharedData,
      chores: currentChores.filter(c => c.id !== choreId),
      completed: sharedData?.completed ?? {},
      users: sharedData?.users ?? {},
    };
    setSharedData(updated);
    await saveShared(updated);
    setActiveChores(prev => prev.filter(id => id !== choreId));
  };

  const toggleChore = async (day, choreId) => {
    if (!currentUser || !sharedData) return;
    const key = `${year}-${month}-${day}-${choreId}`;
    const current = sharedData.completed[key] || [];
    const alreadyDone = current.includes(currentUser.id);
    const updated = { ...sharedData, completed: { ...sharedData.completed, [key]: alreadyDone ? current.filter(id => id !== currentUser.id) : [...current, currentUser.id] } };
    setSharedData(updated); await saveShared(updated);
  };

  const getDayProgress = (day) => {
    if (!sharedData) return { done: 0, total: activeChores.length };
    let done = 0;
    activeChores.forEach(id => { if ((sharedData.completed[`${year}-${month}-${day}-${id}`] || []).length > 0) done++; });
    return { done, total: activeChores.length };
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); setSelectedDay(null); };
  const isTodayFn = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDay(month, year);
  const allUsers = sharedData?.users || {};

  const totalDone = Array.from({length: daysInMonth}, (_,i) => i+1)
    .flatMap(day => activeChores.map(id => ((sharedData?.completed[`${year}-${month}-${day}-${id}`] || []).length > 0) ? 1 : 0))
    .reduce((a,b) => a+b, 0);
  const totalPossible = daysInMonth * activeChores.length;

  const clearMonth = async () => {
    if (!sharedData) return;
    const prefix = `${year}-${month}-`;
    const updated = { ...sharedData, completed: Object.fromEntries(Object.entries(sharedData.completed).filter(([k]) => !k.startsWith(prefix))) };
    setSharedData(updated); await saveShared(updated);
  };

  const DAYS = isMobile ? DAYS_SHORT : DAYS_FULL;

  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap'); * { box-sizing: border-box; } input { outline: none; }`}</style>
        <div style={{ background: "#fff", borderRadius: 24, padding: isMobile ? "32px 24px" : "40px 36px", maxWidth: 380, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.10)", border: `1px solid ${T.cardBorder}`, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🧹</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, margin: "0 0 8px", color: T.text }}>Welcome</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: T.textMuted, fontSize: 14, marginBottom: 24 }}>Enter your name to track chores with your household.</p>
          <input value={setupName} onChange={e => { setSetupName(e.target.value); setSetupError(""); }} onKeyDown={e => e.key === "Enter" && handleSetup()} placeholder="Your name" maxLength={20}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${setupError ? "#ef4444" : T.cardBorder}`, fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: T.text, marginBottom: 8, background: "#f8fafc" }} />
          {setupError && <div style={{ color: "#ef4444", fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>{setupError}</div>}
          <button onClick={handleSetup} style={{ width: "100%", padding: "13px", borderRadius: 12, background: T.accent, color: "#fff", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>Join Tracker</button>
          {Object.keys(allUsers).length > 0 && (
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.cardBorder}` }}>
              <div style={{ fontSize: 12, color: T.textMuted, fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>Already tracking</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {Object.values(allUsers).map((u, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: T.dayBg, borderRadius: 99, padding: "4px 10px", border: `1px solid ${T.cardBorder}` }}>
                    <Avatar name={u.name} color={u.color} size={18} />
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

  if (loading) return <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontFamily: "'DM Sans', sans-serif", color: T.textMuted }}>Loading…</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Georgia', serif", padding: isMobile ? "16px 12px" : "24px 16px", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; } input { outline: none; }
        .day-cell { transition: all 0.15s ease; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .day-cell:hover { transform: scale(1.04); z-index: 10; }
        .day-cell:active { transform: scale(0.97); }
        .nav-btn { transition: all 0.2s; cursor: pointer; border: none; color: ${T.text}; border-radius: 50%; width: 40px; height: 40px; font-size: 18px; display: flex; align-items: center; justify-content: center; background: ${T.btnBg}; -webkit-tap-highlight-color: transparent; }
        .nav-btn:active { opacity: 0.6; }
        .panel-slide { animation: slideIn 0.22s ease; }
        @keyframes slideIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .progress-fill { transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
        .clear-btn { transition: all 0.2s; cursor: pointer; border: 1px solid rgba(255,100,100,0.3); background: rgba(255,100,100,0.08); color: rgba(180,60,60,0.8); border-radius: 8px; padding: 6px 12px; font-size: 12px; font-family: 'DM Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
        .manage-btn { transition: all 0.2s; cursor: pointer; border: 1px solid ${T.cardBorder}; background: ${T.btnBg}; color: ${T.accent}; border-radius: 8px; padding: 6px 14px; font-size: 12px; font-family: 'DM Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
        .remove-btn { opacity: 0; transition: opacity 0.15s; cursor: pointer; background: none; border: none; color: #ef4444; font-size: 16px; padding: 4px 8px; border-radius: 6px; }
        .chore-row:hover .remove-btn { opacity: 1; }
        .chore-tag { transition: all 0.2s; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        @media (max-width: 639px) {
          .remove-btn { opacity: 1 !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? 16 : 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: T.accent, textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Monthly Planner</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.9rem" : "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900, margin: 0, background: `linear-gradient(90deg, ${T.text}, ${T.accent}, ${T.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Chore Tracker
          </h1>

          {/* User row */}
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 99, padding: "5px 12px", border: `1px solid ${T.cardBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <Avatar name={currentUser.name} color={currentUser.color} size={20} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.text, fontWeight: 500 }}>{currentUser.name}</span>
              <button onClick={() => setCurrentUser(null)} title="Switch user" style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 13, padding: "0 0 0 4px" }}>⇄</button>
            </div>
            {Object.entries(allUsers).filter(([id]) => id !== currentUser.id).slice(0, isMobile ? 2 : 10).map(([id, u]) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 4, opacity: 0.6 }}>
                <Avatar name={u.name} color={u.color} size={18} />
                {!isMobile && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: T.textMuted }}>{u.name}</span>}
              </div>
            ))}
          </div>

          {/* Sync */}
          <div style={{ marginTop: 5, fontSize: 11, color: T.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
            {syncing ? "⏳ Saving…" : lastSync ? `✓ Synced ${new Date(lastSync).toLocaleTimeString()}` : ""}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 10, maxWidth: 360, margin: "10px auto 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.accent, fontFamily: "'DM Sans', sans-serif", marginBottom: 5 }}>
              <span>{totalDone} completed</span><span>{totalPossible - totalDone} remaining</span>
            </div>
            <div style={{ height: 5, background: T.progressBg, borderRadius: 99, overflow: "hidden" }}>
              <div className="progress-fill" style={{ height: "100%", borderRadius: 99, background: T.progressFill, width: `${totalPossible ? (totalDone/totalPossible*100) : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 14 : 18 }}>
          <button className="nav-btn" onClick={prevMonth}>‹</button>
          <div style={{ textAlign: "center", minWidth: isMobile ? 160 : 200 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 22 : 28, fontWeight: 700 }}>{MONTHS[month]}</div>
            <div style={{ color: T.accent, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{year}</div>
          </div>
          <button className="nav-btn" onClick={nextMonth}>›</button>
        </div>

        {/* Chore toggles */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 10 }}>
          {chores.map(c => (
            <button key={c.id} className="chore-tag" onClick={() => setActiveChores(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: isMobile ? "5px 10px" : "6px 14px", borderRadius: 99, border: `2px solid ${activeChores.includes(c.id) ? c.color : T.textMuted}`, background: activeChores.includes(c.id) ? `${c.color}22` : "transparent", color: activeChores.includes(c.id) ? T.text : T.textMuted, fontSize: isMobile ? 12 : 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
              <span style={{ fontSize: isMobile ? 13 : 15 }}>{c.icon}</span>
              {(!isMobile || chores.length <= 6) && <span>{c.name}</span>}
            </button>
          ))}
          <button className="manage-btn" onClick={() => setShowManage(true)}>✏️ {isMobile ? "" : "Manage"}</button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: isMobile ? 12 : 16 }}>
          <button className="clear-btn" onClick={clearMonth}>🗑 Clear {isMobile ? MONTHS[month].slice(0,3) : MONTHS[month]}</button>
        </div>

        {/* Calendar */}
        <div style={{ background: T.card, borderRadius: isMobile ? 14 : 20, padding: isMobile ? "12px 8px" : "20px", border: `1px solid ${T.cardBorder}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: isMobile ? 3 : 4, marginBottom: 6 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: isMobile ? 10 : 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: T.accent, letterSpacing: isMobile ? 0 : 2, padding: "3px 0", textTransform: "uppercase" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: isMobile ? 3 : 4 }}>
            {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const { done, total } = getDayProgress(day);
              const pct = total ? done / total : 0;
              const allDone = total > 0 && done === total;
              const sel = selectedDay === day;
              const isT = isTodayFn(day);
              const activeUserIds = new Set();
              activeChores.forEach(id => (sharedData?.completed[`${year}-${month}-${day}-${id}`] || []).forEach(uid => activeUserIds.add(uid)));

              return (
                <div key={day} className="day-cell" onClick={() => setSelectedDay(sel ? null : day)}
                  style={{ borderRadius: isMobile ? 8 : 12, padding: isMobile ? "6px 2px 5px" : "8px 4px 6px", minHeight: isMobile ? 56 : 75, background: sel ? T.selBg : isT ? T.todayBg : T.dayBg, border: `${isMobile ? 1 : 1.5}px solid ${sel ? T.selBorder : isT ? T.todayBorder : T.dayBorder}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>
                  <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: isT ? 700 : 400, fontFamily: "'DM Sans', sans-serif", color: isT ? T.accent : T.text, lineHeight: 1 }}>
                    {day}
                    {isT && <span style={{ position: "absolute", top: 3, right: 3, width: 5, height: 5, borderRadius: "50%", background: T.accent, display: "block" }} />}
                  </div>
                  {total > 0 && (
                    <div style={{ width: "75%", height: isMobile ? 2 : 3, background: T.progressBg, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct * 100}%`, background: allDone ? T.choreDoneFill : T.progressFill, borderRadius: 99, transition: "width 0.3s" }} />
                    </div>
                  )}
                  {activeUserIds.size > 0 && (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      {[...activeUserIds].slice(0, isMobile ? 2 : 3).map((uid, idx) => { const u = allUsers[uid]; if (!u) return null; return <div key={uid} style={{ marginLeft: idx > 0 ? -5 : 0, zIndex: idx }}><Avatar name={u.name} color={u.color} size={isMobile ? 13 : 16} /></div>; })}
                      {activeUserIds.size > (isMobile ? 2 : 3) && <div style={{ marginLeft: -4, width: isMobile ? 13 : 16, height: isMobile ? 13 : 16, borderRadius: "50%", background: T.accent, color: "#fff", fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", border: "2px solid white" }}>+{activeUserIds.size - (isMobile ? 2 : 3)}</div>}
                    </div>
                  )}
                  {allDone && !isMobile && <span style={{ fontSize: 9 }}>✅</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day panel */}
        {selectedDay && (
          <DayPanel
            day={selectedDay} month={month} year={year}
            chores={chores.filter(c => activeChores.includes(c.id))}
            sharedData={sharedData} currentUser={currentUser} allUsers={allUsers}
            isToday={isTodayFn(selectedDay)} onClose={() => setSelectedDay(null)}
            onToggle={toggleChore} isMobile={isMobile}
          />
        )}
      </div>

      {/* Manage Modal */}
      {showManage && (
        <Modal title="Manage Chores" onClose={() => { setShowManage(false); setNewName(""); setNewError(""); }}>
          <div style={{ marginBottom: 16, maxHeight: 220, overflowY: "auto" }}>
            {chores.length === 0 && <p style={{ color: T.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 14, textAlign: "center" }}>No chores yet.</p>}
            {chores.map(c => (
              <div key={c.id} className="chore-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 4px", borderBottom: `1px solid ${T.cardBorder}` }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: T.text }}>{c.name}</span>
                <button className="remove-btn" onClick={() => removeChore(c.id)}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.cardBorder}`, paddingTop: 16 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Add New</div>
            <input value={newName} onChange={e => { setNewName(e.target.value); setNewError(""); }} onKeyDown={e => e.key === "Enter" && addChore()} placeholder="Chore name" maxLength={24}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${newError ? "#ef4444" : T.cardBorder}`, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: T.text, background: "#f8fafc", marginBottom: 8 }} />
            {newError && <div style={{ color: "#ef4444", fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>{newError}</div>}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Icon</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CHORE_ICONS.map(icon => (
                  <button key={icon} onClick={() => setNewIcon(icon)} style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${newIcon === icon ? T.accent : T.cardBorder}`, background: newIcon === icon ? T.btnBg : "transparent", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Color</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CHORE_COLORS.map(color => (
                  <button key={color} onClick={() => setNewColor(color)} style={{ width: 28, height: 28, borderRadius: "50%", background: color, border: `3px solid ${newColor === color ? T.text : "transparent"}`, cursor: "pointer" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, border: `2px solid ${newColor}`, background: `${newColor}22`, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.text }}>
                <span>{newIcon}</span><span>{newName || "Preview"}</span>
              </div>
              <button onClick={addChore} style={{ marginLeft: "auto", padding: "9px 20px", borderRadius: 10, background: T.accent, color: "#fff", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>+ Add</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}