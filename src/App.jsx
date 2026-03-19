import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const DEFAULT_CHORES = [
  { id: 1, name: "Dishes", icon: "🍽️", color: "#f87171" },
  { id: 2, name: "Vacuum", icon: "🧹", color: "#34d399" },
  { id: 3, name: "Laundry", icon: "👕", color: "#60a5fa" },
  { id: 4, name: "Trash", icon: "🗑️", color: "#a3e635" },
  { id: 5, name: "Mop", icon: "🪣", color: "#fbbf24" },
  { id: 6, name: "Groceries", icon: "🛒", color: "#e879f9" },
];

const CHORE_COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#a3e635",
  "#34d399",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#e879f9",
  "#f472b6",
  "#94a3b8",
  "#ffffff",
];
const CHORE_ICONS = [
  "🍽️",
  "🧹",
  "👕",
  "🗑️",
  "🪣",
  "🛒",
  "🧺",
  "🧼",
  "🪥",
  "🌿",
  "🐾",
  "🪴",
  "🧽",
  "🪟",
  "🚿",
  "🛁",
  "🧻",
  "🍳",
  "🥘",
  "🧊",
];
const USER_COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#34d399",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#e879f9",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

const THEMES = {
  dark: {
    bg: "#08090e",
    bgCard: "rgba(255,255,255,0.03)",
    bgPanel: "rgba(255,255,255,0.04)",
    bgInput: "rgba(255,255,255,0.06)",
    bgHover: "rgba(255,255,255,0.07)",
    bgModal: "#0f1018",
    bgPill: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.07)",
    borderAccent: "rgba(99,102,241,0.4)",
    text: "#f1f5f9",
    textSub: "#94a3b8",
    textMuted: "#475569",
    accent: "#6366f1",
    accentLight: "#818cf8",
    accentGlow: "rgba(99,102,241,0.15)",
    todayBg: "rgba(99,102,241,0.12)",
    todayBorder: "rgba(99,102,241,0.45)",
    selBg: "rgba(99,102,241,0.18)",
    selBorder: "#6366f1",
    progressBg: "rgba(255,255,255,0.06)",
    progressFill: "linear-gradient(90deg,#6366f1,#818cf8)",
    doneFill: "#6366f1",
    danger: "rgba(239,68,68,0.15)",
    dangerText: "#fca5a5",
    dangerBorder: "rgba(239,68,68,0.3)",
    colorScheme: "dark",
    bodyBg: "#08090e",
    scrollThumb: "rgba(255,255,255,0.1)",
    completedByBg: "rgba(255,255,255,0.05)",
    noteBg: "rgba(255,255,255,0.04)",
    rejoinHoverBg: "rgba(255,255,255,0.06)",
    modalOverlay: "rgba(0,0,0,0.7)",
    modalShadow: "0 -20px 60px rgba(0,0,0,0.6)",
    setupShadow: "0 24px 80px rgba(0,0,0,0.7)",
    removeUserBorder: "1.5px solid rgba(255,255,255,0.2)",
    overflowBadgeBorder: "1.5px solid rgba(255,255,255,0.15)",
  },
  light: {
    bg: "#f1f5f9",
    bgCard: "rgba(255,255,255,0.85)",
    bgPanel: "rgba(255,255,255,0.95)",
    bgInput: "rgba(255,255,255,0.95)",
    bgHover: "rgba(0,0,0,0.04)",
    bgModal: "#ffffff",
    bgPill: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.09)",
    borderAccent: "rgba(99,102,241,0.3)",
    text: "#0f172a",
    textSub: "#475569",
    textMuted: "#94a3b8",
    accent: "#6366f1",
    accentLight: "#4f46e5",
    accentGlow: "rgba(99,102,241,0.1)",
    todayBg: "rgba(99,102,241,0.08)",
    todayBorder: "rgba(99,102,241,0.35)",
    selBg: "rgba(99,102,241,0.1)",
    selBorder: "#6366f1",
    progressBg: "rgba(0,0,0,0.07)",
    progressFill: "linear-gradient(90deg,#6366f1,#818cf8)",
    doneFill: "#6366f1",
    danger: "rgba(239,68,68,0.08)",
    dangerText: "#dc2626",
    dangerBorder: "rgba(239,68,68,0.25)",
    colorScheme: "light",
    bodyBg: "#f1f5f9",
    scrollThumb: "rgba(0,0,0,0.15)",
    completedByBg: "rgba(0,0,0,0.04)",
    noteBg: "rgba(0,0,0,0.03)",
    rejoinHoverBg: "rgba(0,0,0,0.05)",
    modalOverlay: "rgba(0,0,0,0.4)",
    modalShadow: "0 -20px 60px rgba(0,0,0,0.1)",
    setupShadow: "0 24px 80px rgba(0,0,0,0.12)",
    removeUserBorder: "1.5px solid rgba(255,255,255,0.6)",
    overflowBadgeBorder: "1.5px solid rgba(255,255,255,0.5)",
  },
};

let T = THEMES.dark;

function getDaysInMonth(m, y) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDay(m, y) {
  return new Date(y, m, 1).getDay();
}
function getWeekDates(date) {
  const d = new Date(date),
    start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(start);
    nd.setDate(start.getDate() + i);
    return nd;
  });
}
function isToday(date) {
  const t = new Date();
  return (
    date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear()
  );
}

function useLocalStorage(key, init) {
  const [value, setValue] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : init;
    } catch {
      return init;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

function Avatar({ name, color, size = 24 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 800,
        fontFamily: "'DM Sans', sans-serif",
        flexShrink: 0,
        border: `1.5px solid ${color}44`,
        boxShadow: `0 0 0 2px ${color}22`,
      }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

function Btn({ children, variant = "ghost", style, ...props }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    transition: "all 0.18s",
    WebkitTapHighlightColor: "transparent",
  };
  const variants = {
    ghost: {
      background: T.bgHover,
      color: T.textSub,
      border: `1px solid ${T.border}`,
    },
    accent: { background: T.accent, color: "#fff", border: "none" },
    danger: {
      background: T.danger,
      color: T.dangerText,
      border: `1px solid ${T.dangerBorder}`,
    },
    outline: {
      background: "transparent",
      color: T.accent,
      border: `1.5px dashed ${T.accent}55`,
    },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
}

function ThemeToggle({ theme, onToggle, compact = false }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 4 : 6,
        padding: compact ? "4px 10px" : "5px 14px",
        borderRadius: 99,
        border: `1px solid ${T.border}`,
        background: T.bgPill,
        color: T.textSub,
        fontFamily: "'DM Sans',sans-serif",
        fontSize: compact ? 11 : 12,
        cursor: "pointer",
        transition: "all 0.2s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span style={{ fontSize: compact ? 13 : 14 }}>
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
      {!compact && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: T.modalOverlay,
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bgModal,
          borderRadius: "20px 20px 0 0",
          border: `1px solid ${T.border}`,
          borderBottom: "none",
          padding: "20px 20px 36px",
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: T.modalShadow,
        }}
      >
        <div
          style={{
            width: 32,
            height: 3,
            borderRadius: 99,
            background: T.border,
            margin: "0 auto 20px",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
              color: T.text,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: T.textSub,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Chore Card ────────────────────────────────────────────────────────────────
// Receives onSaveNote(text) — an async function that persists the note.
// Uses a local ref to prevent stale closure issues with the draft value.

function ChoreCard({
  chore,
  completedBy,
  iDid,
  note,
  allUsers,
  isMobile,
  onToggle,
  onSaveNote,
}) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(note);
  const [saving, setSaving] = useState(false);
  const draftRef = useRef(draft);

  // Keep ref in sync with draft state
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // When note prop changes from outside (e.g. Firestore sync), update draft
  // only if the editor is not currently open to avoid overwriting user input
  useEffect(() => {
    if (!expanded) {
      setDraft(note);
      draftRef.current = note;
    }
  }, [note, expanded]);

  const handleSave = async () => {
    const textToSave = draftRef.current;
    setSaving(true);
    try {
      await onSaveNote(textToSave);
      setExpanded(false);
    } catch (e) {
      console.error("Note save failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(note);
    draftRef.current = note;
    setExpanded(false);
  };

  const done = completedBy.length > 0;

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1.5px solid ${done ? chore.color + "55" : T.border}`,
        background: done ? chore.color + "0d" : T.bgCard,
        overflow: "hidden",
        transition: "all 0.2s",
      }}
    >
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={onToggle}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: isMobile ? "13px 14px" : "15px 18px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: isMobile ? 20 : 24 }}>{chore.icon}</span>
          <span
            style={{
              flex: 1,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: isMobile ? 14 : 15,
              fontWeight: 500,
              color: done ? T.text : T.textSub,
            }}
          >
            {chore.name}
          </span>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: `2px solid ${iDid ? chore.color : T.border}`,
              background: iDid ? chore.color + "22" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: iDid ? chore.color : T.textMuted,
              flexShrink: 0,
            }}
          >
            {iDid ? "✓" : ""}
          </span>
        </button>
        {/* Note toggle button — always visible */}
        <button
          onClick={() => setExpanded((e) => !e)}
          title={note.trim() ? "Edit note" : "Add note"}
          style={{
            padding: "0 14px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: note.trim() ? 14 : 13,
            color: note.trim() ? chore.color : T.textSub,
            opacity: 1,
            transition: "all 0.2s",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: isMobile ? 46 : 54,
          }}
        >
          {note.trim() ? "📝" : "✏️"}
        </button>
      </div>

      {/* Who completed it */}
      {done && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            padding: "0 14px 10px",
          }}
        >
          {completedBy.map((uid) => {
            const u = allUsers[uid];
            if (!u) return null;
            return (
              <div
                key={uid}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: T.completedByBg,
                  borderRadius: 99,
                  padding: "2px 8px",
                  border: `1px solid ${T.border}`,
                }}
              >
                <Avatar name={u.name} color={u.color} size={13} />
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    color: T.textSub,
                  }}
                >
                  {u.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Note preview (collapsed) */}
      {note.trim() && !expanded && (
        <div
          onClick={() => setExpanded(true)}
          style={{
            margin: "0 14px 12px",
            padding: "10px 12px",
            borderRadius: 10,
            background: T.bgPanel,
            border: `1px solid ${chore.color}44`,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 11 }}>📝</span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                color: T.textMuted,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Note
            </span>
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: T.text,
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
            }}
          >
            {note}
          </div>
        </div>
      )}

      {/* Note editor (expanded) */}
      {expanded && (
        <div style={{ padding: "0 14px 14px" }}>
          <div
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 11,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            {draft.trim() ? "Edit note" : "Add note"}
          </div>
          <textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              draftRef.current = e.target.value;
            }}
            placeholder="Type a note for this chore…"
            rows={3}
            autoFocus
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1.5px solid ${chore.color}66`,
              background: T.bgInput,
              color: T.text,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              caretColor: chore.color,
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 8,
              justifyContent: "flex-end",
            }}
          >
            <Btn
              variant="ghost"
              style={{ fontSize: 12, padding: "5px 12px" }}
              onClick={handleCancel}
            >
              Cancel
            </Btn>
            <Btn
              variant="accent"
              style={{
                fontSize: 12,
                padding: "5px 14px",
                background: chore.color,
                opacity: saving ? 0.7 : 1,
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chore Panel ───────────────────────────────────────────────────────────────

function ChorePanel({
  date,
  chores,
  activeChores,
  sharedData,
  currentUser,
  allUsers,
  onClose,
  onToggle,
  onSaveNote,
  isMobile,
}) {
  const day = date.getDate(),
    month = date.getMonth(),
    year = date.getFullYear();
  const todayFlag = isToday(date);
  return (
    <div
      className="panel-slide"
      style={{
        marginTop: 12,
        borderRadius: isMobile ? 16 : 18,
        background: T.bgPanel,
        border: `1px solid ${T.border}`,
        padding: isMobile ? 16 : 22,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 2,
            }}
          >
            {DAYS_FULL[date.getDay()]}
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? 18 : 21,
              color: T.text,
            }}
          >
            {MONTHS[month]} {day}
            {todayFlag ? " — Today" : ""}
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: T.textSub,
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
      {activeChores.length === 0 ? (
        <p
          style={{
            color: T.textMuted,
            fontFamily: "'DM Sans',sans-serif",
            textAlign: "center",
          }}
        >
          No chores active.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeChores.map((id) => {
            const chore = chores.find((c) => c.id === id);
            if (!chore) return null;
            const key = `${year}-${month}-${day}-${id}`;
            const completedBy = sharedData?.completed?.[key] || [];
            const iDid = completedBy.includes(currentUser.id);
            const note = sharedData?.notes?.[key] || "";
            return (
              <ChoreCard
                key={id}
                chore={chore}
                completedBy={completedBy}
                iDid={iDid}
                note={note}
                allUsers={allUsers}
                isMobile={isMobile}
                onToggle={() => onToggle(day, month, year, id)}
                onSaveNote={(text) => onSaveNote(day, month, year, id, text)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Month View ────────────────────────────────────────────────────────────────

function MonthView({
  month,
  year,
  chores,
  activeChores,
  sharedData,
  allUsers,
  currentUser,
  isMobile,
  onToggle,
  onSaveNote,
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDay(month, year);
  const DAYS = isMobile ? DAYS_SHORT : DAYS_FULL;
  const progress = (day) => {
    let done = 0;
    activeChores.forEach((id) => {
      if (
        (sharedData?.completed?.[`${year}-${month}-${day}-${id}`] || [])
          .length > 0
      )
        done++;
    });
    return { done, total: activeChores.length };
  };
  return (
    <>
      <div
        style={{
          background: T.bgCard,
          borderRadius: isMobile ? 14 : 18,
          padding: isMobile ? "12px 8px" : 20,
          border: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: isMobile ? 2 : 4,
            marginBottom: 8,
          }}
        >
          {DAYS.map((d, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontSize: isMobile ? 10 : 11,
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 600,
                color: T.textMuted,
                letterSpacing: isMobile ? 0 : 1,
                padding: "3px 0",
                textTransform: "uppercase",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: isMobile ? 3 : 4,
          }}
        >
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const { done, total } = progress(day);
            const pct = total ? done / total : 0;
            const allDone = total > 0 && done === total;
            const sel = selectedDay === day;
            const today =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();
            const activeUids = new Set();
            activeChores.forEach((id) =>
              (
                sharedData?.completed?.[`${year}-${month}-${day}-${id}`] || []
              ).forEach((uid) => activeUids.add(uid)),
            );
            return (
              <div
                key={day}
                className="day-cell"
                onClick={() => setSelectedDay(sel ? null : day)}
                style={{
                  borderRadius: isMobile ? 8 : 11,
                  padding: isMobile ? "7px 2px 6px" : "9px 4px 7px",
                  minHeight: isMobile ? 58 : 76,
                  background: sel ? T.selBg : today ? T.todayBg : T.bgCard,
                  border: `1.5px solid ${sel ? T.selBorder : today ? T.todayBorder : T.border}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? 11 : 13,
                    fontWeight: today ? 700 : 400,
                    fontFamily: "'DM Sans',sans-serif",
                    color: today ? T.accentLight : T.text,
                  }}
                >
                  {day}
                  {today && (
                    <span
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: T.accent,
                      }}
                    />
                  )}
                </div>
                {total > 0 && (
                  <div
                    style={{
                      width: "75%",
                      height: isMobile ? 2 : 3,
                      background: T.progressBg,
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct * 100}%`,
                        background: allDone ? T.doneFill : T.progressFill,
                        borderRadius: 99,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                )}
                {activeUids.size > 0 && (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {[...activeUids]
                      .slice(0, isMobile ? 2 : 3)
                      .map((uid, idx) => {
                        const u = allUsers[uid];
                        if (!u) return null;
                        return (
                          <div
                            key={uid}
                            style={{
                              marginLeft: idx > 0 ? -5 : 0,
                              zIndex: idx,
                            }}
                          >
                            <Avatar
                              name={u.name}
                              color={u.color}
                              size={isMobile ? 13 : 16}
                            />
                          </div>
                        );
                      })}
                    {activeUids.size > (isMobile ? 2 : 3) && (
                      <div
                        style={{
                          marginLeft: -4,
                          width: isMobile ? 13 : 16,
                          height: isMobile ? 13 : 16,
                          borderRadius: "50%",
                          background: T.accent,
                          color: "#fff",
                          fontSize: 7,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: T.overflowBadgeBorder,
                        }}
                      >
                        +{activeUids.size - (isMobile ? 2 : 3)}
                      </div>
                    )}
                  </div>
                )}
                {allDone && <span style={{ fontSize: 9 }}>✅</span>}
              </div>
            );
          })}
        </div>
      </div>
      {selectedDay && (
        <ChorePanel
          date={new Date(year, month, selectedDay)}
          chores={chores}
          activeChores={activeChores}
          sharedData={sharedData}
          currentUser={currentUser}
          allUsers={allUsers}
          onClose={() => setSelectedDay(null)}
          onToggle={onToggle}
          onSaveNote={onSaveNote}
          isMobile={isMobile}
        />
      )}
    </>
  );
}

// ── Week View ─────────────────────────────────────────────────────────────────

function WeekView({
  focusDate,
  chores,
  activeChores,
  sharedData,
  allUsers,
  currentUser,
  isMobile,
  onToggle,
  onSaveNote,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const weekDates = getWeekDates(focusDate);
  return (
    <>
      <div
        style={{
          background: T.bgCard,
          borderRadius: isMobile ? 14 : 18,
          padding: isMobile ? "12px 8px" : 20,
          border: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: isMobile ? 4 : 8,
          }}
        >
          {weekDates.map((date, idx) => {
            const day = date.getDate(),
              month = date.getMonth(),
              year = date.getFullYear();
            const tod = isToday(date);
            const sel = selectedDate?.toDateString() === date.toDateString();
            let done = 0;
            activeChores.forEach((id) => {
              if (
                (sharedData?.completed?.[`${year}-${month}-${day}-${id}`] || [])
                  .length > 0
              )
                done++;
            });
            const total = activeChores.length;
            const pct = total ? done / total : 0;
            const allDone = total > 0 && done === total;
            const activeUids = new Set();
            activeChores.forEach((id) =>
              (
                sharedData?.completed?.[`${year}-${month}-${day}-${id}`] || []
              ).forEach((uid) => activeUids.add(uid)),
            );
            return (
              <div
                key={idx}
                className="day-cell"
                onClick={() => setSelectedDate(sel ? null : date)}
                style={{
                  borderRadius: isMobile ? 10 : 14,
                  padding: isMobile ? "10px 4px" : "16px 8px",
                  minHeight: isMobile ? 90 : 130,
                  background: sel ? T.selBg : tod ? T.todayBg : T.bgCard,
                  border: `1.5px solid ${sel ? T.selBorder : tod ? T.todayBorder : T.border}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: isMobile ? 9 : 10,
                    color: tod ? T.accentLight : T.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {DAYS_FULL[idx].slice(0, 3)}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: isMobile ? 18 : 26,
                    fontWeight: tod ? 700 : 500,
                    color: tod ? T.accentLight : T.text,
                  }}
                >
                  {day}
                </div>
                {total > 0 && (
                  <>
                    <div
                      style={{
                        width: "80%",
                        height: 3,
                        background: T.progressBg,
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct * 100}%`,
                          background: allDone ? T.doneFill : T.progressFill,
                          borderRadius: 99,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: isMobile ? 9 : 11,
                        color: T.textMuted,
                      }}
                    >
                      {done}/{total}
                    </div>
                  </>
                )}
                {activeUids.size > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    {[...activeUids].slice(0, 2).map((uid) => {
                      const u = allUsers[uid];
                      if (!u) return null;
                      return (
                        <Avatar
                          key={uid}
                          name={u.name}
                          color={u.color}
                          size={isMobile ? 14 : 18}
                        />
                      );
                    })}
                    {activeUids.size > 2 && (
                      <div
                        style={{
                          width: isMobile ? 14 : 18,
                          height: isMobile ? 14 : 18,
                          borderRadius: "50%",
                          background: T.accent,
                          color: "#fff",
                          fontSize: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: T.overflowBadgeBorder,
                        }}
                      >
                        +{activeUids.size - 2}
                      </div>
                    )}
                  </div>
                )}
                {allDone && <span style={{ fontSize: 10 }}>✅</span>}
              </div>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <ChorePanel
          date={selectedDate}
          chores={chores}
          activeChores={activeChores}
          sharedData={sharedData}
          currentUser={currentUser}
          allUsers={allUsers}
          onClose={() => setSelectedDate(null)}
          onToggle={onToggle}
          onSaveNote={onSaveNote}
          isMobile={isMobile}
        />
      )}
    </>
  );
}

// ── Day View ──────────────────────────────────────────────────────────────────

function DayView({
  focusDate,
  chores,
  activeChores,
  sharedData,
  allUsers,
  currentUser,
  isMobile,
  onToggle,
  onSaveNote,
  onAddChore,
}) {
  const day = focusDate.getDate(),
    month = focusDate.getMonth(),
    year = focusDate.getFullYear();
  const tod = isToday(focusDate);
  return (
    <div
      style={{
        background: T.bgCard,
        borderRadius: isMobile ? 14 : 18,
        padding: isMobile ? 16 : 24,
        border: `1px solid ${T.border}`,
      }}
    >
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 11,
            color: T.textMuted,
            textTransform: "uppercase",
            letterSpacing: 3,
            marginBottom: 4,
          }}
        >
          {DAYS_FULL[focusDate.getDay()]}
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: isMobile ? 48 : 64,
            fontWeight: 700,
            color: tod ? T.accentLight : T.text,
            lineHeight: 1,
          }}
        >
          {day}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13,
            color: T.textSub,
            marginTop: 4,
          }}
        >
          {MONTHS[month]} {year}
        </div>
      </div>
      {activeChores.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p
            style={{
              color: T.textMuted,
              fontFamily: "'DM Sans',sans-serif",
              marginBottom: 14,
            }}
          >
            No chores active.
          </p>
          <Btn
            variant="outline"
            style={{ fontSize: 14, padding: "10px 20px", margin: "0 auto" }}
            onClick={onAddChore}
          >
            <span style={{ fontSize: 16 }}>＋</span> Add a Chore
          </Btn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeChores.map((id) => {
            const chore = chores.find((c) => c.id === id);
            if (!chore) return null;
            const key = `${year}-${month}-${day}-${id}`;
            const completedBy = sharedData?.completed?.[key] || [];
            const iDid = completedBy.includes(currentUser.id);
            const note = sharedData?.notes?.[key] || "";
            return (
              <ChoreCard
                key={id}
                chore={chore}
                completedBy={completedBy}
                iDid={iDid}
                note={note}
                allUsers={allUsers}
                isMobile={isMobile}
                onToggle={() => onToggle(day, month, year, id)}
                onSaveNote={(text) => onSaveNote(day, month, year, id, text)}
              />
            );
          })}
          <Btn
            variant="outline"
            style={{
              fontSize: 13,
              padding: "11px",
              width: "100%",
              marginTop: 4,
            }}
            onClick={onAddChore}
          >
            <span style={{ fontSize: 15 }}>＋</span> Add Chore
          </Btn>
        </div>
      )}
    </div>
  );
}

// ── Setup Screen ──────────────────────────────────────────────────────────────

function SetupScreen({
  allUsers,
  loading,
  onJoin,
  onRejoin,
  theme,
  onToggleTheme,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const isMobile = useIsMobile();
  const handle = () => {
    const n = name.trim();
    if (!n) {
      setError("Please enter a name.");
      return;
    }
    if (n.length > 20) {
      setError("Max 20 characters.");
      return;
    }
    onJoin(n);
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;}input,textarea{outline:none;}::placeholder{color:${T.textMuted};}input{color-scheme:${T.colorScheme};}html,body{margin:0;padding:0;background:${T.bodyBg};}@keyframes spin{to{transform:rotate(360deg);}}.rejoin-btn:hover{border-color:var(--c)!important;background:${T.rejoinHoverBg}!important;transform:translateY(-1px);}`}</style>
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 10 }}>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <div
        style={{
          background: T.bgModal,
          borderRadius: 22,
          padding: isMobile ? "32px 24px" : "44px 40px",
          maxWidth: 400,
          width: "100%",
          boxShadow: T.setupShadow,
          border: `1px solid ${T.border}`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🧹</div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            margin: "0 0 8px",
            color: T.text,
          }}
        >
          Welcome
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: T.textSub,
            fontSize: 14,
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          Enter your name to track chores with your household.
        </p>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handle()}
          placeholder="Your name"
          maxLength={20}
          style={{
            width: "100%",
            padding: "13px 16px",
            borderRadius: 12,
            border: `1.5px solid ${error ? "#ef4444" : T.border}`,
            background: T.bgInput,
            color: T.text,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            marginBottom: 8,
            caretColor: T.accent,
            transition: "border-color 0.2s",
          }}
        />
        {error && (
          <div
            style={{
              color: T.dangerText,
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 8,
            }}
          >
            {error}
          </div>
        )}
        <Btn
          variant="accent"
          onClick={handle}
          style={{
            width: "100%",
            padding: "13px",
            fontSize: 15,
            borderRadius: 12,
          }}
        >
          Join Tracker
        </Btn>
        <div
          style={{
            marginTop: 28,
            paddingTop: 24,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: T.textMuted,
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {loading
              ? "Loading…"
              : Object.keys(allUsers).length > 0
                ? "Return as"
                : "No users yet"}
          </div>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "8px 0",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${T.border}`,
                  borderTopColor: T.accent,
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
              }}
            >
              {Object.entries(allUsers).map(([id, u]) => (
                <button
                  key={id}
                  className="rejoin-btn"
                  onClick={() => onRejoin(id, u)}
                  style={{
                    "--c": u.color,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: T.bgPill,
                    borderRadius: 99,
                    padding: "7px 14px",
                    border: `1.5px solid ${T.border}`,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: T.text,
                    transition: "all 0.2s",
                  }}
                >
                  <Avatar name={u.name} color={u.color} size={20} />
                  <span>{u.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Manage Chores Modal ───────────────────────────────────────────────────────

function ManageModal({ chores, onClose, onAdd, onRemove }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🧹");
  const [color, setColor] = useState(CHORE_COLORS[0]);
  const [error, setError] = useState("");
  const handleAdd = () => {
    const n = name.trim();
    if (!n) {
      setError("Enter a chore name.");
      return;
    }
    if (chores.find((c) => c.name.toLowerCase() === n.toLowerCase())) {
      setError("Already exists.");
      return;
    }
    onAdd(n, icon, color);
    setName("");
    setIcon("🧹");
    setColor(CHORE_COLORS[0]);
    setError("");
  };
  return (
    <Modal title="Manage Chores" onClose={onClose}>
      <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 16 }}>
        {chores.length === 0 && (
          <p
            style={{
              color: T.textMuted,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            No chores yet.
          </p>
        )}
        {chores.map((c) => (
          <div
            key={c.id}
            className="chore-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 4px",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 20 }}>{c.icon}</span>
            <span
              style={{
                flex: 1,
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 14,
                color: T.text,
              }}
            >
              {c.name}
            </span>
            <button className="remove-btn" onClick={() => onRemove(c.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
        <div
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: T.textMuted,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Add New
        </div>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Chore name"
          maxLength={24}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: `1.5px solid ${error ? "#ef4444" : T.border}`,
            background: T.bgInput,
            color: T.text,
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            marginBottom: 8,
            caretColor: T.accent,
          }}
        />
        {error && (
          <div
            style={{
              color: T.dangerText,
              fontSize: 12,
              fontFamily: "'DM Sans',sans-serif",
              marginBottom: 8,
            }}
          >
            {error}
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 12,
              color: T.textMuted,
              marginBottom: 6,
            }}
          >
            Icon
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CHORE_ICONS.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${icon === ic ? T.accent : T.border}`,
                  background: icon === ic ? T.accentGlow : "transparent",
                }}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 12,
              color: T.textMuted,
              marginBottom: 6,
            }}
          >
            Color
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CHORE_COLORS.map((cl) => (
              <button
                key={cl}
                onClick={() => setColor(cl)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: cl,
                  cursor: "pointer",
                  border:
                    color === cl
                      ? `3px solid ${T.text}`
                      : "3px solid transparent",
                  boxShadow: color === cl ? `0 0 0 1px ${cl}` : "none",
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 99,
              border: `2px solid ${color}55`,
              background: color + "15",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 13,
              color: T.text,
            }}
          >
            <span>{icon}</span>
            <span>{name || "Preview"}</span>
          </div>
          <Btn
            variant="accent"
            onClick={handleAdd}
            style={{ marginLeft: "auto", padding: "9px 20px", fontSize: 14 }}
          >
            ＋ Add
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function ChoreTracker() {
  const today = new Date();
  const isMobile = useIsMobile();

  const [theme, setTheme] = useLocalStorage("chore-theme", "dark");
  T = THEMES[theme] || THEMES.dark;
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const [view, setView] = useState("month");
  const [focusDate, setFocusDate] = useState(today);
  const [activeChores, setActiveChores] = useLocalStorage(
    "chore-active",
    [1, 4],
  );
  const [showManage, setShowManage] = useState(false);
  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [currentUser, setCurrentUser] = useLocalStorage("chore-user", null);

  const isSaving = useRef(false);
  const unsubRef = useRef(null);
  const sharedDataRef = useRef(null); // always holds latest sharedData
  const DOC = doc(db, "household", "shared");

  // Wrapper that keeps ref and state in sync
  const updateSharedData = useCallback((data) => {
    sharedDataRef.current = data;
    setSharedData(data);
  }, []);

  const saveShared = useCallback(async (data) => {
    isSaving.current = true;
    setSyncing(true);
    try {
      await setDoc(DOC, { data: JSON.stringify(data) });
      setLastSync(Date.now());
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
      isSaving.current = false;
    }
  }, []);

  const startListener = useCallback(() => {
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = onSnapshot(DOC, (snap) => {
      if (isSaving.current) return;
      if (snap.exists()) {
        try {
          updateSharedData(JSON.parse(snap.data().data));
        } catch {
          updateSharedData({
            completed: {},
            users: {},
            notes: {},
            chores: DEFAULT_CHORES,
            nextId: DEFAULT_CHORES.length + 1,
          });
        }
      } else {
        updateSharedData({
          completed: {},
          users: {},
          notes: {},
          chores: DEFAULT_CHORES,
          nextId: DEFAULT_CHORES.length + 1,
        });
      }
      setLastSync(Date.now());
      setLoading(false);
    });
  }, [updateSharedData]);

  useEffect(() => {
    setLoading(true);
    startListener();
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") startListener();
    };
    const onFocus = () => startListener();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [startListener]);
  useEffect(() => {
    if (!currentUser || !sharedData) return;
    if (sharedData.users && !sharedData.users[currentUser.id])
      setCurrentUser(null);
  }, [sharedData, currentUser]);

  const chores = sharedData?.chores || DEFAULT_CHORES;
  const allUsers = sharedData?.users || {};
  const month = focusDate.getMonth();
  const year = focusDate.getFullYear();

  const go = (dir) => {
    const d = new Date(focusDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setFocusDate(d);
  };

  const navLabel = () => {
    if (view === "month") return `${MONTHS[month]} ${year}`;
    if (view === "week") {
      const wk = getWeekDates(focusDate);
      const s = wk[0],
        e = wk[6];
      if (s.getMonth() === e.getMonth())
        return `${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}`;
      return `${MONTHS[s.getMonth()].slice(0, 3)} ${s.getDate()} – ${MONTHS[e.getMonth()].slice(0, 3)} ${e.getDate()}`;
    }
    return `${DAYS_FULL[focusDate.getDay()]}, ${MONTHS[month].slice(0, 3)} ${focusDate.getDate()}`;
  };

  const toggleChore = async (day, m, y, choreId) => {
    const latest = sharedDataRef.current;
    if (!currentUser || !latest) return;
    const key = `${y}-${m}-${day}-${choreId}`;
    const cur = latest.completed?.[key] || [];
    const done = cur.includes(currentUser.id);
    const updated = {
      ...latest,
      completed: {
        ...latest.completed,
        [key]: done
          ? cur.filter((id) => id !== currentUser.id)
          : [...cur, currentUser.id],
      },
    };
    updateSharedData(updated);
    await saveShared(updated);
  };

  // saveNote reads from sharedDataRef to always get the latest state,
  // preventing stale closure overwrites that would erase the note.
  const saveNote = async (day, m, y, choreId, note) => {
    const latest = sharedDataRef.current;
    if (!latest) return;
    const key = `${y}-${m}-${day}-${choreId}`;
    const notes = { ...(latest.notes || {}), [key]: note };
    if (!note.trim()) delete notes[key];
    const updated = { ...latest, notes };
    updateSharedData(updated);
    await saveShared(updated);
  };

  const addChore = async (name, icon, color) => {
    const latest = sharedDataRef.current;
    const currentChores = latest?.chores ?? DEFAULT_CHORES;
    const nextId = latest?.nextId ?? currentChores.length + 1;
    const newChore = { id: nextId, name, icon, color };
    const updated = {
      ...latest,
      chores: [...currentChores, newChore],
      nextId: nextId + 1,
      completed: latest?.completed ?? {},
      users: latest?.users ?? {},
      notes: latest?.notes ?? {},
    };
    updateSharedData(updated);
    await saveShared(updated);
    setActiveChores((prev) => [...prev, newChore.id]);
  };

  const removeChore = async (choreId) => {
    const latest = sharedDataRef.current;
    const currentChores = latest?.chores ?? DEFAULT_CHORES;
    const updated = {
      ...latest,
      chores: currentChores.filter((c) => c.id !== choreId),
      completed: latest?.completed ?? {},
      users: latest?.users ?? {},
      notes: latest?.notes ?? {},
    };
    updateSharedData(updated);
    await saveShared(updated);
    setActiveChores((prev) => prev.filter((id) => id !== choreId));
  };

  const removeUser = async (userId) => {
    const latest = sharedDataRef.current;
    const updatedUsers = { ...latest.users };
    delete updatedUsers[userId];
    const updated = { ...latest, users: updatedUsers };
    updateSharedData(updated);
    await saveShared(updated);
  };

  const clearPeriod = async () => {
    const latest = sharedDataRef.current;
    if (!latest) return;
    let keys = [];
    if (view === "month") {
      keys = Object.keys(latest.completed || {}).filter((k) =>
        k.startsWith(`${year}-${month}-`),
      );
    } else if (view === "week") {
      getWeekDates(focusDate).forEach((d) => {
        keys.push(
          ...Object.keys(latest.completed || {}).filter((k) =>
            k.startsWith(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-`),
          ),
        );
      });
    } else {
      const d = focusDate;
      keys = Object.keys(latest.completed || {}).filter((k) =>
        k.startsWith(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-`),
      );
    }
    const newCompleted = { ...latest.completed };
    keys.forEach((k) => delete newCompleted[k]);
    const updated = { ...latest, completed: newCompleted };
    updateSharedData(updated);
    await saveShared(updated);
  };

  const handleJoin = (name) => {
    const existing = Object.entries(allUsers).find(
      ([, u]) => u.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      const [id, u] = existing;
      setCurrentUser({ id, name: u.name, color: u.color });
      return;
    }
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    const user = { id, name, color };
    setCurrentUser(user);
    const updated = {
      ...sharedDataRef.current,
      users: { ...(sharedDataRef.current?.users || {}), [id]: { name, color } },
    };
    updateSharedData(updated);
    saveShared(updated);
  };
  const handleRejoin = (id, u) =>
    setCurrentUser({ id, name: u.name, color: u.color });

  const { totalDone, totalPossible } = (() => {
    if (!sharedData) return { totalDone: 0, totalPossible: 0 };
    const count = (days) =>
      days
        .flatMap(([d, m, y]) =>
          activeChores.map((id) =>
            (sharedData.completed?.[`${y}-${m}-${d}-${id}`] || []).length > 0
              ? 1
              : 0,
          ),
        )
        .reduce((a, b) => a + b, 0);
    if (view === "month") {
      const n = getDaysInMonth(month, year);
      const days = Array.from({ length: n }, (_, i) => [i + 1, month, year]);
      return { totalDone: count(days), totalPossible: n * activeChores.length };
    }
    if (view === "week") {
      const days = getWeekDates(focusDate).map((d) => [
        d.getDate(),
        d.getMonth(),
        d.getFullYear(),
      ]);
      return { totalDone: count(days), totalPossible: 7 * activeChores.length };
    }
    const d = focusDate;
    return {
      totalDone: count([[d.getDate(), d.getMonth(), d.getFullYear()]]),
      totalPossible: activeChores.length,
    };
  })();

  if (!currentUser) {
    return (
      <SetupScreen
        allUsers={allUsers}
        loading={loading}
        onJoin={handleJoin}
        onRejoin={handleRejoin}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        padding: isMobile ? "16px 12px" : "28px 20px",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;}input,textarea{outline:none;}::placeholder{color:${T.textMuted};}input,textarea{color-scheme:${T.colorScheme};}
        html,body{margin:0;padding:0;background:${T.bodyBg};transition:background 0.3s;}
        .day-cell{transition:all 0.15s ease;-webkit-tap-highlight-color:transparent;}.day-cell:hover{transform:scale(1.03);z-index:10;}.day-cell:active{transform:scale(0.97);}
        .panel-slide{animation:slideIn 0.2s ease;}@keyframes slideIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .remove-btn{opacity:0;transition:opacity 0.15s;cursor:pointer;background:none;border:none;color:#f87171;font-size:15px;padding:4px 8px;border-radius:6px;}.chore-row:hover .remove-btn{opacity:1;}
        .user-pill .remove-user-btn{opacity:0;transition:opacity 0.15s;}.user-pill:hover .remove-user-btn{opacity:1;}
        @media(max-width:639px){.remove-btn{opacity:1!important;}.user-pill .remove-user-btn{opacity:1!important;}}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:2px;}
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 18 : 28 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 6,
              color: T.textMuted,
              textTransform: "uppercase",
              marginBottom: 8,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Household Planner
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "1.9rem" : "clamp(2.2rem,5vw,3rem)",
              fontWeight: 900,
              margin: 0,
              color: T.text,
              WebkitTextFillColor: "unset",
            }}
          >
            Chore Tracker
          </h1>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: T.bgPill,
                borderRadius: 99,
                padding: "5px 12px",
                border: `1px solid ${T.border}`,
              }}
            >
              <Avatar
                name={currentUser.name}
                color={currentUser.color}
                size={20}
              />
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13,
                  color: T.text,
                  fontWeight: 500,
                }}
              >
                {currentUser.name}
              </span>
              <button
                onClick={() => setCurrentUser(null)}
                title="Switch user"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.textMuted,
                  fontSize: 13,
                  padding: "0 0 0 2px",
                  lineHeight: 1,
                }}
              >
                ⇄
              </button>
            </div>
            {Object.entries(allUsers)
              .filter(([id]) => id !== currentUser.id)
              .slice(0, isMobile ? 3 : 8)
              .map(([id, u]) => (
                <div
                  key={id}
                  className="user-pill"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    opacity: 0.6,
                    position: "relative",
                  }}
                >
                  <Avatar name={u.name} color={u.color} size={18} />
                  {!isMobile && (
                    <span
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 12,
                        color: T.textSub,
                      }}
                    >
                      {u.name}
                    </span>
                  )}
                  <button
                    className="remove-user-btn"
                    onClick={() => removeUser(id)}
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: T.removeUserBorder,
                      color: "#fff",
                      fontSize: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            <ThemeToggle
              theme={theme}
              onToggle={toggleTheme}
              compact={isMobile}
            />
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 10,
              color: T.textMuted,
              fontFamily: "'DM Sans',sans-serif",
              letterSpacing: 1,
            }}
          >
            {syncing
              ? "⏳ Saving…"
              : lastSync
                ? `✓ synced ${new Date(lastSync).toLocaleTimeString()}`
                : ""}
          </div>

          <div style={{ marginTop: 12, maxWidth: 340, margin: "12px auto 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: T.textMuted,
                fontFamily: "'DM Sans',sans-serif",
                marginBottom: 6,
              }}
            >
              <span>{totalDone} done</span>
              <span>{totalPossible - totalDone} left</span>
            </div>
            <div
              style={{
                height: 4,
                background: T.progressBg,
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: T.progressFill,
                  width: `${totalPossible ? (totalDone / totalPossible) * 100 : 0}%`,
                  transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            marginBottom: isMobile ? 12 : 16,
          }}
        >
          {["month", "week", "day"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: isMobile ? "6px 14px" : "7px 18px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: isMobile ? 12 : 13,
                fontWeight: view === v ? 600 : 400,
                background: view === v ? T.accent : T.bgCard,
                color: view === v ? "#fff" : T.textSub,
                border: `1px solid ${view === v ? T.accent : T.border}`,
                transition: "all 0.18s",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 8 : 14,
            marginBottom: isMobile ? 12 : 16,
          }}
        >
          <button
            onClick={() => go(-1)}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `1px solid ${T.border}`,
              background: T.bgCard,
              color: T.text,
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            ‹
          </button>
          <div style={{ textAlign: "center", minWidth: isMobile ? 160 : 240 }}>
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: isMobile ? 16 : 20,
                fontWeight: 700,
                color: T.text,
              }}
            >
              {navLabel()}
            </div>
          </div>
          <button
            onClick={() => go(1)}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `1px solid ${T.border}`,
              background: T.bgCard,
              color: T.text,
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            ›
          </button>
          <button
            onClick={() => setFocusDate(new Date())}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.bgCard,
              color: T.textSub,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Today
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          {chores.map((c) => (
            <button
              key={c.id}
              onClick={() =>
                setActiveChores((prev) =>
                  prev.includes(c.id)
                    ? prev.filter((x) => x !== c.id)
                    : [...prev, c.id],
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: isMobile ? "5px 10px" : "6px 14px",
                borderRadius: 99,
                border: `1.5px solid ${activeChores.includes(c.id) ? c.color + "88" : T.border}`,
                background: activeChores.includes(c.id)
                  ? c.color + "18"
                  : T.bgCard,
                color: activeChores.includes(c.id) ? T.text : T.textMuted,
                fontSize: isMobile ? 12 : 13,
                fontFamily: "'DM Sans',sans-serif",
                cursor: "pointer",
                transition: "all 0.18s",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: isMobile ? 13 : 14 }}>{c.icon}</span>
              {(!isMobile || chores.length <= 6) && <span>{c.name}</span>}
            </button>
          ))}
          <button
            onClick={() => setShowManage(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: isMobile ? "5px 10px" : "6px 14px",
              borderRadius: 99,
              border: `1.5px dashed ${T.accent}55`,
              background: "transparent",
              color: T.accent,
              fontSize: isMobile ? 12 : 13,
              fontFamily: "'DM Sans',sans-serif",
              cursor: "pointer",
              transition: "all 0.18s",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ fontSize: isMobile ? 13 : 15 }}>＋</span>
            {(!isMobile || chores.length <= 6) && <span>Add Chore</span>}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: isMobile ? 12 : 18,
          }}
        >
          <button
            onClick={clearPeriod}
            style={{
              padding: "5px 14px",
              borderRadius: 8,
              cursor: "pointer",
              border: `1px solid ${T.dangerBorder}`,
              background: T.danger,
              color: T.dangerText,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 12,
              transition: "all 0.18s",
            }}
          >
            🗑 Clear{" "}
            {view === "month"
              ? isMobile
                ? MONTHS[month].slice(0, 3)
                : MONTHS[month]
              : view === "week"
                ? "Week"
                : "Day"}
          </button>
        </div>

        <div style={{ display: view === "month" ? "block" : "none" }}>
          <MonthView
            month={month}
            year={year}
            chores={chores}
            activeChores={activeChores}
            sharedData={sharedData}
            allUsers={allUsers}
            currentUser={currentUser}
            isMobile={isMobile}
            onToggle={toggleChore}
            onSaveNote={saveNote}
          />
        </div>
        <div style={{ display: view === "week" ? "block" : "none" }}>
          <WeekView
            focusDate={focusDate}
            chores={chores}
            activeChores={activeChores}
            sharedData={sharedData}
            allUsers={allUsers}
            currentUser={currentUser}
            isMobile={isMobile}
            onToggle={toggleChore}
            onSaveNote={saveNote}
          />
        </div>
        <div style={{ display: view === "day" ? "block" : "none" }}>
          <DayView
            focusDate={focusDate}
            chores={chores}
            activeChores={activeChores}
            sharedData={sharedData}
            allUsers={allUsers}
            currentUser={currentUser}
            isMobile={isMobile}
            onToggle={toggleChore}
            onSaveNote={saveNote}
            onAddChore={() => setShowManage(true)}
          />
        </div>
      </div>

      {showManage && (
        <ManageModal
          chores={chores}
          onClose={() => setShowManage(false)}
          onAdd={addChore}
          onRemove={removeChore}
        />
      )}
    </div>
  );
}
