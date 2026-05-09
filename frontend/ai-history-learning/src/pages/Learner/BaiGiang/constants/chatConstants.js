export const THEME = {
  dark: {
    sidebar: "#1a1b1e",
    sidebar2: "#25262b",
    sbBorder: "rgba(255,255,255,0.05)",
    sbBright: "#ffffff",
    sbMuted: "#909296",
    sbDim: "#c1c2c5",
    chatBg: "#141517",
    chatBorder: "rgba(255,255,255,0.06)",
    surface: "#1a1b1e",
    titleColor: "#e9ecef",
    msgAiBg: "#25262b",
    msgAiBorder: "rgba(255,255,255,0.08)",
    inputBg: "#25262b",
    inputBorder: "rgba(255,255,255,0.1)",
  },
  light: {
    sidebar: "#f8f9fa",
    sidebar2: "#ffffff",
    sbBorder: "#e9ecef",
    sbBright: "#1a1b1e",
    sbMuted: "#868e96",
    sbDim: "#495057",
    chatBg: "#ffffff",
    chatBorder: "#f1f3f5",
    surface: "#ffffff",
    titleColor: "#212529",
    msgAiBg: "#f8f9fa",
    msgAiBorder: "#e9ecef",
    inputBg: "#ffffff",
    inputBorder: "#dee2e6",
  }
};

export const GRAD = {
  indigo: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
};

export const GLOBAL_CSS = `
  @keyframes chatai-pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  .chatai-scroll::-webkit-scrollbar { width: 5px; }
  .chatai-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
`;