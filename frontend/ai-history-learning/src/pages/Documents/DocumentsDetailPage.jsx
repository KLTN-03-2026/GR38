import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState } from "react";

const tabs = [
  { key: "Thông tin", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { key: "Chat", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { key: "Quizz", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { key: "FlashCard", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
];

const mockChapters = [
  { id: 1, title: "Chương 1: Bối cảnh lịch sử", duration: "45p", lessons: 3, progress: 100 },
  { id: 2, title: "Chương 2: Diễn biến chính", duration: "60p", lessons: 5, progress: 60 },
  { id: 3, title: "Chương 3: Kết quả & ý nghĩa", duration: "30p", lessons: 2, progress: 0 },
];

const TAG_STYLES = {
  "Bài giảng": { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  "Bài kiểm tra": { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316" },
};

export default function DocumentsDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Thông tin");
  const [expandedChapter, setExpandedChapter] = useState(null);

  const doc = location.state?.doc ?? {
    id,
    title: "Chiến dịch Điện Biên Phủ 1954",
    duration: "158h 50p",
    img: "/anh1.jpg",
    tags: ["Bài giảng", "Bài kiểm tra"],
    description: "Tài liệu tổng hợp về chiến dịch lịch sử Điện Biên Phủ, bao gồm bối cảnh, diễn biến và ý nghĩa lịch sử của trận đánh quyết định.",
    author: "Nguyễn Văn Hùng",
    updatedAt: "12/04/2025",
    students: 128,
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8F7F4", minHeight: 0, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        .ddp-back-btn {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #6B7280; font-weight: 500;
          background: none; border: none; cursor: pointer;
          padding: 6px 10px; border-radius: 8px;
          transition: background 0.15s, color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .ddp-back-btn:hover { background: #F3F4F6; color: #111827; }

        .ddp-edit-btn {
          font-size: 13px; font-weight: 500; color: #fff;
          background: #F26739; border: none; cursor: pointer;
          padding: 7px 20px; border-radius: 10px;
          transition: background 0.15s, transform 0.1s;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.01em;
        }
        .ddp-edit-btn:hover { background: #E05530; }
        .ddp-edit-btn:active { transform: scale(0.97); }

        .ddp-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 20px; font-size: 13px; font-weight: 500;
          border: none; background: none; cursor: pointer;
          color: #9CA3AF; border-bottom: 2px solid transparent;
          margin-bottom: -1px; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .ddp-tab:hover { color: #374151; }
        .ddp-tab.active { color: #F26739; border-bottom-color: #F26739; }

        .ddp-chapter-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-radius: 12px;
          border: 1px solid #F0EDE8; background: #fff;
          cursor: pointer; transition: all 0.15s;
          gap: 12px;
        }
        .ddp-chapter-row:hover { border-color: #F26739; background: #FFFAF8; }

        .ddp-stat-card {
          display: flex; flex-direction: column; align-items: center;
          padding: 14px 20px; background: #fff;
          border: 1px solid #F0EDE8; border-radius: 14px;
          flex: 1; gap: 2px;
        }

        .ddp-progress-bar {
          height: 4px; border-radius: 999px;
          background: #F0EDE8; overflow: hidden; width: 64px;
        }
        .ddp-progress-fill {
          height: 100%; border-radius: 999px; background: #F26739;
          transition: width 0.3s ease;
        }

        .ddp-coming-soon {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 64px 24px;
          background: #fff; border: 1px solid #F0EDE8;
          border-radius: 16px; gap: 12px; text-align: center;
        }

        .ddp-action-btn {
          font-size: 13px; font-weight: 500; color: #fff;
          background: #F26739; border: none; cursor: pointer;
          padding: 10px 28px; border-radius: 10px;
          transition: background 0.15s, transform 0.1s;
          font-family: 'DM Sans', sans-serif;
        }
        .ddp-action-btn:hover { background: #E05530; }
        .ddp-action-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Sub-header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0EDE8", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="ddp-back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Trở về
        </button>
        <button className="ddp-edit-btn">Chỉnh sửa</button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Hero title */}
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#111827", marginBottom: 20, fontWeight: 400, lineHeight: 1.3 }}>
            {doc.title}
          </h1>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #F0EDE8", marginBottom: 24 }}>
            {tabs.map(({ key, icon }) => (
              <button key={key} className={`ddp-tab${activeTab === key ? " active" : ""}`} onClick={() => setActiveTab(key)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                {key}
              </button>
            ))}
          </div>

          {/* ── Tab: Thông tin ── */}
          {activeTab === "Thông tin" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Cover + meta */}
              <div style={{ background: "#fff", border: "1px solid #F0EDE8", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={doc.img}
                    alt={doc.title}
                    style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  {/* Fallback cover */}
                  <div style={{ display: "none", width: "100%", height: 220, background: "linear-gradient(135deg, #FFF0E8 0%, #FFD9C4 100%)", alignItems: "center", justifyContent: "center" }}>
                    <svg width="48" height="48" fill="none" stroke="#F26739" viewBox="0 0 24 24" opacity="0.4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  {/* Tag overlay */}
                  <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                    {doc.tags.map((tag) => {
                      const s = TAG_STYLES[tag] || { bg: "#F3F4F6", color: "#374151", dot: "#9CA3AF" };
                      return (
                        <span key={tag} style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(4px)" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {doc.description && (
                    <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.65, marginBottom: 16 }}>{doc.description}</p>
                  )}

                  {/* Stats row */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <div className="ddp-stat-card">
                      <span style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>{doc.duration}</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>Thời lượng</span>
                    </div>
                    <div className="ddp-stat-card">
                      <span style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>{mockChapters.length}</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>Chương</span>
                    </div>
                    <div className="ddp-stat-card">
                      <span style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>{doc.students ?? "—"}</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>Học sinh</span>
                    </div>
                  </div>

                  {/* Author / update */}
                  {(doc.author || doc.updatedAt) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, paddingTop: 14, borderTop: "1px solid #F9F7F4" }}>
                      {doc.author && (
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#FFF0E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="13" height="13" fill="none" stroke="#F26739" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span style={{ fontSize: 12, color: "#6B7280" }}>{doc.author}</span>
                        </div>
                      )}
                      {doc.updatedAt && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                          <svg width="12" height="12" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span style={{ fontSize: 12, color: "#9CA3AF" }}>Cập nhật {doc.updatedAt}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Chapters */}
              <div style={{ background: "#fff", border: "1px solid #F0EDE8", borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>Nội dung tài liệu</h3>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>{mockChapters.length} chương</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mockChapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="ddp-chapter-row"
                      onClick={() => setExpandedChapter(expandedChapter === ch.id ? null : ch.id)}
                    >
                      {/* Number badge */}
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "#FFF0E8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#F26739" }}>{ch.id}</span>
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 500, color: "#111827", margin: "0 0 4px" }}>{ch.title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{ch.lessons} bài học</span>
                          <span style={{ fontSize: 11, color: "#D1D5DB" }}>·</span>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{ch.duration}</span>
                        </div>
                      </div>

                      {/* Progress + chevron */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div className="ddp-progress-bar">
                            <div className="ddp-progress-fill" style={{ width: `${ch.progress}%` }} />
                          </div>
                          <span style={{ fontSize: 10, color: ch.progress === 100 ? "#10B981" : "#9CA3AF", fontWeight: 500, marginTop: 3, display: "block" }}>
                            {ch.progress === 100 ? "Hoàn thành" : ch.progress > 0 ? `${ch.progress}%` : "Chưa học"}
                          </span>
                        </div>
                        <svg
                          width="16" height="16" fill="none" stroke="#D1D5DB" viewBox="0 0 24 24"
                          style={{ transform: expandedChapter === ch.id ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Chat ── */}
          {activeTab === "Chat với AI " && (
            <div className="ddp-coming-soon">
              <div style={{ width: 52, height: 52, background: "#F3F4F6", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#374151", margin: 0 }}>Tính năng Chat</p>
              <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>Đang được phát triển, sẽ sớm ra mắt</p>
            </div>
          )}

          {/* ── Tab: Quizz ── */}
          {activeTab === "Quizz" && (
            <div className="ddp-coming-soon">
              <div style={{ width: 52, height: 52, background: "#FFF0E8", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" fill="none" stroke="#F26739" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#374151", margin: 0 }}>Ôn tập với bài kiểm tra nhanh</p>
              <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>Kiểm tra kiến thức của bạn qua các câu hỏi trắc nghiệm</p>
              <button className="ddp-action-btn" onClick={() => navigate("/teacher/quizzes")}>
                Vào làm bài
              </button>
            </div>
          )}

          {/* ── Tab: FlashCard ── */}
          {activeTab === "FlashCard" && (
            <div className="ddp-coming-soon">
              <div style={{ width: 52, height: 52, background: "#FFF0E8", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" fill="none" stroke="#F26739" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#374151", margin: 0 }}>Ôn tập với FlashCard</p>
              <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>Ghi nhớ kiến thức nhanh hơn với phương pháp FlashCard</p>
              <button className="ddp-action-btn" onClick={() => navigate("/teacher/flashcards")}>
                Xem FlashCard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}