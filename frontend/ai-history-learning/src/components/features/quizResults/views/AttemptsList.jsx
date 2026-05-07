import { useNavigate } from "react-router-dom";
import { Clock, Calendar, ArrowLeft } from "lucide-react";

// ==========================================
// ATTEMPTS LIST - View 1: Danh sách các lần làm bài
// ==========================================
export default function AttemptsList({ attemptsList, onSelectAttempt }) {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(155deg,#F4F6FB 0%,#EEF2FF 100%)",
      padding: "40px 16px",
      fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
    }}>
      <style>{`
        .attempt-card {
          background: #fff; border-radius: 16px; padding: 18px;
          border: 1.5px solid #E5E7EB; margin-bottom: 14px;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .attempt-card:hover {
          transform: translateY(-3px);
          border-color: #D1D5DB;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        /* 1. MỚI THÊM: CSS CHO THANH CUỘN */
        .scroll-container {
          max-height: 65vh; 
          overflow-y: auto;
          padding-right: 8px;
        }
        .scroll-container::-webkit-scrollbar { width: 6px; }
        .scroll-container::-webkit-scrollbar-track { background: transparent; }
        .scroll-container::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        .scroll-container::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>

      <div style={{ maxWidth: 580, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", color: "#6B7280", fontWeight: 600, fontSize: 14, padding: 0, marginBottom: 16 }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1F2937", margin: 0 }}>Lịch sử làm bài</h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
            Bạn đã hoàn thành bài thi này {attemptsList.length} lần
          </p>
        </div>

        {/* 2. MỚI THÊM: BỌC DANH SÁCH TRONG DIV CUỘN */}
        <div className="scroll-container">
          {attemptsList.map((attempt, idx) => {
            const dt       = new Date(attempt.createdAt);
            const isLatest = idx === 0;
            return (
              <div key={attempt._id} className="attempt-card" onClick={() => onSelectAttempt(attempt._id)}>
                {/* Số thứ tự */}
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#FFF3EE", display: "flex", alignItems: "center", justifyContent: "center", color: "#F26739", fontWeight: 800, fontSize: 18 }}>
                  #{attemptsList.length - idx}
                </div>

                {/* Thông tin */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: "#1F2937", fontSize: 15 }}>
                      Bài làm {attemptsList.length - idx}
                    </span>
                    {isLatest && (
                      <span style={{ background: "#ECFDF5", color: "#10B981", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100 }}>
                        MỚI NHẤT
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 14, color: "#9CA3AF", fontSize: 13, fontWeight: 500 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={13} /> {dt.toLocaleDateString("vi-VN")}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={13} /> {dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Điểm */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: attempt.score >= (attempt.totalQuestions / 2) ? "#10B981" : "#F26739" }}>
                    {attempt.score}
                    <span style={{ fontSize: 14, color: "#9CA3AF" }}>/{attempt.totalQuestions}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}