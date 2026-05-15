import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

import ChatAI from "./ChatAI"; 
import Quizz from "./Quizz"; 
import FlashCard from "./FlashCard"; 
import DocumentViewer from "@/components/features/documents/DocumentViewer";

const BaiGiang = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [activeTab, setActiveTab] = useState("Thông tin");
  const [lectureData, setLectureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = ["Thông tin", "Chat", "Quizzes", "FlashCard"];

  useEffect(() => {
    const fetchDetailDocument = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/documents/${id}`);
        const data = res?.data?.data || res?.data || res;
        
        if (data) {
          setLectureData(data);
        } else {
          setError("Không tìm thấy dữ liệu bài giảng.");
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết tài liệu:", err);
        setError("Có lỗi xảy ra khi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetailDocument();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] gap-4">
      <Loader2 className="animate-spin text-[#F26739]" size={40} />
      <p className="text-gray-500 text-sm font-medium">Đang tải nội dung...</p>
    </div>
  );

  if (error || !lectureData) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] gap-4 p-5 text-center">
      <AlertCircle className="text-red-500" size={48} />
      <h2 className="text-xl font-bold text-gray-800">{error}</h2>
      <button onClick={() => navigate("/learner/documents")} className="mt-2 bg-[#F26739] text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-[#d8562c] transition-all text-sm">
        Quay lại danh sách
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-3 md:p-5">
      {/* Header Điều hướng - Thu nhỏ max-width từ 1113px xuống 1000px */}
      <div className="w-full max-w-[1000px] h-[48px] bg-white border border-gray-200 rounded-[8px] flex items-center px-4 mb-4 shadow-sm">
        <button onClick={() => navigate("/learner/documents")} className="flex items-center gap-2 text-[15px] font-bold text-black hover:text-[#F26739] transition-colors">
          <ArrowLeft size={18} /> Trở về tài liệu
        </button>
      </div>

      {/* Khung nội dung chính - Thu nhỏ max-width và padding */}
      <div className="w-full max-w-[1000px] bg-white rounded-[8px] p-4 md:p-5 flex flex-col gap-4 shadow-sm border border-gray-100 mb-6">
        <h1 className="text-[20px] md:text-[24px] font-black text-black uppercase border-b border-gray-100 pb-3 tracking-tight">
          {lectureData.title}
        </h1>

        {/* Tab Switcher - Thu nhỏ chiều cao */}
        <div className="w-full h-[44px] bg-[#F4F4F5] rounded-[8px] p-1 flex items-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 h-full flex items-center justify-center rounded-[6px] text-[13px] font-black transition-all ${
                activeTab === tab ? "bg-white shadow-sm text-[#F26739]" : "text-[#09090B] opacity-50 hover:opacity-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Nội dung các Tab */}
        <div className="w-full flex-1 bg-white pt-2 flex flex-col">
          {activeTab === "Thông tin" && (
            /* Thu nhỏ chiều cao khung xem tài liệu để vừa vặn hơn */
            <div className="w-full h-[65vh] min-h-[550px] flex flex-col border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <DocumentViewer 
                fileUrl={lectureData?.filePath} 
                title={lectureData?.title} 
              />
            </div>
          )}

          {/* Các component con giữ nguyên logic truyền ID */}
          {activeTab === "Chat" && <ChatAI documentId={id} />}
          {activeTab === "Quizzes" && <Quizz lessonId={id} lectureTitle={lectureData.title} />}
          {activeTab === "FlashCard" && <FlashCard documentId={id} lectureTitle={lectureData.title} />}
        </div>
      </div>
    </div>
  );
};

export default BaiGiang;