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
      // ✅ THÊM "thumbnail" VÀO HÀM POPULATE ĐỂ LẤY LINK ẢNH TỪ BẢNG DOCUMENT
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
      options: q.options || [], // Mảng các đáp án A, B, C, D
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

//@desc Nộp bài quiz
//@route POST /api/v1/quizzes/:id/submit
//@access Private
// export const submitQuiz = async (req, res, next) => {
//   try {
//     const userAnswers = Array.isArray(req.body.userAnswers)
//       ? req.body.userAnswers
//       : Array.isArray(req.body.answers)
//         ? req.body.answers
//         : [];

//     if (!userAnswers.length) {
//       return res.status(400).json({
//         success: false,
//         error: "Vui lòng cung cấp userAnswers dưới dạng mảng",
//         statusCode: 400,
//       });
//     }

//     const quiz = await Quiz.findById(req.params.id);

//     if (!quiz) {
//       return res.status(404).json({
//         success: false,
//         error: "Không tìm thấy Quiz",
//         statusCode: 404,
//       });
//     }

//     const answerMap = new Map(
//       userAnswers
//         .filter((answer) => answer && answer.questionId)
//         .map((answer) => [
//           String(answer.questionId),
//           answer.selectedAnswer ?? null,
//         ]),
//     );

//     let correctCount = 0;
//     const totalQuestions = Array.isArray(quiz.questions)
//       ? quiz.questions.length
//       : 0;

//     const details = (quiz.questions || []).map((question) => {
//       const questionId = String(question._id);
//       const selectedAnswer = answerMap.has(questionId)
//         ? String(answerMap.get(questionId)).trim()
//         : null;
//       const isCorrect =
//         selectedAnswer === String(question.correctAnswer).trim();

//       if (isCorrect) {
//         correctCount += 1;
//       }

//       return {
//         questionId: question._id,
//         question: question.question,
//         selectedAnswer,
//         correctAnswer: question.correctAnswer,
//         explanation: question.explanation,
//         isCorrect,
//       };
//     });

//     const quizResult = await QuizResult.create({
//       userId: req.user._id,
//       quizId: quiz._id,
//       score: correctCount,
//       totalQuestions,
//       answers: details.map((item) => ({
//         questionId: item.questionId,
//         selectedAnswer: item.selectedAnswer,
//         isCorrect: item.isCorrect,
//       })),
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         quizResultId: quizResult._id,
//         score: correctCount,
//         correctCount,
//         totalQuestions,
//         details,
//       },
//       message: "Quiz đã được nộp thành công",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

//@desc Lấy kết quả quiz
//@route GET /api/v1/quizzes/:id/results
//@access Private
// export const getQuizResults = async (req, res, next) => {
//   try {
//     const result = await QuizResult.findOne({
//       quizId: req.params.id,
//       userId: req.user._id,
//     })
//       .sort({ createdAt: -1 })
//       .populate({
//         path: "quizId",
//         populate: {
//           path: "teacherId",
//           select: "fullName email",
//         },
//       });

//     if (!result) {
//       return res.status(404).json({
//         success: false,
//         error: "Chưa có kết quả nộp bài cho Quiz này",
//         statusCode: 404,
//       });
//     }

//     const quiz = result.quizId;

//     if (!quiz) {
//       return res.status(404).json({
//         success: false,
//         error: "Đề thi gốc không còn tồn tại",
//         statusCode: 404,
//       });
//     }

//     const detailedResults = result.answers.map((answer) => {
//       const question =
//         quiz.questions.id(answer.questionId) ||
//         quiz.questions.find(
//           (item) => String(item._id) === String(answer.questionId),
//         );

//       if (!question) {
//         return {
//           questionId: answer.questionId,
//           question: null,
//           options: [],
//           correctAnswer: null,
//           selectedAnswer: answer.selectedAnswer,
//           isCorrect: answer.isCorrect,
//           explanation: null,
//         };
//       }

//       return {
//         questionId: question._id,
//         question: question.question,
//         options: question.options,
//         correctAnswer: question.correctAnswer,
//         selectedAnswer: answer.selectedAnswer,
//         isCorrect: answer.isCorrect,
//         explanation: question.explanation,
//       };
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         quizResultId: result._id,
//         quiz: {
//           _id: quiz._id,
//           title: quiz.title,
//           teacher: quiz.teacherId,
//         },
//         score: result.score,
//         totalQuestions: result.totalQuestions,
//         submittedAt: result.createdAt,
//         details: detailedResults,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

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

    // Chỉ người tạo (teacherId) hoặc Admin mới được xóa
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