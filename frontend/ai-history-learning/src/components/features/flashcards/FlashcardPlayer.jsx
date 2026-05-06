import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FlashcardPlayer({ cards }) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);

	const normalizedCards = useMemo(() => {
		if (!Array.isArray(cards)) return null;
		return cards.map((card) => ({
			front: card.front ?? card.q ?? card.question ?? "",
			back: card.back ?? card.a ?? card.answer ?? "",
			difficulty: card.difficulty ?? null,
		}));
	}, [cards]);

	if (!normalizedCards) {
		return (
			<div className="w-full rounded-2xl border border-gray-200 bg-white p-6 text-center">
				<div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
				<p className="text-sm text-gray-500">Đang tải flashcard...</p>
			</div>
		);
	}

	if (normalizedCards.length === 0) {
		return (
			<div className="w-full rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
				<p className="text-base font-semibold text-gray-700">Bộ thẻ chưa có nội dung</p>
				<p className="mt-1 text-sm text-gray-500">Hãy tạo thêm thẻ để bắt đầu học.</p>
			</div>
		);
	}

	const total = normalizedCards.length;
	const currentCard = normalizedCards[currentIndex];

	const goPrev = () => {
		if (currentIndex === 0) return;
		setCurrentIndex((prev) => prev - 1);
		setIsFlipped(false);
	};

	const goNext = () => {
		if (currentIndex >= total - 1) return;
		setCurrentIndex((prev) => prev + 1);
		setIsFlipped(false);
	};

	return (
		<div className="w-full rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
			<div className="mb-4 flex items-center justify-between">
				<span className="text-xs font-bold uppercase tracking-wider text-gray-400">Thẻ {currentIndex + 1}</span>
				<span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
					{currentIndex + 1}/{total}
				</span>
			</div>

			<div className="perspective [perspective:1200px]">
				<button
					type="button"
					onClick={() => setIsFlipped((prev) => !prev)}
					className="group relative block h-[320px] w-full cursor-pointer rounded-2xl border border-gray-200 focus:outline-none"
				>
					<div
						className={`transform-style-3d relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
							isFlipped ? "rotate-y-180 [transform:rotateY(180deg)]" : ""
						}`}
					>
						<div className="backface-hidden absolute inset-0 flex h-full flex-col rounded-2xl bg-gradient-to-br from-white to-orange-50 p-6 [backface-visibility:hidden]">
							<span className="mb-4 inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
								Câu hỏi
							</span>
							<p className="m-auto text-center text-lg font-semibold leading-relaxed text-gray-900 sm:text-2xl">
								{currentCard.front || "Không có câu hỏi"}
							</p>
							{currentCard.difficulty && (
								<span className="mt-4 inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
									Độ khó: {currentCard.difficulty}
								</span>
							)}
						</div>

						<div className="backface-hidden absolute inset-0 flex h-full flex-col rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
							<span className="mb-4 inline-flex w-fit rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
								Đáp án 
							</span>
							<p className="m-auto text-center text-lg font-semibold leading-relaxed text-emerald-900 sm:text-2xl">
								{currentCard.back || "Chưa có đáp án"}
							</p>
						</div>
					</div>
				</button>
			</div>

			<div className="mt-5 flex items-center justify-between gap-3">
				<button
					type="button"
					onClick={goPrev}
					disabled={currentIndex === 0}
					className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
				>
					<ChevronLeft size={16} />
					Trước   
				</button>

				<button
					type="button"
					onClick={goNext}
					disabled={currentIndex >= total - 1}
					className="inline-flex items-center gap-1 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
				>
					Tiếp
					<ChevronRight size={16} />
				</button>
			</div>
		</div>
	);
}
