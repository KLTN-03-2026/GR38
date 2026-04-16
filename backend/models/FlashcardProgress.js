import mongoose from "mongoose";

const flashcardProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    flashcardSetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flashcard', // Link tới bộ Flashcard gốc của Teacher
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
            // Gợi ý thêm cho hệ thống ôn tập: Trạng thái ghi nhớ
            memoryStatus: {
                type: String,
                enum: ['Chưa học', 'Đang học', 'Đã nhớ'],
                default: 'Chưa học'
            }
        }
    ]
}, { timestamps: true });

// Tối ưu hóa truy vấn: Mỗi học sinh chỉ có 1 bản ghi Progress cho 1 bộ Flashcard
flashcardProgressSchema.index({ userId: 1, flashcardSetId: 1 }, { unique: true });

const FlashcardProgress = mongoose.model("FlashcardProgress", flashcardProgressSchema);

export default FlashcardProgress;