import {
  IconZap, IconClipboardList, IconAlignLeft, IconBookOpen,
  IconCardStack, IconQuizCheck, IconSummary, IconLightbulb,
} from "../icons";

// ── Theme tokens ──────────────────────────────────────────────────────────────
export const THEME = {
  light: {
    sidebar:         "#f0f1f8",
    sidebar2:        "#e4e6f0",
    sbBorder:        "rgba(0,0,0,0.07)",
    sbMuted:         "rgba(0,0,0,0.38)",
    sbDim:           "rgba(0,0,0,0.55)",
    sbBright:        "rgba(0,0,0,0.85)",
    sbHover:         "rgba(0,0,0,0.05)",
    chatBg:          "#ffffff",
    surface:         "#f7f8fc",
    chatBorder:      "rgba(0,0,0,0.06)",
    msgAiBg:         "#f8f9fc",
    msgAiBorder:     "#e9eaf0",
    msgAiColor:      "#1f2937",
    inputBg:         "#f7f8fc",
    inputBorder:     "#e8e9f0",
    titleColor:      "#111111",
    subColor:        "#6b7280",
    btnBg:           "#fafafa",
    btnBorder:       "#e5e7eb",
    btnIcon:         "#6b7280",
    timeColor:       "#d1d5db",
    hintColor:       "#d1d5db",
    dialogBg:        "#ffffff",
    dialogBorder:    "rgba(0,0,0,0.06)",
    dialogTitle:     "#111111",
    dialogSub:       "#9ca3af",
    dialogInput:     "#f9fafb",
    dialogInputBdr:  "#e5e7eb",
    dialogInputClr:  "#111111",
    dialogBtnBg:     "#ffffff",
    dialogBtnBdr:    "#e5e7eb",
    dialogBtnClr:    "#6b7280",
    dialogPickBg:    "#f9fafb",
    dialogPickClr:   "#6b7280",
    dialogPickBdr:   "#e5e7eb",
    dialogOverlay:   "rgba(0,0,0,0.45)",
    okCircleBg:      "#f0fdf4",
    errCircleBg:     "#fee2e2",
    loadText:        "#374151",
    loadSub:         "#9ca3af",
    teacherBadgeBg:  "#eef2ff",
    teacherBadgeClr: "#4338ca",
  },
  dark: {
    sidebar:         "#080810",
    sidebar2:        "#111118",
    sbBorder:        "rgba(255,255,255,0.06)",
    sbMuted:         "rgba(255,255,255,0.30)",
    sbDim:           "rgba(255,255,255,0.55)",
    sbBright:        "rgba(255,255,255,0.85)",
    sbHover:         "rgba(255,255,255,0.06)",
    chatBg:          "#13131a",
    surface:         "#1a1a24",
    chatBorder:      "rgba(255,255,255,0.06)",
    msgAiBg:         "#1e1e2a",
    msgAiBorder:     "#2a2a3a",
    msgAiColor:      "#e2e4ef",
    inputBg:         "#1a1a24",
    inputBorder:     "#2a2a3a",
    titleColor:      "#f0f0f8",
    subColor:        "#8b8fa8",
    btnBg:           "#1e1e2a",
    btnBorder:       "#2a2a3a",
    btnIcon:         "#8b8fa8",
    timeColor:       "#444460",
    hintColor:       "#3a3a50",
    dialogBg:        "#1e1e2a",
    dialogBorder:    "rgba(255,255,255,0.08)",
    dialogTitle:     "#f0f0f8",
    dialogSub:       "#8b8fa8",
    dialogInput:     "#13131a",
    dialogInputBdr:  "#2a2a3a",
    dialogInputClr:  "#e2e4ef",
    dialogBtnBg:     "#13131a",
    dialogBtnBdr:    "#2a2a3a",
    dialogBtnClr:    "#8b8fa8",
    dialogPickBg:    "#13131a",
    dialogPickClr:   "#8b8fa8",
    dialogPickBdr:   "#2a2a3a",
    dialogOverlay:   "rgba(0,0,0,0.72)",
    okCircleBg:      "rgba(16,185,129,0.15)",
    errCircleBg:     "rgba(239,68,68,0.15)",
    loadText:        "#e2e4ef",
    loadSub:         "#8b8fa8",
    teacherBadgeBg:  "rgba(99,102,241,0.18)",
    teacherBadgeClr: "#a5b4fc",
  },
};

// ── Gradients ─────────────────────────────────────────────────────────────────
export const GRAD = {
  indigo:  "linear-gradient(135deg,#5b5ef4,#7c3aed)",
  amber:   "linear-gradient(135deg,#f59e0b,#ef4444)",
  emerald: "linear-gradient(135deg,#10b981,#059669)",
  pink:    "linear-gradient(135deg,#ec4899,#be185d)",
  user:    "linear-gradient(135deg,#5b5ef4,#7c3aed)",
};

// ── Quick actions ─────────────────────────────────────────────────────────────
export const QUICK_ACTIONS = [
  {
    label: "Tạo Flashcard", Icon: IconZap, cmd: "tạo flashcard", grad: GRAD.indigo,
    pill:     { color: "#4338ca", bg: "#eef2ff",               border: "#c7d2fe" },
    pillDark: { color: "#a5b4fc", bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.3)" },
  },
  {
    label: "Tạo Quiz", Icon: IconClipboardList, cmd: "tạo quiz", grad: GRAD.amber,
    pill:     { color: "#b45309", bg: "#fffbeb",               border: "#fde68a" },
    pillDark: { color: "#fbbf24", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" },
  },
  {
    label: "Tóm tắt tài liệu", Icon: IconAlignLeft, cmd: "tóm tắt", grad: GRAD.emerald,
    pill:     { color: "#065f46", bg: "#ecfdf5",               border: "#a7f3d0" },
    pillDark: { color: "#34d399", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)" },
  },
  {
    label: "Giải thích khái niệm", Icon: IconBookOpen, cmd: "giải thích khái niệm", grad: GRAD.pink,
    pill:     { color: "#9d174d", bg: "#fdf2f8",               border: "#fbcfe8" },
    pillDark: { color: "#f472b6", bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.3)" },
  },
];

// ── Action badge config ───────────────────────────────────────────────────────
export const ACTION_BADGE = {
  "Tạo Flashcard":        { Icon: IconCardStack,  color: "#534AB7", bg: "#EEEDFE", border: "#AFA9EC",  darkColor: "#a5b4fc", darkBg: "rgba(99,102,241,0.15)",  darkBorder: "rgba(99,102,241,0.35)" },
  "Tạo Quiz":             { Icon: IconQuizCheck,  color: "#0F6E56", bg: "#E1F5EE", border: "#5DCAA5",  darkColor: "#34d399", darkBg: "rgba(16,185,129,0.15)",   darkBorder: "rgba(16,185,129,0.35)" },
  "Tóm tắt":              { Icon: IconSummary,    color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7",  darkColor: "#34d399", darkBg: "rgba(16,185,129,0.15)",   darkBorder: "rgba(16,185,129,0.35)" },
  "Giải thích khái niệm": { Icon: IconLightbulb,  color: "#9d174d", bg: "#fdf2f8", border: "#f9a8d4",  darkColor: "#f472b6", darkBg: "rgba(236,72,153,0.15)",   darkBorder: "rgba(236,72,153,0.35)" },
};

// ── Global CSS ────────────────────────────────────────────────────────────────
export const GLOBAL_CSS = `
  @keyframes chatai-spin   { to{transform:rotate(360deg)} }
  @keyframes chatai-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
  @keyframes chatai-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes chatai-pulse  { 0%,100%{opacity:1} 50%{opacity:0.45} }
  @keyframes chatai-bulb   { 0%{transform:scale(1) rotate(0deg)} 30%{transform:scale(1.2) rotate(-14deg)} 65%{transform:scale(1.1) rotate(9deg)} 100%{transform:scale(1) rotate(0deg)} }
  .chatai-msg   { animation: chatai-fadein 0.2s ease }
  .chatai-hbtn:hover   { background: var(--sb-hover) !important }
  .chatai-pill:hover   { opacity: 0.82 }
  .chatai-send:hover   { opacity: 0.86 }
  .chatai-action:hover { background: var(--sb-hover) !important }
  .chatai-sb-scroll::-webkit-scrollbar { width:0 }
  .chatai-fbtn:hover   { background: var(--fbtn-hover) !important }
  .chatai-scroll::-webkit-scrollbar       { width:3px }
  .chatai-scroll::-webkit-scrollbar-track { background:transparent }
  .chatai-scroll::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius:2px }
  .chatai-input:focus-within { border-color: #5b5ef4 !important }
  .chatai-bulb { transition: background 0.2s, transform 0.15s }
  .chatai-bulb:hover  { transform: scale(1.1) }
  .chatai-bulb:active { animation: chatai-bulb 0.38s ease }
  .chatai-dialog-input:focus { border-color: #5b5ef4 !important; outline: none; }
  .chatai-dialog-pick:hover  { opacity: 0.85; }
`;