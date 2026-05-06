import Quiz from "#models/Quiz.js";
import QuizResult from "#models/QuizResult.js";
import { USER_ROLES } from "#models/User.js";

//@desc Nộp bài quiz và tự động chấm điểm
//@route POST /api/v1/quizzes/:quizId/submit
//@access Private 
export const submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { timeSpent = 0 } = req.body; // Khai báo biến timeSpent từ req.body
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

    // 2. Map lại đáp án của user
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

    // Xác định xem ai đang nộp bài (Giáo viên hay Người học)
    const isTeacherPreview = req.user.role === USER_ROLES.TEACHER; 
    const scoreSystem10 = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
    const roundedScore = Math.round(scoreSystem10 * 100) / 100; 

    // 4. Lưu kết quả vào DB 
    const newResult = await QuizResult.create({
      userId: req.user._id,
      quizId: quiz._id,
      score: roundedScore,                
      correctAnswersCount: correctCount,  
      totalQuestions: totalQuestions,
      timeSpent: timeSpent,               
      answers: processedAnswers,
      isTeacherPreview: isTeacherPreview,
    });

    res.status(201).json({
      success: true,
      message: isTeacherPreview ? "Nộp bài thi thử của giáo viên thành công!" : "Nộp bài thành công!",
      data: {
        resultId: newResult._id,
        score: correctCount,
        totalQuestions: totalQuestions,
        isTeacherPreview: isTeacherPreview 
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
      userId: req.user._id, 
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

// CÁC API TỐI ƯU DÀNH CHO NGƯỜI HỌC (LEARNER)

//@desc Lấy danh sách quiz cho Người học (Tối ưu payload, không gửi mảng questions)
//@route GET /api/v1/quizzes
//@access Public / Private
export const getAllQuizzesForLearner = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; 
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    const [totalQuizzes, quizzes] = await Promise.all([
      Quiz.countDocuments(query),
      Quiz.aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "documents",
            localField: "documentId",
            foreignField: "_id",
            as: "documentInfo"
          }
        },
        { $unwind: { path: "$documentInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            description: 1,
            thumbnail: 1,
            tags: 1,
            isAiGenerated: 1,
            createdAt: 1,
            "documentInfo.title": 1,
            questionCount: "$totalQuestions" 
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: quizzes,
      pagination: { 
        total: totalQuizzes, 
        page, 
        limit, 
        totalPages: Math.ceil(totalQuizzes / limit) 
      },
    });
  } catch (error) {
    next(error);
  }
};

//@desc Lấy nội dung Quiz để học viên làm bài (ẨN ĐÁP ÁN VÀ GIẢI THÍCH)
//@route GET /api/v1/quizzes/:id/play
//@access Private (Learner)
export const getQuizForPlay = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("documentId", "title thumbnail")
      .select("-questions.correctAnswer -questions.explanation") 
      .lean();

    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: "Không tìm thấy bộ câu hỏi" 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: quiz 
    });
  } catch (error) {
    next(error);
  }
};
//@desc Lấy TẤT CẢ thống kê bài làm của học viên (Client-side pagination)
//@route GET /api/v1/quizzes/statistics
//@access Private (Teacher/Admin)
export const getTeacherStatistics = async (req, res, next) => {
  try {
    const { scoreFilter } = req.query;

    // 1. Điều kiện cơ bản ở bảng QuizResult
    let matchStage = {
      isTeacherPreview: { $ne: true }
    };

    // Lọc theo điểm số ngay từ DB cho nhẹ 
    if (scoreFilter && scoreFilter !== "all") {
      if (scoreFilter === "excellent") matchStage.score = { $gte: 8 };
      else if (scoreFilter === "average") matchStage.score = { $gte: 5, $lt: 8 };
      else if (scoreFilter === "poor") matchStage.score = { $lt: 5 };
    }

    const pipeline = [
      { $match: matchStage },
      
      // 2. Join với bảng Quizzes để lấy thông tin đề thi
      {
        $lookup: {
          from: "quizzes", 
          localField: "quizId",
          foreignField: "_id",
          as: "quizInfo"
        }
      },
      { $unwind: { path: "$quizInfo", preserveNullAndEmptyArrays: false } },

      // 3. Phân quyền: Chỉ lấy kết quả của các Quiz do giáo viên đang đăng nhập tạo ra
      ...(req.user.role !== USER_ROLES.ADMIN ? [{
        $match: {
          "quizInfo.teacherId": new mongoose.Types.ObjectId(req.user._id)
        }
      }] : []),

      // 4. Join với bảng Users để lấy thông tin học viên
      {
        $lookup: {
          from: "users", 
          localField: "userId",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },

      { $sort: { createdAt: -1 } },

      // 6. Định hình lại dữ liệu trả về cho Frontend 
      {
        $project: {
          _id: 1,
          score: 1,
          correctAnswersCount: 1,
          totalQuestions: 1,
          timeSpent: 1,
          createdAt: 1,
          quizTitle: "$quizInfo.title",
          learnerName: "$userInfo.fullName",
          learnerEmail: "$userInfo.email"
        }
      }
    ];

    const data = await QuizResult.aggregate(pipeline);

    // Trả về trực tiếp mảng data
    res.status(200).json({
      success: true,
      totalCount: data.length, 
      data: data,
    });
  } catch (error) {
    next(error);
  }
};