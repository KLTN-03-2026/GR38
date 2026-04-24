import Flashcard from "../models/Flashcard.js";
import FlashcardProgress from "../models/FlashcardProgress.js";
import { USER_ROLES } from "../models/User.js";

const resolveFlashcardSetId = async ({ setId, cardId }) => {
    if (setId) {
        return setId;
    }

    const flashcardSet = await Flashcard.findOne({
        "cards._id": cardId
    }).select("_id");

    return flashcardSet?._id || null;
};

//@desc Tải tất cả flashcard của tài liệu (Kèm ảnh tài liệu)
// @route GET /api/flashcards/:documentId
// @access Private
export const getFlashcards = async (req, res, next) => {
    try {
        const { documentId } = req.params;

        // 1. Tìm bộ Flashcard gốc và "kéo" theo title, thumbnail của Document
        const flashcardSet = await Flashcard.findOne({ 
            documentId: documentId 
        }).populate('documentId', 'title thumbnail'); // ✅ THÊM POPULATE Ở ĐÂY

        if (!flashcardSet) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }

        // 2. Tìm TIẾN ĐỘ CÁ NHÂN
        const progress = await FlashcardProgress.findOne({
            userId: req.user._id,
            flashcardSetId: flashcardSet._id
        });

        // 3. TRỘN DỮ LIỆU
        const cardsWithUserStatus = flashcardSet.cards.map(card => {
            const cardProg = progress?.cardProgress.find(
                cp => cp.cardId.toString() === card._id.toString()
            );

            return {
                _id: card._id,
                front: card.front, // Hoặc question tuỳ vào schema của bạn
                back: card.back,   // Hoặc answer tuỳ vào schema của bạn
                difficulty: card.difficulty,
                isStarred: cardProg ? cardProg.isStarred : false,
                reviewCount: cardProg ? cardProg.reviewCount : 0,
                memoryStatus: cardProg ? cardProg.memoryStatus : 'Chưa học',
                lastReviewed: cardProg ? cardProg.lastReviewed : null
            };
        });

        res.status(200).json({
            success: true,
            count: cardsWithUserStatus.length,
            data: {
                _id: flashcardSet._id,
                title: flashcardSet.documentId?.title || "Bộ Flashcard", 
                thumbnail: flashcardSet.documentId?.thumbnail || null, // ✅ TRẢ VỀ LINK ẢNH CHO FRONTEND
                cards: cardsWithUserStatus
            }
        });

    } catch (error) {
        next(error);
    }
};
//@desc Tải tất cả bộ flashcard cho người dùng (Danh sách)
// @route GET /api/flashcards
// @access Private
export const getAllFlashcardSets = async (req, res, next) => {
    try {
        let query = {};
        if (req.user.role === USER_ROLES.TEACHER) {
            query = { teacherId: req.user._id }; 
        }

        const flashcardSets = await Flashcard.find(query)
            .populate('documentId', 'title thumbnail') // ✅ THÊM POPULATE THUMBNAIL
            .sort({ createdAt: -1 });
    
        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets,
        });
    } catch(error) {
        next(error);
    }
};

//@desc Đánh dấu đã xem lại flashcard 
// @route POST /api/flashcards/:setId/cards/:cardId/review
// @access Private
export const reviewFlashcard = async (req, res, next) => {
    try {
        const { setId, cardId } = req.params;
        const flashcardSetId = await resolveFlashcardSetId({ setId, cardId });

        if (!flashcardSetId) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy bộ flashcard hoặc thẻ flashcard',
                statusCode: 404
            });
        }

        // Tìm tiến độ của học sinh này với bộ flashcard. Nếu chưa có thì tạo mới (upsert)
        let progress = await FlashcardProgress.findOne({
            userId: req.user._id,
            flashcardSetId
        });

        if (!progress) {
            progress = new FlashcardProgress({
                userId: req.user._id,
                flashcardSetId,
                cardProgress: []
            });
        }

        // Tìm thẻ trong mảng tiến độ
        let cardProg = progress.cardProgress.find(cp => cp.cardId.toString() === cardId);

        if (cardProg) {
            cardProg.reviewCount += 1;
            cardProg.lastReviewed = new Date();
        } else {
            progress.cardProgress.push({
                cardId: cardId,
                reviewCount: 1,
                lastReviewed: new Date(),
                isStarred: false
            });
        }

        await progress.save();

        res.status(200).json({
            success: true,
            data: progress,
            message: 'Đã lưu tiến độ ôn tập thẻ thành công'
        });
    } catch (error) {
        next(error);
    }
};

//@desc Đánh dấu yêu thích flashcard 
// @route PUT /api/flashcards/:setId/cards/:cardId/star
// @access Private
export const toggleStarFlashcard = async (req, res, next) => {
    try {
        const { setId, cardId } = req.params;
        const flashcardSetId = await resolveFlashcardSetId({ setId, cardId });

        if (!flashcardSetId) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy bộ flashcard hoặc thẻ flashcard',
                statusCode: 404
            });
        }

        let progress = await FlashcardProgress.findOne({
            userId: req.user._id,
            flashcardSetId
        });

        if (!progress) {
            progress = new FlashcardProgress({
                userId: req.user._id,
                flashcardSetId,
                cardProgress: []
            });
        }

        let cardProg = progress.cardProgress.find(cp => cp.cardId.toString() === cardId);

        if (cardProg) {
            cardProg.isStarred = !cardProg.isStarred;
        } else {
            progress.cardProgress.push({
                cardId: cardId,
                isStarred: true, 
                reviewCount: 0
            });
            cardProg = progress.cardProgress[progress.cardProgress.length - 1]; 
        }

        await progress.save();

        res.status(200).json({
            success: true,
            data: progress,
            message: `Thẻ đã được ${cardProg.isStarred ? 'đánh dấu sao' : 'bỏ đánh dấu sao'}`
        });
    } catch (error) {
        next(error);
    }
};

//@desc Lấy chi tiết bộ flashcard Và tiến độ học của Học sinh
// @route GET /api/flashcards/sets/:setId
// @access Private
export const getFlashcardSetWithProgress = async (req, res, next) => {
    try {
        const { setId } = req.params;

        // 1. Lấy dữ liệu GỐC của Giáo viên (Kèm ảnh tài liệu)
        const flashcardSet = await Flashcard.findById(setId)
            .populate('documentId', 'title thumbnail'); // ✅ THÊM THUMBNAIL
        
        if (!flashcardSet) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy bộ flashcard' });
        }

        const progress = await FlashcardProgress.findOne({
            userId: req.user._id,
            flashcardSetId: setId
        });

        const cardsWithProgress = flashcardSet.cards.map(card => {
            const cardProg = progress?.cardProgress.find(
                cp => cp.cardId.toString() === card._id.toString()
            );

            return {
                _id: card._id,
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                isStarred: cardProg ? cardProg.isStarred : false,
                reviewCount: cardProg ? cardProg.reviewCount : 0,
                memoryStatus: cardProg ? cardProg.memoryStatus : 'Chưa học',
                lastReviewed: cardProg ? cardProg.lastReviewed : null
            };
        });

        res.status(200).json({
            success: true,
            data: {
                _id: flashcardSet._id,
                documentId: flashcardSet.documentId?._id, // Tách nhỏ data cho Front-end dễ lấy
                documentTitle: flashcardSet.documentId?.title,
                documentThumbnail: flashcardSet.documentId?.thumbnail, // ✅ LINK ẢNH HIỂN THỊ
                teacherId: flashcardSet.teacherId, 
                totalCards: flashcardSet.cards.length,
                cards: cardsWithProgress 
            }
        });
    } catch (error) {
        next(error);
    }
};

//@desc Xóa bộ flashcard
// @route DELETE /api/flashcards/:id
// @access Private
export const deleteFlashcardSet = async (req, res, next) => {
    try{
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            teacherId: req.user._id
        });

        if(!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy bộ flashcard',
                statusCode: 404
            });
        }

        await flashcardSet.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Đã xóa bộ flashcard thành công'
        });
    }catch(error) {
        next(error);
    }
};