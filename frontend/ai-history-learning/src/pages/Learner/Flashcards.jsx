import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import imgKhangChien from "../../assets/khangchienchongmy.webp";
import imgThoiTienSu from "../../assets/thoitiensu.jpg";
import imgQuanChu from "../../assets/thoikyquanchu.jpg";
import imgBacThuoc from "../../assets/thoikybatthuoc.webp";
import imgHienDai from "../../assets/thoikyhiendai.webp";
import imgDienBienPhu from "../../assets/Chien-Thang-Dien-Bie.jpg";

const FLASHCARD_DATA = [
  { id: "khang-chien-chong-my", title: "Kháng chiến chống mỹ", cards: 10, progress: 40, image: imgKhangChien },
  { id: "thoi-tien-su", title: "Lịch sử Việt Nam thời tiền sử", cards: 10, progress: 30, image: imgThoiTienSu },
  { id: "thoi-quan-chu", title: "Thời kỳ quân chủ (939 - 1945)", cards: 10, progress: 45, image: imgQuanChu },
  { id: "thoi-bac-thuoc", title: "Thời bắc thuộc (180 TCN - 938)", cards: 10, progress: 20, image: imgBacThuoc},
  { id: "thoi-ky-hien-dai", title: "Thời kỳ hiện đại (1858 - nay)", cards: 10, progress: 60, image: imgHienDai },
  { id: "dien-bien-phu", title: "Chiến tranh Điện Biên Phủ", cards: 10, progress: 15, image: imgDienBienPhu }
];

const Flashcards = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = FLASHCARD_DATA.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen flex flex-col items-center p-8 font-['Inter']">
      <div className="w-full max-w-[1400px]">
        
        {/* Thanh tìm kiếm */}
        <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] mb-10 flex items-center px-5 justify-between shadow-sm">
          <div className="flex items-center bg-[#F9F9F9] border border-gray-200 rounded-[6px] px-3 h-[38px] w-full max-w-[500px] gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bộ thẻ học..."
              className="bg-transparent border-none outline-none text-[14px] w-full text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-[#F26739] text-white text-[14px] font-semibold rounded-[6px] px-8 h-[36px] hover:bg-orange-600 transition-colors shadow-sm">
            Tìm kiếm
          </button>
        </div>

        <h1 className="text-center text-[36px] font-black mb-14 uppercase tracking-tight text-[#18181B]">
          Thư viện FlashCards
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
          {filteredData.map((item) => (
            <div key={item.id} className="flex flex-col group bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="w-full h-[210px] overflow-hidden rounded-[18px] mb-5 bg-gray-50 shadow-inner">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              
              <div className="px-2">
                <h3 className="text-[19px] font-bold mb-4 h-[54px] line-clamp-2 text-[#18181B] leading-tight">{item.title}</h3>
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-[#1473E6] text-white text-[12px] px-3 py-1 rounded-full font-bold">{item.cards} Thẻ học</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1473E6] rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }}></div>
                    </div>
                    <span className="text-[12px] font-bold text-gray-400">{item.progress}%</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/learner/hoc-flashcard`)} // Chuyển đến trang chi tiết
                  className="w-full bg-[#F26739] text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#d9562d] transition-colors shadow-lg active:scale-[0.97]"
                >
                  Bắt đầu học ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Flashcards;