import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
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
            required: true,
            validate: {
                validator: function(value) {
                    return Array.isArray(this.options) && this.options.includes(value);
                },
                message: 'Đáp án đúng phải nằm trong danh sách lựa chọn'
            }
        },
        explanation: {
            type: String,
            default: ''
        },
        difficulty: {
            type: String,
            enum: ['Dễ', 'Trung bình', 'Khó'],
            default: 'Trung bình'
        }
    }],
    totalQuestions: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    stats: {
        enrolledLearners: {
            type: Number,
            default: 0
        },
        totalAttempts: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
})

quizSchema.pre('save', function(next) {
    this.totalQuestions = Array.isArray(this.questions) ? this.questions.length : 0;
    next();
});

//Index for faster queries
quizSchema.index({ teacherId: 1, createdAt: -1 });
quizSchema.index({ teacherId: 1, isPublished: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;