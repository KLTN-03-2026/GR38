import mongoose from "mongoose";
import Document from "#models/Document.js";
import FlashcardProgress from "#models/FlashcardProgress.js";
import QuizResult from "#models/QuizResult.js";
import User from "#models/User.js";

//@desc Lấy thống kê tiến độ học tập của người dùng
//@route GET /api/progress/dashboard
//@access Private
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const currentYear = new Date().getFullYear();

    const [
      user,
      totalDocuments,
      flashcardProgressStats,
      basicStats,
      studyDaysAggr,
      yearlyOverview,
      recentDocuments,
      recentQuizzesData,
    ] = await Promise.all([
      // 1. Lấy thông tin User
      User.findById(userId).select("currentStreak"),
      
      // 2. Thống kê Document
      Document.countDocuments({ userId }),
      
      // 3. Thống kê Flashcard
      FlashcardProgress.aggregate([
        { $match: { userId: userObjectId } },
        {
          $project: {
            totalCards: { $size: { $ifNull: ["$cardProgress", []] } },
            reviewedCards: {
              $size: {
                $filter: {
                  input: { $ifNull: ["$cardProgress", []] },
                  as: "card",
                  cond: { $gt: ["$$card.reviewCount", 0] },
                },
              },
            },
            starredCards: {
              $size: {
                $filter: {
                  input: { $ifNull: ["$cardProgress", []] },
                  as: "card",
                  cond: { $eq: ["$$card.isStarred", true] },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalFlashcardSets: { $sum: 1 },
            totalFlashcards: { $sum: "$totalCards" },
            reviewedFlashcards: { $sum: "$reviewedCards" },
            starredFlashcards: { $sum: "$starredCards" },
          },
        },
      ]),

      // 4. Tổng bài làm & Điểm trung bình Quiz
      QuizResult.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            totalExercises: { $sum: 1 },
            averageScore: { $avg: "$score" },
          },
        },
      ]),

      // 5. Tổng số ngày học
      QuizResult.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
        },
        { $count: "totalDays" },
      ]),

      // 6. Dữ liệu biểu đồ 12 tháng
      QuizResult.aggregate([
        {
          $match: {
            userId: userObjectId,
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31T23:59:59`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
      ]),

      // 7. Hoạt động gần đây: Documents
      Document.find({ userId })
        .sort({ lastAccessed: -1 })
        .limit(5)
        .select("title fileName lastAccessed status"),

      // 8. Hoạt động gần đây: Quizzes
      QuizResult.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("quizId", "title")
        .select("score totalQuestions createdAt"),
    ]);

    // XỬ LÝ KẾT QUẢ TỪ PROMISE.ALL
    const totalFlashcardSets = flashcardProgressStats.length > 0 ? flashcardProgressStats[0].totalFlashcardSets : 0;
    const totalFlashcards = flashcardProgressStats.length > 0 ? flashcardProgressStats[0].totalFlashcards : 0;
    const reviewedFlashcards = flashcardProgressStats.length > 0 ? flashcardProgressStats[0].reviewedFlashcards : 0;
    const starredFlashcards = flashcardProgressStats.length > 0 ? flashcardProgressStats[0].starredFlashcards : 0;

    const completedQuizzes = basicStats.length > 0 ? basicStats[0].totalExercises : 0;
    const averageScore = basicStats.length > 0 ? parseFloat(basicStats[0].averageScore.toFixed(1)) : 0;
    const totalStudyDays = studyDaysAggr.length > 0 ? studyDaysAggr[0].totalDays : 0;

    const chartData = Array.from({ length: 12 }, (_, i) => {
      const monthData = yearlyOverview.find((item) => item._id === i + 1);
      return { month: `T${i + 1}`, exercises: monthData ? monthData.count : 0 };
    });

    const formattedRecentQuizzes = recentQuizzesData.map((result) => ({
      id: result._id,
      title: result.quizId?.title || "Bài tập đã xóa",
      score: result.score,
      createdAt: result.createdAt,
    }));

    // TRẢ KẾT QUẢ CHO FRONTEND
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudyDays,
          completedQuizzes,
          studyStreak: user?.currentStreak || 0,
          averageScore,
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewedFlashcards,
          starredFlashcards,
        },
        chartData,
        recent: {
          documents: recentDocuments,
          quizzes: formattedRecentQuizzes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};