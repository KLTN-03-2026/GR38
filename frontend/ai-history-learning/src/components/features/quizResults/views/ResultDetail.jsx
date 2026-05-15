import FloatingOrbs from "../components/FloatingOrbs";
import Particles    from "../components/Particles";
import PercentRing  from "../components/PercentRing";
import AnimNum      from "../components/AnimNum";
import QuestionCard from "../components/QuestionCard";
import { IconCheck, IconX, IconClipboard } from "../components/Icons";

// ==========================================
// RESULT DETAIL - View 2: Chi tiết kết quả đúng / sai
// ==========================================
export default function ResultDetail({ apiDetail, loading, mounted, showDetailQuestions, setShowDetailQuestions, onBack }) {
  const fs = apiDetail.score;
  const ft = apiDetail.total;
  const fa = apiDetail.answered;

  const done   = fa > 0;
  const pct    = fa === 0 ? 0 : Math.round((fs / ft) * 100);
  const color  = !done ? "#EF4444" : pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";
  const heroBg = !done
    ? "linear-gradient(140deg,#FEF2F2,#FECACA22)"
    : pct >= 80
      ? "linear-gradient(140deg,#ECFDF5,#D1FAE522)"
      : pct >= 50
        ? "linear-gradient(140deg,#FFFBEB,#FEF3C722)"
        : "linear-gradient(140deg,#FEF2F2,#FECACA22)";

  const msg = !done
    ? { h: "Chưa hoàn thành bài",           s: "Hãy thử lại nhé!" }
    : pct === 100
      ? { h: "Xuất sắc! Hoàn hảo tuyệt đối!", s: "Bạn đã trả lời đúng tất cả câu hỏi 🎉" }
      : pct >= 80
        ? { h: "Rất tốt! Gần hoàn hảo rồi!",   s: "Kiến thức của bạn rất vững chắc 💪" }
        : pct >= 50
          ? { h: "Khá tốt! Cố lên nhé!",          s: "Ôn lại một chút nữa là giỏi thôi 📚" }
          : { h: "Cần cố gắng thêm!",              s: "Xem lại bài và thử lại bạn nhé 🔄" };

  const answersMap = apiDetail.questions?.reduce((a, q, i) => {
    if (q.userAnswer != null) a[i] = Number(q.userAnswer);
    return a;
  }, {}) || {};

  const stats = [
    { label: "Hoàn thành", val: fa,      icon: <IconClipboard size={20} stroke="#374151" />,                     iconBg: "rgba(243,244,246,0.8)", bg: "rgba(255,255,255,0.75)",   tc: "#374151", delay: "0s"    },
    { label: "Câu đúng",   val: fs,      icon: <IconCheck size={20} stroke="#065F46" strokeWidth={2.2} />,       iconBg: "rgba(209,250,229,0.8)", bg: "rgba(209,250,229,0.65)",   tc: "#065F46", delay: "0.06s" },
    { label: "Câu sai",    val: fa - fs, icon: <IconX     size={20} stroke="#991B1B" strokeWidth={2.2} />,       iconBg: "rgba(254,226,226,0.8)", bg: "rgba(254,226,226,0.65)",   tc: "#991B1B", delay: "0.12s" },
  ];

  return (
    <>
      <style>{`
        @keyframes slideUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes orbFloat { from{transform:translateY(0) scale(1)} to{transform:translateY(-18px) scale(1.06)} }
        @keyframes burst    { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0);opacity:0} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes badgePop { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
        @keyframes statIn   { from{opacity:0;transform:translateY(16px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
        .qr-stat    { flex:1; border-radius:16px; padding:16px 12px; text-align:center; backdrop-filter:blur(4px); transition:transform 0.2s; }
        .qr-stat:hover { transform:translateY(-4px); }
        .qr-toggle  { width:100%; border:1.5px solid #E5E7EB; background:#fff; border-radius:14px; padding:13px 20px; font-size:14px; font-weight:600; color:#374151; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; margin-bottom:14px; font-family:inherit; }
        .qr-toggle:hover { background:#F9FAFB; border-color:#D1D5DB; transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.06); }
        .qr-back    { width:100%; border:none; border-radius:14px; padding:16px 20px; font-size:15px; font-weight:700; color:#fff; cursor:pointer; font-family:inherit; letter-spacing:0.02em; background:linear-gradient(135deg,#F26739 0%,#f9874a 100%); box-shadow:0 4px 18px rgba(242,103,57,0.32); transition:all 0.25s; }
        .qr-back:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(242,103,57,0.42); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(155deg,#F4F6FB 0%,#EEF2FF 100%)", padding: "28px 16px 52px", fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>

          {/* Loading indicator nhỏ */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 14, color: "#9CA3AF", fontSize: 12 }}>
              <div style={{ width: 14, height: 14, border: "2px solid #F26739", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              Đang tải chi tiết...
            </div>
          )}

          {/* ---- HERO SECTION ---- */}
          <div style={{
            position: "relative", background: heroBg, borderRadius: 24,
            padding: "36px 28px 30px", marginBottom: 14, textAlign: "center",
            overflow: "hidden",
            boxShadow: `0 8px 40px ${color}1A, 0 2px 8px rgba(0,0,0,0.05)`,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.5s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)",
          }}>
            {/* Top color bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, borderRadius: "24px 24px 0 0", background: `linear-gradient(90deg,${color},${color}66)` }} />

            <FloatingOrbs color={color} />
            <Particles active={done && pct >= 80} />

            {/* Badge hoàn thành */}
            <div style={{ marginBottom: 20, animation: "badgePop 0.55s 0.15s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "6px 18px", borderRadius: 100, color: "#fff", letterSpacing: "0.04em", background: done ? "#10B981" : "#EF4444", boxShadow: `0 4px 16px ${done ? "#10B98155" : "#EF444455"}` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.65)" }} />
                {done ? "Hoàn Thành" : "Không Hoàn Thành"}
              </span>
            </div>

            {/* Percent Ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
              <PercentRing percent={pct} color={color} />
            </div>

            {/* Message */}
            <div style={{ marginBottom: 22, animation: "slideUp 0.5s 0.3s cubic-bezier(0.22,1,0.36,1) both" }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#1F2937", marginBottom: 5 }}>{msg.h}</p>
              <p style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{msg.s}</p>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, animation: "slideUp 0.5s 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
              {stats.map((s, i) => (
                <div key={i} className="qr-stat" style={{ background: s.bg, animation: `statIn 0.5s ${s.delay} cubic-bezier(0.22,1,0.36,1) both` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.tc, lineHeight: 1 }}>
                    <AnimNum to={s.val} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: s.tc, opacity: 0.65, marginTop: 5 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, marginTop: 18 }}>{apiDetail.quizTitle}</p>
          </div>

          {/* ---- TOGGLE CHI TIẾT ---- */}
          <button className="qr-toggle" onClick={() => setShowDetailQuestions(p => !p)} disabled={loading}>
            <svg
              style={{ transform: showDetailQuestions ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
              width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {showDetailQuestions ? "Ẩn chi tiết" : "Xem chi tiết đúng / sai"}
            {!showDetailQuestions && apiDetail.questions?.length > 0 && (
              <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 700, background: "#F3F4F6", color: "#6B7280", padding: "2px 8px", borderRadius: 100 }}>
                {apiDetail.questions.length} câu
              </span>
            )}
          </button>

          {/* ---- DANH SÁCH CÂU HỎI ---- */}
          {showDetailQuestions && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
              {apiDetail.questions?.map((q, i) => (
                <QuestionCard key={i} q={q} i={i} userAns={answersMap[i]} delay={i * 0.045} />
              ))}
            </div>
          )}

          <button className="qr-back" onClick={onBack}>
            Quay lại danh sách các bài làm
          </button>

        </div>
      </div>
    </>
  );
}