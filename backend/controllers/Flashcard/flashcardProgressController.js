import Flashcard from "#models/Flashcard.js";
import FlashcardProgress from "#models/FlashcardProgress.js";

// Hàm helper được di chuyển sang đây vì chỉ liên quan đến logic tiến độ
const resolveFlashcardSetId = async ({ setId, cardId }) => {
  if (setId) {
    return setId;
  }
  const flashcardSet = await Flashcard.findOne({
    "cards._id": cardId,
  }).select("_id");

  return flashcardSet?._id || null;
};

//@desc Lấy chi tiết bộ flashcard Và tiến độ học của Học sinh
// @route GET /api/v1/flashcards/:id
// @access Private
export const getFlashcardSetWithProgress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const flashcardSet = await Flashcard.findById(id).populate(
      "documentId",
      "title thumbnail",
    );

    if (!flashcardSet) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy bộ flashcard" });
    }

    const progress = await FlashcardProgress.findOne({
      userId: req.user._id,
      flashcardSetId: id,
    });

    const cardsWithProgress = flashcardSet.cards.map((card) => {
      const cardProg = progress?.cardProgress.find(
        (cp) => cp.cardId.toString() === card._id.toString(),
      );

      return {
        _id: card._id,
        front: card.front,
        difficulty: card.difficulty,
        isStarred: cardProg ? cardProg.isStarred : false,
        reviewCount: cardProg ? cardProg.reviewCount : 0,
        memoryStatus: cardProg ? cardProg.memoryStatus : "Chưa học",
        lastReviewed: cardProg ? cardProg.lastReviewed : null,
      };
    });

    // Ưu tiên ảnh riêng của bộ (tạo thủ công), nếu không có thì lấy ảnh của tài liệu (tạo AI)
    const displayThumbnail =
      flashcardSet.thumbnail || flashcardSet.documentId?.thumbnail || null;

    res.status(200).json({
      success: true,
      data: {
        _id: flashcardSet._id,
        documentId: flashcardSet.documentId?._id || null,
        documentTitle: flashcardSet.documentId?.title || null,
        thumbnail: displayThumbnail,
        teacherId: flashcardSet.teacherId,
        title: flashcardSet.title,
        description: flashcardSet.description,
        totalCards: flashcardSet.cards.length,
        cards: cardsWithProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};


//@desc Lấy bộ flashcard dựa vào ID của Tài liệu
// @route GET /api/v1/flashcards/document/:documentId
// @access Private
export const getFlashcardsByDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const flashcardSet = await Flashcard.findOne({
      documentId: documentId,
    }).populate("documentId", "title thumbnail");

    if (!flashcardSet) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: null,
      });
    }

    const progress = await FlashcardProgress.findOne({
      userId: req.user._id,
      flashcardSetId: flashcardSet._id,
    });

    const cardsWithUserStatus = flashcardSet.cards.map((card) => {
      const cardProg = progress?.cardProgress.find(
        (cp) => cp.cardId.toString() === card._id.toString(),
      );

      return {
        _id: card._id,
        front: card.front,
        difficulty: card.difficulty,
        isStarred: cardProg ? cardProg.isStarred : false,
        reviewCount: cardProg ? cardProg.reviewCount : 0,
        memoryStatus: cardProg ? cardProg.memoryStatus : "Chưa học",
        lastReviewed: cardProg ? cardProg.lastReviewed : null,
      };
    });

    // Ưu tiên ảnh riêng của bộ (tạo thủ công), nếu không có thì lấy ảnh của tài liệu (tạo AI)
    const displayThumbnail =
      flashcardSet.thumbnail || flashcardSet.documentId?.thumbnail || null;

    res.status(200).json({
      success: true,
      count: cardsWithUserStatus.length,
      data: {
        _id: flashcardSet._id,
        documentId: flashcardSet.documentId?._id || null,
        title:
          flashcardSet.title ||
          flashcardSet.documentId?.title ||
          "Bộ Flashcard",
        thumbnail: displayThumbnail,
        teacherId: flashcardSet.teacherId,
        description: flashcardSet.description,
        totalCards: flashcardSet.cards.length,
        cards: cardsWithUserStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

//@desc Lấy mặt sau của một thẻ flashcard
// @route GET /api/v1/flashcards/:setId/cards/:cardId/back
// @access Private
export const getFlashcardCardBack = async (req, res, next) => {
  try {
    const { setId, cardId } = req.params;

    const flashcardSet = await Flashcard.findById(setId);
    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ flashcard",
        statusCode: 404,
      });
    }

    const card = flashcardSet.cards.id(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy thẻ flashcard",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: card._id,
        back: card.back,
      },
    });
  } catch (error) {
    next(error);
  }
};


//@desc Đánh dấu đã xem lại flashcard
// @route POST /api/v1/flashcards/:setId/cards/:cardId/review
// @access Private
export const reviewFlashcard = async (req, res, next) => {
  try {
    const { setId, cardId } = req.params;
    if (!cardId || cardId === "null") {
      return res.status(400).json({
        success: false,
        error: "cardId không hợp lệ",
        statusCode: 400,
      });
    }
    const flashcardSetId = await resolveFlashcardSetId({ setId, cardId });

    if (!flashcardSetId) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ flashcard hoặc thẻ flashcard",
        statusCode: 404,
      });
    }

    let progress = await FlashcardProgress.findOne({
      userId: req.user._id,
      flashcardSetId,
    });

    if (!progress) {
      progress = new FlashcardProgress({
        userId: req.user._id,
        flashcardSetId,
        cardProgress: [],
      });
    }

    let cardProg = progress.cardProgress.find(
      (cp) => cp.cardId.toString() === cardId,
    );

    if (cardProg) {
      cardProg.reviewCount += 1;
      cardProg.lastReviewed = new Date();
    } else {
      progress.cardProgress.push({
        cardId: cardId,
        reviewCount: 1,
        lastReviewed: new Date(),
        isStarred: false,
      });
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
      message: "Đã lưu tiến độ ôn tập thẻ thành công",
    });
  } catch (error) {
    next(error);
  }
};

//@desc Đánh dấu yêu thích flashcard
// @route PUT /api/v1/flashcards/:setId/cards/:cardId/star
// @access Private
export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const { setId, cardId } = req.params;
    if (!cardId || cardId === "null") {
      return res.status(400).json({
        success: false,
        error: "cardId không hợp lệ",
        statusCode: 400,
      });
    }
    const flashcardSetId = await resolveFlashcardSetId({ setId, cardId });

    if (!flashcardSetId) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ flashcard hoặc thẻ flashcard",
        statusCode: 404,
      });
    }

    let progress = await FlashcardProgress.findOne({
      userId: req.user._id,
      flashcardSetId,
    });

    if (!progress) {
      progress = new FlashcardProgress({
        userId: req.user._id,
        flashcardSetId,
        cardProgress: [],
      });
    }

    let cardProg = progress.cardProgress.find(
      (cp) => cp.cardId.toString() === cardId,
    );

    if (cardProg) {
      cardProg.isStarred = !cardProg.isStarred;
    } else {
      progress.cardProgress.push({
        cardId: cardId,
        isStarred: true,
        reviewCount: 0,
      });
      cardProg = progress.cardProgress[progress.cardProgress.length - 1];
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
      message: `Thẻ đã được ${cardProg.isStarred ? "đánh dấu sao" : "bỏ đánh dấu sao"}`,
    });
  } catch (error) {
    next(error);
  }
};