import Flashcard from "../models/Flashcard.js";
import FlashcardProgress from "../models/FlashcardProgress.js";
import { USER_ROLES } from "../models/User.js";
import Document from "../models/Document.js";

const resolveFlashcardSetId = async ({ setId, cardId }) => {
  if (setId) {
    return setId;
  }

  const flashcardSet = await Flashcard.findOne({
    "cards._id": cardId,
  }).select("_id");

  return flashcardSet?._id || null;
};

//@desc Tạo bộ flashcard thủ công
// @route POST /api/v1/flashcards/manual
// @access Private (Teacher, Admin)
export const createManualFlashcardSet = async (req, res, next) => {
  try {
    if (req.user.role !== USER_ROLES.TEACHER && req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        error: "Chỉ giáo viên hoặc Admin mới có quyền tạo bộ Flashcard",
        statusCode: 403,
      });
    }

    let parsedCards = req.body.cards;
    if (typeof parsedCards === "string") {
      try {
        parsedCards = JSON.parse(parsedCards);
      } catch (e) {
        return res.status(400).json({ success: false, error: "Dữ liệu cards không đúng định dạng JSON", statusCode: 400 });
      }
    }

    const { documentId, title, description, tags } = req.body;

    const validDocumentId = (documentId && documentId.trim() !== "" && documentId !== "null") ? documentId : null;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Tiêu đề (title) là bắt buộc",
        statusCode: 400,
      });
    }

    if (!parsedCards || parsedCards.length < 5) {
      return res.status(400).json({
        success: false,
        error: "Bạn cần nhập tối thiểu 5 thẻ flashcard để tạo bộ ôn tập",
        statusCode: 400,
      });
    }

    // --- LOGIC XỬ LÝ ẢNH BÌA (Đã đồng bộ giống bên Quiz) ---
    let finalThumbnail = null;
    if (req.file) {
      // 1. Nếu có file upload từ client
      finalThumbnail = req.file.path;
    } else if (documentId) {
      // 2. Nếu không có file upload nhưng có liên kết tài liệu -> Lấy ảnh tài liệu
      const doc = await Document.findById(documentId).select("thumbnail");
      if (doc && doc.thumbnail) {
        finalThumbnail = doc.thumbnail;
      }
    }

    const newFlashcardSet = await Flashcard.create({
      documentId: validDocumentId,
      teacherId: req.user._id,
      title,
      thumbnail: finalThumbnail, 
      description: description || "",
      tags: tags || [],
      cards: parsedCards.map((card) => ({
        front: card.front,
        back: card.back,
        difficulty: card.difficulty || "Trung bình",
      })),
      isAiGenerated: false 
    });

    res.status(201).json({
      success: true,
      message: "Đã tạo bộ flashcard thủ công thành công",
      data: newFlashcardSet,
    });
  } catch (error) {
    next(error);
  }
};

//@desc Chỉnh sửa thông tin bộ flashcard (Tiêu đề, ảnh bìa, mô tả)
// @route PUT /api/flashcards/:id
// @access Private (Teacher)
export const updateFlashcardSet = async (req, res, next) => {
  try {
    const { title, description, tags } = req.body;

    const flashcardSet = await Flashcard.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ flashcard hoặc bạn không có quyền chỉnh sửa",
        statusCode: 404,
      });
    }

    if (title !== undefined) flashcardSet.title = title;
    if (description !== undefined) flashcardSet.description = description;
    if (tags !== undefined) flashcardSet.tags = tags;

    // Chỉ cập nhật thumbnail nếu có upload file mới
    if (req.file) {
      flashcardSet.thumbnail = req.file.path;
    }

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      message: "Đã cập nhật thông tin bộ flashcard thành công",
      data: flashcardSet,
    });
  } catch (error) {
    next(error);
  }
};

//@desc Chỉnh sửa nội dung một thẻ flashcard
// @route PUT /api/flashcards/:setId/cards/:cardId
// @access Private (Chỉ dành cho Teacher sở hữu bộ flashcard)
export const updateFlashcard = async (req, res, next) => {
  try {
    const { setId, cardId } = req.params;
    const { front, back, difficulty } = req.body;

    const flashcardSet = await Flashcard.findOne({
      _id: setId,
      teacherId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ flashcard hoặc bạn không có quyền chỉnh sửa",
        statusCode: 404,
      });
    }

    const cardToUpdate = flashcardSet.cards.id(cardId);

    if (!cardToUpdate) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy thẻ flashcard cần sửa",
        statusCode: 404,
      });
    }

    if (front !== undefined) cardToUpdate.front = front;
    if (back !== undefined) cardToUpdate.back = back;

    if (
      difficulty !== undefined &&
      ["Dễ", "Trung bình", "Khó"].includes(difficulty)
    ) {
      cardToUpdate.difficulty = difficulty;
    }

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      message: "Đã cập nhật thẻ flashcard thành công",
      data: cardToUpdate,
    });
  } catch (error) {
    next(error);
  }
};

//@desc Lấy bộ flashcard dựa vào ID của Tài liệu (Dùng cho trang Chi tiết Tài liệu)
// @route GET /api/flashcards/document/:documentId
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
        back: card.back,
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
        cards: cardsWithUserStatus,
      },
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
      .populate("documentId", "title thumbnail")
      .sort({ createdAt: -1 });

    const mappedSets = flashcardSets.map((set) => {
      const setObj = set.toObject();
      return {
        ...setObj,
        // Ưu tiên ảnh riêng của bộ (tạo thủ công), nếu không có thì lấy ảnh của tài liệu (tạo AI)
        thumbnail: setObj.thumbnail || setObj.documentId?.thumbnail || null,
      };
    });

    res.status(200).json({
      success: true,
      count: mappedSets.length,
      data: mappedSets, 
    });
  } catch (error) {
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
// @route PUT /api/flashcards/:setId/cards/:cardId/star
// @access Private
export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const { setId, cardId } = req.params;
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

//@desc Lấy chi tiết bộ flashcard Và tiến độ học của Học sinh
// @route GET /api/flashcards/:id
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
        back: card.back,
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

//@desc Xóa bộ flashcard
// @route DELETE /api/flashcards/:id
// @access Private
export const deleteFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ flashcard",
        statusCode: 404,
      });
    }

    await flashcardSet.deleteOne();

    res.status(200).json({
      success: true,
      message: "Đã xóa bộ flashcard thành công",
    });
  } catch (error) {
    next(error);
  }
};