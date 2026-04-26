import { useState, useEffect } from "react";
import { quizService } from "../../../services/quizService";

const emptyQuestion = { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "" };

const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm border rounded-xl outline-none input-field ${err ? "border-red-300 bg-red-50" : "border-gray-200"}`;

export default function AddQuizModal({ onClose, onSave, documentId, editQuiz }) {
  const isEdit = !!editQuiz;

  const [step, setStep]             = useState(1);
  const [quizTitle, setQuizTitle]   = useState("");
  const [description, setDesc]      = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [timeLimit, setTimeLimit]   = useState(30);
  const [titleErr, setTitleErr]     = useState("");
  const [questions, setQuestions]   = useState([]);
  const [currentQ, setCurrentQ]     = useState(emptyQuestion);
  const [currentQErrors, setCQErr]  = useState({});
  const [editingIndex, setEditIdx]  = useState(null);
  const [saving, setSaving]         = useState(false);
  const [saveErr, setSaveErr]       = useState("");
  const [listErr, setListErr]       = useState(""); // ← lỗi riêng cho danh sách câu hỏi

  useEffect(() => {
    if (!editQuiz) return;
    setQuizTitle(editQuiz.title ?? "");
    setDesc(editQuiz.description ?? "");
    setDifficulty(editQuiz.difficulty ?? "EASY");
    setTimeLimit(editQuiz.time_limit ?? 30);
    const normalized = (editQuiz.questions ?? []).map((q) => {
      const idx = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : q.options?.indexOf(q.correctAnswer) ?? 0;
      return { question: q.question, options: q.options ?? [], correctAnswer: q.options?.[idx] ?? q.correctAnswer ?? "", correctAnswerIndex: idx };
    });
    setQuestions(normalized);
  }, [editQuiz]);

  const validateTitle = () => {
    if (!quizTitle.trim()) { setTitleErr("Vui lòng nhập tên Quiz"); return false; }
    setTitleErr(""); return true;
  };

  const validateCurrentQ = () => {
    const err = {};
    if (!currentQ.question.trim()) err.question      = "Vui lòng nhập câu hỏi";
    if (!currentQ.optionA.trim())  err.optionA       = "Vui lòng nhập đáp án A";
    if (!currentQ.optionB.trim())  err.optionB       = "Vui lòng nhập đáp án B";
    if (!currentQ.optionC.trim())  err.optionC       = "Vui lòng nhập đáp án C";
    if (!currentQ.optionD.trim())  err.optionD       = "Vui lòng nhập đáp án D";
    if (!currentQ.correctAnswer)   err.correctAnswer = "Vui lòng chọn đáp án đúng";
    setCQErr(err);
    return Object.keys(err).length === 0;
  };

  const handleQChange = (e) => {
    const { name, value } = e.target;
    setCurrentQ((p) => ({ ...p, [name]: value }));
    if (currentQErrors[name]) setCQErr((p) => ({ ...p, [name]: "" }));
  };

  const handleAddQuestion = () => {
    if (!validateCurrentQ()) return;
    const options      = [currentQ.optionA, currentQ.optionB, currentQ.optionC, currentQ.optionD];
    const correctIndex = Number(currentQ.correctAnswer);
    const correctText  = options[correctIndex];
    if (!correctText || !options.includes(correctText)) {
      setCQErr((p) => ({ ...p, correctAnswer: "Đáp án đúng không hợp lệ" }));
      return;
    }
    const built = { question: currentQ.question, options, correctAnswer: correctText, correctAnswerIndex: correctIndex };
    if (editingIndex !== null) {
      setQuestions((p) => p.map((q, i) => (i === editingIndex ? built : q)));
      setEditIdx(null);
    } else {
      setQuestions((p) => [...p, built]);
    }
    setListErr(""); // xóa lỗi danh sách khi thêm thành công
    setCurrentQ(emptyQuestion);
    setCQErr({});
  };

  const handleEdit = (i) => {
    const q = questions[i];
    const correctIndex = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : q.options.indexOf(q.correctAnswer);
    setCurrentQ({
      question: q.question,
      optionA: q.options[0] ?? "",
      optionB: q.options[1] ?? "",
      optionC: q.options[2] ?? "",
      optionD: q.options[3] ?? "",
      correctAnswer: String(correctIndex === -1 ? 0 : correctIndex),
    });
    setEditIdx(i);
  };

  const handleRemoveQ = (i) => setQuestions((p) => p.filter((_, idx) => idx !== i));

  const handleFinish = async () => {
    // ← Fix: dùng listErr riêng thay vì setCQErr để không gây confusion
    if (questions.length < 5) {
      setListErr("Cần ít nhất 5 câu hỏi để tạo Quiz");
      return;
    }
    setListErr("");
    try {
      setSaving(true);
      setSaveErr("");
      const payload = {
        title:       quizTitle,
        description,
        difficulty,
        timeLimit:   Number(timeLimit),
        documentId:  documentId ?? null,
        questions:   questions.map((q) => ({
          question:           q.question,
          options:            q.options,
          correctAnswer:      q.correctAnswer,
          correctAnswerIndex: q.correctAnswerIndex,
        })),
      };

      let result;
      if (isEdit) {
        const quizId = editQuiz._id ?? editQuiz.id;
        result = await quizService.update(quizId, payload);
      } else {
        result = await quizService.create(payload);
      }
      // Truyền kèm questions local vì server thường không trả lại đủ questions trong response
      onSave(result, isEdit, questions);
    } catch (err) {
      setSaveErr(err?.response?.data?.message || `Lỗi ${isEdit ? "cập nhật" : "tạo"} Quiz, vui lòng thử lại.`);
      console.error("❌ Lỗi chi tiết:", err?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col modal-box" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              {isEdit
                ? step === 1 ? "Chỉnh sửa Quiz" : `Chỉnh sửa câu hỏi — ${quizTitle}`
                : step === 1 ? "Tạo Quiz mới"   : `Thêm câu hỏi — ${quizTitle}`}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-300"
                    style={{ background: step >= s ? "#F26739" : "#e5e7eb", color: step >= s ? "white" : "#9ca3af" }}>
                    {s}
                  </div>
                  <span className="text-[11px]" style={{ color: step >= s ? "#F26739" : "#9ca3af" }}>
                    {s === 1 ? "Thông tin" : `${questions.length}/5 câu`}
                  </span>
                  {s < 2 && <div className="w-5 h-px" style={{ background: step > s ? "#F26739" : "#e5e7eb" }} />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all text-xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Tên Quiz <span className="text-red-400">*</span></label>
                <input type="text" placeholder="Nhập tên quiz..." value={quizTitle}
                  onChange={(e) => { setQuizTitle(e.target.value); if (titleErr) setTitleErr(""); }}
                  className={inputCls(titleErr)} autoFocus />
                {titleErr && <p className="text-xs text-red-500 mt-1">{titleErr}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Mô tả</label>
                <textarea placeholder="Nhập mô tả quiz..." value={description}
                  onChange={(e) => setDesc(e.target.value)} rows={2} className={`${inputCls(false)} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Độ khó</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={inputCls(false)}>
                    <option value="EASY">Dễ</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HARD">Khó</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Thời gian (phút)</label>
                  <input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} className={inputCls(false)} />
                </div>
              </div>
              {!documentId && (
                <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                  <svg width="15" height="15" className="text-orange-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-orange-600">Quiz này sẽ được tạo <strong>không gắn với tài liệu</strong> nào. Bạn có thể gắn tài liệu sau.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Danh sách câu hỏi đã thêm */}
              {questions.length > 0 && (
                <div className="space-y-1.5">
                  {questions.map((q, i) => (
                    // ← Fix: bỏ hoàn toàn animation fadeInUp, dùng style tĩnh
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gray-100 bg-gray-50"
                      style={{ opacity: 1, visibility: "visible" }}
                    >
                      <span className="text-[11px] font-semibold text-gray-400 shrink-0 w-5">#{i + 1}</span>
                      <p className="text-xs text-gray-600 flex-1 truncate">{q.question}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 shrink-0">
                        {["A","B","C","D"][q.correctAnswerIndex]}
                      </span>
                      <button onClick={() => handleEdit(i)} className="text-[11px] text-blue-500 hover:text-blue-700 shrink-0 transition-colors">Sửa</button>
                      <button onClick={() => handleRemoveQ(i)} className="text-[11px] text-red-400 hover:text-red-600 shrink-0 transition-colors">Xoá</button>
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
                  <textarea name="question" placeholder="Nhập câu hỏi..." value={currentQ.question}
                    onChange={handleQChange} rows={2} className={`${inputCls(currentQErrors.question)} resize-none`} />
                  {currentQErrors.question && <p className="text-xs text-red-500 mt-1">{currentQErrors.question}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["A", "B", "C", "D"].map((letter) => {
                    const key = `option${letter}`;
                    return (
                      <div key={letter}>
                        <input type="text" name={key} placeholder={`Đáp án ${letter}`}
                          value={currentQ[key]} onChange={handleQChange} className={inputCls(currentQErrors[key])} />
                        {currentQErrors[key] && <p className="text-xs text-red-500 mt-0.5">{currentQErrors[key]}</p>}
                      </div>
                    );
                  })}
                </div>
                <div>
                  <select name="correctAnswer" value={currentQ.correctAnswer} onChange={handleQChange} className={inputCls(currentQErrors.correctAnswer)}>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="0">Đáp án A</option>
                    <option value="1">Đáp án B</option>
                    <option value="2">Đáp án C</option>
                    <option value="3">Đáp án D</option>
                  </select>
                  {currentQErrors.correctAnswer && <p className="text-xs text-red-500 mt-1">{currentQErrors.correctAnswer}</p>}
                </div>
                <button onClick={handleAddQuestion}
                  className="w-full py-2.5 text-sm border border-orange-200 text-orange-500 rounded-xl font-medium transition-all"
                  style={{ background: "#fff8f5" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#ffefe8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff8f5")}>
                  {editingIndex !== null ? "Cập nhật câu hỏi" : "+ Thêm câu hỏi này"}
                </button>
              </div>

              {/* ← Fix: lỗi "chưa đủ 5 câu" hiển thị riêng, không dùng currentQErrors */}
              {listErr && <p className="text-xs text-red-500 text-center">{listErr}</p>}
              {saveErr && <p className="text-xs text-red-500 text-center">{saveErr}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 pb-5 pt-3.5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 ghost-btn">Huỷ</button>
          {step === 1 ? (
            <button onClick={() => { if (validateTitle()) setStep(2); }}
              className="px-5 py-2.5 text-sm text-white rounded-xl font-medium primary-btn" style={{ background: "#F26739" }}>
              Tiếp theo →
            </button>
          ) : (
            <button onClick={handleFinish} disabled={saving}
              className="px-5 py-2.5 text-sm text-white rounded-xl font-medium primary-btn disabled:opacity-60" style={{ background: "#F26739" }}>
              {saving ? "Đang lưu..." : isEdit ? `Lưu thay đổi (${questions.length} câu)` : `Tạo Quiz (${questions.length}/5 câu)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}