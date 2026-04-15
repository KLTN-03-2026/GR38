import React, { useState, useEffect } from "react";
import { Search, Clock, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

// IMPORT HÌNH ẢNH ASSETS
import imgDienBien from "../../assets/Chien-Thang-Dien-Bie.jpg";
import imgChongMy from "../../assets/khangchienchongmy.webp";
import imgBatThuoc from "../../assets/thoikybatthuoc.webp";
import imgHienDai from "../../assets/thoikyhiendai.webp";
import imgQuanChu from "../../assets/thoikyquanchu.jpg";
import imgTienSu from "../../assets/thoitiensu.jpg";

import banner1 from "../../assets/HinhChinh1.png";
import banner2 from "../../assets/Hinhchinh2.jpg";
import banner3 from "../../assets/Hinhchinh3.jpg"; 
import banner4 from "../../assets/Hinhchinh4.jpg";
import banner5 from "../../assets/Hinhchinh5.jpg";

const Documents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [banner1, banner2, banner3, banner4, banner5];

  const allDocuments = [
    { id: "dien-bien-phu", title: "Chiến tranh điện biên phủ", time: "158h50p", image: imgDienBien },
    { id: "khang-chien-chong-my", title: "Kháng chiến chống mỹ", time: "158h50p", image: imgChongMy },
    { id: "tien-su", title: "Lịch sử Việt Nam thời tiền sử", time: "158h50p", image: imgTienSu },
    { id: "quan-chu", title: "Thời kỳ quân chủ (939 – 1945)", time: "158h50p", image: imgQuanChu },
    { id: "bac-thuoc", title: "Thời Bắc thuộc (180 TCN – 938)", time: "158h50p", image: imgBatThuoc },
    { id: "hien-dai", title: "Thời kỳ hiện đại (1858 – nay)", time: "158h50p", image: imgHienDai },
  ];

  const [filteredDocs, setFilteredDocs] = useState(allDocuments);

  const handleSearch = () => {
    const results = allDocuments.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocs(results);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 10000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="flex-1 bg-[#FAFAFA] p-8 font-['Inter'] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1404px]"> 
        
        {/* Thanh tìm kiếm */}
        <div className="w-full bg-white border border-black rounded-[10px] mb-8 flex items-center justify-between h-[53px] px-[18px]">
          <div className="flex items-center bg-[#FAFAFA] border border-[#E4E4E7] rounded-[6px] px-3 py-2 w-[625px] h-[40px] gap-2">
            <Search size={16} className="text-[#9E9EA7]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm khóa học"
              className="bg-transparent border-none outline-none text-[14px] w-full text-[#71717A]"
            />
          </div>
          <button onClick={handleSearch} className="bg-[#F26739] text-white text-[14px] font-medium rounded-[6px] w-[57px] h-[36px] hover:bg-orange-600 transition-colors">
            Tìm
          </button>
        </div>

        {/* Banner */}
        <div className="w-full h-[350px] rounded-xl overflow-hidden mb-10 shadow-sm relative bg-gray-200">
          <div className="w-full h-full flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
            {banners.map((bn, index) => (
              <img key={index} src={bn} className="w-full h-full object-cover flex-shrink-0" alt="banner" />
            ))}
          </div>
        </div>

        <h2 className="text-[26px] font-bold text-black mb-8">Tài liệu của tôi</h2>
        
        {/* Grid Danh sách tài liệu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[40px] gap-y-[40px]">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-[6px] p-[10px] flex flex-col gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-full h-[180px] bg-gray-100 rounded-[6px] overflow-hidden">
                <img src={doc.image} alt={doc.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-3 px-1">
                <h3 className="text-[18px] font-semibold text-black line-clamp-1">{doc.title}</h3>
                <div className="flex items-center gap-2 text-black text-[16px]">
                  <Clock size={16} /> <span>{doc.time}</span>
                </div>
                <div className="flex gap-3 mt-2">
                  {/* NÚT BÀI GIẢNG: Chuyển sang trang BaiGiang.jsx */}
                  <button 
                    onClick={() => navigate(`/bai-giang/${doc.id}`)} 
                    className="bg-[#1473E6] text-white text-[12px] font-semibold px-4 py-2 rounded-full hover:bg-blue-700 flex-1 transition-colors"
                  >
                    Bài giảng
                  </button>
                  {/* NÚT BÀI KIỂM TRA */}
                  <button 
                    onClick={() => navigate(`/baikiemtra/${doc.id}`)}
                    className="bg-[#1473E6] text-white text-[12px] font-semibold px-4 py-2 rounded-full hover:bg-blue-700 flex-1 transition-colors"
                  >
                    Bài kiểm tra
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Phân trang */}
        <div className="mt-16 flex flex-row justify-between items-center px-[20px] w-full h-[40px] border-t border-gray-100 pt-10 mb-10">
          <span className="text-[16px] font-medium text-black">1 trang</span>
          <div className="flex flex-row items-center gap-[4px]">
            <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-gray-600">
              <ChevronLeft size={14} /> <span className="text-[14px] font-medium">Previous</span>
            </button>
            <button className="w-10 h-10 border border-[#E4E4E7] rounded-[6px] flex items-center justify-center text-[14px] font-medium text-[#F26739]">1</button>
            <div className="px-2"><MoreHorizontal size={16} className="text-gray-400" /></div>
            <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-gray-600">
              <span className="text-[14px] font-medium">Next</span> <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;