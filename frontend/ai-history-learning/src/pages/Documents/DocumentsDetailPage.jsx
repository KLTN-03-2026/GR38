import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState } from "react";

const tabs = ["Thông tin", "Chat", "Quizz", "FlashCard"];

const mockChapters = [
  { id: 1, title: "Chương 1: Bối cảnh lịch sử", duration: "45p" },
  { id: 2, title: "Chương 2: Diễn biến chính", duration: "60p" },
  { id: 3, title: "Chương 3: Kết quả & ý nghĩa", duration: "30p" },
];

const DEFAULT_DOCS = {
  1: {
    title: "Chiến tranh Điện Biên Phủ",
    duration: "158h50p",
    img: "/anh6.jpg",
    tags: ["Bài giảng", "Bài kiểm tra"],
    description: "Tài liệu về chiến dịch Điện Biên Phủ",
    students: 128,
  },
};

// ============ ICONS ============
function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function IconCards() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="16" height="13" rx="2" />
      <path d="M6 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
    </svg>
  );
}

// ============ COMPONENT ============
export default function DocumentsDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const doc =
    location.state?.doc ??
    DEFAULT_DOCS[Number(id)] ?? {
      title: "Tài liệu",
      duration: "—",
      img: "/anh1.jpg",
      tags: [],
      description: "",
      students: 0,
    };

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab ?? "Thông tin"
  );

  const goToBaiGiang = () => navigate(`/teacher/baigiang/${id}`, { state: { doc } });
  const goToBaiKiemTra = () => navigate(`/teacher/baikiemtra/${id}`, { state: { doc } });

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition">
          <IconBack /> Trở về
        </button>
        <button className="flex items-center gap-2 bg-[#F26739] hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm transition">
          <IconEdit /> Chỉnh sửa
        </button>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-xl font-bold text-gray-800 mb-5">{doc.title}</h1>

        {/* TABS */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm transition border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#F26739] text-[#F26739] font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ===== THÔNG TIN ===== */}
        {activeTab === "Thông tin" && (
          <div className="space-y-4">

            {/* Ảnh + meta */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <img src={doc.img} alt={doc.title} className="w-full h-52 object-cover bg-gray-100" />
              <div className="p-4">
                {doc.description && <p className="text-sm text-gray-500 mb-3">{doc.description}</p>}
                <div className="flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><IconClock /> {doc.duration}</span>
                  <span className="flex items-center gap-1.5"><IconBook /> {mockChapters.length} chương</span>
                  <span className="flex items-center gap-1.5"><IconUser /> {doc.students ?? 0}</span>
                </div>
              </div>
            </div>

            {/* ✅ 2 CARD LỚN — bấm vào là vào thẳng */}
            <div className="grid grid-cols-2 gap-4">

              {/* Bài giảng */}
              <button
                onClick={goToBaiGiang}
                className="group relative bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg rounded-xl p-5 text-left transition-all duration-200 overflow-hidden"
              >
                {/* accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <span className="text-blue-400 translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                    <IconArrowRight />
                  </span>
                </div>

                <p className="text-sm font-bold text-gray-800 mb-1">Bài giảng</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <IconClock /> {mockChapters.length} chương · {doc.duration}
                </p>
              </button>

              {/* Bài kiểm tra */}
              <button
                onClick={goToBaiKiemTra}
                className="group relative bg-white border border-gray-200 hover:border-orange-300 hover:shadow-lg rounded-xl p-5 text-left transition-all duration-200 overflow-hidden"
              >
                {/* accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#F26739] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="#F26739" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <span className="text-orange-400 translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                    <IconArrowRight />
                  </span>
                </div>

                <p className="text-sm font-bold text-gray-800 mb-1">Bài kiểm tra</p>
                <p className="text-xs text-gray-400">Kiểm tra kiến thức</p>
              </button>

            </div>

            {/* Danh sách chương */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Danh sách chương</p>
                <button onClick={goToBaiGiang}
                  className="text-xs text-[#F26739] hover:underline font-medium">
                  Xem tất cả →
                </button>
              </div>
              {mockChapters.map((ch, i) => (
                <button key={ch.id} onClick={goToBaiGiang}
                  className={`w-full flex justify-between items-center px-4 py-3 text-sm hover:bg-orange-50 transition text-left ${
                    i !== mockChapters.length - 1 ? "border-b border-gray-100" : ""
                  }`}>
                  <span className="text-gray-700">{ch.title}</span>
                  <span className="flex items-center gap-1 text-gray-400 shrink-0 ml-2">
                    <IconClock /> {ch.duration}
                  </span>
                </button>
              ))}
            </div>

          </div>
        )}

        {/* ===== CHAT ===== */}
        {activeTab === "Chat" && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 text-gray-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm">Chat đang phát triển...</p>
          </div>
        )}

        {/* ===== QUIZZ ===== */}
        {activeTab === "Quizz" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-1">Bài kiểm tra</p>
              <p className="text-xs text-gray-400">Kiểm tra kiến thức sau khi học xong bài giảng</p>
            </div>
            <div className="p-6 flex justify-center">
              <button onClick={goToBaiKiemTra}
                className="inline-flex items-center gap-2 bg-[#F26739] hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow-md">
                Vào bài kiểm tra <IconArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* ===== FLASHCARD ===== */}
        {activeTab === "FlashCard" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-1">FlashCard</p>
              <p className="text-xs text-gray-400">Ôn tập nhanh với thẻ ghi nhớ</p>
            </div>
            <div className="p-6 flex justify-center">
              <button onClick={() => navigate("/teacher/flashcards")}
                className="inline-flex items-center gap-2 bg-[#F26739] hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow-md">
                <IconCards /> Mở FlashCard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}