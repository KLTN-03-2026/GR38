import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../../lib/api";

const FlashcardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const rawDocId =
    location.state?.documentId ?? sessionStorage.getItem(`flash_docId_${id}`);
  const documentId =
    typeof rawDocId === "object" && rawDocId !== null
      ? rawDocId?._id
      : rawDocId;
  console.log(">>> documentId:", documentId);
  console.log(">>> location.state:", location.state);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (location.state?.documentId) {
      sessionStorage.setItem(`flash_docId_${id}`, location.state.documentId);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // 1. Bộ tự tạo (localStorage)
        const local = JSON.parse(localStorage.getItem("flashcards") || "[]");
        const found = local.find((item) => String(item.id) === String(id));
        if (found) {
          setFlashcardSet({
            title: found.title,
            questions: found.cards.map((c) => ({ q: c.front, a: c.back })),
          });
          return;
        }

        // 2. Bộ AI từ API — gọi list rồi filter theo id
        const res = await api.get(`/flashcards`);
        const allItems = res.data.data ?? res.data ?? [];

        const raw = Array.isArray(allItems)
          ? allItems.find((item) => (item._id ?? item.id) === id)
          : allItems;

        if (!raw) {
          setFlashcardSet(null);
          return;
        }

        const cards = raw?.cards ?? raw?.items ?? [];
        setFlashcardSet({
          title: raw?.title ?? "Flashcard",
          questions: cards.map((c) => ({
            q: c.front ?? c.question ?? c.term ?? "",
            a: c.back ?? c.answer ?? c.definition ?? "",
          })),
        });
      } catch (err) {
        console.error("Lỗi tải flashcard:", err.message);
        setFlashcardSet(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);
  const goBack = () => {
    console.log(">>> goBack documentId:", documentId);
    if (documentId) {
      navigate(`/teacher/documents/${documentId}`, {
        state: { activeTab: "FlashCard" },
      });
    } else {
      navigate(-1);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcardSet.questions.length - 1) {
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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Đang tải flashcard...</p>
        </div>
      </div>
    );

  if (!flashcardSet || !flashcardSet.questions?.length)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] gap-4">
        <p className="text-[20px] font-bold text-gray-500">
          Không tìm thấy bộ flashcard này.
        </p>
        <button
          onClick={goBack}
          className="bg-[#F26739] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#d9562d] transition-colors"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );

  const { title, questions } = flashcardSet;

  return (
    <div className="flex flex-col items-start p-[20px_16px] gap-[20px] w-full min-h-screen bg-[#FAFAFA] font-['Inter']">
      <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] flex items-center px-[18px] shadow-sm">
        <button
          onClick={goBack}
          className="text-[16px] font-semibold flex items-center gap-2 text-gray-700 hover:text-[#F26739] transition-colors"
        >
          ← Quay lại danh sách
        </button>
      </div>

      <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-[28px] font-black mb-8 uppercase text-[#18181B] tracking-tight">
          {title}
        </h2>

        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full min-h-[400px] rounded-3xl flex flex-col p-8 cursor-pointer transition-all duration-500 shadow-lg border-2 ${
            isFlipped
              ? "bg-[#47ED70] border-[#36BA58]"
              : "bg-[#F4F4F5] border-[#E4E4E7]"
          }`}
        >
          <div className="flex justify-start w-full mb-4">
            <span
              className={`text-[13px] px-6 py-2 rounded-full font-bold shadow-sm ${
                isFlipped
                  ? "bg-white text-[#36BA58]"
                  : "bg-[#1473E6] text-white"
              }`}
            >
              {isFlipped
                ? `ĐÁP ÁN ${currentIndex + 1}`
                : `CÂU HỎI ${currentIndex + 1}`}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
            <p
              className={`text-[30px] font-extrabold leading-tight max-w-[900px] ${
                isFlipped ? "text-[#064E3B]" : "text-[#18181B]"
              }`}
            >
              {isFlipped
                ? questions[currentIndex].a
                : questions[currentIndex].q}
            </p>
          </div>

          {!isFlipped && (
            <div className="flex justify-center mt-6">
              <div className="bg-[#F26739] text-white text-[14px] px-6 py-2.5 rounded-xl font-bold shadow-md animate-bounce">
                Chạm để xem đáp án 👆
              </div>
            </div>
          )}
        </div>

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
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 font-bold text-[16px] hover:text-[#F26739] disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={24} /> TRƯỚC
            </button>

            <div className="hidden md:flex gap-2 flex-wrap max-w-[500px] justify-center">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    setIsFlipped(false);
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                    currentIndex === i
                      ? "bg-[#18181B] text-white shadow-lg"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-2 font-bold text-[16px] hover:text-[#F26739] disabled:opacity-20 transition-all"
            >
              TIẾP THEO <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FlashcardDetail;
