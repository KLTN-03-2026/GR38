import Flashcard from "#models/Flashcard.js";
import FlashcardProgress from "#models/FlashcardProgress.js";
import { USER_ROLES } from "#models/User.js";
import Document from "#models/Document.js";
import { logActivity } from "#utils/activityLogger.js";
import { createNotification } from "#utils/notificationService.js";

//@desc Tải tất cả bộ flashcard (Có thể lọc theo giáo viên)
// @route GET /api/v1/flashcards
// @access Private
export const getAllFlashcardSets = async (req, res, next) => {
  try {
    let query = {};
    const isStarredFilter = req.query.starred === "true";
    if (req.user.role === USER_ROLES.TEACHER) {
      query = { teacherId: req.user._id };
    }

    if (isStarredFilter && req.user.role !== USER_ROLES.LEARNER) {
      query = { ...query, starredBy: req.user._id };
    }

    const flashcardSets = await Flashcard.find(query)
      .populate("documentId", "title thumbnail")
      .sort({ createdAt: -1 });

    let progressMap = new Map();
    if (req.user.role === USER_ROLES.LEARNER && flashcardSets.length > 0) {
      const setIds = flashcardSets.map((set) => set._id);
      const progressDocs = await FlashcardProgress.find({
        userId: req.user._id,
        flashcardSetId: { $in: setIds },
      }).select("flashcardSetId cardProgress");

      progressMap = new Map(
        progressDocs.map((doc) => [doc.flashcardSetId.toString(), doc]),
      );
    }

    const mappedSets = flashcardSets.map((set) => {
      const setObj = set.toObject();
      const totalCards = Array.isArray(setObj.cards) ? setObj.cards.length : 0;
      const progressDoc = progressMap.get(setObj._id.toString());
      const isStarredFromProgress = Array.isArray(progressDoc?.cardProgress)
        ? progressDoc.cardProgress.some((cardProg) => cardProg.isStarred)
        : false;
      const isStarredFromSet = Array.isArray(setObj.starredBy)
        ? setObj.starredBy.some(
            (userId) => userId.toString() === req.user._id.toString(),
          )
        : false;
      const isStarred = req.user.role === USER_ROLES.LEARNER
        ? isStarredFromProgress || isStarredFromSet
        : isStarredFromSet;
      const memorizedCount = progressDoc
        ? progressDoc.cardProgress.filter(
            (cardProg) => cardProg.memoryStatus === "Đã nhớ",
          ).length
        : 0;
      const progressPercent = totalCards > 0
        ? Math.round((memorizedCount / totalCards) * 100)
        : 0;
      return {
        ...setObj,
        thumbnail: setObj.thumbnail || setObj.documentId?.thumbnail || null,
        cardCount: totalCards,
        progress: req.user.role === USER_ROLES.LEARNER ? progressPercent : 0,
        isStarred,
      };
    });

    const filteredSets =
      isStarredFilter && req.user.role === USER_ROLES.LEARNER
        ? mappedSets.filter((set) => set.isStarred)
        : mappedSets;

    filteredSets.forEach((set) => {
      delete set.cards;
    });

    res.status(200).json({
      success: true,
      count: filteredSets.length,
      data: filteredSets,
    });
  } catch (error) {
    next(error);
  }
};

//@desc Toggle sao (bookmark) cho bộ flashcard
// @route POST /api/v1/flashcards/:id/star
// @access Private
export const toggleStarFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findById(req.params.id);

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ flashcard",
        statusCode: 404,
      });
    }

    const userId = req.user._id;
    const isStarred = flashcardSet.starredBy.some((id) => id.equals(userId));

    if (isStarred) {
      flashcardSet.starredBy = flashcardSet.starredBy.filter(
        (id) => !id.equals(userId),
      );
    } else {
      flashcardSet.starredBy.push(userId);
    }

    const updatedSet = await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: {
        ...updatedSet.toObject(),
        isStarred: !isStarred,
      },
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
      const isStarred = Array.isArray(setObj.starredBy)
        ? setObj.starredBy.some(
            (userId) => userId.toString() === req.user._id.toString(),
          )
        : false;
      return {
        ...setObj,
        thumbnail: setObj.thumbnail || setObj.documentId?.thumbnail || null,
        cardCount: Array.isArray(setObj.cards) ? setObj.cards.length : 0,
        isStarred,
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

    if (req.user.role === USER_ROLES.TEACHER) {
      await logActivity(req.user._id, "CREATE", "FLASHCARD", newFlashcardSet.title);
      await createNotification(
        "Flashcard mới",
        `${req.user.fullName} vừa thêm bộ flashcard ${newFlashcardSet.title}`,
        "FLASHCARD",
        newFlashcardSet._id,
        req.user._id,
        req.user.fullName,
      );
    }

    res.status(201).json({
      success: true,
      message: "Đã tạo bộ flashcard thủ công thành công",
      data: newFlashcardSet,
    });
  } catch (error) {
    next(error);
  }
};


// @desc Chỉnh sửa thông tin bộ flashcard (Tiêu đề, ảnh bìa, mô tả, mảng thẻ)
// @route PUT /api/v1/flashcards/:id
// @access Private (Teacher)
export const updateFlashcardSet = async (req, res, next) => {
  try {
    const { title, description, tags } = req.body;
    let parsedCards = req.body.cards;

    // 1. Xử lý Parse JSON (Vì dùng FormData có file nên cards thường bị ép thành string)
    if (typeof parsedCards === "string") {
      try {
        parsedCards = JSON.parse(parsedCards);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Dữ liệu cards không đúng định dạng JSON",
        });
      }
    }

    // 2. Gom toàn bộ dữ liệu cần update vào 1 Object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = typeof tags === "string" ? JSON.parse(tags) : tags;

    // Cho phép mảng rỗng để user có thể xóa toàn bộ thẻ nếu muốn
    if (Array.isArray(parsedCards)) {
      updateData.cards = parsedCards.map((card) => ({
        front: card.front,
        back: card.back,
        difficulty: card.difficulty || "Trung bình",
      }));
      // Tự động cập nhật tổng số lượng thẻ (Nếu Model của bạn có trường này)
      updateData.totalCards = parsedCards.length; 
    }

    // Chỉ cập nhật thumbnail nếu có upload file mới
    if (req.file) {
      updateData.thumbnail = req.file.path;
    }

    // 3. Sử dụng findOneAndUpdate (Thao tác DB nhanh hơn .save())
    const updateFilter =
      req.user.role === USER_ROLES.ADMIN
        ? { _id: req.params.id }
        : { _id: req.params.id, teacherId: req.user._id };

    const updatedFlashcardSet = await Flashcard.findOneAndUpdate(
      updateFilter,
      { $set: updateData }, // Set các field có thay đổi
      {
        returnDocument: "after",
        runValidators: true, // Vẫn bắt Mongoose kiểm tra rule (required, maxlength...)
      }
    );

    if (!updatedFlashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ flashcard hoặc bạn không có quyền chỉnh sửa",
      });
    }

    if (req.user.role === USER_ROLES.TEACHER) {
      await logActivity(req.user._id, "UPDATE", "FLASHCARD", updatedFlashcardSet.title);
    }

    // 4. Trả về Response
    res.status(200).json({
      success: true,
      message: "Đã cập nhật thông tin bộ flashcard thành công",
      data: updatedFlashcardSet,
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

    const setFilter =
      req.user.role === USER_ROLES.ADMIN
        ? { _id: setId }
        : { _id: setId, teacherId: req.user._id };

    const flashcardSet = await Flashcard.findOne(setFilter);

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

    if (req.user.role === USER_ROLES.TEACHER) {
      await logActivity(req.user._id, "UPDATE", "FLASHCARD", flashcardSet.title);
    }

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
    const setFilter =
      req.user.role === USER_ROLES.ADMIN
        ? { _id: req.params.id }
        : { _id: req.params.id, teacherId: req.user._id };

    const flashcardSet = await Flashcard.findOne(setFilter);

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ flashcard",
        statusCode: 404,
      });
    }

    await flashcardSet.deleteOne();

    if (req.user.role === USER_ROLES.TEACHER) {
      await logActivity(req.user._id, "DELETE", "FLASHCARD", flashcardSet.title);
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa bộ flashcard thành công",
    });
  } catch (error) {
    next(error);
  }
};

//@desc Lấy thông tin bộ flashcard đầy đủ để chỉnh sửa
// @route GET /api/v1/flashcards/:id/edit
// @access Private (Teacher)
export const getFlashcardSetForEdit = async (req, res, next) => {
  try {
    const setFilter =
      req.user.role === USER_ROLES.ADMIN
        ? { _id: req.params.id }
        : { _id: req.params.id, teacherId: req.user._id };

    const flashcardSet = await Flashcard.findOne(setFilter).populate(
      "documentId",
      "title thumbnail"
    );

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ flashcard hoặc bạn không có quyền chỉnh sửa",
        statusCode: 404,
      });
    }

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
        tags: flashcardSet.tags,
        totalCards: flashcardSet.cards.length,
        cards: flashcardSet.cards.map((card) => ({
          _id: card._id,
          front: card.front,
          back: card.back,
          difficulty: card.difficulty,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};