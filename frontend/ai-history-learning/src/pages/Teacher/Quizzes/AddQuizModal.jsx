import { useState, useEffect, useRef } from "react";
import { quizService } from "../../../services/quizService";
import api from "../../../lib/api";

const MAX_Q = 20, MIN_Q = 5, MAX_MB = 5;
const EMPTY_Q = { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "" };
const LETTERS = ["A", "B", "C", "D"];

const cls = (err) => `w-full px-3 py-2.5 text-sm border rounded-xl outline-none input-field ${err ? "border-red-300 bg-red-50" : "border-gray-200"}`;

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

function ThumbnailPicker({ preview, name, onChange, onRemove, error, maxMb }) {
  const ref = useRef(null);
  const FileInput = () => <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onChange} />;
  return (
    <Field label="Ảnh bìa (Thumbnail)" error={error}>
      {preview ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 group" style={{ height: 160 }}>
          <img src={preview} alt="thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.45)" }}>
            <label className="cursor-pointer px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100">Đổi ảnh <FileInput /></label>
            <button type="button" onClick={onRemove} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600">Xoá ảnh</button>
          </div>
          {name && <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-md px-2 py-0.5"><span className="text-[10px] text-white truncate max-w-[200px] block">{name}</span></div>}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all" style={{ height: 140, borderColor: "#E5E7EB", background: "#FAFAFA" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#F26739"; e.currentTarget.style.background = "#FFF8F5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FAFAFA"; }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "#F3F4F6" }}>
            <svg width="20" height="20" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12zm-4.5 9h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0021 4.5H6a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 006 21h3z" /></svg>
          </div>
          <span className="text-xs font-medium text-gray-500">Nhấn để chọn ảnh bìa</span>
          <span className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP — tối đa {maxMb}MB</span>
          <FileInput />
        </label>
      )}
    </Field>
  );
}

export default function AddQuizModal({ onClose, onSave, documentId, editQuiz }) {
  const isEdit = !!editQuiz;
  const [step, setStep] = useState(1);
  const [quizTitle, setQuizTitle] = useState("");
  const [description, setDesc] = useState("");
  const [difficulty, setDiff] = useState("EASY");
  const [timeLimit, setTime] = useState(30);
  const [titleErr, setTitleErr] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(EMPTY_Q);
  const [qErrors, setQErrors] = useState({});
  const [editIdx, setEditIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [listErr, setListErr] = useState("");
  const [thumb, setThumb] = useState(null);
  const [thumbPreview, setThumbPrev] = useState("");
  const [thumbErr, setThumbErr] = useState("");
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(documentId ?? "");

  useEffect(() => {
    (async () => {
      try {
        setDocsLoading(true);
        const res = await api.get("/documents");
        setDocs(Array.isArray(res?.data?.data ?? res?.data) ? (res?.data?.data ?? res?.data) : []);
      } catch { setDocs([]); }
      finally { setDocsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!editQuiz) return;
    setQuizTitle(editQuiz.title ?? "");
    setDesc(editQuiz.description ?? "");
    setDiff(editQuiz.difficulty ?? "EASY");
    setTime(editQuiz.timeLimit ?? editQuiz.time_limit ?? 30);
    if (editQuiz.thumbnail) setThumbPrev(editQuiz.thumbnail);
    setSelectedDoc(String(editQuiz.documentId ?? documentId ?? ""));
    setQuestions((editQuiz.questions ?? []).map((q) => {
      const idx = q.correctAnswerIndex ?? q.options?.indexOf(q.correctAnswer) ?? 0;
      return { question: q.question, options: q.options ?? [], correctAnswer: q.options?.[idx] ?? q.correctAnswer ?? "", correctAnswerIndex: idx };
    }));
  }, [editQuiz]);

  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) { setThumbErr(`Ảnh quá lớn, tối đa ${MAX_MB}MB`); return; }
    setThumbErr(""); setThumb(file); setThumbPrev(URL.createObjectURL(file));
  };

  const handleQChange = ({ target: { name, value } }) => {
    setCurrentQ((p) => ({ ...p, [name]: value }));
    if (qErrors[name]) setQErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateQ = () => {
    const err = {};
    if (!currentQ.question.trim()) err.question = "Vui lòng nhập câu hỏi";
    LETTERS.forEach((l) => { if (!currentQ[`option${l}`].trim()) err[`option${l}`] = `Vui lòng nhập đáp án ${l}`; });
    if (!currentQ.correctAnswer) err.correctAnswer = "Vui lòng chọn đáp án đúng";
    setQErrors(err);
    return !Object.keys(err).length;
  };

  const handleAddQ = () => {
    if (editIdx === null && questions.length >= MAX_Q) { setListErr(`Tối đa ${MAX_Q} câu hỏi`); return; }
    if (!validateQ()) return;
    const options = LETTERS.map((l) => currentQ[`option${l}`]);
    const ci = Number(currentQ.correctAnswer);
    if (!options[ci]) { setQErrors((p) => ({ ...p, correctAnswer: "Đáp án đúng không hợp lệ" })); return; }
    const built = { question: currentQ.question, options, correctAnswer: options[ci], correctAnswerIndex: ci };
    setQuestions((p) => editIdx !== null ? p.map((q, i) => (i === editIdx ? built : q)) : [...p, built]);
    setEditIdx(null); setListErr(""); setCurrentQ(EMPTY_Q); setQErrors({});
  };

  const handleEdit = (i) => {
    const q = questions[i];
    const ci = q.correctAnswerIndex ?? q.options.indexOf(q.correctAnswer);
    setCurrentQ({ question: q.question, ...Object.fromEntries(LETTERS.map((l, j) => [`option${l}`, q.options[j] ?? ""])), correctAnswer: String(ci === -1 ? 0 : ci) });
    setEditIdx(i);
  };

  // ✅ Chỉ xóa trong state, lưu toàn bộ khi bấm "Lưu thay đổi"
  const handleRemoveQ = (i) => {
    setQuestions((p) => p.filter((_, j) => j !== i));
    if (editIdx === i) { setEditIdx(null); setCurrentQ(EMPTY_Q); }
    setListErr("");
  };

  const handleFinish = async () => {
    if (questions.length < MIN_Q) { setListErr(`Cần ít nhất ${MIN_Q} câu hỏi`); return; }
    try {
      setSaving(true); setSaveErr("");
      const data = {
        title: quizTitle, description, difficulty,
        timeLimit: Number(timeLimit),
        documentId: selectedDoc || null,
        questions: questions.map(({ question, options, correctAnswer, correctAnswerIndex }) => ({ question, options, correctAnswer, correctAnswerIndex })),
      };
      const result = isEdit
        ? await quizService.update(editQuiz._id ?? editQuiz.id, data, thumb ?? undefined)
        : await quizService.create(data, thumb ?? undefined);
      onSave(result, isEdit, questions);
    } catch (err) {
      setSaveErr(err?.response?.data?.message || `Lỗi ${isEdit ? "cập nhật" : "tạo"} Quiz, vui lòng thử lại.`);
    } finally { setSaving(false); }
  };

  const btnBase = "px-5 py-2.5 text-sm rounded-xl font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col modal-box" style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              {isEdit ? (step === 1 ? "Chỉnh sửa Quiz" : `Chỉnh sửa câu hỏi — ${quizTitle}`) : (step === 1 ? "Tạo Quiz mới" : `Thêm câu hỏi — ${quizTitle}`)}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-300"
                    style={{ background: step >= s ? "#F26739" : "#e5e7eb", color: step >= s ? "white" : "#9ca3af" }}>{s}</div>
                  <span className="text-[11px]" style={{ color: step >= s ? "#F26739" : "#9ca3af" }}>
                    {s === 1 ? "Thông tin" : `${questions.length}/${MAX_Q} câu`}
                  </span>
                  {s < 2 && <div className="w-5 h-px" style={{ background: step > s ? "#F26739" : "#e5e7eb" }} />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all text-xl">×</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <Field label="Tên Quiz" required error={titleErr}>
                <input type="text" placeholder="Nhập tên quiz..." value={quizTitle} autoFocus
                  onChange={(e) => { setQuizTitle(e.target.value); if (titleErr) setTitleErr(""); }}
                  className={cls(titleErr)} />
              </Field>
              <Field label="Mô tả">
                <textarea placeholder="Nhập mô tả quiz..." value={description} rows={2}
                  onChange={(e) => setDesc(e.target.value)} className={`${cls(false)} resize-none`} />
              </Field>
              <Field label="Tài liệu gắn với Quiz (Tuỳ chọn)">
                <select value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)} disabled={docsLoading} className={cls(false)}>
                  <option value="">-- Không gắn tài liệu --</option>
                  {docs.map((d) => { const id = String(d._id ?? d.id); return <option key={id} value={id}>{d.title ?? d.name}</option>; })}
                </select>
                {docsLoading && <p className="text-xs text-gray-400 mt-1">Đang tải danh sách tài liệu...</p>}
              </Field>
              <ThumbnailPicker preview={thumbPreview} name={thumb?.name} maxMb={MAX_MB}
                onChange={handleThumbChange} onRemove={() => { setThumb(null); setThumbPrev(""); setThumbErr(""); }} error={thumbErr} />
              <div className="grid gap-3">           
                <Field label="Thời gian (phút)">
                  <input type="number" min={1} value={timeLimit} onChange={(e) => setTime(e.target.value)} className={cls(false)} />
                </Field>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.length > 0 && (
                <div className="space-y-1.5">
                  {questions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gray-100 bg-gray-50">
                      <span className="text-[11px] font-semibold text-gray-400 shrink-0 w-5">#{i + 1}</span>
                      <p className="text-xs text-gray-600 flex-1 truncate">{q.question}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 shrink-0">{LETTERS[q.correctAnswerIndex]}</span>
                      <button onClick={() => handleEdit(i)} className="text-[11px] text-blue-500 hover:text-blue-700 transition-colors">Sửa</button>
                      <button onClick={() => handleRemoveQ(i)} className="text-[11px] text-red-400 hover:text-red-600 transition-colors">Xoá</button>
                    </div>
                  ))}
                </div>
              )}

              {(editIdx !== null || questions.length < MAX_Q) && (
                <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {editIdx !== null ? `Chỉnh sửa câu ${editIdx + 1}` : "Câu hỏi mới"}
                  </p>
                  <div>
                    <textarea name="question" placeholder="Nhập câu hỏi..." value={currentQ.question}
                      onChange={handleQChange} rows={2} className={`${cls(qErrors.question)} resize-none`} />
                    {qErrors.question && <p className="text-xs text-red-500 mt-1">{qErrors.question}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {LETTERS.map((l) => {
                      const key = `option${l}`;
                      return (
                        <div key={l}>
                          <input type="text" name={key} placeholder={`Đáp án ${l}`} value={currentQ[key]} onChange={handleQChange} className={cls(qErrors[key])} />
                          {qErrors[key] && <p className="text-xs text-red-500 mt-0.5">{qErrors[key]}</p>}
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <select name="correctAnswer" value={currentQ.correctAnswer} onChange={handleQChange} className={cls(qErrors.correctAnswer)}>
                      <option value="">Chọn đáp án đúng</option>
                      {LETTERS.map((l, i) => <option key={l} value={i}>Đáp án {l}</option>)}
                    </select>
                    {qErrors.correctAnswer && <p className="text-xs text-red-500 mt-1">{qErrors.correctAnswer}</p>}
                  </div>
                  <button onClick={handleAddQ} className="w-full py-2.5 text-sm border border-orange-200 text-orange-500 rounded-xl font-medium transition-all"
                    style={{ background: "#fff8f5" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#ffefe8")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff8f5")}>
                    {editIdx !== null ? "Cập nhật câu hỏi" : "+ Thêm câu hỏi này"}
                  </button>
                </div>
              )}

              {questions.length >= MAX_Q && editIdx === null && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-orange-600">Đã đạt tối đa <strong>{MAX_Q} câu hỏi</strong>. Xoá bớt để thêm câu mới.</p>
                </div>
              )}
              {listErr && <p className="text-xs text-red-500 text-center">{listErr}</p>}
              {saveErr && <p className="text-xs text-red-500 text-center">{saveErr}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 pb-5 pt-3.5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className={`${btnBase} border border-gray-200 text-gray-600 ghost-btn`}>Huỷ</button>
          {step === 1 ? (
            <button onClick={() => { if (!quizTitle.trim()) { setTitleErr("Vui lòng nhập tên Quiz"); return; } setStep(2); }}
              className={`${btnBase} text-white primary-btn`} style={{ background: "#F26739" }}>
              Tiếp theo →
            </button>
          ) : (
            <button onClick={handleFinish} disabled={saving}
              className={`${btnBase} text-white primary-btn disabled:opacity-60`} style={{ background: "#F26739" }}>
              {saving ? "Đang lưu..." : isEdit ? `Lưu thay đổi (${questions.length} câu)` : "Tạo Quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}