import mongoose from 'mongoose';

export const COURSE_STATUS = Object.freeze({
    ACTIVE: 'active',
    COMPLETED: 'completed',
    DROPPED: 'dropped'
});

export const COURSE_CONTENT_TYPE = Object.freeze({
    QUIZ: 'Quiz',
    FLASHCARD: 'Flashcard'
});

const courseSchema = new mongoose.Schema(
    {
        learnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        lessonType: {
            type: String,
            enum: Object.values(COURSE_CONTENT_TYPE),
            required: true
        },
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'lessonType'
        },
        status: {
            type: String,
            enum: Object.values(COURSE_STATUS),
            default: COURSE_STATUS.ACTIVE
        },
        progressPercent: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

courseSchema.index({ learnerId: 1, lessonType: 1, lessonId: 1 }, { unique: true });
courseSchema.index({ teacherId: 1, lessonType: 1, status: 1 });
courseSchema.index({ teacherId: 1, learnerId: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;
