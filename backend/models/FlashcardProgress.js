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
    cardProgress: [
        {
            cardId: { 
                type: mongoose.Schema.Types.ObjectId, 
                required: true 
            }, 
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

            nextReviewDate: {
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