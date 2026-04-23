import React, { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/api/v1";

const Baikiemtra = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // MongoDB ObjectId của document
  const location = useLocation();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [doc, setDoc] = useState(location.state?.doc ?? null);
  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [tempAnswer, setTempAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Fetch quiz theo documentId
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        // Fetch quizzes liên quan đến document này
        const res = await axios.get(`${API}/quizzes/by-document/${id}`, { headers });
        const data = res.data.data ?? res.data ?? [];

        // Chuẩn hoá: mỗi quiz item cần có question, options[], correct
        // Tuỳ schema backend của bạn, điều chỉnh mapping ở đây
        const normalized = data.map((q, i) => ({
          id: q._id ?? i,
          question: q.question,
          options: q.options ?? q.choices ?? [],
          // correct là string khớp với một trong options
          correct: q.correctAnswer ?? q.correct ?? q.answer ?? "",
        }));

        if (!normalized.length) {
          setFetchError("Tài liệu này chưa có câu hỏi kiểm tra.");
        } else {
          setQuestionsData(normalized);
          // Đặt thời gian: 30s mỗi câu, tối thiểu 60s
          setTimeLeft(Math.max(60, normalized.length * 30));
        }
      } catch (err) {
        console.error("Lỗi tải quiz:", err.response?.data ?? err.message);
        setFetchError("Không thể tải bài kiểm tra. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    // Nếu chưa có doc info, fetch luôn
    if (!doc) {
      axios.get(`${API}/documents/${id}`, { headers })
        .then((r) => setDoc(r.data.data))
        .catch(() => {});
    }

    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Timer
  useEffect(() => {
    if (!questionsData.length) return;
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      setIsSubmitted(true);
    }
  }, [timeLeft, isSubmitted, questionsData.length]);

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
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 2000);
      return;
    }
    setSaveStatus("saving");
    setTimeout(() => {
      setAnswers({ ...answers, [currentIdx]: tempAnswer });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 2000);
    }, 400);
  };

  const handleSubmit = () => {
    if (!window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;
    setIsSubmitted(true);
  };

  const calculateScore = () =>
    questionsData.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);

  const total = questionsData.length;

  // ── Loading ──
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  // ── Error / No quiz ──
  if (fetchError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#FAFAFA]">
        <div className="text-center space-y-2">
          <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">{fetchError}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-[#F26739] text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  // ── Kết quả ──
  if (isSubmitted) {
    const score = calculateScore();
    return (
      <div className="p-8 bg-[#FAFAFA] min-h-screen font-['Inter']">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-2xl font-bold mb-2">Kết Quả Bài Kiểm Tra</h1>
          <p className="text-gray-500 mb-6">Tài liệu › Bài Kiểm Tra › Kết Quả</p>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 bg-white p-8 rounded-xl border border-[#E4E4E7] shadow-sm">
              <div className="flex items-center gap-10">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="#E4E4E7" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="64" cy="64" r="58"
                      stroke="#10B981" strokeWidth="8" fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * (score / total))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold">{Math.round((score / total) * 100)}%</span>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 font-medium">
                    Kết Quả: <span className="text-black">{score}/{total} Đúng</span>
                  </p>
                  <p className="text-green-600 font-semibold italic">Hoàn thành bài kiểm tra!</p>
                </div>
              </div>

              <div className="mt-8 bg-[#81F69F] rounded-2xl p-6 flex flex-col items-center justify-center h-48 border border-green-300">
                <div className="text-5xl font-black text-[#10B981]">
                  SCORE {score}/{total}
                </div>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="mt-6 w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-all"
              >
                Quay lại trang tài liệu
              </button>
            </div>

            <div className="w-full lg:w-[400px] bg-[#D9D9D9] p-6 rounded-xl">
              <h3 className="font-bold mb-4">Xem Lại</h3>
              <div className="grid grid-cols-5 gap-3">
                {questionsData.map((q, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-white text-sm
                      ${!answers[i] ? "bg-white text-gray-400 border" : answers[i] === q.correct ? "bg-blue-600" : "bg-red-600"}`}
                  >
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

  // ── Đề thi ──
  return (
    <div className="p-8 bg-[#FAFAFA] min-h-screen font-['Inter'] flex flex-col items-center">
      <div className="w-full max-w-[1280px]">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="p-1 bg-black text-white rounded">📖</span> Bài Kiểm Tra
            </h1>
            <p className="text-gray-500 mt-1">Tài liệu › Bài Kiểm Tra</p>
            {doc?.title && (
              <h2 className="text-xl font-bold mt-4 uppercase">{doc.title}</h2>
            )}
          </div>
          <div className="bg-[#F26739] text-white px-6 py-3 rounded-lg flex items-center gap-3 shadow-lg">
            <Clock size={24} />
            <span className="text-lg font-bold">Thời Gian Còn Lại: {formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Câu hỏi */}
          <div className="flex-1">
            <div className="bg-white p-10 rounded-2xl border border-[#E4E4E7] shadow-sm relative min-h-[400px]">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-bold text-sm">
                  Câu {currentIdx + 1}
                </span>
                <p className="text-lg font-bold text-gray-800">
                  {questionsData[currentIdx].question}
                </p>
              </div>

              <div className="space-y-4">
                {questionsData[currentIdx].options.map((opt, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer
                      ${tempAnswer === opt
                        ? "border-[#F26739] bg-orange-50"
                        : "border-gray-100 bg-white hover:bg-gray-50"}`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      name="answer"
                      checked={tempAnswer === opt}
                      onChange={() => setTempAnswer(opt)}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${tempAnswer === opt ? "border-[#F26739]" : "border-gray-300"}`}>
                      {tempAnswer === opt && <div className="w-2.5 h-2.5 bg-[#F26739] rounded-full" />}
                    </div>
                    <span className="font-medium text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>

              {/* Save button (góc trên phải của card) */}
              <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                <button
                  onClick={handleSaveAnswer}
                  disabled={saveStatus === "saving"}
                  className={`font-bold px-6 py-2 rounded-lg text-sm border transition-all
                    ${saveStatus === "saving"
                      ? "bg-gray-100 text-gray-400 border-gray-300"
                      : "bg-orange-100 text-[#F26739] border-[#F26739] hover:bg-[#F26739] hover:text-white"}`}
                >
                  {saveStatus === "saving" ? "Đang lưu..." : "Lưu câu trả lời"}
                </button>
                {saveStatus === "success" && (
                  <span className="text-green-600 text-xs font-bold animate-bounce">✓ Đã lưu thành công</span>
                )}
                {saveStatus === "error" && (
                  <span className="text-red-600 text-xs font-bold">! Vui lòng chọn đáp án</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <span className="font-bold text-gray-500">{currentIdx + 1} / {total} Câu</span>
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentIdx(0)}
                  className="bg-orange-500 text-white px-8 py-2 rounded-full font-bold hover:bg-orange-600 transition-all shadow-md"
                >
                  Quay lại câu đầu
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-[#F26739] text-white px-8 py-2 rounded-full font-bold hover:opacity-90 shadow-md"
                >
                  Nộp Bài
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((p) => p - 1)}
                  className="p-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft />
                </button>
                <button
                  disabled={currentIdx === total - 1}
                  onClick={() => setCurrentIdx((p) => p + 1)}
                  className="p-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>

          {/* Panel danh sách câu */}
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

            <button
              onClick={handleSaveAnswer}
              className="w-full bg-[#F26739] text-white py-4 rounded-xl mt-12 font-bold text-xl flex items-center justify-center gap-3 hover:bg-orange-600 shadow-lg"
            >
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
