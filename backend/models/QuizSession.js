import mongoose from "mongoose";

const quizSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    timeRemaining: {
      type: Number,
      required: true,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedOption: {
          type: String,
          default: null,
        },
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const QuizSession = mongoose.model("QuizSession", quizSessionSchema);

export default QuizSession;
