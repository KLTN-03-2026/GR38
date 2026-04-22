import Quiz from "#models/Quiz.js";
import QuizResult from "#models/QuizResult.js";

//@desc Nộp bài quiz và tự động chấm điểm
//@route POST /api/v1/quizzes/:quizId/submit
//@access Private (Learner)
export const submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userAnswers = Array.isArray(req.body.userAnswers) ? req.body.userAnswers : [];

    if (!userAnswers.length) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp danh sách câu trả lời của bạn.",
        statusCode: 400,
      });
    }

    // 1. Tìm đề thi gốc để đối chiếu đáp án
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy đề thi này.",
        statusCode: 404,
      });
    }
    const answerMap = new Map(
      userAnswers
        .filter((ans) => ans && ans.questionId)
        .map((ans) => [String(ans.questionId), ans.selectedAnswer ?? null])
    );

    let correctCount = 0;
    const totalQuestions = quiz.totalQuestions || quiz.questions.length;

    // 3. Chấm điểm từng câu
    const processedAnswers = quiz.questions.map((q) => {
      const qIdStr = String(q._id);
      const selectedAnswer = answerMap.has(qIdStr) ? String(answerMap.get(qIdStr)).trim() : null;
      
      const isCorrect = selectedAnswer === String(q.correctAnswer).trim();
      if (isCorrect) correctCount++;
      return {
        questionId: q._id,
        selectedAnswer: selectedAnswer,
        isCorrect: isCorrect,
      };
    });

    // 4. Lưu kết quả vào DB
    const newResult = await QuizResult.create({
      userId: req.user._id,
      quizId: quiz._id,
      score: correctCount,
      totalQuestions: totalQuestions,
      answers: processedAnswers,
    });

    // 5. Trả về cho frontend
    res.status(201).json({
      success: true,
      message: "Nộp bài thành công!",
      data: {
        resultId: newResult._id,
        score: correctCount,
        totalQuestions: totalQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

//@desc Lấy chi tiết một bài đã làm (để xem lại câu đúng/sai)
//@route GET /api/v1/quizzes/detail/:resultId
//@access Private
export const getQuizResultDetail = async (req, res, next) => {
  try {
    const result = await QuizResult.findOne({
      _id: req.params.resultId,
      userId: req.user._id, // Chỉ cho phép xem kết quả của chính mình
    }).populate("quizId", "title questions description");

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy kết quả làm bài này.",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//@desc Lấy toàn bộ lịch sử làm bài của User (Dùng cho Dashboard/Profile)
//@route GET /api/v1/quizzes/my-history
//@access Private
export const getMyHistory = async (req, res, next) => {
  try {
    const history = await QuizResult.find({ userId: req.user._id })
      .populate("quizId", "title") 
      .sort({ createdAt: -1 });   

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};