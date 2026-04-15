import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// 1. IMPORT CÁC COMPONENT CON (Đã thêm FlashCard)
import ChatAI from "./ChatAI"; 
import Quizz from "./Quizz"; 
import FlashCard from "./FlashCard"; 

// DỮ LIỆU GIẢ (MOCK DATA)
const MOCK_LECTURE_DATA = {
  "dien-bien-phu": {
    id: "dien-bien-phu",
    title: "Chiến tranh điện biên phủ",
    contentTitle: "Trận Chiến Điện Biên Phủ",
    tabs: ["Thông tin", "Chat", "Quizzes", "FlashCard"],
    content: {
      text: `Trận Điện Biên Phủ (tiếng Pháp: Bataille de Diên Biên Phu; phát âm [bataj də djɛ̃ bjɛ̃ fy]), còn gọi là Chiến dịch Điện Biên Phủ, là trận đánh lớn nhất trong Chiến tranh Đông Dương lần thứ nhất diễn ra tại lòng chảo Mường Thanh... \n\nĐây là chiến thắng quân sự lớn nhất trong cuộc Chiến tranh Đông Dương (1945 – 1954) của Việt Nam. Với thắng lợi quyết định này, lực lượng Quân đội Nhân dân Việt Nam do Đại tướng Võ Nguyên Giáp chỉ huy đã buộc quân đội Pháp và Quốc Gia Việt Nam tại Điện Biên Phủ phải đầu hàng vào ngày 7 tháng 5 năm 1954.`,
    }
  }
};

const BaiGiang = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [activeTab, setActiveTab] = useState("Thông tin");
  const [lectureData, setLectureData] = useState(null);

  useEffect(() => {
    // Tìm dữ liệu theo ID, nếu không có thì lấy mặc định bài Điện Biên Phủ
    const data = MOCK_LECTURE_DATA[id] || MOCK_LECTURE_DATA["dien-bien-phu"];
    setLectureData(data);
  }, [id]);

  if (!lectureData) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-5 font-['Inter']">
      
      {/* 1. Nút Trở về */}
      <div className="w-full max-w-[1134px] h-[53px] bg-white border-[0.1px] border-black rounded-[10px] flex items-center px-[18px] mb-5 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[26px] font-normal leading-[20px] text-black hover:opacity-60 transition-all"
        >
          <ArrowLeft size={28} /> Trở về
        </button>
      </div>

      {/* 2. Khung chứa chính */}
      <div className="w-full max-w-[1113px] min-h-[1071px] bg-white rounded-[6px] p-[10px] flex flex-col gap-4 shadow-md mb-10">
        
        {/* Tiêu đề bài học */}
        <div className="w-full h-[40px] flex items-center px-2">
          <h1 className="text-[26px] font-semibold leading-[20px] text-black uppercase">
            {lectureData.title}
          </h1>
        </div>

        {/* 3. Thanh Tabs */}
        <div className="w-full max-w-[1081px] h-[50px] bg-[#F4F4F5] rounded-[6px] p-1 flex items-center mx-auto">
          {lectureData.tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 h-[42px] flex items-center justify-center rounded-[4px] text-[14px] font-medium transition-all duration-300 ${
                activeTab === tab 
                ? "bg-white shadow-sm text-[#09090B]" 
                : "text-[#09090B] opacity-50 hover:opacity-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. Vùng hiển thị nội dung động */}
        <div className="w-full flex-1 bg-white flex flex-col items-center py-6">
          
          {/* TAB THÔNG TIN */}
          {activeTab === "Thông tin" && (
            <div className="relative w-full max-w-[1051px] min-h-[883px] bg-black flex justify-center items-start pt-10 rounded-sm overflow-y-auto">
              <div className="w-full max-w-[711px] min-h-[821px] bg-white shadow-2xl p-14 mb-10">
                <h2 className="text-[22px] font-bold text-center mb-10 leading-[27px] border-b pb-4">
                  {lectureData.contentTitle}
                </h2>
                <div className="text-[17px] font-medium leading-[26px] text-justify whitespace-pre-line text-black">
                  {lectureData.content.text}
                </div>
              </div>
            </div>
          )}

          {/* TAB CHAT AI */}
          {activeTab === "Chat" && (
            <div className="w-full px-2">
               <ChatAI />
            </div>
          )}

          {/* TAB QUIZZES */}
          {activeTab === "Quizzes" && (
            <div className="w-full h-full">
              <Quizz lessonId={id} /> 
            </div>
          )}

          {/* TAB FLASHCARD (Lỗi đã được sửa ở đây) */}
          {activeTab === "FlashCard" && (
            <div className="w-full h-full">
              <FlashCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaiGiang;