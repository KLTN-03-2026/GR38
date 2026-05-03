import Quiz from "#models/Quiz.js";
import QuizResult from "#models/QuizResult.js";
import { USER_ROLES } from "#models/User.js";
import Document from "#models/Document.js";

//@desc Lấy danh sách quiz cho một tài liệu
//@route GET /api/v1/quizzes/:documentId
//@access Private
export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName thumbnail") 
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

//@desc Lấy chi tiết một quiz
//@route GET /api/v1/quizzes/quiz/:id
//@access Private
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "documentId",
      "title fileName thumbnail" 
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy Quiz",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

//@desc Tạo quiz thủ công (Giáo viên tự soạn)
//@route POST /api/v1/quizzes/manual
//@access Private (Teacher, Admin)
export const createQuizManual = async (req, res, next) => {
  try {
    const { title, documentId, description } = req.body;
    let { questions } = req.body;

    // Do gửi qua FormData (để đính kèm ảnh), questions có thể bị biến thành String
    if (typeof questions === "string") {
      questions = JSON.parse(questions);
    }

    if (!title || !questions || !Array.isArray(questions) || questions.length < 5) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp tiêu đề và ít nhất 5 câu hỏi trắc nghiệm.",
        statusCode: 400,
      });
    }


    let finalThumbnail = null;
    if (req.file) {
      // 1. Ưu tiên cao nhất: Giáo viên tự tải ảnh từ máy tính lên
      finalThumbnail = req.file.path; 
    } else if (documentId) {
      // 2. Nếu không up ảnh, nhưng tạo quiz thuộc về 1 tài liệu -> Lấy ảnh của tài liệu
      const doc = await Document.findById(documentId).select("thumbnail");
      if (doc && doc.thumbnail) {
        finalThumbnail = doc.thumbnail;
      }
    }

    const formattedQuestions = questions.map((q) => ({
      question: q.question,
      options: q.options || [], 
      correctAnswer: String(q.correctAnswer).trim(),
      explanation: q.explanation || "Không có giải thích chi tiết.", 
      difficulty: q.difficulty || "Trung bình"
    }));

    const newQuiz = await Quiz.create({
      title,
      description: description || "",
      documentId: documentId || null, 
      thumbnail: finalThumbnail, // Đã xử lý logic hợp lý
      teacherId: req.user._id,        
      questions: formattedQuestions,
      isAiGenerated: false // Đánh dấu đây là quiz làm bằng tay         
    });

    res.status(201).json({
      success: true,
      data: newQuiz,
      message: "Tạo bài trắc nghiệm thủ công thành công",
    });
  } catch (error) {
    next(error); 
  }
};

//@desc Chỉnh sửa thông tin bộ Quiz (Tiêu đề, ảnh bìa, mô tả, tags)
//@route PUT /api/v1/quizzes/:id
//@access Private (Teacher)
export const updateQuiz = async (req, res, next) => {
  try {
    const { title, description, tags } = req.body;

    // Tìm quiz và đảm bảo người sửa phải là người tạo ra quiz đó
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ Quiz hoặc bạn không có quyền chỉnh sửa",
        statusCode: 404,
      });
    }

    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (tags !== undefined) quiz.tags = typeof tags === 'string' ? JSON.parse(tags) : tags; 

    if (req.file) {
      quiz.thumbnail = req.file.path;
    }

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Đã cập nhật thông tin bộ Quiz thành công",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

//@desc Chỉnh sửa nội dung một câu hỏi trong bộ Quiz
//@route PUT /api/v1/quizzes/:quizId/questions/:questionId
//@access Private (Chỉ dành cho Teacher sở hữu bộ Quiz)
export const updateQuizQuestion = async (req, res, next) => {
  try {
    const { quizId, questionId } = req.params;
    const { question, options, correctAnswer, explanation, difficulty } = req.body;

    const quiz = await Quiz.findOne({
      _id: quizId,
      teacherId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bộ Quiz hoặc bạn không có quyền chỉnh sửa",
        statusCode: 404,
      });
    }

    // Tìm câu hỏi trong mảng questions dựa vào ID
    const questionToUpdate = quiz.questions.id(questionId);

    if (!questionToUpdate) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy câu hỏi cần sửa",
        statusCode: 404,
      });
    }

    // Cập nhật các trường nếu có truyền lên
    if (question !== undefined) questionToUpdate.question = question;
    if (correctAnswer !== undefined) questionToUpdate.correctAnswer = correctAnswer;
    if (explanation !== undefined) questionToUpdate.explanation = explanation;
    
    // Cập nhật mảng options
    if (options !== undefined) {
       let parsedOptions = options;
       if (typeof options === "string") {
         try { parsedOptions = JSON.parse(options); } catch (e) {}
       }
       questionToUpdate.options = parsedOptions;
    }

    if (
      difficulty !== undefined &&
      ["Dễ", "Trung bình", "Khó"].includes(difficulty)
    ) {
      questionToUpdate.difficulty = difficulty;
    }

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Đã cập nhật câu hỏi Quiz thành công",
      data: questionToUpdate,
    });
  } catch (error) {
    next(error);
  }
};

//@desc Lấy danh sách toàn bộ bài quiz do giáo viên hiện tại tạo
//@route GET /api/v1/quizzes/my-quizzes
//@access Private (Teacher)
export const getTeacherQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ teacherId: req.user._id })
      .populate("documentId", "title fileName thumbnail")
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
      message: "Lấy danh sách đề thi của giáo viên thành công",
    });
  } catch (error) {
    next(error);
  }
};

//@desc Xóa quiz
//@route DELETE /api/v1/quizzes/:id
//@access Private
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy Quiz",
        statusCode: 404,
      });
    }
    if (
      quiz.teacherId.toString() !== req.user._id.toString() &&
      req.user.role !== USER_ROLES.ADMIN
    ) {
      return res.status(403).json({
        success: false,
        error: "Không có quyền xóa",
        statusCode: 403,
      });
    }

    await quiz.deleteOne();
    // (Tùy chọn) Xóa luôn các QuizResult liên quan để nhẹ Database
    await QuizResult.deleteMany({ quizId: req.params.id });

    res.status(200).json({
      success: true,
      message: "Quiz đã được xóa thành công",
    });
  } catch (error) {
    next(error);
  }
};
