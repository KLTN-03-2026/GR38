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
        min: 0
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 0
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

quizResultSchema.index({ userId: 1, quizId: 1, createdAt: -1 });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

export default QuizResult;