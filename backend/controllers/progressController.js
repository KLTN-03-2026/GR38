import Document from '#models/Document.js';
import Flashcard from '#models/Flashcard.js';
import Quiz from '#models/Quiz.js';
import QuizResult from '#models/QuizResult.js'; // Nhớ import thêm QuizResult nhé!

//@desc Lấy thống kê tiến độ học tập của người dùng
//@route GET /api/progress/dashboard
//@access Private
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id; 

        // 1. Lấy tổng số liệu cơ bản
        const totalDocuments = await Document.countDocuments({ userId });
        const totalFlashcardSets = await Flashcard.countDocuments({ userId });
        
        // 2. Thống kê Flashcard 
        const flashcardSets = await Flashcard.find({ userId });
        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(c => c.reviewedCount > 0).length;
            starredFlashcards += set.cards.filter(c => c.isStarred).length;
        });

        // 3. THỐNG KÊ QUIZ 
        // Lấy tất cả bài quiz mà user này ĐÃ LÀM
        const userResults = await QuizResult.find({ userId });
        const completedQuizzes = userResults.length;
        
        const averageScore = completedQuizzes > 0
            ? Math.round(userResults.reduce((sum, r) => sum + r.score, 0) / completedQuizzes)
            : 0;

        // 4. Hoạt động gần đây
        const recentDocuments = await Document.find({ userId })
            .sort({ lastAccessed: -1})
            .limit(5)
            .select('title fileName lastAccessed status');
        
        // Lấy 5 BÀI NỘP gần nhất (Dùng QuizResult)
        const recentQuizzes = await QuizResult.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('quizId', 'title') 
            .select('score totalQuestions createdAt');

        // Chuỗi học tập
        const studyStreak = Math.floor(Math.random() * 7 ) + 1; 

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalDocuments,
                    totalFlashcardSets,
                    totalFlashcards,
                    reviewedFlashcards,
                    starredFlashcards,
                    completedQuizzes, // Số bài đã làm
                    averageScore,
                    studyStreak
                },
                recent: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes // Trả về 5 bài làm gần nhất
                }
            }
        });
    } catch (error) {
        next(error);
    }
};