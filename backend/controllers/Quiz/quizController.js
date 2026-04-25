import Quiz from "#models/Quiz.js";
import QuizResult from "#models/QuizResult.js";
import { USER_ROLES } from "#models/User.js";

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
//@route POST /api/v1/quizzes
//@access Private (Teacher, Admin)
export const createQuizManual = async (req, res, next) => {
  try {
    const { title, documentId, questions, description } = req.body;

    // 1. Validation cơ bản: Đảm bảo có title và mảng questions hợp lệ
    if (!title || !questions || !Array.isArray(questions) || questions.length < 5) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp tiêu đề và ít nhất 5 câu hỏi trắc nghiệm.",
        statusCode: 400,
      });
    }
    // 2. Format lại cấu trúc câu hỏi nếu cần thiết
    const formattedQuestions = questions.map((q) => ({
      question: q.question,
      options: q.options || [], 
      correctAnswer: String(q.correctAnswer).trim(),
      explanation: q.explanation || "Không có giải thích chi tiết.", 
    }));

    // 3. Khởi tạo Quiz mới
    const newQuiz = await Quiz.create({
      title,
      description: description || "",
      documentId: documentId || null, 
      teacherId: req.user._id,        
      questions: formattedQuestions,
      isAiGenerated: false          
    });

    // 4. Trả về kết quả
    res.status(201).json({
      success: true,
      data: newQuiz,
      message: "Tạo bài trắc nghiệm thủ công thành công",
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