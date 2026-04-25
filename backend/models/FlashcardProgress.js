import mongoose from "mongoose";

const flashcardProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    flashcardSetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flashcard', 
        required: true
    },
    // Lưu trạng thái học tập của TỪNG THẺ trong bộ flashcard đó
    cardProgress: [
        {
            cardId: { 
                type: mongoose.Schema.Types.ObjectId, 
                required: true 
            }, // Link tới _id của cái thẻ (front/back) trong bộ gốc
            isStarred: {
                type: Boolean,
                default: false
            },
            reviewCount: {
                type: Number,
                default: 0
            },
            lastReviewed: {
                type: Date,
                default: null
            },
            memoryStatus: {
                type: String,
                enum: ['Chưa học', 'Đang học', 'Đã nhớ'],
                default: 'Chưa học'
            }
        }
    ]
}, { timestamps: true });


flashcardProgressSchema.index({ userId: 1, flashcardSetId: 1 }, { unique: true });

const FlashcardProgress = mongoose.model("FlashcardProgress", flashcardProgressSchema);

export default FlashcardProgress;