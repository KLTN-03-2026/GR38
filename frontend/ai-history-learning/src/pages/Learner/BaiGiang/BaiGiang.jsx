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
        // Gọi API lấy chi tiết tài liệu
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
      <Loader2 className="animate-spin text-[#F26739]" size={48} />
      <p className="text-gray-500 font-medium">Đang tải nội dung...</p>
    </div>
  );

  if (error || !lectureData) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] gap-4 p-5 text-center">
      <AlertCircle className="text-red-500" size={60} />
      <h2 className="text-2xl font-bold text-gray-800">{error}</h2>
      <button onClick={() => navigate("/learner/documents")} className="mt-4 bg-[#F26739] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-[#d8562c] transition-all">
        Quay lại danh sách
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-5">
      {/* Header Điều hướng */}
      <div className="w-full max-w-[1113px] h-[53px] bg-white border border-gray-200 rounded-[10px] flex items-center px-[18px] mb-5 shadow-sm">
        <button onClick={() => navigate("/learner/documents")} className="flex items-center gap-2 text-[18px] font-semibold text-black hover:text-[#F26739] transition-colors">
          <ArrowLeft size={20} /> Trở về tài liệu
        </button>
      </div>

      <div className="w-full max-w-[1113px] min-h-[800px] bg-white rounded-[6px] p-[20px] flex flex-col gap-4 shadow-sm border border-gray-100 mb-10">
        <h1 className="text-[24px] md:text-[28px] font-bold text-black uppercase border-b border-gray-100 pb-4">
          {lectureData.title}
        </h1>

        {/* Tab Switcher */}
        <div className="w-full h-[50px] bg-[#F4F4F5] rounded-[6px] p-1 flex items-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 h-[42px] flex items-center justify-center rounded-[4px] text-[14px] font-bold transition-all ${
                activeTab === tab ? "bg-white shadow-sm text-[#F26739]" : "text-[#09090B] opacity-50 hover:opacity-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Nội dung các Tab */}
        <div className="w-full flex-1 bg-white pt-4 flex flex-col">
  {activeTab === "Thông tin" && (
    /* ĐIỂM QUAN TRỌNG: Cấp chiều cao cố định cho thẻ bọc ngoài (ví dụ: 75vh hoặc 800px) */
    <div className="w-full h-[75vh] min-h-[700px] flex flex-col border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <DocumentViewer 
        fileUrl={lectureData?.filePath} 
        title={lectureData?.title} 
      />
    </div>
  )}

          {/* Truyền đúng ID cho các component con */}
          {activeTab === "Chat" && <ChatAI documentId={id} />}
          {activeTab === "Quizzes" && <Quizz lessonId={id} lectureTitle={lectureData.title} />}
          {activeTab === "FlashCard" && <FlashCard documentId={id} lectureTitle={lectureData.title} />}
        </div>
      </div>
    </div>
  );
};

export default BaiGiang;