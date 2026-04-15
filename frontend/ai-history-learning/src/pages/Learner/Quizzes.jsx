import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

// IMPORT HÌNH ẢNH TỪ ASSETS
import imgDienBienPhu from "../../assets/Chien-Thang-Dien-Bie.jpg";
import imgChongMy from "../../assets/khangchienchongmy.webp";
import imgBatThuoc from "../../assets/thoikybatthuoc.webp";
import imgQuanChu from "../../assets/thoikyquanchu.jpg";
import imgHienDai from "../../assets/thoikyhiendai.webp";
import imgTienSu from "../../assets/thoitiensu.jpg";

const Quizzes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // 2. Khởi tạo hook navigate

  const quizData = [
    { id: 1, title: "Kháng chiến chống mỹ", questions: 10, img: imgChongMy },
    { id: 2, title: "Lịch sử Việt Nam thời tiền sử", questions: 10, img: imgTienSu },
    { id: 3, title: "Thời ký quân chủ (939 - 1945)", questions: 10, img: imgQuanChu },
    { id: 4, title: "Thời bắc thuộc (180 TCN - 938)", questions: 10, img: imgBatThuoc },
    { id: 5, title: "Thời kỳ hiện đại (1858 - nay)", questions: 10, img: imgHienDai },
    { id: 6, title: "Chiến tranh Điện Biên Phủ", questions: 10, img: imgDienBienPhu },
  ];

  const filteredQuizzes = quizData.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Hàm xử lý khi nhấn Bắt đầu
  const handleStartQuiz = (id) => {
    // Điều hướng sang trang HocQuizz với ID tương ứng
    // Đảm bảo bạn đã cấu hình Route trong App.js là: /hoc-quizz/:id
    navigate(`/hoc-quizz/${id}`);
  };

  return (
    <div className="p-8 w-full bg-[#FAFAFA] min-h-screen">
      {/* Search Header */}
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-xl border border-[#E4E4E7] overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-40 bg-gray-100 relative">
                <img 
                  src={quiz.img}
                  alt={quiz.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h2 className="font-bold text-lg text-gray-800 mb-3 line-clamp-2 h-14">
                  {quiz.title}
                </h2>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                    {quiz.questions} Câu hỏi
                  </span>
                  <button 
                    onClick={() => handleStartQuiz(quiz.id)} // 4. Thêm sự kiện click
                    className="bg-[#F26739] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d8562c] transition-colors"
                  >
                    Bắt đầu
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            Không tìm thấy kết quả phù hợp.
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;