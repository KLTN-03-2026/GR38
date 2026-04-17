import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

//@desc Lấy thống kê tiến độ học tập của người dùng
//@route GET /api/progress/dashboard
//@access Private
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id; 

        // Lấy tổng số tài liệu, flashcard và quiz của người dùng
        const totalDocuments = await Document.countDocuments({ userId });
        const totalFlashcardSets = await Flashcard.countDocuments({ userId });
        const totalQuizzes = await Quiz.countDocuments({ userId });
        const completedQuizzes = await Quiz.countDocuments({ userId, completedAt : { $ne: null } });

        //Lấy thống kê flashcard
        const flashcardSets = await Flashcard.find({ userId });
        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(c => c.reviewedCount > 0).length;
            starredFlashcards += set.cards.filter(c => c.isStarred).length;
        });

        //Lấy thống kê quiz
        const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
        const averageScore = quizzes.length > 0
            ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length)
            : 0;

        //Hoạt động gần đây
        const recentDocuments = await Document.find({ userId })
            .sort({ lastAccessed: -1})
            .limit(5)
            .select('title fileName lastAccessed status');
        
        const recentQuizzes = await Quiz.find({ userId, completedAt: { $ne: null } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('documentId', 'title')
            .select('title score totalQuestions completedAt');

            //Chuỗi học tập [đơn giản hóa - trong sản xuất, theo dõi hoạt động hàng ngày]
            const studyStreak = Math.floor(Math.random() * 7 ) + 1; // Giả lập chuỗi học tập từ 1 đến 7 ngày

            res.status(200).json({
                success: true,
                data: {
                    overview: {
                        totalDocuments,
                        totalFlashcardSets,
                        totalFlashcards,
                        reviewedFlashcards,
                        starredFlashcards,
                        totalQuizzes,
                        completedQuizzes,
                        averageScore,
                        studyStreak
                    },
                    recent: {
                        documents: recentDocuments,
                        quizzes: recentQuizzes

                    }
                }
            });
    } catch (error) {
        next(error);
    }
};
