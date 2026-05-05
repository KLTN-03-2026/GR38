import mongoose from "mongoose";

// 1. TÁCH RIÊNG SUB-SCHEMA CHO CÂU HỎI
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [(array) => array.length === 4, "Phải có đúng 4 lựa chọn"],
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return Array.isArray(this.options) && this.options.includes(value);
      },
      message: "Đáp án đúng phải nằm trong danh sách lựa chọn",
    },
  },
  explanation: {
    type: String,
    default: "",
  },
  // Có thể giữ lại hoặc bỏ difficulty ở từng câu hỏi tùy logic của bạn
  difficulty: {
    type: String,
    enum: ["Dễ", "Trung bình", "Khó"],
    default: "Trung bình",
  },
});

// 2. SCHEMA CHÍNH CHO QUIZ
const quizSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: null, 
    },
    timeLimit: {
      type: Number,
      default: 30, 
    },

    isAiGenerated: {
      type: Boolean,
      default: false, 
    },
    questions: {
      type: [questionSchema], 
      validate: [
        (val) => val.length >= 5,
        "Một bài trắc nghiệm phải có ít nhất 5 câu hỏi."
      ],
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    stats: {
      enrolledLearners: {
        type: Number,
        default: 0,
      },
      totalAttempts: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.pre("save", function (next) {
  this.totalQuestions = Array.isArray(this.questions) ? this.questions.length : 0;
});
quizSchema.index({ teacherId: 1, createdAt: -1 });
quizSchema.index({ teacherId: 1, isPublished: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;