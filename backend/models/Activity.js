import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actionType: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["DOCUMENT", "QUIZ", "FLASHCARD"],
      required: true,
    },
    targetName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
