import { IconCheck, IconX, IconLightbulb } from "./Icons";
import OptionRow from "./OptionRow";

// ==========================================
// QUESTION CARD - Card hiển thị 1 câu hỏi + đáp án + giải thích
// ==========================================
export default function QuestionCard({ q, i, userAns, delay }) {
  const ci       = Number(q.answer);
  const answered = userAns !== undefined && userAns !== null;
  const correct  = answered && Number(userAns) === ci;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      border: `1.5px solid ${!answered ? "#E5E7EB" : correct ? "#BBF7D0" : "#FECACA"}`,
      padding: "20px 20px 16px",
      boxShadow: `0 2px 12px ${!answered ? "rgba(0,0,0,0.04)" : correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)"}`,
      animation: `slideUp 0.45s ${delay}s cubic-bezier(0.22,1,0.36,1) both`,
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
          <span style={{ background: "#F4F6FB", color: "#6B7280", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, flexShrink: 0, marginTop: 2 }}>
            {i + 1}
          </span>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1F2937", lineHeight: 1.65, margin: 0 }}>
            {q.question}
          </p>
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100, flexShrink: 0,
          background: !answered ? "#F3F4F6" : correct ? "#DCFCE7" : "#FEE2E2",
          color:      !answered ? "#6B7280"  : correct ? "#166534" : "#991B1B",
        }}>
          {!answered
            ? "Chưa làm"
            : correct
              ? <><IconCheck size={11} stroke="#166534" /> Đúng</>
              : <><IconX size={11} stroke="#991B1B" /> Sai</>
          }
        </span>
      </div>

      {/* Options */}
      {q.options.map((opt, j) => (
        <OptionRow key={j} opt={opt} isAnswer={j === ci} isChosen={j === Number(userAns)} />
      ))}

      {/* Explanation */}
      {answered && q.explanation && (
        <div style={{
          marginTop: 12, display: "flex", gap: 10,
          background: correct
            ? "linear-gradient(135deg,#ECFDF5,#D1FAE5)"
            : "linear-gradient(135deg,#FFFBEB,#FEF3C7)",
          border: `1.5px solid ${correct ? "#A7F3D0" : "#FDE68A"}`,
          borderRadius: 12, padding: "12px 14px", alignItems: "flex-start",
        }}>
          <span style={{ flexShrink: 0, marginTop: 2 }}>
            <IconLightbulb size={16} stroke={correct ? "#065F46" : "#92400E"} />
          </span>
          <div style={{ fontSize: 13, color: correct ? "#065F46" : "#92400E", lineHeight: 1.7, margin: 0 }}>
            <strong style={{ display: "block", marginBottom: 2 }}>Giải thích:</strong> {q.explanation}
          </div>
        </div>
      )}
    </div>
  );
}