// ── SVG base wrapper ──────────────────────────────────────────────────────────
const Ico = ({ size = 16, children, style }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    style={style}
  >
    {children}
  </svg>
);

// ════════════════════════════════════════════════════════════════════
// GENERAL UI
// ════════════════════════════════════════════════════════════════════
export const IconBack         = ({ size = 18 }) => <Ico size={size}><polyline points="15 18 9 12 15 6" /></Ico>;
export const IconArrowRight   = ({ size = 16 }) => <Ico size={size}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Ico>;
export const IconPlus         = ({ size = 16 }) => <Ico size={size}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Ico>;
export const IconX            = ({ size = 16 }) => <Ico size={size}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ico>;
export const IconCheck        = ({ size = 16 }) => <Ico size={size}><polyline points="20 6 9 17 4 12"/></Ico>;
export const IconChevronRight = ({ size = 12 }) => <Ico size={size}><polyline points="9 18 15 12 9 6"/></Ico>;
export const IconChevronsUpDown = ({ size = 13 }) => <Ico size={size}><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></Ico>;
export const IconMoreHoriz    = ({ size = 16 }) => <Ico size={size}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></Ico>;

// ════════════════════════════════════════════════════════════════════
// NAVIGATION / SIDEBAR
// ════════════════════════════════════════════════════════════════════
export const IconMessageSquare = ({ size = 15 }) => <Ico size={size}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Ico>;
export const IconRotateCcw     = ({ size = 14 }) => <Ico size={size}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></Ico>;
export const IconSearch        = ({ size = 15 }) => <Ico size={size}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Ico>;
export const IconSettings      = ({ size = 15 }) => <Ico size={size}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ico>;
export const IconFile          = ({ size = 15 }) => <Ico size={size}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></Ico>;

// ════════════════════════════════════════════════════════════════════
// CHAT CORE
// ════════════════════════════════════════════════════════════════════

// Headset — AI assistant
export const IconBot = ({ size = 15 }) => <Ico size={size}>
  <path d="M20 7a8 8 0 0 0-16 0"/>
  <rect x="2"  y="7" width="4" height="7" rx="1"/>
  <rect x="18" y="7" width="4" height="7" rx="1"/>
  <path d="M20 14v1a4 4 0 0 1-4 4h-2"/>
  <circle cx="12" cy="20" r="1"/>
</Ico>;

// Paper plane — gửi tin
export const IconSend = ({ size = 15 }) => <Ico size={size}>
  <line x1="22" y1="2" x2="11" y2="13"/>
  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
</Ico>;

// Arc spinner — loading
export const IconLoader = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: "chatai-spin 0.9s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// ════════════════════════════════════════════════════════════════════
// QUICK ACTIONS (sidebar + pill buttons)
// ════════════════════════════════════════════════════════════════════

// Card với divider — flashcard
export const IconZap = ({ size = 13, style }) => <Ico size={size} style={style}>
  <rect x="2" y="5" width="20" height="14" rx="2"/>
  <line x1="2" y1="10" x2="22" y2="10"/>
</Ico>;

// Clipboard — quiz
export const IconClipboardList = ({ size = 13, style }) => <Ico size={size} style={style}>
  <rect x="8" y="2" width="8" height="4" rx="1"/>
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  <line x1="12" y1="11" x2="16" y2="11"/>
  <line x1="12" y1="16" x2="16" y2="16"/>
  <line x1="8"  y1="11" x2="8.01" y2="11"/>
  <line x1="8"  y1="16" x2="8.01" y2="16"/>
</Ico>;

// Lines — tóm tắt
export const IconAlignLeft = ({ size = 13, style }) => <Ico size={size} style={style}>
  <line x1="17" y1="10" x2="3" y2="10"/>
  <line x1="21" y1="6"  x2="3" y2="6"/>
  <line x1="21" y1="14" x2="3" y2="14"/>
  <line x1="17" y1="18" x2="3" y2="18"/>
</Ico>;

// Open book — giải thích
export const IconBookOpen = ({ size = 13, style }) => <Ico size={size} style={style}>
  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
</Ico>;

// ════════════════════════════════════════════════════════════════════
// ACTION RESULT BADGES (chip trong AI message)
// ════════════════════════════════════════════════════════════════════

// Stacked cards — Flashcard badge
export const IconCardStack = ({ size = 13, style }) => <Ico size={size} style={style}>
  <rect x="3" y="7" width="15" height="11" rx="2"/>
  <path d="M6 7V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
</Ico>;

// Clipboard with checkmarks — Quiz badge
export const IconQuizCheck = ({ size = 13, style }) => <Ico size={size} style={style}>
  <rect x="8" y="2" width="8" height="4" rx="1"/>
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  <polyline points="9 12 11 14 15 10"/>
  <polyline points="9 17 11 19 15 15"/>
</Ico>;

// Summary with highlight line — Tóm tắt badge
export const IconSummary = ({ size = 13, style }) => <Ico size={size} style={style}>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
  <polyline points="14 2 14 8 20 8"/>
  <line x1="9" y1="13" x2="15" y2="13"/>
  <line x1="9" y1="17" x2="13" y2="17"/>
</Ico>;

// Lightbulb — Giải thích badge
export const IconLightbulb = ({ size = 13, style }) => <Ico size={size} style={style}>
  <path d="M9 21h6"/>
  <path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V18H9v-3.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z"/>
</Ico>;

// ════════════════════════════════════════════════════════════════════
// BUBBLE ACTIONS (feedback row dưới AI message)
// ════════════════════════════════════════════════════════════════════
export const IconThumbUp = ({ size = 12 }) => <Ico size={size}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></Ico>;
export const IconCopy    = ({ size = 12 }) => <Ico size={size}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Ico>;
export const IconRefresh = ({ size = 12 }) => <Ico size={size}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></Ico>;

// ════════════════════════════════════════════════════════════════════
// FEATURE TABS
// ════════════════════════════════════════════════════════════════════
export const IconQuiz  = ({ size = 18 }) => <Ico size={size}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></Ico>;
export const IconCards = ({ size = 18 }) => <Ico size={size}><rect x="2" y="7" width="16" height="13" rx="2"/><path d="M6 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/></Ico>;
export const IconChat  = ({ size = 18 }) => <Ico size={size}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Ico>;
export const IconImage = ({ size = 20 }) => <Ico size={size}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Ico>;
export const IconEdit  = ({ size = 16 }) => <Ico size={size}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Ico>;
export const IconTrash = ({ size = 16 }) => <Ico size={size}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Ico>;

// ════════════════════════════════════════════════════════════════════
// EMPTY STATE HELPER
// ════════════════════════════════════════════════════════════════════
export const EmptyState = ({ icon, message, sub }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
    justifyContent:"center", padding:"4rem 0", gap:"0.75rem", color:"#9ca3af" }}>
    <div style={{ width:56, height:56, borderRadius:16, background:"#f9fafb",
      border:"0.5px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center" }}>
      {icon}
    </div>
    <p style={{ fontSize:14, fontWeight:500, color:"#6b7280", margin:0 }}>{message}</p>
    {sub && <p style={{ fontSize:12, color:"#9ca3af", margin:0 }}>{sub}</p>}
  </div>
);