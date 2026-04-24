// GlobalStyles.jsx
export const GlobalStyles = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(32px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(-32px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes tabFadeOut {
      from { opacity: 1; transform: translateY(0); }
      to   { opacity: 0; transform: translateY(5px); }
    }
    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes warnShake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-4px); }
      40%     { transform: translateX(4px); }
      60%     { transform: translateX(-3px); }
      80%     { transform: translateX(3px); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .anim-fade-in-up  { animation: fadeInUp 0.28s cubic-bezier(.4,0,.2,1) both; }
    .anim-scale-in    { animation: scaleIn  0.22s cubic-bezier(.4,0,.2,1) both; }
    .anim-fade-in     { animation: fadeIn   0.18s ease both; }
    .anim-slide-left  { animation: slideInLeft  0.22s cubic-bezier(.4,0,.2,1) both; }
    .anim-slide-right { animation: slideInRight 0.22s cubic-bezier(.4,0,.2,1) both; }
    .tab-fade-out     { animation: tabFadeOut 0.14s ease both; }
    .tab-fade-in      { animation: tabFadeIn  0.18s ease both; }
    .warn-shake       { animation: warnShake 0.4s ease both; }

    .quiz-card { transition: transform 0.2s cubic-bezier(.4,0,.2,1), box-shadow 0.2s, border-color 0.2s; }
    .quiz-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px -4px rgba(0,0,0,0.10); border-color: #e0ddd8; }
    .quiz-card:hover .card-thumb { transform: scale(1.03); }
    .card-thumb { transition: transform 0.35s cubic-bezier(.4,0,.2,1); }

    .option-btn { transition: background 0.15s, border-color 0.15s, transform 0.12s; }
    .option-btn:hover:not(.selected) { background: #f8f7f5; border-color: #d0cdc8; }
    .option-btn.selected { border-color: #3b82f6; background: #eff6ff; }
    .option-btn:active { transform: scale(0.99); }

    .page-btn { transition: background 0.15s, border-color 0.15s, transform 0.1s, color 0.15s; }
    .page-btn:hover { background: #f3f4f6; }
    .page-btn:active { transform: scale(0.95); }
    .page-btn.current { background: #3b82f6; color: white; border-color: #3b82f6; }
    .page-btn.answered:not(.current) { background: #eff6ff; color: #3b82f6; border-color: #bfdbfe; }

    .tab-btn { position: relative; transition: color 0.15s; }
    .tab-btn::after {
      content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
      height: 2px; background: #F26739; border-radius: 2px 2px 0 0;
      transform: scaleX(0); transition: transform 0.2s cubic-bezier(.4,0,.2,1);
    }
    .tab-btn.active::after { transform: scaleX(1); }
    .tab-btn.active { color: #F26739; font-weight: 500; }

    .primary-btn { transition: background 0.15s, transform 0.1s, box-shadow 0.15s; }
    .primary-btn:hover { background: #e05a2b !important; box-shadow: 0 4px 12px -2px rgba(242,103,57,0.35); }
    .primary-btn:active { transform: scale(0.98); }

    .ghost-btn { transition: background 0.15s, border-color 0.15s, color 0.15s; }
    .ghost-btn:hover { background: #f3f4f6; border-color: #d1d5db; }

    /* Delete overlay chỉ hiện khi hover card */
    .delete-overlay { opacity: 0; transition: opacity 0.18s; }
    .quiz-card:hover .delete-overlay { opacity: 1; }

    .nav-btn { transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s; }
    .nav-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .next-btn-ready { background: #3b82f6 !important; box-shadow: 0 2px 8px -1px rgba(59,130,246,0.35); transition: background 0.15s, box-shadow 0.15s, transform 0.1s; }
    .next-btn-ready:hover { background: #2563eb !important; }
    .next-btn-ready:active { transform: scale(0.98); }
    .next-btn-warn { background: #ef4444 !important; transition: background 0.15s; }

    .submit-btn { background: #F26739 !important; transition: background 0.15s, box-shadow 0.15s, transform 0.1s; box-shadow: 0 2px 8px -1px rgba(242,103,57,0.3); }
    .submit-btn:hover { background: #e05a2b !important; box-shadow: 0 4px 14px -2px rgba(242,103,57,0.4); }
    .submit-btn:active { transform: scale(0.98); }

    .modal-overlay { animation: fadeIn 0.18s ease both; }
    .modal-box { animation: scaleIn 0.22s cubic-bezier(.4,0,.2,1) both; }
    .progress-bar { transition: width 0.45s cubic-bezier(.4,0,.2,1); }

    .back-btn { transition: color 0.15s, transform 0.15s; }
    .back-btn:hover { color: #111827; transform: translateX(-2px); }

    .spinner { animation: spin 0.7s linear infinite; }

    .doc-select-card { transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s; }
    .doc-select-card:hover { border-color: #F26739; box-shadow: 0 4px 16px -4px rgba(242,103,57,0.2); transform: translateY(-1px); }
    .doc-select-card.selected { border-color: #F26739; background: #fff8f5; box-shadow: 0 4px 16px -4px rgba(242,103,57,0.25); }
  `}</style>
);