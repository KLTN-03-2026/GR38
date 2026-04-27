import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        // Ghi chú: Thống nhất score nên là điểm hệ 10 (VD: 8.5) để dễ tính trung bình trên Dashboard.
        // Còn số câu đúng đã có thể suy ra từ mảng answers hoặc tính dựa trên phần trăm.
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 0
    },
    timeSpent: {
        type: Number,
        default: 0,
        // THÊM MỚI: Thời gian làm bài (tính bằng giây). Rất cần thiết để đánh giá 
        // học viên làm nhanh hay chậm, hoặc chống gian lận/spam submit.
    },
    answers: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            selectedAnswer: {
                type: String,
                default: null
            },
            isCorrect: {
                type: Boolean,
                default: false
            }
        }
    ]
}, {
    timestamps: true 
});

// CẬP NHẬT INDEX (Rất quan trọng cho hiệu năng):

// 1. Index của bạn: Tốt cho việc tìm lịch sử của 1 bài cụ thể (Tránh trùng lặp, xem lịch sử làm bài A)
quizResultSchema.index({ userId: 1, quizId: 1, createdAt: -1 });

// 2. THÊM INDEX MỚI: Cực kỳ quan trọng cho API Dashboard!
quizResultSchema.index({ userId: 1, createdAt: -1 });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

export default QuizResult;