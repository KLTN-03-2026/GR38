import React, { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Baikiemtra = () => {
  const navigate = useNavigate();
  
  // --- DATA GIẢ ---
  const questionsData = [
    { id: 1, question: "Chiến dịch Điện Biên Phủ kết thúc vào năm nào?", options: ["Năm 1999", "Năm 2026", "Năm 1954", "Năm 1991"], correct: "Năm 1954" },
    { id: 2, question: "Chiến thắng Điện Biên Phủ kết thúc vào ngày nào?", options: ["6/5/1954", "7/5/1954", "8/5/1954", "9/5/1954"], correct: "7/5/1954" },
    { id: 3, question: "Ai là Tổng chỉ huy quân đội Việt Nam trong chiến dịch?", options: ["Trường Chinh", "Võ Nguyên Giáp", "Hồ Chí Minh", "Phạm Văn Đồng"], correct: "Võ Nguyên Giáp" },
    { id: 4, question: "Đối thủ chính của quân đội Việt Nam là nước nào?", options: ["Mỹ", "Pháp", "Nhật", "Anh"], correct: "Pháp" },
    { id: 5, question: "Tướng chỉ huy quân Pháp tại Điện Biên Phủ là ai?", options: ["Salan", "De Castries", "Navarre", "Bigeard"], correct: "De Castries" },
    { id: 6, question: "Chiến dịch Điện Biên Phủ thuộc cuộc kháng chiến nào?", options: ["Kháng chiến chống Mỹ", "Kháng chiến chống Pháp", "Kháng chiến chống Nhật", "Nội chiến"], correct: "Kháng chiến chống Pháp" },
    { id: 7, question: "Điện Biên Phủ thuộc khu vực nào của Việt Nam?", options: ["Đồng bằng Bắc Bộ", "Tây Nguyên", "Tây Bắc", "Nam Bộ"], correct: "Tây Bắc" },
    { id: 8, question: "Phương châm tác chiến của ta trong chiến dịch là gì?", options: ["Đánh nhanh thắng nhanh", "Đánh chắc tiến chắc", "Phòng thủ là chính", "Rút lui chiến lược"], correct: "Đánh chắc tiến chắc" },
    { id: 9, question: "Chiến dịch Điện Biên Phủ kéo dài bao nhiêu ngày?", options: ["45 ngày", "56 ngày", "60 ngày", "30 ngày"], correct: "56 ngày" },
    { id: 10, question: "Chiến thắng Điện Biên Phủ có ý nghĩa gì?", options: ["Mở đầu chiến tranh", "Kết thúc chiến tranh Đông Dương lần thứ nhất", "Thống nhất đất nước", "Bắt đầu công nghiệp hóa"], correct: "Kết thúc chiến tranh Đông Dương lần thứ nhất" },
    { id: 11, question: "Hội nghị nào được ký kết sau chiến thắng?", options: ["Hội nghị Paris", "Hội nghị Genève", "Hội nghị Potsdam", "Hội nghị Versailles"], correct: "Hội nghị Genève" },
    { id: 12, question: "Ai là Chủ tịch nước Việt Nam thời điểm đó?", options: ["Hồ Chí Minh", "Tôn Đức Thắng", "Võ Nguyên Giáp", "Lê Duẩn"], correct: "Hồ Chí Minh" },
    { id: 13, question: "Chiến dịch Điện Biên Phủ gồm mấy đợt tấn công?", options: ["2 đợt", "3 đợt", "4 đợt", "5 đợt"], correct: "3 đợt" },
    { id: 14, question: "Cứ điểm quan trọng nhất của Pháp là gì?", options: ["Him Lam", "Độc Lập", "Mường Thanh", "Hồng Cúm"], correct: "Mường Thanh" },
    { id: 15, question: "Lực lượng tham gia chiến dịch chủ yếu là gì?", options: ["Hải quân", "Không quân", "Bộ binh", "Cảnh sát"], correct: "Bộ binh" },
    { id: 16, question: "Chiến thuật nổi bật của quân ta là gì?", options: ["Đánh du kích", "Không chiến", "Bao vây, đánh lấn", "Rút lui"], correct: "Bao vây, đánh lấn" },
    { id: 17, question: "Chiến thắng Điện Biên Phủ được gọi là gì?", options: ["Trận chiến thế kỷ", "Lừng lẫy năm châu, chấn động địa cầu", "Cuộc chiến vĩ đại", "Trận đánh cuối cùng"], correct: "Lừng lẫy năm châu, chấn động địa cầu" },
    { id: 18, question: "Mục tiêu chính của Pháp khi xây dựng cứ điểm này?", options: ["Phòng thủ", "Tiêu diệt chủ lực Việt Minh", "Chiếm miền Nam", "Bảo vệ thủ đô"], correct: "Tiêu diệt chủ lực Việt Minh" },
    { id: 19, question: "Yếu tố góp phần quan trọng vào chiến thắng?", options: ["Vũ khí hiện đại", "Tinh thần chiến đấu và chiến thuật", "Hỗ trợ từ Mỹ", "Thời tiết thuận lợi"], correct: "Tinh thần chiến đấu và chiến thuật" },
    { id: 20, question: "Chiến thắng ảnh hưởng thế nào đến thế giới?", options: ["Không ảnh hưởng", "Chỉ trong nước", "Cổ vũ giải phóng dân tộc", "Gây chiến tranh thế giới"], correct: "Cổ vũ giải phóng dân tộc" },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [tempAnswer, setTempAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      setIsSubmitted(true);
    }
  }, [timeLeft, isSubmitted]);

  useEffect(() => {
    setTempAnswer(answers[currentIdx] || null);
    setSaveStatus(null);
  }, [currentIdx, answers]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSaveAnswer = () => {
    if (isSubmitted) return;
    if (!tempAnswer) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2000);
      return;
    }
    setSaveStatus('saving');
    setTimeout(() => {
      setAnswers({ ...answers, [currentIdx]: tempAnswer });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    }, 600);
  };

  const handleSubmit = () => {
    const confirmSubmit = window.confirm("Bạn có chắc chắn muốn nộp bài?");
    if (confirmSubmit) setIsSubmitted(true);
  };

  const calculateScore = () => {
    let score = 0;
    questionsData.forEach((q, index) => {
      if (answers[index] === q.correct) score++;
    });
    return score;
  };

  if (isSubmitted) {
    const score = calculateScore();
    return (
        <div className="p-8 bg-[#FAFAFA] min-h-screen font-['Inter']">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-2xl font-bold mb-2">Kết Quả Bài Kiểm Tra</h1>
            <p className="text-gray-500 mb-6">Tài liệu &gt; Bài Kiểm Tra &gt; Kết Quả</p>
            
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 bg-white p-8 rounded-xl border border-[#E4E4E7] shadow-sm">
                <div className="flex items-center gap-10">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="#E4E4E7" strokeWidth="8" fill="transparent" />
                      <circle cx="64" cy="64" r="58" stroke="#10B981" strokeWidth="8" fill="transparent" 
                        strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * (score/20))}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-2xl font-bold">{(score/20)*100}%</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600 font-medium">Kết Quả: <span className="text-black">{score}/20 Đúng</span></p>
                    <p className="text-green-600 font-semibold italic">Hoàn thành bài kiểm tra!</p>
                  </div>
                </div>
                <div className="mt-8 bg-[#81F69F] rounded-2xl p-6 flex flex-col items-center justify-center h-48 border border-green-300">
                  <div className="text-5xl font-black text-[#10B981]">SCORE {score}/20</div>
                </div>
                <button 
                    onClick={() => navigate("/learner/documents")}
                    className="mt-6 w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-all"
                >
                    Quay lại trang tài liệu
                </button>
              </div>
  
              <div className="w-full lg:w-[400px] bg-[#D9D9D9] p-6 rounded-xl">
                <h3 className="font-bold mb-4">Xem Lại</h3>
                <div className="grid grid-cols-5 gap-3">
                  {questionsData.map((_, i) => (
                      <div key={i} className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-white
                        ${!answers[i] ? "bg-white text-gray-400" : answers[i] === questionsData[i].correct ? "bg-blue-600" : "bg-red-600"}`}>
                        {i + 1}
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="p-8 bg-[#FAFAFA] min-h-screen font-['Inter'] flex flex-col items-center">
      <div className="w-full max-w-[1280px]">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="p-1 bg-black text-white rounded">📖</span> Bài Kiểm Tra
            </h1>
            <p className="text-gray-500 mt-1">Tài liệu &gt; Bài Kiểm Tra</p>
            <h2 className="text-xl font-bold mt-4 uppercase">Chiến tranh điện biên phủ</h2>
          </div>
          <div className="bg-[#F26739] text-white px-6 py-3 rounded-lg flex items-center gap-3 shadow-lg">
            <Clock size={24} />
            <span className="text-lg font-bold">Thời Gian Còn Lại : {formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="bg-white p-10 rounded-2xl border border-[#E4E4E7] shadow-sm relative min-h-[400px]">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-bold text-sm">Câu {currentIdx + 1}</span>
                <p className="text-lg font-bold text-gray-800">{questionsData[currentIdx].question}</p>
              </div>

              <div className="space-y-4">
                {questionsData[currentIdx].options.map((opt, i) => (
                  <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${tempAnswer === opt ? "border-[#F26739] bg-orange-50" : "border-gray-100 bg-white hover:bg-gray-50"}`}>
                    <input type="radio" className="hidden" name="answer" checked={tempAnswer === opt} onChange={() => setTempAnswer(opt)} />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${tempAnswer === opt ? "border-[#F26739]" : "border-gray-300"}`}>
                      {tempAnswer === opt && <div className="w-2.5 h-2.5 bg-[#F26739] rounded-full"></div>}
                    </div>
                    <span className="font-medium text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>

              <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                <button 
                    onClick={handleSaveAnswer}
                    disabled={saveStatus === 'saving'}
                    className={`font-bold px-6 py-2 rounded-lg text-sm border transition-all
                    ${saveStatus === 'saving' ? "bg-gray-100 text-gray-400 border-gray-300" : "bg-orange-100 text-[#F26739] border-[#F26739] hover:bg-[#F26739] hover:text-white"}`}
                >
                    {saveStatus === 'saving' ? "Đang lưu..." : "Lưu câu trả lời"}
                </button>
                {saveStatus === 'success' && <span className="text-green-600 text-xs font-bold animate-bounce">✓ Đã lưu thành công</span>}
                {saveStatus === 'error' && <span className="text-red-600 text-xs font-bold">! Vui lòng chọn đáp án</span>}
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <span className="font-bold text-gray-500">{currentIdx + 1} / 20 Câu</span>
              <div className="flex gap-4">
                <button 
                    onClick={() => setCurrentIdx(0)} 
                    className="bg-orange-500 text-white px-8 py-2 rounded-full font-bold hover:bg-orange-600 transition-all shadow-md"
                >
                    Quay lại câu đầu
                </button>
                <button onClick={handleSubmit} className="bg-[#F26739] text-white px-8 py-2 rounded-full font-bold hover:opacity-90 shadow-md">Nộp Bài</button>
              </div>
              <div className="flex gap-2">
                <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(p => p - 1)} className="p-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-30"><ChevronLeft/></button>
                <button disabled={currentIdx === 19} onClick={() => setCurrentIdx(p => p + 1)} className="p-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-30"><ChevronRight/></button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[400px] bg-[#D9D9D9] p-8 rounded-2xl shadow-inner">
            <h3 className="text-xl font-bold mb-6">Danh Sách Câu Hỏi</h3>
            <div className="grid grid-cols-5 gap-3">
              {questionsData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg transition-all
                    ${currentIdx === i ? "ring-4 ring-orange-300 scale-110 z-10" : ""}
                    ${answers[i] ? "bg-blue-600 text-white" : "bg-white text-black"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button onClick={handleSaveAnswer} className="w-full bg-[#F26739] text-white py-4 rounded-xl mt-12 font-bold text-xl flex items-center justify-center gap-3 hover:bg-orange-600 shadow-lg">
              Lưu Câu trả lời →
            </button>
            <div className="mt-8 flex items-center gap-3 text-sm text-gray-600 bg-white/50 p-3 rounded-lg">
                <div className="w-6 h-6 bg-white border rounded shadow-sm flex items-center justify-center font-bold text-blue-600">i</div>
                <span>Nhấn "Lưu" để xác nhận đáp án cho mỗi câu hỏi.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Baikiemtra;