import Flashcard from "#models/Flashcard.js";
import { USER_ROLES } from "#models/User.js";
import Document from "#models/Document.js";

//@desc Tải tất cả bộ flashcard (Có thể lọc theo giáo viên)
// @route GET /api/v1/flashcards
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
        thumbnail: setObj.thumbnail || setObj.documentId?.thumbnail || null,
        cardCount: Array.isArray(setObj.cards) ? setObj.cards.length : 0,
      };
    });

    mappedSets.forEach((set) => {
      delete set.cards;
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

//@desc Lấy danh sách toàn bộ Flashcard do giáo viên hiện tại tạo
//@route GET /api/v1/flashcards/my-flashcards
//@access Private (Teacher)
export const getTeacherFlashcardSets = async (req, res, next) => {
  try {
    const flashcardSets = await Flashcard.find({ teacherId: req.user._id })
      .populate("documentId", "title thumbnail")
      .sort({ createdAt: -1 });

    const mappedSets = flashcardSets.map((set) => {
      const setObj = set.toObject();
      return {
        ...setObj,
        thumbnail: setObj.thumbnail || setObj.documentId?.thumbnail || null,
        cardCount: Array.isArray(setObj.cards) ? setObj.cards.length : 0,
      };
    });

    mappedSets.forEach((set) => {
      delete set.cards;
    });

    res.status(200).json({
      success: true,
      count: mappedSets.length,
      data: mappedSets,
      message: "Lấy danh sách bộ Flashcard của giáo viên thành công",
    });
  } catch (error) {
    next(error);
  }
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
// @route PUT /api/v1/flashcards/:id
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
// @route PUT /api/v1/flashcards/:setId/cards/:cardId
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

//@desc Xóa bộ flashcard
// @route DELETE /api/v1/flashcards/:id
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