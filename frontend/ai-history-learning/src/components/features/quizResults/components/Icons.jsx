// ==========================================
// ICONS - Tất cả SVG icons dùng chung
// ==========================================

export const IconCheck = ({ size = 16, stroke = "#065F46", strokeWidth = 2.2 }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export const IconX = ({ size = 16, stroke = "#991B1B", strokeWidth = 2.2 }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const IconClipboard = ({ size = 20, stroke = "#374151" }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

export const IconLightbulb = ({ size = 16, stroke = "#92400E" }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

export const IconWarning = ({ size = 15, stroke = "#9CA3AF" }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);