import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        default: null
    },
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
    thumbnail: {
        type: String, 
        default: null
    },
    description: {
        type: String,
        default: ''
    },

    isAiGenerated: {
        type: Boolean,
        default: false
    },
    cards: [
        {
            front: {type: String, required: true},
            back: {type: String, required: true},
            difficulty: {
                type: String,
                enum: ["Dễ", "Trung bình", "Khó"],
                default: "Trung bình"
            }
        },
    ],
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
        }
    }
}, {
    timestamps: true,
});

flashcardSchema.index({ teacherId: 1, createdAt: -1 });
flashcardSchema.index({ teacherId: 1, isPublished: 1 });

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

export default Flashcard;