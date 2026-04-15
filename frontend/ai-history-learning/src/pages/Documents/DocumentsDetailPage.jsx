import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState } from "react";

const tabs = ["Thông tin", "Chat", "Quizz", "FlashCard"];

const mockChapters = [
  { id: 1, title: "Chương 1: Bối cảnh lịch sử", duration: "45p", lessons: 3 },
  { id: 2, title: "Chương 2: Diễn biến chính", duration: "60p", lessons: 5 },
  { id: 3, title: "Chương 3: Kết quả & ý nghĩa", duration: "30p", lessons: 2 },
];

export default function DocumentsDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Thông tin");

  const doc = location.state?.doc ?? {
    id,
    title: "Tài liệu lịch sử",
    duration: "158h50p",
    img: "/anh1.jpg",
    tags: ["Bài giảng", "Bài kiểm tra"],
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-0">

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Trở về
        </button>
        <button className="bg-[#F26739] hover:bg-orange-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
          Chỉnh sửa
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl w-full mx-auto">

          <h1 className="text-xl font-semibold text-gray-800 mb-5">{doc.title}</h1>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-[#F26739] text-[#F26739] font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab: Thông tin */}
          {activeTab === "Thông tin" && (
            <div className="space-y-5">

              {/* Thumbnail + meta */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <img src={doc.img} alt={doc.title} className="w-full h-52 object-cover" />
                <div className="p-4">
                  <h2 className="text-base font-semibold text-gray-800 mb-2">{doc.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {doc.duration}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          tag === "Bài giảng" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chapters */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Nội dung tài liệu</h3>
                <div className="space-y-3">
                  {mockChapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-blue-600">{ch.id}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{ch.title}</p>
                          <p className="text-xs text-gray-400">{ch.lessons} bài học</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {ch.duration}
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Chat */}
          {activeTab === "Chat" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
              Tính năng chat đang được phát triển
            </div>
          )}

          {/* Tab: Quizz */}
          {activeTab === "Quizz" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500 mb-4">Ôn tập với bài kiểm tra nhanh</p>
              <button
                onClick={() => navigate("/teacher/quizzes")}
                className="bg-[#F26739] hover:bg-orange-600 text-white text-sm px-6 py-2 rounded-lg transition-colors"
              >
                Vào làm bài
              </button>
            </div>
          )}

          {/* Tab: FlashCard */}
          {activeTab === "FlashCard" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500 mb-4">Ôn tập với FlashCard</p>
              <button
                onClick={() => navigate("/teacher/flashcards")}
                className="bg-[#F26739] hover:bg-orange-600 text-white text-sm px-6 py-2 rounded-lg transition-colors"
              >
                Xem FlashCard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}