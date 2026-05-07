import { IconCheck, IconX } from "./Icons";

// ==========================================
// OPTION ROW - Một dòng đáp án trong câu hỏi
// ==========================================
export default function OptionRow({ opt, isAnswer, isChosen }) {
  let bg = "#FAFAFA", border = "#F3F4F6", tc = "#9CA3AF", fw = 400, badge = null;

  if (isAnswer && isChosen) {
    bg = "#ECFDF5"; border = "#86EFAC"; tc = "#065F46"; fw = 600;
    badge = (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#10B981", background: "#D1FAE5", padding: "2px 8px", borderRadius: 100, whiteSpace: "nowrap" }}>
        <IconCheck size={11} stroke="#10B981" /> Đúng · Bạn chọn
      </span>
    );
  } else if (isAnswer) {
    bg = "#ECFDF5"; border = "#86EFAC"; tc = "#065F46"; fw = 600;
    badge = (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#10B981", background: "#D1FAE5", padding: "2px 8px", borderRadius: 100, whiteSpace: "nowrap" }}>
        <IconCheck size={11} stroke="#10B981" /> Đáp án đúng
      </span>
    );
  } else if (isChosen) {
    bg = "#FEF2F2"; border = "#FCA5A5"; tc = "#991B1B"; fw = 600;
    badge = (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#EF4444", background: "#FEE2E2", padding: "2px 8px", borderRadius: 100, whiteSpace: "nowrap" }}>
        <IconX size={11} stroke="#EF4444" /> Bạn chọn
      </span>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: bg, border: `1.5px solid ${border}`,
      borderRadius: 10, padding: "10px 14px", marginBottom: 8,
      transition: "all 0.2s",
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        background: isAnswer ? "#10B981" : isChosen ? "#EF4444" : "#E5E7EB",
        boxShadow: isAnswer ? `0 0 8px #10B98177` : isChosen ? `0 0 8px #EF444477` : "none",
      }} />
      <span style={{ flex: 1, fontSize: 13, color: tc, fontWeight: fw, lineHeight: 1.5 }}>{opt}</span>
      {badge}
    </div>
  );
}