import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleOptions(question) {
  const indexed = question.options.map((opt, i) => ({ text: opt, isAnswer: i === question.answer }));
  const shuffled = shuffleArray(indexed);
  return {
    ...question,
    options: shuffled.map((o) => o.text),
    answer: shuffled.findIndex((o) => o.isAnswer),
  };
}

const emptyForm = {
  title: "", quantity: "", question: "",
  optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "",
};

function QuizView({ quiz, questions, onBack, onFinish }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [activeTab, setActiveTab] = useState("Quizz");

  const tabs = ["Thông tin", "Chat", "Quizz", "FlashCard"];
  const total = questions.length;
  const q = questions[currentQ];

  const handleSelect = (i) => setAnswers((prev) => ({ ...prev, [currentQ]: i }));

  const handleSave = () => {
    if (answers[currentQ] !== undefined && currentQ < total - 1) {
      setCurrentQ((c) => c + 1);
    }
  };

  const handleSubmit = () => {
    const score = Object.entries(answers).filter(
      ([i, a]) => questions[Number(i)]?.answer === a
    ).length;
    const answered = Object.keys(answers).length; // ← THÊM
    onFinish({ quiz, answers, score, total, questions, answered }); // ← THÊM answered
  };

  const handleReset = () => { setCurrentQ(0); setAnswers({}); };

  const maxVisible = 3;
  const pageNumbers = Array.from({ length: Math.min(maxVisible, total) }, (_, i) => i);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Trở về
        </button>
        <button className="bg-[#F26739] hover:bg-orange-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
          Chỉnh sửa câu hỏi
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto">
          <h1 className="text-xl font-semibold text-gray-800 mb-5">{quiz.title}</h1>

          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-[#F26739] text-[#F26739] font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-3 mb-1">
              <span className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full whitespace-nowrap">
                Câu {currentQ + 1}
              </span>
              <p className="text-gray-800 text-sm font-medium leading-6 pt-0.5">{q.q}</p>
            </div>

            <div className="flex items-center justify-between mb-5 mt-2">
              <span className="text-xs text-gray-400">Chọn 1 câu đúng</span>
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full transition-colors"
              >
                Lưu câu trả lời
              </button>
            </div>

            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQ] === i
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={answers[currentQ] === i}
                    onChange={() => handleSelect(i)}
                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleReset}
              className="border border-[#F26739] text-[#F26739] hover:bg-orange-50 text-sm px-5 py-2 rounded-lg transition-colors"
            >
              Quay lại trang đầu
            </button>
            <button
              onClick={handleSubmit}
              className="bg-[#F26739] hover:bg-orange-600 text-white text-sm px-5 py-2 rounded-lg transition-colors"
            >
              Nộp Bài
            </button>
          </div>

          <div className="flex items-center gap-4 mt-5">
            <span className="text-sm text-gray-500 whitespace-nowrap">{currentQ + 1} / {total} Câu</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
              <div
                className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentQ + 1) / total) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
                disabled={currentQ === 0}
                className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40 px-1 py-1"
              >
                &lt; Previous
              </button>
              {pageNumbers.map((i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-7 h-7 text-xs rounded-md border transition-colors ${
                    currentQ === i
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              {total > maxVisible && <span className="text-gray-400 text-xs">...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [quizView, setQuizView] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addErrors, setAddErrors] = useState({});

  const handleDelete = (id) => setQuizzes((prev) => prev.filter((q) => q.id !== id));

  const handleStartQuiz = (quiz) => {
    const raw = questionsByQuiz[quiz.id] ?? [];
    if (raw.length === 0) { alert("Quiz này chưa có câu hỏi!"); return; }
    const shuffled = shuffleArray(raw).map((q) => shuffleOptions(q));
    setQuizView({ quiz, questions: shuffled });
  };

  const handleFinish = ({ quiz, answers, score, total, questions, answered }) => {
    setQuizView(null);
    navigate("/teacher/quiz-result", {
      state: { quiz, answers, score, total, questions, answered }, // ← THÊM answered
    });
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (addErrors[name]) setAddErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddSubmit = () => {
    let err = {};
    if (!addForm.title.trim()) err.title = "Vui lòng nhập tên Quiz";
    if (!addForm.quantity) err.quantity = "Vui lòng nhập số lượng";
    if (!addForm.question.trim()) err.question = "Vui lòng nhập câu hỏi";
    if (!addForm.optionA.trim()) err.optionA = "Vui lòng nhập đáp án A";
    if (!addForm.optionB.trim()) err.optionB = "Vui lòng nhập đáp án B";
    if (!addForm.optionC.trim()) err.optionC = "Vui lòng nhập đáp án C";
    if (!addForm.optionD.trim()) err.optionD = "Vui lòng nhập đáp án D";
    if (!addForm.correctAnswer) err.correctAnswer = "Vui lòng chọn đáp án đúng";
    if (Object.keys(err).length) { setAddErrors(err); return; }

    const newId = Math.max(...quizzes.map((q) => q.id)) + 1;
    const newQuestion = {
      q: addForm.question,
      options: [addForm.optionA, addForm.optionB, addForm.optionC, addForm.optionD],
      answer: Number(addForm.correctAnswer),
    };
    setQuestionsByQuiz((prev) => ({ ...prev, [newId]: [newQuestion] }));
    setQuizzes((prev) => [...prev, { id: newId, title: addForm.title, questions: Number(addForm.quantity), img: "/anh1.jpg" }]);
    setAddForm(emptyForm);
    setAddErrors({});
    setShowAddModal(false);
  };

  if (quizView) {
    return (
      <QuizView
        quiz={quizView.quiz}
        questions={quizView.questions}
        onBack={() => setQuizView(null)}
        onFinish={handleFinish}
      />
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Câu hỏi ôn tập</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#F26739] hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
        >
          Thêm câu hỏi
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="relative">
              <img src={quiz.img} alt={quiz.title} className="w-full h-36 object-cover bg-gray-100" />
              <button
                onClick={() => handleDelete(quiz.id)}
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow hover:bg-red-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="p-3">
              <p className="font-medium text-gray-800 mb-2">{quiz.title}</p>
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                {quiz.questions} Câu hỏi
              </span>
              <button
                onClick={() => handleStartQuiz(quiz)}
                className="w-full mt-3 bg-[#F26739] hover:bg-orange-600 text-white py-2 rounded-md text-sm transition-colors"
              >
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Thêm Quiz</h2>
                <p className="text-xs text-gray-400 mt-0.5">Nhập thông tin</p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setAddForm(emptyForm); setAddErrors({}); }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >×</button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Tên Quiz</label>
                  <input type="text" name="title" placeholder="Nhập tên quiz..." value={addForm.title} onChange={handleAddChange}
                    className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition ${addErrors.title ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`} />
                  {addErrors.title && <p className="text-xs text-red-500 mt-1">{addErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Số lượng Quiz</label>
                  <input type="number" name="quantity" placeholder="1...10" value={addForm.quantity} onChange={handleAddChange}
                    className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition ${addErrors.quantity ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`} />
                  {addErrors.quantity && <p className="text-xs text-red-500 mt-1">{addErrors.quantity}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Câu hỏi</label>
                <textarea name="question" placeholder="Nhập câu hỏi..." value={addForm.question} onChange={handleAddChange} rows={3}
                  className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition resize-none ${addErrors.question ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`} />
                {addErrors.question && <p className="text-xs text-red-500 mt-1">{addErrors.question}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Câu trả lời</label>
                <div className="grid grid-cols-2 gap-3">
                  {["A", "B", "C", "D"].map((letter) => {
                    const key = `option${letter}`;
                    return (
                      <div key={letter}>
                        <input type="text" name={key} placeholder={`Đáp án ${letter}`} value={addForm[key]} onChange={handleAddChange}
                          className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition ${addErrors[key] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`} />
                        {addErrors[key] && <p className="text-xs text-red-500 mt-1">{addErrors[key]}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Đáp án đúng</label>
                <select name="correctAnswer" value={addForm.correctAnswer} onChange={handleAddChange}
                  className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition ${addErrors.correctAnswer ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"}`}>
                  <option value="">Chọn đáp án đúng</option>
                  <option value="0">Đáp án A</option>
                  <option value="1">Đáp án B</option>
                  <option value="2">Đáp án C</option>
                  <option value="3">Đáp án D</option>
                </select>
                {addErrors.correctAnswer && <p className="text-xs text-red-500 mt-1">{addErrors.correctAnswer}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={() => { setShowAddModal(false); setAddForm(emptyForm); setAddErrors({}); }}
                className="px-5 py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition">Huỷ</button>
              <button onClick={handleAddSubmit}
                className="px-5 py-2 text-sm bg-[#F26739] hover:bg-orange-600 text-white rounded-md transition">Thêm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}