import mongoose from 'mongoose';
import Document from '#models/Document.js';
import Flashcard from '#models/Flashcard.js';
import Quiz from '#models/Quiz.js';
import QuizResult from '#models/QuizResult.js';
import User from '#models/User.js'; // Import thêm User để lấy chuỗi ngày học thật

//@desc Lấy thống kê tiến độ học tập của người dùng
//@route GET /api/progress/dashboard
//@access Private
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id; 
        const currentYear = new Date().getFullYear();

        // 1. Lấy thông tin User để lấy chuỗi ngày học thật (thay thế Math.random)
        const user = await User.findById(userId).select('currentStreak');

        // 2. Thống kê Document & Flashcard (Giữ nguyên logic của bạn)
        const totalDocuments = await Document.countDocuments({ userId });
        const totalFlashcardSets = await Flashcard.countDocuments({ userId });
        
        const flashcardSets = await Flashcard.find({ userId });
        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(c => c.reviewedCount > 0).length;
            starredFlashcards += set.cards.filter(c => c.isStarred).length;
        });

        // 3. THỐNG KÊ QUIZ BẰNG MONGODB AGGREGATION (Tối ưu cho Dashboard UI)
        
        // 3.1 - Tổng bài làm & Điểm trung bình
        const basicStats = await QuizResult.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { 
                $group: { 
                    _id: null, 
                    totalExercises: { $sum: 1 },
                    averageScore: { $avg: "$score" }
                } 
            }
        ]);
        const completedQuizzes = basicStats.length > 0 ? basicStats[0].totalExercises : 0;
        const averageScore = basicStats.length > 0 ? parseFloat(basicStats[0].averageScore.toFixed(1)) : 0;

        // 3.2 - Tổng số ngày học (Đếm các ngày khác nhau có nộp bài)
        const studyDaysAggr = await QuizResult.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } 
                } 
            },
            { $count: "totalDays" }
        ]);
        const totalStudyDays = studyDaysAggr.length > 0 ? studyDaysAggr[0].totalDays : 0;

        // 3.3 - Dữ liệu biểu đồ 12 tháng
        const yearlyOverview = await QuizResult.aggregate([
            { 
                $match: { 
                    userId: new mongoose.Types.ObjectId(userId),
                    createdAt: { 
                        $gte: new Date(`${currentYear}-01-01`), 
                        $lte: new Date(`${currentYear}-12-31T23:59:59`) 
                    }
                } 
            },
            { 
                $group: { 
                    _id: { $month: "$createdAt" }, 
                    count: { $sum: 1 } 
                } 
            }
        ]);
        // Format mảng đủ 12 tháng cho Recharts vẽ biểu đồ
        const chartData = Array.from({ length: 12 }, (_, i) => {
            const monthData = yearlyOverview.find(item => item._id === i + 1);
            return { month: `T${i + 1}`, exercises: monthData ? monthData.count : 0 };
        });

        // 4. Hoạt động gần đây
        const recentDocuments = await Document.find({ userId })
            .sort({ lastAccessed: -1})
            .limit(5)
            .select('title fileName lastAccessed status');
        
        // Lấy 5 bài nộp gần nhất và format lại cho giống thiết kế UI
        const recentQuizzesData = await QuizResult.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('quizId', 'title') 
            .select('score totalQuestions createdAt');

        const formattedRecentQuizzes = recentQuizzesData.map(result => ({
            id: result._id,
            title: result.quizId?.title || 'Bài tập đã xóa',
            score: result.score,
            createdAt: result.createdAt
        }));

        // 5. TRẢ KẾT QUẢ CHO FRONTEND
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    // Dữ liệu cho 4 thẻ Card trên cùng
                    totalStudyDays, 
                    completedQuizzes, 
                    studyStreak: user?.currentStreak || 0, 
                    averageScore,

                    // Dữ liệu cũ giữ nguyên phòng khi Frontend cần
                    totalDocuments,
                    totalFlashcardSets,
                    totalFlashcards,
                    reviewedFlashcards,
                    starredFlashcards,
                },
                chartData, // Dữ liệu cho Biểu đồ cột
                recent: {
                    documents: recentDocuments,
                    quizzes: formattedRecentQuizzes // Dữ liệu cho Danh sách bài đã hoàn thành
                }
            }
        });
    } catch (error) {
        next(error);
    }
};