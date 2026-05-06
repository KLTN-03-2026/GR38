import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../lib/api";
import {
  ChevronLeft,
  Clock,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// ── Render nội dung PDF - format tự nhiên ──
function RenderChunkContent({ text }) {
  if (!text) return null;

  // Tách theo dòng trắng (đoạn văn)
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {paragraphs.map((para, i) => {
        const t = para.trim();
        if (!t) return null;

        // Danh sách bullet
        if (/^[\-\+\*•]\s/.test(t)) {
          const lines = t.split(/\n/).filter(Boolean);
          return (
            <ul
              key={i}
              style={{
                paddingLeft: "20px",
                margin: 0,
                listStyleType: "disc",
              }}
            >
              {lines.map((line, j) => (
                <li
                  key={j}
                  style={{
                    fontSize: "13px",
                    color: "#111",
                    lineHeight: 1.9,
                    marginBottom: "4px",
                  }}
                >
                  {line.replace(/^[\-\+\*•]\s*/, "")}
                </li>
              ))}
            </ul>
          );
        }

        // Danh sách số
        if (/^\d+[.\)]\s/.test(t)) {
          const lines = t.split(/\n/).filter(Boolean);
          return (
            <ol
              key={i}
              style={{
                paddingLeft: "20px",
                margin: 0,
                listStyleType: "decimal",
              }}
            >
              {lines.map((line, j) => (
                <li
                  key={j}
                  style={{
                    fontSize: "13px",
                    color: "#111",
                    lineHeight: 1.9,
                    marginBottom: "4px",
                  }}
                >
                  {line.replace(/^\d+[.\)]\s*/, "")}
                </li>
              ))}
            </ol>
          );
        }

        // Tiêu đề (ngắn, viết hoa, không kết thúc bằng dấu câu)
        const wordCount = t.split(/\s+/).length;
        const isHeading =
          wordCount <= 12 &&
          !t.endsWith(".") &&
          !t.endsWith(",") &&
          (t === t.toUpperCase() || /^[A-ZĐÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂẮẶẤẦ]/.test(t[0]));

        if (isHeading && wordCount <= 8) {
          return (
            <h3
              key={i}
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#111",
                margin: "8px 0 4px",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              {t}
            </h3>
          );
        }

        // Đoạn văn thông thường
        return (
          <p
            key={i}
            style={{
              fontSize: "13px",
              color: "#111",
              lineHeight: 1.9,
              textAlign: "justify",
              margin: 0,
            }}
          >
            {t}
          </p>
        );
      })}
    </div>
  );
}

// ── Shared UI ──
const LoadingScreen = ({ message = "Đang tải bài giảng..." }) => (
  <div className="h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center space-y-3">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  </div>
);

const ErrorScreen = ({ message, onBack }) => (
  <div className="h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
      <AlertTriangle className="w-6 h-6 text-red-400" />
    </div>
    <p className="text-sm font-medium text-gray-700">{message}</p>
    <button
      onClick={onBack}
      className="mt-2 text-sm text-[#F26739] hover:underline font-medium"
    >
      ← Quay lại
    </button>
  </div>
);

const CompletionModal = ({ title, onBack }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl w-[340px] p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100">
        <Check className="w-8 h-8 text-green-500" strokeWidth={2.5} />
      </div>
      <p className="text-lg font-bold text-gray-800 mb-1">Hoàn thành!</p>
      <p className="text-sm text-gray-400 mb-6 leading-relaxed">
        Bạn đã hoàn thành bài giảng
        <br />
        <span className="font-medium text-gray-600">"{title}"</span>
      </p>
      <button
        onClick={onBack}
        className="w-full py-2.5 rounded-xl bg-[#F26739] text-white text-sm font-semibold hover:bg-orange-600 transition"
      >
        Quay về danh sách tài liệu
      </button>
    </div>
  </div>
);

// ══════════════ MAIN PAGE ══════════════
export default function BaiGiangPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/documents/${id}`);
        const d = res.data.data;
        setDoc(d);
        if (d.status === "failed")
          return setError(
            "Tài liệu bị lỗi xử lý. Vui lòng xóa và tải lên lại.",
          );
        if (d.status === "processing")
          return setError("Tài liệu đang được xử lý. Vui lòng thử lại sau.");
        if (d.status !== "ready")
          return setError(`Trạng thái không hợp lệ: "${d.status}"`);
      } catch (err) {
        if (err.response?.status === 404) setError("Không tìm thấy tài liệu.");
        else if (err.response?.status === 401)
          setError("Phiên đăng nhập hết hạn.");
        else setError("Không thể tải nội dung bài giảng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const progress = completed ? 100 : 0;

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onBack={() => navigate(-1)} />;

  // Gộp toàn bộ nội dung từ chunks hoặc extractedText
  const rawContent = doc?.chunks?.length
    ? doc.chunks.map((c) => c.content).join("\n\n")
    : (doc?.extractedText ?? "");

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ChevronLeft size={18} /> Trở về
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() =>
              navigate(`/teacher/documents/${id}`, {
                state: { doc, activeTab: "Thông tin" },
              })
            }
            className="text-sm text-gray-400 hover:text-[#F26739] hover:underline transition-colors"
          >
            Tài liệu
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700 line-clamp-1 max-w-xs">
            {doc?.title ?? "Đang tải..."}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F26739] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* TAB HEADER */}
          <div className="bg-white border-b border-gray-100 px-6">
            <div className="flex justify-center">
              <div className="px-8 py-3 border-b-2 border-[#F26739] -mb-px">
                <span className="text-base font-extrabold text-[#F26739] uppercase tracking-widest">
                  BÀI GIẢNG
                </span>
              </div>
            </div>
          </div>

          {/* PDF VIEWER */}
          <div className="flex-1 overflow-hidden bg-[#525659] flex items-stretch">
            {doc?.filePath ? (
              <iframe
                src={`${doc.filePath}#toolbar=1&navpanes=1&view=FitH&zoom=60&sidebarsize=120`}
                 allow="fullscreen"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                }}
                title={doc?.title}
              />
            ) : (
              <div
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  textAlign: "center",
                  margin: "auto",
                }}
              >
                Không tìm thấy file PDF gốc.
              </div>
            )}
          </div>
          {/* FOOTER ACTION */}
          <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shrink-0">
            <p className="text-xs text-gray-400">
              Sau khi đọc xong, bấm hoàn thành để tiếp tục.
            </p>
            <button
              onClick={() => {
                setCompleted(true);
                setShowCompletionModal(true);
              }}
              disabled={completed}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                completed
                  ? "bg-green-50 text-green-600 border border-green-200 cursor-default"
                  : "bg-[#F26739] text-white hover:bg-orange-600"
              }`}
            >
              {completed ? (
                <>
                  <Check size={14} strokeWidth={3} /> Đã hoàn thành
                </>
              ) : (
                "Hoàn thành bài giảng ✓"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showCompletionModal && (
        <CompletionModal
          title={doc?.title ?? ""}
          onBack={() => navigate("/teacher/documents")}
        />
      )}
    </div>
  );
}
