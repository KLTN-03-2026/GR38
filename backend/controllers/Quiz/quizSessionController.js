import QuizSession from "#models/QuizSession.js";
import { validationResult } from "express-validator";

//@desc Luu tien trinh lam bai quiz (auto-save)
//@route POST /api/quiz-session/save-progress
//@access Private
export const saveQuizProgress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Du lieu khong hop le.",
        data: null,
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Chua xac thuc nguoi dung.",
        data: null,
      });
    }

    const { quizId, timeRemaining, currentQuestionIndex, answers } = req.body;

    const session = await QuizSession.findOneAndUpdate(
      { userId, quizId, isCompleted: false },
      {
        userId,
        quizId,
        timeRemaining,
        currentQuestionIndex,
        answers,
        isCompleted: false,
      },
      { upsert: true, new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Lưu tiến trình làm bài quiz thành công!",
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lưu tiến trình quiz.",
      data: null,
    });
  }
};
