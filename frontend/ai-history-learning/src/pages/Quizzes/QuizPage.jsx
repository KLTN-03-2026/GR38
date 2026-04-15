import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── DATA ────────────────────────────────────────────────────────────────────
const initialQuestionsByQuiz = {
  1: [
    { q: "Chiến dịch Hồ Chí Minh diễn ra vào năm nào?", options: ["1973", "1974", "1975", "1976"], answer: 2 },
    { q: "Ai là tổng thống Mỹ khi Mỹ rút quân khỏi Việt Nam?", options: ["Kennedy", "Johnson", "Nixon", "Ford"], answer: 2 },
    { q: "Hiệp định Paris được ký kết vào năm nào?", options: ["1971", "1972", "1973", "1974"], answer: 2 },
    { q: "Sự kiện Vịnh Bắc Bộ xảy ra vào năm nào?", options: ["1962", "1964", "1966", "1968"], answer: 1 },
    { q: "Chiến dịch 'Linebacker II' của Mỹ còn được gọi là gì?", options: ["Trận Hà Nội", "Điện Biên Phủ trên không", "Mậu Thân", "Xuân Hè"], answer: 1 },
    { q: "Tổng tiến công Mậu Thân diễn ra vào năm nào?", options: ["1966", "1967", "1968", "1969"], answer: 2 },
    { q: "Quân giải phóng tiến vào Sài Gòn ngày nào?", options: ["28/4/1975", "29/4/1975", "30/4/1975", "01/5/1975"], answer: 2 },
    { q: "Ai là Tổng thống cuối cùng của VNCH?", options: ["Nguyễn Văn Thiệu", "Dương Văn Minh", "Trần Văn Hương", "Nguyễn Cao Kỳ"], answer: 1 },
    { q: "Mỹ bắt đầu ném bom miền Bắc Việt Nam vào năm nào?", options: ["1963", "1964", "1965", "1966"], answer: 2 },
    { q: "Chiến lược 'Việt Nam hóa chiến tranh' do ai đề xướng?", options: ["Kennedy", "Johnson", "Nixon", "Ford"], answer: 2 },
  ],
  2: [
    { q: "Người Việt cổ xuất hiện cách đây bao nhiêu năm?", options: ["5.000 năm", "10.000 năm", "30.000 năm", "50.000 năm"], answer: 2 },
    { q: "Nền văn hóa nào tiêu biểu cho thời tiên sử Việt Nam?", options: ["Đông Sơn", "Sa Huỳnh", "Hòa Bình", "Phùng Nguyên"], answer: 2 },
    { q: "Nhà nước đầu tiên của người Việt có tên là gì?", options: ["Văn Lang", "Âu Lạc", "Nam Việt", "Đại Việt"], answer: 0 },
    { q: "Trống đồng Đông Sơn thuộc nền văn hóa nào?", options: ["Phùng Nguyên", "Đồng Đậu", "Gò Mun", "Đông Sơn"], answer: 3 },
    { q: "Người tối cổ ở Việt Nam được tìm thấy ở đâu?", options: ["Hang Thẩm Khuyên", "Hang Đồng Nội", "Núi Đọ", "Cả 3 đáp án"], answer: 3 },
    { q: "Văn hóa Hòa Bình tồn tại cách đây khoảng bao nhiêu năm?", options: ["3.000 năm", "5.000 năm", "10.000 năm", "15.000 năm"], answer: 2 },
    { q: "Công cụ đặc trưng của người nguyên thủy Việt Nam là gì?", options: ["Đồ đá", "Đồ đồng", "Đồ sắt", "Đồ gốm"], answer: 0 },
    { q: "Nền văn hóa Sa Huỳnh phân bố chủ yếu ở đâu?", options: ["Miền Bắc", "Miền Trung", "Miền Nam", "Tây Nguyên"], answer: 1 },
    { q: "Kỹ thuật trồng lúa nước xuất hiện từ thời kỳ nào?", options: ["Đồ đá cũ", "Đồ đá mới", "Đồ đồng", "Đồ sắt"], answer: 1 },
    { q: "Người Việt cổ sống chủ yếu bằng nghề gì?", options: ["Chăn nuôi", "Săn bắt hái lượm", "Buôn bán", "Làm gốm"], answer: 1 },
  ],
  3: [
    { q: "Triều đại phong kiến đầu tiên của Việt Nam là gì?", options: ["Nhà Lý", "Nhà Trần", "Nhà Ngô", "Nhà Đinh"], answer: 2 },
    { q: "Ai là người lập ra nhà Lý?", options: ["Lý Thái Tổ", "Lý Thái Tông", "Lý Nhân Tông", "Lý Cao Tông"], answer: 0 },
    { q: "Kinh đô Thăng Long được dời từ đâu?", options: ["Hoa Lư", "Phú Xuân", "Thanh Hóa", "Nam Định"], answer: 0 },
    { q: "Nhà Trần thành lập năm nào?", options: ["1225", "1226", "1227", "1228"], answer: 0 },
    { q: "Ai ba lần lãnh đạo chống quân Mông-Nguyên?", options: ["Trần Thái Tông", "Trần Thánh Tông", "Trần Nhân Tông", "Trần Anh Tông"], answer: 2 },
    { q: "Bộ luật Hồng Đức được ban hành dưới triều đại nào?", options: ["Nhà Lý", "Nhà Trần", "Nhà Lê", "Nhà Nguyễn"], answer: 2 },
    { q: "Trận Bạch Đằng năm 1288 do ai chỉ huy?", options: ["Lý Thường Kiệt", "Trần Hưng Đạo", "Nguyễn Huệ", "Đinh Bộ Lĩnh"], answer: 1 },
    { q: "Nhà Nguyễn được thành lập năm nào?", options: ["1800", "1801", "1802", "1803"], answer: 2 },
    { q: "Kinh đô của nhà Nguyễn đặt ở đâu?", options: ["Hà Nội", "Huế", "Đà Nẵng", "Sài Gòn"], answer: 1 },
    { q: "Lý Thường Kiệt đánh quân Tống trên sông nào?", options: ["Sông Hồng", "Sông Mã", "Sông Như Nguyệt", "Sông Bạch Đằng"], answer: 2 },
  ],
  4: [
    { q: "Bắc thuộc lần đầu bắt đầu từ năm nào?", options: ["179 TCN", "111 TCN", "43 SCN", "938 SCN"], answer: 1 },
    { q: "Ai lãnh đạo cuộc khởi nghĩa chống quân Hán năm 40 SCN?", options: ["Ngô Quyền", "Đinh Bộ Lĩnh", "Hai Bà Trưng", "Lý Bí"], answer: 2 },
    { q: "Ngô Quyền chiến thắng quân Nam Hán trên sông nào?", options: ["Sông Hồng", "Sông Mã", "Sông Bạch Đằng", "Sông Đà"], answer: 2 },
    { q: "Lý Bí lập ra nước gì sau khi đánh đuổi quân Lương?", options: ["Đại Việt", "Vạn Xuân", "Đại Cồ Việt", "Nam Việt"], answer: 1 },
    { q: "Khởi nghĩa Lý Bí nổ ra năm nào?", options: ["540", "541", "542", "543"], answer: 2 },
    { q: "Triệu Đà thôn tính Âu Lạc vào năm nào?", options: ["207 TCN", "179 TCN", "111 TCN", "43 SCN"], answer: 1 },
    { q: "Cuộc khởi nghĩa Bà Triệu diễn ra năm nào?", options: ["248", "258", "268", "278"], answer: 0 },
    { q: "Đinh Bộ Lĩnh dẹp loạn 12 sứ quân vào năm nào?", options: ["965", "967", "968", "970"], answer: 2 },
    { q: "Nhà Hán đặt Việt Nam thành bao nhiêu quận?", options: ["6", "7", "8", "9"], answer: 3 },
    { q: "Mai Thúc Loan khởi nghĩa chống lại triều đại nào?", options: ["Nhà Hán", "Nhà Tấn", "Nhà Đường", "Nhà Tống"], answer: 2 },
  ],
  5: [
    { q: "Pháp xâm lược Việt Nam bắt đầu từ năm nào?", options: ["1858", "1862", "1884", "1885"], answer: 0 },
    { q: "Hiệp ước nào đánh dấu Việt Nam hoàn toàn thuộc Pháp?", options: ["Nhâm Tuất", "Giáp Tuất", "Patenôtre", "Harmand"], answer: 2 },
    { q: "Cách mạng tháng Tám diễn ra năm nào?", options: ["1944", "1945", "1946", "1947"], answer: 1 },
    { q: "Đảng Cộng sản Việt Nam được thành lập năm nào?", options: ["1928", "1929", "1930", "1931"], answer: 2 },
    { q: "Ai đọc Tuyên ngôn độc lập ngày 2/9/1945?", options: ["Võ Nguyên Giáp", "Hồ Chí Minh", "Trường Chinh", "Phạm Văn Đồng"], answer: 1 },
    { q: "Phong trào Đông Du do ai khởi xướng?", options: ["Phan Bội Châu", "Phan Châu Trinh", "Nguyễn Thái Học", "Hoàng Hoa Thám"], answer: 0 },
    { q: "Khởi nghĩa Yên Bái do tổ chức nào lãnh đạo?", options: ["Việt Minh", "VNQDĐ", "Đông Dương CS Đảng", "Hội VNCMTN"], answer: 1 },
    { q: "Pháp nổ súng tấn công Đà Nẵng vào ngày nào?", options: ["01/9/1858", "01/9/1859", "01/9/1860", "01/9/1861"], answer: 0 },
    { q: "Hiệp định Sơ bộ ký năm nào?", options: ["1945", "1946", "1947", "1948"], answer: 1 },
    { q: "Toàn quốc kháng chiến bùng nổ vào năm nào?", options: ["1945", "1946", "1947", "1948"], answer: 1 },
  ],
  6: [
    { q: "Chiến dịch Điện Biên Phủ diễn ra vào năm nào?", options: ["1950", "1952", "1954", "1956"], answer: 2 },
    { q: "Ai là tổng tư lệnh chiến dịch Điện Biên Phủ?", options: ["Hồ Chí Minh", "Võ Nguyên Giáp", "Lê Duẩn", "Trường Chinh"], answer: 1 },
    { q: "Chiến dịch Điện Biên Phủ kết thúc vào ngày nào?", options: ["05/05/1954", "07/05/1954", "10/05/1954", "15/05/1954"], answer: 1 },
    { q: "Chiến dịch Điện Biên Phủ kéo dài bao nhiêu ngày?", options: ["45 ngày", "55 ngày", "65 ngày", "75 ngày"], answer: 1 },
    { q: "Tướng Pháp chỉ huy tại Điện Biên Phủ là ai?", options: ["Navarre", "De Castries", "Salan", "Leclerc"], answer: 1 },
    { q: "Điện Biên Phủ thuộc tỉnh nào?", options: ["Sơn La", "Lai Châu", "Điện Biên", "Lào Cai"], answer: 2 },
    { q: "Quân Pháp tại Điện Biên Phủ đầu hàng vào lúc mấy giờ?", options: ["15:00", "17:30", "17:00", "18:00"], answer: 2 },
    { q: "Chiến dịch Điện Biên Phủ bắt đầu vào ngày nào?", options: ["13/3/1954", "14/3/1954", "15/3/1954", "16/3/1954"], answer: 0 },
    { q: "Sau Điện Biên Phủ, hiệp định nào được ký kết?", options: ["Hiệp định Paris", "Hiệp định Genève", "Hiệp định Sơ bộ", "Hiệp định Fontainebleau"], answer: 1 },
    { q: "Đại đoàn nào tham gia mở màn chiến dịch Điện Biên Phủ?", options: ["Đại đoàn 308", "Đại đoàn 304", "Đại đoàn 316", "Đại đoàn 312"], answer: 3 },
  ],
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(q) {
  const indexed = q.options.map((text, i) => ({ text, isAnswer: i === q.answer }));
  const shuffled = shuffleArray(indexed);
  return { ...q, options: shuffled.map((o) => o.text), answer: shuffled.findIndex((o) => o.isAnswer) };
}

// ─── ADD QUIZ MODAL ───────────────────────────────────────────────────────────
const emptyQuizInfo  = { title: "" };
const emptyQuestion  = { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "" };

function AddQuizModal({ onClose, onSave }) {
  const [step, setStep]               = useState(1);
  const [quizInfo, setQuizInfo]       = useState(emptyQuizInfo);
  const [quizInfoErrors, setQIErr]    = useState({});
  const [questions, setQuestions]     = useState([]);
  const [currentQ, setCurrentQ]       = useState(emptyQuestion);
  const [currentQErrors, setCQErr]    = useState({});
  const [editingIndex, setEditIdx]    = useState(null);

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setQuizInfo((p) => ({ ...p, [name]: value }));
    setQIErr((p) => ({ ...p, [name]: "" }));
  };
  const handleInfoNext = () => {
    if (!quizInfo.title.trim()) { setQIErr({ title: "Vui lòng nhập tên Quiz" }); return; }
    setStep(2);
  };

  const handleQChange = (e) => {
    const { name, value } = e.target;
    setCurrentQ((p) => ({ ...p, [name]: value }));
    setCQErr((p) => ({ ...p, [name]: "" }));
  };

  const validateQ = () => {
    const err = {};
    if (!currentQ.question.trim()) err.question = "Vui lòng nhập câu hỏi";
    ["A", "B", "C", "D"].forEach((l) => {
      if (!currentQ[`option${l}`].trim()) err[`option${l}`] = `Vui lòng nhập đáp án ${l}`;
    });
    if (currentQ.correctAnswer === "") err.correctAnswer = "Vui lòng chọn đáp án đúng";
    return err;
  };

  const handleAddQuestion = () => {
    const err = validateQ();
    if (Object.keys(err).length) { setCQErr(err); return; }
    const newQ = {
      q: currentQ.question,
      options: [currentQ.optionA, currentQ.optionB, currentQ.optionC, currentQ.optionD],
      answer: Number(currentQ.correctAnswer),
    };
    setQuestions((p) => editingIndex !== null ? p.map((q, i) => i === editingIndex ? newQ : q) : [...p, newQ]);
    setEditIdx(null);
    setCurrentQ(emptyQuestion);
    setCQErr({});
  };

  const handleEditQuestion = (i) => {
    const q = questions[i];
    setCurrentQ({ question: q.q, optionA: q.options[0], optionB: q.options[1], optionC: q.options[2], optionD: q.options[3], correctAnswer: String(q.answer) });
    setCQErr({});
    setEditIdx(i);
  };

  const handleDeleteQuestion = (i) => {
    setQuestions((p) => p.filter((_, idx) => idx !== i));
    if (editingIndex === i) { setEditIdx(null); setCurrentQ(emptyQuestion); }
  };

  const handleFinish = () => {
    if (!questions.length) { alert("Vui lòng thêm ít nhất 1 câu hỏi!"); return; }
    onSave({ title: quizInfo.title, questions });
  };

  const inputCls = (field) =>
    `w-full px-3 py-2 text-sm border rounded-xl outline-none transition-all duration-200 ${
      currentQErrors[field]
        ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
        : "border-gray-200 focus:border-[#F26739] focus:ring-2 focus:ring-orange-100"
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-gray-900">{step === 1 ? "Tạo Quiz mới" : `Thêm câu hỏi — ${quizInfo.title}`}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{step === 1 ? "Bước 1 / 2 — Thông tin Quiz" : `Bước 2 / 2 — ${questions.length} câu hỏi đã thêm`}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl">×</button>
        </div>

        <div className="flex gap-1 px-6 pt-3 shrink-0">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-[#F26739]" : "bg-gray-200"}`} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên Quiz</label>
                <input
                  type="text" name="title" placeholder="VD: Kháng chiến chống Mỹ..."
                  value={quizInfo.title} onChange={handleInfoChange}
                  className={`w-full px-3 py-2 text-sm border rounded-xl outline-none transition-all duration-200 ${quizInfoErrors.title ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#F26739] focus:ring-2 focus:ring-orange-100"}`}
                />
                {quizInfoErrors.title && <p className="text-xs text-red-500 mt-1">{quizInfoErrors.title}</p>}
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-700 font-medium mb-1">Hướng dẫn</p>
                <p className="text-xs text-blue-600 leading-5">Ở bước tiếp theo, bạn có thể thêm nhiều câu hỏi. Mỗi câu có 4 đáp án và 1 đáp án đúng.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {questions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Câu hỏi đã thêm</p>
                  <div className="space-y-2">
                    {questions.map((q, i) => (
                      <div key={i} className={`flex items-start justify-between gap-3 p-3 border rounded-xl transition-all duration-150 ${editingIndex === i ? "border-[#F26739] bg-orange-50" : "border-gray-200 bg-gray-50"}`}>
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 font-medium truncate">{q.q}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Đúng: <span className="text-green-600 font-semibold">{q.options[q.answer]}</span></p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => handleEditQuestion(i)} className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50">Sửa</button>
                          <button onClick={() => handleDeleteQuestion(i)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50">Xoá</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`border rounded-xl p-4 space-y-3 ${editingIndex !== null ? "border-[#F26739] bg-orange-50/40" : "border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">{editingIndex !== null ? `Chỉnh sửa câu ${editingIndex + 1}` : `Câu hỏi ${questions.length + 1}`}</p>
                  {editingIndex !== null && (
                    <button onClick={() => { setEditIdx(null); setCurrentQ(emptyQuestion); setCQErr({}); }} className="text-xs text-gray-400 hover:text-gray-600">Huỷ chỉnh sửa</button>
                  )}
                </div>

                <div>
                  <textarea name="question" placeholder="Nhập câu hỏi..." value={currentQ.question} onChange={handleQChange} rows={2} className={`${inputCls("question")} resize-none`} />
                  {currentQErrors.question && <p className="text-xs text-red-500 mt-1">{currentQErrors.question}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {["A", "B", "C", "D"].map((l) => {
                    const key = `option${l}`;
                    return (
                      <div key={l}>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{l}</span>
                          <input type="text" name={key} placeholder={`Đáp án ${l}`} value={currentQ[key]} onChange={handleQChange} className={`pl-7 ${inputCls(key)}`} />
                        </div>
                        {currentQErrors[key] && <p className="text-xs text-red-500 mt-0.5">{currentQErrors[key]}</p>}
                      </div>
                    );
                  })}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">Đáp án đúng</p>
                  <div className="flex gap-2">
                    {["A", "B", "C", "D"].map((l, idx) => (
                      <label key={idx} className={`flex-1 flex items-center justify-center py-1.5 border rounded-lg cursor-pointer text-sm transition-all duration-150 ${currentQ.correctAnswer === String(idx) ? "border-green-400 bg-green-50 text-green-700 font-semibold" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                        <input type="radio" name="correctAnswer" value={idx} checked={currentQ.correctAnswer === String(idx)} onChange={handleQChange} className="hidden" />
                        {l}
                      </label>
                    ))}
                  </div>
                  {currentQErrors.correctAnswer && <p className="text-xs text-red-500 mt-1">{currentQErrors.correctAnswer}</p>}
                </div>

                <button onClick={handleAddQuestion} className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${editingIndex !== null ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-[#F26739] hover:bg-orange-600 text-white"}`}>
                  {editingIndex !== null ? "Lưu chỉnh sửa" : "Thêm câu hỏi"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-3 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Huỷ bỏ</button>
          {step === 1
            ? <button onClick={handleInfoNext} className="flex-1 py-2.5 text-sm bg-[#F26739] hover:bg-orange-600 text-white rounded-xl font-semibold">Tiếp theo →</button>
            : <button onClick={handleFinish} disabled={!questions.length} className="flex-1 py-2.5 text-sm bg-[#F26739] hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold">Tạo Quiz ({questions.length} câu)</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── QUIZ VIEW ────────────────────────────────────────────────────────────────
const TABS = ["Thông tin", "Chat", "Quizz", "FlashCard"];

function QuizView({ quiz, questions, onBack, onFinish }) {
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState({});
  const [activeTab, setActiveTab] = useState("Quizz");
  // "left" | "right" | null — for question slide
  const [animDir, setAnimDir]     = useState(null);
  // tab transition state
  const [tabAnim, setTabAnim]     = useState(null); // null | "fade-out" | "fade-in"
  const [displayedTab, setDisplayedTab] = useState("Quizz");
  const [showWarn, setShowWarn]   = useState(false);
  const animRef                   = useRef(null);
  const tabRef                    = useRef(null);

  const total = questions.length;
  const q     = questions[currentQ];
  const selectedAnswer = answers[currentQ];

  // Question slide transition
  const goTo = (next, dir) => {
    if (next < 0 || next >= total) return;
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(() => {
      setCurrentQ(next);
      setAnimDir(null);
      setShowWarn(false);
    }, 220);
  };

  const handleNext = () => {
    if (selectedAnswer === undefined) { setShowWarn(true); return; }
    if (currentQ < total - 1) goTo(currentQ + 1, "left");
  };

  const handlePrev = () => goTo(currentQ - 1, "right");

  const handleJump = (i) => {
    if (i === currentQ) return;
    goTo(i, i > currentQ ? "left" : "right");
  };

  // Tab transition: fade out → swap content → fade in
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    clearTimeout(tabRef.current);
    setTabAnim("fade-out");
    tabRef.current = setTimeout(() => {
      setDisplayedTab(tab);
      setActiveTab(tab);
      setTabAnim("fade-in");
      tabRef.current = setTimeout(() => setTabAnim(null), 200);
    }, 150);
  };

  const handleSubmit = () => {
    const score = Object.entries(answers).filter(([i, a]) => questions[Number(i)]?.answer === a).length;
    onFinish({ quiz, answers, score, total, questions, answered: Object.keys(answers).length });
  };

  const pageNums = Array.from({ length: total }, (_, i) => i).filter(
    (i) => i === 0 || i === total - 1 || Math.abs(i - currentQ) <= 1
  );

  const slideClass = animDir === "left"
    ? "animate-slide-left"
    : animDir === "right"
    ? "animate-slide-right"
    : "";

  const tabContentClass =
    tabAnim === "fade-out" ? "tab-fade-out" :
    tabAnim === "fade-in"  ? "tab-fade-in"  : "";

  return (
    <>
      <style>{`
        @keyframes slideInLeft  { from { opacity: 0; transform: translateX(40px);  } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes tabFadeOut   { from { opacity: 1; transform: translateY(0);     } to { opacity: 0; transform: translateY(6px); } }
        @keyframes tabFadeIn    { from { opacity: 0; transform: translateY(-6px);  } to { opacity: 1; transform: translateY(0); } }

        .animate-slide-left  { animation: slideInLeft  0.22s cubic-bezier(.4,0,.2,1) both; }
        .animate-slide-right { animation: slideInRight 0.22s cubic-bezier(.4,0,.2,1) both; }
        .tab-fade-out        { animation: tabFadeOut   0.15s ease both; }
        .tab-fade-in         { animation: tabFadeIn    0.20s ease both; }

        /* Big "Tiếp theo" button pulse on warn */
        @keyframes warnPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.35); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }
        .btn-next-warn { animation: warnPulse 0.6s ease; }
      `}</style>

      <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Trở về
          </button>
          <button className="bg-[#F26739] hover:bg-orange-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors duration-200">
            Chỉnh sửa câu hỏi
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full">
            <h1 className="text-xl font-semibold text-gray-800 mb-5">{quiz.title}</h1>

            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-200 mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab} onClick={() => handleTabChange(tab)}
                  className={`px-8 py-2.5 text-sm transition-all duration-200 border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-[#F26739] text-[#F26739] font-medium"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── Tab content with fade transition ── */}
            <div className={tabContentClass}>

              {displayedTab === "Quizz" && (
                <>
                  {/* Question card */}
                  <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden ${slideClass}`}>
                    <div className="flex items-start gap-3 mb-1">
                      <span className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full whitespace-nowrap">Câu {currentQ + 1}</span>
                      <p className="text-gray-800 text-sm font-medium leading-6 pt-0.5">{q.q}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 mb-4">
                      <span className="text-xs text-gray-400">Chọn 1 đáp án đúng</span>
                    </div>

                    <div className="space-y-3">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => { setAnswers((p) => ({ ...p, [currentQ]: i })); setShowWarn(false); }}
                          className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-all duration-200 ${
                            selectedAnswer === i
                              ? "border-blue-400 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${selectedAnswer === i ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                            {selectedAnswer === i && <span className="w-2 h-2 rounded-full bg-white" />}
                          </span>
                          <span className="text-sm text-gray-700">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Actions + Navigation (redesigned) ── */}
                  <div className="mt-5">

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs text-gray-500 whitespace-nowrap font-medium">{currentQ + 1} / {total}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-blue-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${((currentQ + 1) / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{Math.round(((currentQ + 1) / total) * 100)}%</span>
                    </div>

                    {/* Navigation row */}
                    <div className="flex items-center gap-3">

                      {/* Prev button */}
                      <button
                        onClick={handlePrev}
                        disabled={currentQ === 0}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Trước
                      </button>

                      {/* Page dots */}
                      <div className="flex items-center gap-1.5 flex-1 justify-center flex-wrap">
                        {pageNums.map((i, arrIdx) => (
                          <span key={i} className="flex items-center gap-1.5">
                            {arrIdx > 0 && pageNums[arrIdx] - pageNums[arrIdx - 1] > 1 && (
                              <span className="text-gray-300 text-xs select-none">…</span>
                            )}
                            <button
                              onClick={() => handleJump(i)}
                              className={`w-8 h-8 text-xs rounded-lg border transition-all duration-200 font-medium ${
                                currentQ === i
                                  ? "bg-blue-500 text-white border-blue-500 shadow-sm scale-110"
                                  : answers[i] !== undefined
                                  ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  : "border-gray-200 text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              {i + 1}
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Next / Submit button — big & prominent */}
                      {currentQ < total - 1 ? (
                        <button
                          onClick={handleNext}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0 ${
                            showWarn
                              ? "bg-red-500 hover:bg-red-600 text-white btn-next-warn"
                              : selectedAnswer !== undefined
                              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-500"
                          }`}
                        >
                          {showWarn ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                              </svg>
                              Chọn đáp án!
                            </>
                          ) : (
                            <>
                              Câu tiếp
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#F26739] hover:bg-orange-600 text-white shadow-sm hover:shadow-md transition-all duration-200 shrink-0"
                        >
                          Nộp bài
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Secondary actions */}
                    <div className="flex justify-between items-center mt-3">
                      <button
                        onClick={() => { setCurrentQ(0); setAnswers({}); }}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        Làm lại từ đầu
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="text-xs text-[#F26739] hover:text-orange-700 font-medium transition-colors duration-200"
                      >
                        Nộp bài ngay →
                      </button>
                    </div>
                  </div>
                </>
              )}

              {displayedTab === "Thông tin" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-base font-bold text-gray-800 mb-3">{quiz.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {total} câu hỏi
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {Object.keys(answers).length} đã trả lời
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-4 leading-6">Bộ câu hỏi lịch sử giúp bạn ôn tập kiến thức một cách hệ thống và hiệu quả.</p>
                </div>
              )}

              {displayedTab === "Chat" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center text-gray-400 text-sm py-16">
                  Tính năng Chat đang được phát triển...
                </div>
              )}

              {displayedTab === "FlashCard" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center text-gray-400 text-sm py-16">
                  Tính năng FlashCard đang được phát triển...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([
    { id: 1, title: "Kháng chiến chống Mỹ", questions: 10, img: "/anh1.jpg" },
    { id: 2, title: "Lịch sử Việt Nam thời tiên sử", questions: 10, img: "/anh2.jpg" },
    { id: 3, title: "Thời kỳ quân chủ (939 - 1945)", questions: 10, img: "/anh3.jpg" },
    { id: 4, title: "Thời bắc thuộc (180 TCN - 938)", questions: 10, img: "/anh4.jpg" },
    { id: 5, title: "Thời kỳ hiện đại (1858 - nay)", questions: 10, img: "/anh5.jpg" },
    { id: 6, title: "Chiến tranh Điện Biên Phủ", questions: 10, img: "/anh6.jpg" },
  ]);
  const [questionsByQuiz, setQuestionsByQuiz] = useState(initialQuestionsByQuiz);
  const [quizView, setQuizView]               = useState(null);
  const [showAddModal, setShowAddModal]       = useState(false);

  const handleStartQuiz = (quiz) => {
    const raw = questionsByQuiz[quiz.id] ?? [];
    if (!raw.length) { alert("Quiz này chưa có câu hỏi!"); return; }
    setQuizView({ quiz, questions: shuffleArray(raw).map(shuffleOptions) });
  };

  const handleFinish = (result) => {
    setQuizView(null);
    navigate("/teacher/quiz-result", { state: result });
  };

  const handleSaveQuiz = ({ title, questions }) => {
    const newId = Math.max(...quizzes.map((q) => q.id), 0) + 1;
    setQuestionsByQuiz((p) => ({ ...p, [newId]: questions }));
    setQuizzes((p) => [...p, { id: newId, title, questions: questions.length, img: "/anh1.jpg" }]);
    setShowAddModal(false);
  };

  if (quizView) {
    return <QuizView quiz={quizView.quiz} questions={quizView.questions} onBack={() => setQuizView(null)} onFinish={handleFinish} />;
  }

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Câu hỏi ôn tập</h1>
          <p className="text-sm text-gray-400 mt-0.5">{quizzes.length} bộ câu hỏi đang có</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#F26739] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Thêm câu hỏi
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <div className="relative overflow-hidden">
              <img src={quiz.img} alt={quiz.title} className="w-full h-40 object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <button
                onClick={(e) => { e.stopPropagation(); setQuizzes((p) => p.filter((q) => q.id !== quiz.id)); }}
                className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50"
              >
                <svg className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">{quiz.title}</p>
              <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-semibold">{quiz.questions} Câu hỏi</span>
              <button onClick={() => handleStartQuiz(quiz)} className="w-full mt-3 bg-[#F26739] hover:bg-orange-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors duration-200">
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && <AddQuizModal onClose={() => setShowAddModal(false)} onSave={handleSaveQuiz} />}
    </div>
  );
}