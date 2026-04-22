import { useState } from "react";
import { quizService } from "../../../services/QuizService";


const emptyQuestion = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
};

const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm border rounded-xl outline-none input-field ${
    err ? "error" : "border-gray-200"
  }`;

export default function AddQuizModal({ onClose, onSave }) {
  const [step, setStep]            = useState(1);
  const [quizTitle, setQuizTitle]  = useState("");
  const [description, setDesc]     = useState("");
  const [difficulty, setDifficulty]= useState("EASY");
  const [timeLimit, setTimeLimit]  = useState(30);
  const [titleErr, setTitleErr]    = useState("");
  const [questions, setQuestions]  = useState([]);
  const [currentQ, setCurrentQ]    = useState(emptyQuestion);
  const [currentQErrors, setCQErr] = useState({});
  const [editingIndex, setEditIdx] = useState(null);
  const [saving, setSaving]        = useState(false);
  const [saveErr, setSaveErr]      = useState("");

  // ── Validate ──────────────────────────────────────────────────────────────
  const validateTitle = () => {
    if (!quizTitle.trim()) { setTitleErr("Vui lòng nhập tên Quiz"); return false; }
    setTitleErr(""); return true;
  };

  const validateCurrentQ = () => {
    const err = {};
    if (!currentQ.question.trim()) err.question   = "Vui lòng nhập câu hỏi";
    if (!currentQ.optionA.trim())  err.optionA    = "Vui lòng nhập đáp án A";
    if (!currentQ.optionB.trim())  err.optionB    = "Vui lòng nhập đáp án B";
    if (!currentQ.optionC.trim())  err.optionC    = "Vui lòng nhập đáp án C";
    if (!currentQ.optionD.trim())  err.optionD    = "Vui lòng nhập đáp án D";
    if (!currentQ.correctAnswer)   err.correctAnswer = "Vui lòng chọn đáp án đúng";
    setCQErr(err);
    return Object.keys(err).length === 0;
  };

  // ── Question handlers ─────────────────────────────────────────────────────
  const handleQChange = (e) => {
    const { name, value } = e.target;
    setCurrentQ((p) => ({ ...p, [name]: value }));
    if (currentQErrors[name]) setCQErr((p) => ({ ...p, [name]: "" }));
  };

  const handleAddQuestion = () => {
    if (!validateCurrentQ()) return;
    const built = {
      question: currentQ.question,
      options: [currentQ.optionA, currentQ.optionB, currentQ.optionC, currentQ.optionD],
      correctAnswer: Number(currentQ.correctAnswer),
    };
    if (editingIndex !== null) {
      setQuestions((p) => p.map((q, i) => (i === editingIndex ? built : q)));
      setEditIdx(null);
    } else {
      setQuestions((p) => [...p, built]);
    }
    setCurrentQ(emptyQuestion);
    setCQErr({});
  };

  const handleEdit = (i) => {
    const q = questions[i];
    setCurrentQ({
      question:      q.question,
      optionA:       q.options[0],
      optionB:       q.options[1],
      optionC:       q.options[2],
      optionD:       q.options[3],
      correctAnswer: String(q.correctAnswer),
    });
    setEditIdx(i);
  };

  const handleRemoveQ = (i) => setQuestions((p) => p.filter((_, idx) => idx !== i));

  // ── Save to API ───────────────────────────────────────────────────────────
  const handleFinish = async () => {
    if (questions.length === 0) {
      setCQErr({ question: "Thêm ít nhất 1 câu hỏi" });
      return;
    }
    try {
      setSaving(true);
      setSaveErr("");
      const payload = {
        title:       quizTitle,
        description,
        difficulty,
        timeLimit:   Number(timeLimit),
        questions:   questions.map((q) => ({
          question:      q.question,
          options:       q.options,
          correctAnswer: q.correctAnswer,
        })),
      };
      const result = await quizService.create(payload);
      onSave(result);
    } catch (err) {
      setSaveErr(err?.response?.data?.message || "Lỗi tạo Quiz, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col modal-box"
        style={{ maxHeight: "90vh" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              {step === 1 ? "Tạo Quiz mới" : `Thêm câu hỏi — ${quizTitle}`}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-300"
                    style={{
                      background: step >= s ? "#F26739" : "#e5e7eb",
                      color:      step >= s ? "white"   : "#9ca3af",
                    }}
                  >
                    {s}
                  </div>
                  <span className="text-[11px]" style={{ color: step >= s ? "#F26739" : "#9ca3af" }}>
                    {s === 1 ? "Thông tin" : `${questions.length} câu`}
                  </span>
                  {s < 2 && (
                    <div className="w-5 h-px" style={{ background: step > s ? "#F26739" : "#e5e7eb" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {step === 1 ? (
            <div className="anim-fade-in space-y-4">
              {/* Tên quiz */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Tên Quiz <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên quiz..."
                  value={quizTitle}
                  onChange={(e) => { setQuizTitle(e.target.value); if (titleErr) setTitleErr(""); }}
                  className={inputCls(titleErr)}
                  autoFocus
                />
                {titleErr && <p className="text-xs text-red-500 mt-1">{titleErr}</p>}
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Mô tả
                </label>
                <textarea
                  placeholder="Nhập mô tả quiz..."
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  className={`${inputCls(false)} resize-none`}
                />
              </div>

              {/* Độ khó + Thời gian */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Độ khó
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className={inputCls(false)}
                  >
                    <option value="EASY">Dễ</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HARD">Khó</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className={inputCls(false)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="anim-fade-in space-y-4">
              {/* Danh sách câu hỏi đã thêm */}
              {questions.length > 0 && (
                <div className="space-y-1.5">
                  {questions.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gray-100 bg-gray-50/70"
                      style={{ animation: `fadeInUp 0.2s ${i * 0.03}s both` }}
                    >
                      <span className="text-[11px] font-semibold text-gray-400 shrink-0 w-5">#{i + 1}</span>
                      <p className="text-xs text-gray-600 flex-1 truncate">{q.question}</p>
                      <button
                        onClick={() => handleEdit(i)}
                        className="text-[11px] text-blue-500 hover:text-blue-700 shrink-0 transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleRemoveQ(i)}
                        className="text-[11px] text-red-400 hover:text-red-600 shrink-0 transition-colors"
                      >
                        Xoá
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form nhập câu hỏi mới */}
              <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {editingIndex !== null ? `Chỉnh sửa câu ${editingIndex + 1}` : "Câu hỏi mới"}
                </p>

                <div>
                  <textarea
                    name="question"
                    placeholder="Nhập câu hỏi..."
                    value={currentQ.question}
                    onChange={handleQChange}
                    rows={2}
                    className={`${inputCls(currentQErrors.question)} resize-none`}
                  />
                  {currentQErrors.question && (
                    <p className="text-xs text-red-500 mt-1">{currentQErrors.question}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {["A", "B", "C", "D"].map((letter) => {
                    const key = `option${letter}`;
                    return (
                      <div key={letter}>
                        <input
                          type="text"
                          name={key}
                          placeholder={`Đáp án ${letter}`}
                          value={currentQ[key]}
                          onChange={handleQChange}
                          className={inputCls(currentQErrors[key])}
                        />
                        {currentQErrors[key] && (
                          <p className="text-xs text-red-500 mt-0.5">{currentQErrors[key]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div>
                  <select
                    name="correctAnswer"
                    value={currentQ.correctAnswer}
                    onChange={handleQChange}
                    className={inputCls(currentQErrors.correctAnswer)}
                  >
                    <option value="">Chọn đáp án đúng</option>
                    <option value="0">Đáp án A</option>
                    <option value="1">Đáp án B</option>
                    <option value="2">Đáp án C</option>
                    <option value="3">Đáp án D</option>
                  </select>
                  {currentQErrors.correctAnswer && (
                    <p className="text-xs text-red-500 mt-1">{currentQErrors.correctAnswer}</p>
                  )}
                </div>

                <button
                  onClick={handleAddQuestion}
                  className="w-full py-2.5 text-sm border border-orange-200 text-orange-500 rounded-xl font-medium transition-all"
                  style={{ background: "#fff8f5" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#ffefe8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff8f5")}
                >
                  {editingIndex !== null ? "Cập nhật câu hỏi" : "+ Thêm câu hỏi này"}
                </button>
              </div>

              {saveErr && (
                <p className="text-xs text-red-500 text-center">{saveErr}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-2.5 px-6 pb-5 pt-3.5 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 ghost-btn"
          >
            Huỷ
          </button>
          {step === 1 ? (
            <button
              onClick={() => { if (validateTitle()) setStep(2); }}
              className="px-5 py-2.5 text-sm text-white rounded-xl font-medium primary-btn"
              style={{ background: "#F26739" }}
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="px-5 py-2.5 text-sm text-white rounded-xl font-medium primary-btn disabled:opacity-60"
              style={{ background: "#F26739" }}
            >
              {saving ? "Đang lưu..." : `Tạo Quiz (${questions.length} câu)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}