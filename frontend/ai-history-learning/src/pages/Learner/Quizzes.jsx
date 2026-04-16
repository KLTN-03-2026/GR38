import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import imgChongMy from "../../assets/khangchienchongmy.webp";
import imgTienSu from "../../assets/thoitiensu.jpg";
import imgQuanChu from "../../assets/thoikyquanchu.jpg";
import imgBatThuoc from "../../assets/thoikybatthuoc.webp";
import imgHienDai from "../../assets/thoikyhiendai.webp";
import imgDienBienPhu from "../../assets/Chien-Thang-Dien-Bie.jpg";

const Quizzes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const quizData = [
    { id: "khang-chien-chong-my", title: "Kháng chiến chống mỹ", questions: 10, img: imgChongMy },
    { id: "thoi-tien-su", title: "Lịch sử Việt Nam thời tiền sử", questions: 10, img: imgTienSu },
    { id: "thoi-quan-chu", title: "Thời kỳ quân chủ (939 - 1945)", questions: 10, img: imgQuanChu },
    { id: "thoi-bac-thuoc", title: "Thời bắc thuộc (180 TCN - 938)", questions: 10, img: imgBatThuoc },
    { id: "thoi-ky-hien-dai", title: "Thời kỳ hiện đại (1858 - nay)", questions: 10, img: imgHienDai },
    { id: "dien-bien-phu", title: "Chiến tranh Điện Biên Phủ", questions: 10, img: imgDienBienPhu },
  ];

  const filteredQuizzes = quizData.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartQuiz = (id) => {
    navigate(`/learner/hoc-quizz/${id}`);
  };

  return (
    <div className="p-8 w-full bg-[#FAFAFA] min-h-screen font-['Inter']">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-xl border border-[#E4E4E7] shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Câu hỏi ôn tập</h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm bài ôn tập..."
            className="w-full pl-10 pr-4 py-2 bg-[#F4F4F5] border-none rounded-lg outline-none focus:ring-2 focus:ring-[#F26739]/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid danh sách Quiz */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-xl border border-[#E4E4E7] overflow-hidden hover:shadow-lg transition-all group">
            <div className="h-44 bg-gray-100 relative">
              <img 
                src={quiz.img} 
                alt={quiz.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                onError={(e) => e.target.src = "https://via.placeholder.com/400x200?text=History"}
              />
            </div>
            <div className="p-5">
              <h2 className="font-bold text-lg text-gray-800 mb-3 line-clamp-2 h-14 uppercase">{quiz.title}</h2>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{quiz.questions} Câu hỏi</span>
                <button 
                  onClick={() => handleStartQuiz(quiz.id)} 
                  className="bg-[#F26739] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#d8562c] transition-all shadow-md active:scale-95"
                >
                  Bắt đầu
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quizzes;