import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, CheckCircle } from "lucide-react";

const HocQuizz = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- STATE QUẢN LÝ ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  const [savedAnswers, setSavedAnswers] = useState({});    
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [scoreData, setScoreData] = useState({ score: 0, correct: 0, total: 0 });

  // --- FAKE DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Giả lập dữ liệu từ Server
      const mockQuestions = [
        { id: 1, question: "Hội nghị nào được ký kết sau chiến thắng Điện Biên Phủ?", options: ["Hội nghị Paris", "Hội nghị Genève", "Hội nghị Potsdam", "Hội nghị Versailles"], correct: 1 },
        { id: 2, question: "Ai là Chủ tịch nước Việt Nam thời điểm diễn ra chiến dịch?", options: ["Hồ Chí Minh", "Tôn Đức Thắng", "Võ Nguyên Giáp", "Lê Duẩn"], correct: 0 },
        { id: 3, question: "Chiến dịch Điện Biên Phủ gồm mấy đợt tấn công chính?", options: ["2", "3", "4", "5"], correct: 1 },
        { id: 4, question: "Cứ điểm quan trọng nhất của Pháp tại Điện Biên Phủ là gì?", options: ["Him Lam", "Độc Lập", "Mường Thanh", "Hồng Cúm"], correct: 2 },
        { id: 5, question: "Lực lượng tham gia chiến dịch chủ yếu là lực lượng nào?", options: ["Hải quân", "Không quân", "Bộ binh", "Cảnh sát"], correct: 2 },
        { id: 6, question: "Chiến thuật nổi bật của quân ta trong chiến dịch là gì?", options: ["Đánh du kích", "Không chiến", "Bao vây, đánh lấn", "Rút lui"], correct: 2 },
        { id: 7, question: "Chiến thắng Điện Biên Phủ được gọi là gì?", options: ["Trận chiến thế kỷ", "Lừng lẫy năm châu, chấn động địa cầu", "Cuộc chiến vĩ đại", "Trận đánh cuối cùng"], correct: 1 },
        { id: 8, question: "Mục tiêu chính của Pháp khi xây dựng Điện Biên Phủ là gì?", options: ["Phòng thủ", "Thu hút và tiêu diệt chủ lực Việt Minh", "Chiếm miền Nam", "Bảo vệ thủ đô"], correct: 1 },
        { id: 9, question: "Yếu tố nào góp phần quan trọng vào chiến thắng của ta?", options: ["Vũ khí hiện đại", "Tinh thần chiến đấu và chiến thuật hợp lý", "Hỗ trợ từ Mỹ", "Thời tiết thuận lợi"], correct: 1 },
        { id: 10, question: "Chiến thắng Điện Biên Phủ ảnh hưởng thế nào đến thế giới?", options: ["Không ảnh hưởng", "Chỉ ảnh hưởng trong nước", "Cổ vũ phong trào giải phóng dân tộc", "Làm bùng nổ chiến tranh"], correct: 2 },
      ];
      setQuizData(mockQuestions);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // --- HANDLERS ---
  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [quizData[currentQuestionIndex].id]: optionIndex,
    });
  };

  const handleSave = () => {
    const currentId = quizData[currentQuestionIndex].id;
    if (selectedAnswers[currentId] !== undefined) {
      // Sau này gọi API gửi lên Server ở đây: 
      // axios.post('/api/save-answer', { quizId: id, questionId: currentId, answer: selectedAnswers[currentId] })
      setSavedAnswers({
        ...savedAnswers,
        [currentId]: selectedAnswers[currentId],
      });
      setSaveMessage("Lưu thành công!");
      setTimeout(() => setSaveMessage(""), 2000);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quizData.forEach((q) => {
      if (savedAnswers[q.id] === q.correct) {
        correctCount++;
      }
    });

    setScoreData({
      score: (correctCount / quizData.length) * 100,
      correct: correctCount,
      total: quizData.length,
    });
    setIsFinished(true);
  };

  if (loading) return <div className="p-10 text-center font-bold">Đang tải câu hỏi...</div>;

  // --- UI KẾT QUẢ ---
  if (isFinished) {
    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-5">
        <div className="w-full max-w-[1134px] bg-white border border-gray-200 rounded-[10px] flex items-center px-4 py-3 mb-5 shadow-sm">
          <button onClick={() => navigate("/quiz")} className="flex items-center gap-2 text-lg font-medium"><ArrowLeft size={20} /> Trở về</button>
        </div>
        <div className="w-full max-w-[1113px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-bold uppercase">Kết quả: Chiến tranh điện biên phủ</h2></div>
          <div className="p-12 flex flex-col items-center text-center">
             <div className="bg-[#4ADE80] text-white px-10 py-2 rounded-full text-xl font-bold mb-6">Hoàn Thành</div>
             <div className="text-6xl font-black text-red-500 mb-10">{scoreData.score} %</div>
             <div className="flex gap-4">
                <div className="bg-[#FBBF24] text-white px-6 py-2 rounded-lg font-bold">Hoàn thành {scoreData.total} câu</div>
                <div className="bg-[#4ADE80] text-white px-6 py-2 rounded-lg font-bold">Đúng {scoreData.correct} câu</div>
             </div>
             <button onClick={() => { setIsFinished(false); setSelectedAnswers({}); setSavedAnswers({}); setCurrentQuestionIndex(0); }} className="mt-10 text-blue-600 font-semibold hover:underline">Làm lại bài thi</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-5 font-['Inter']">
      <div className="w-full max-w-[1134px] h-[53px] bg-white border border-gray-200 rounded-[10px] flex items-center px-[18px] mb-5 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[20px] font-normal text-black hover:opacity-60 transition-all">
          <ArrowLeft size={24} /> Trở về
        </button>
      </div>

      <div className="w-full max-w-[1113px] bg-white rounded-[12px] p-8 shadow-md border border-[#E4E4E7]">
        <h2 className="text-2xl font-bold mb-6 uppercase">Chiến tranh điện biên phủ</h2>

        <div className="bg-[#F4F4F5] rounded-xl p-8 relative min-h-[420px]">
          {/* Badge Câu hỏi (Góc trái trên) */}
          <div className="absolute top-6 left-6 bg-[#2563EB] text-white px-4 py-1 rounded-full text-sm font-bold">
            Câu {currentQuestionIndex + 1}
          </div>

          {/* Nút Lưu & Thông báo (Sát góc phải trên) */}
          <div className="absolute top-6 right-6 flex items-center gap-4">
             {saveMessage && (
               <div className="flex items-center gap-2 text-green-600 font-bold animate-in fade-in slide-in-from-right-2">
                 <CheckCircle size={18} /> {saveMessage}
               </div>
             )}
             <button 
                onClick={handleSave} 
                className="bg-[#2563EB] text-white px-5 py-2 rounded-full flex items-center gap-2 text-sm font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95"
             >
                <Save size={18}/> Lưu câu trả lời
             </button>
          </div>

          <div className="mt-14 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">{currentQuestion?.question}</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion?.options.map((option, index) => (
              <label key={index} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedAnswers[currentQuestion.id] === index ? "border-[#2563EB] bg-blue-50" : "border-transparent bg-white hover:bg-gray-50"}`}>
                <input type="radio" className="hidden" checked={selectedAnswers[currentQuestion.id] === index} onChange={() => handleSelectOption(index)} />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedAnswers[currentQuestion.id] === index ? "border-[#2563EB]" : "border-gray-300"}`}>
                  {selectedAnswers[currentQuestion.id] === index && <div className="w-2.5 h-2.5 bg-[#2563EB] rounded-full"></div>}
                </div>
                <span className="text-lg text-gray-700">{String.fromCharCode(65 + index)}. {option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer điều hướng */}
        <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-gray-500 font-medium whitespace-nowrap">{currentQuestionIndex + 1} / {quizData.length} Câu</div>

          <div className="flex items-center gap-4 flex-1 w-full max-w-md">
             <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}></div>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={24} /></button>
            
            <div className="hidden sm:flex gap-1.5">
               {quizData.map((q, i) => {
                 const isSelected = selectedAnswers[q.id] !== undefined;
                 const isSaved = savedAnswers[q.id] !== undefined;
                 const isCurrent = currentQuestionIndex === i;
                 
                 let bgColor = "bg-white text-gray-400 border-gray-200";
                 
                 if (isSaved) {
                    bgColor = "bg-[#1473E6] text-white border-[#1473E6]"; // Xanh khi đã Lưu
                 } else if (isSelected && !isCurrent) {
                    bgColor = "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"; // Vàng nhạt khi đã chọn nhưng qua câu khác
                 }

                 return (
                   <button 
                    key={i} 
                    onClick={() => setCurrentQuestionIndex(i)} 
                    className={`w-9 h-9 rounded-md text-sm font-bold border transition-all ${bgColor} ${isCurrent ? "ring-2 ring-offset-1 ring-black shadow-inner scale-110" : ""}`}
                   >
                     {i + 1}
                   </button>
                 );
               })}
            </div>

            <button onClick={() => setCurrentQuestionIndex(prev => Math.min(quizData.length - 1, prev + 1))} disabled={currentQuestionIndex === quizData.length - 1} className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={24} /></button>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setCurrentQuestionIndex(0)} className="bg-[#F26739] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#d8562c] text-sm shadow-sm transition-colors">Quay lại trang đầu</button>
            <button onClick={handleSubmit} className="bg-[#F26739] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#d8562c] text-sm shadow-sm transition-colors">Nộp Bài</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HocQuizz;