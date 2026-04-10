import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    title: {
        typr: String,
        required: true,
        trim: true
    },
    questions: [{
        question:{
            type: String,
            required:true
        },
        options: {
            type: [String],
            required: true,
            validate: [array => array.length === 4,'Phải có 4 lựa chọn' ]
        },
        correctAnswer: {
            type: String,
            required: true
        },
        explanation: {
            type: String,
            default: ''
        },
        diffiulty: {
            type: String,
            enum: ['Dể', 'Trung bình', 'Khó'],
            default: 'Trung bình'
        }
    }],
    userAnswers: [{
        questionIndex: {
            type: Number,
            required: true
        },
        selectedAnswer: {
            type: String,
            required: true
        },
        isCorrect: {
            type: Boolean,
            requered: true
        },
        answeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

//Index for faster queries
quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;