import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/api/v1";

// Data mặc định
const DEFAULT_DB = {
  "khang-chien": {
    title: "Kháng chiến chống Mỹ",
    questions: [
      { q: "Ai là người lãnh đạo cuộc kháng chiến chống Mỹ giải phóng miền Nam?", a: "Chủ tịch Hồ Chí Minh là người lãnh đạo dành thắng lợi giải phóng Miền Nam Việt Nam." },
      { q: "Chiến dịch Hồ Chí Minh diễn ra vào năm nào?", a: "Chiến dịch Hồ Chí Minh diễn ra vào năm 1975, kết thúc vào ngày 30/4/1975." },
      { q: "Hiệp định Paris được ký kết vào năm nào?", a: "Hiệp định Paris được ký kết vào ngày 27/1/1973." },
    ],
  },
  "tien-su": {
    title: "Lịch sử Việt Nam thời tiền sử",
    questions: [
      { q: "Nền văn hóa tiêu biểu của thời tiền sử Việt Nam là gì?", a: "Nền văn hóa Đông Sơn, nổi tiếng với trống đồng." },
      { q: "Con người xuất hiện ở Việt Nam từ bao giờ?", a: "Khoảng 500.000 năm trước, dấu tích được tìm thấy ở hang Thẩm Khuyên, Lạng Sơn." },
      { q: "Thời kỳ đồ đá mới ở Việt Nam có đặc điểm gì nổi bật?", a: "Con người biết trồng lúa nước, làm gốm và sống định canh định cư." },
    ],
  },
  "quan-chu": {
    title: "Thời kỳ quân chủ (939 - 1945)",
    questions: [
      { q: "Triều đại nào mở đầu thời kỳ quân chủ độc lập của Việt Nam?", a: "Triều đại Ngô (939 - 965) do Ngô Quyền sáng lập sau chiến thắng Bạch Đằng năm 938." },
      { q: "Ai là người thống nhất đất nước sau thời kỳ Bắc thuộc?", a: "Ngô Quyền, sau chiến thắng quân Nam Hán trên sông Bạch Đằng năm 938." },
      { q: "Triều Nguyễn tồn tại từ năm nào đến năm nào?", a: "Triều Nguyễn tồn tại từ năm 1802 đến năm 1945." },
    ],
  },
  "bac-thuoc": {
    title: "Thời Bắc thuộc (180 TCN - 938)",
    questions: [
      { q: "Cuộc khởi nghĩa Hai Bà Trưng diễn ra vào năm nào?", a: "Năm 40 sau Công nguyên." },
      { q: "Ai lãnh đạo cuộc khởi nghĩa chống lại ách đô hộ nhà Đường?", a: "Phùng Hưng (Bố Cái Đại Vương) lãnh đạo cuộc khởi nghĩa cuối thế kỷ VIII." },
      { q: "Chiến thắng Bạch Đằng năm 938 do ai chỉ huy?", a: "Ngô Quyền chỉ huy, đánh bại quân Nam Hán, chấm dứt thời Bắc thuộc." },
    ],
  },
  "hien-dai": {
    title: "Thời kỳ hiện đại (1858 - nay)",
    questions: [
      { q: "Pháp bắt đầu xâm lược Việt Nam từ năm nào?", a: "Năm 1858, Pháp tấn công Đà Nẵng." },
      { q: "Cách mạng tháng Tám thành công vào ngày nào?", a: "Ngày 19/8/1945." },
      { q: "Việt Nam thống nhất hoàn toàn vào năm nào?", a: "Năm 1976, sau Đại hội thống nhất đất nước." },
    ],
  },
  "dien-bien-phu": {
    title: "Chiến tranh Điện Biên Phủ",
    questions: [
      { q: "Chiến dịch Điện Biên Phủ diễn ra vào thời gian nào?", a: "Từ ngày 13/3/1954 đến 7/5/1954." },
      { q: "Ai là tổng chỉ huy quân đội Việt Nam trong chiến dịch Điện Biên Phủ?", a: "Đại tướng Võ Nguyên Giáp." },
      { q: "Chiến thắng Điện Biên Phủ có ý nghĩa gì?", a: "Buộc Pháp ký Hiệp định Genève, chấm dứt chiến tranh Đông Dương." },
    ],
  },
};

const FlashcardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // 1. Bộ mặc định built-in
        if (DEFAULT_DB[id]) {
          setFlashcardSet(DEFAULT_DB[id]);
          return;
        }

        // 2. Bộ tự tạo (localStorage)
        const local = JSON.parse(localStorage.getItem("flashcards") || "[]");
        const found = local.find((item) => String(item.id) === String(id));
        if (found) {
          setFlashcardSet({
            title: found.title,
            questions: found.cards.map((c) => ({ q: c.front, a: c.back })),
          });
          return;
        }

        // 3. Bộ AI từ API
        const res = await axios.get(`${API}/flashcards/${id}`, { headers });
        const raw = res.data.data ?? res.data;
        if (raw) {
          // Chuẩn hoá — tuỳ schema backend: cards[{front,back}] hoặc items[{question,answer}]
          const cards = raw.cards ?? raw.items ?? [];
          setFlashcardSet({
            title: raw.title ?? raw.documentTitle ?? "Flashcard",
            questions: cards.map((c) => ({
              q: c.front ?? c.question ?? c.term ?? "",
              a: c.back ?? c.answer ?? c.definition ?? "",
            })),
          });
        } else {
          setFlashcardSet(null);
        }
      } catch (err) {
        console.error("Lỗi tải flashcard:", err.message);
        setFlashcardSet(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Đang tải flashcard...</p>
        </div>
      </div>
    );
  }

  if (!flashcardSet || !flashcardSet.questions?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] gap-4">
        <p className="text-[20px] font-bold text-gray-500">Không tìm thấy bộ flashcard này.</p>
        <button onClick={() => navigate("/teacher/flashcards")}
          className="bg-[#F26739] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#d9562d] transition-colors">
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const { title, questions } = flashcardSet;

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="flex flex-col items-start p-[20px_16px] gap-[20px] w-full min-h-screen bg-[#FAFAFA] font-['Inter']">

      {/* Thanh điều hướng */}
      <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] flex items-center px-[18px] shadow-sm">
        <button onClick={() => navigate("/teacher/flashcards")}
          className="text-[16px] font-semibold flex items-center gap-2 text-gray-700 hover:text-[#F26739] transition-colors">
          ← Quay lại danh sách
        </button>
      </div>

      <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-[28px] font-black mb-8 uppercase text-[#18181B] tracking-tight">
          {title}
        </h2>

        {/* Flashcard chính */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full min-h-[400px] rounded-3xl flex flex-col p-8 cursor-pointer transition-all duration-500 shadow-lg border-2 ${
            isFlipped ? "bg-[#47ED70] border-[#36BA58]" : "bg-[#F4F4F5] border-[#E4E4E7]"
          }`}
        >
          <div className="flex justify-start w-full mb-4">
            <span className={`text-[13px] px-6 py-2 rounded-full font-bold shadow-sm ${
              isFlipped ? "bg-white text-[#36BA58]" : "bg-[#1473E6] text-white"
            }`}>
              {isFlipped ? `ĐÁP ÁN ${currentIndex + 1}` : `CÂU HỎI ${currentIndex + 1}`}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
            <p className={`text-[30px] font-extrabold leading-tight max-w-[900px] ${
              isFlipped ? "text-[#064E3B]" : "text-[#18181B]"
            }`}>
              {isFlipped ? questions[currentIndex].a : questions[currentIndex].q}
            </p>
          </div>

          {!isFlipped && (
            <div className="flex justify-center mt-6">
              <div className="bg-[#F26739] text-white text-[14px] px-6 py-2.5 rounded-xl font-bold shadow-md animate-bounce text-center">
                Chạm để xem đáp án 👆
              </div>
            </div>
          )}
        </div>

        {/* Điều hướng dưới card */}
        <div className="flex justify-between items-center mt-10 px-4">
          <div className="flex flex-col">
            <span className="font-bold text-[18px] text-[#18181B]">
              {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-[13px] font-medium uppercase tracking-widest text-gray-400">
              Tiến độ
            </span>
          </div>

          <div className="flex items-center gap-8">
            <button onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 font-bold text-[16px] hover:text-[#F26739] disabled:opacity-20 transition-all">
              <ChevronLeft size={24} /> TRƯỚC
            </button>

            <div className="hidden md:flex gap-2 flex-wrap max-w-[500px] justify-center">
              {questions.map((_, i) => (
                <button key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); setIsFlipped(false); }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                    currentIndex === i
                      ? "bg-[#18181B] text-white shadow-lg"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>

            <button onClick={(e) => { e.stopPropagation(); handleNext(); }}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-2 font-bold text-[16px] hover:text-[#F26739] disabled:opacity-20 transition-all">
              TIẾP THEO <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDetail;