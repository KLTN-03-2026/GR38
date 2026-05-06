import mongoose from 'mongoose';

export const REPORT_STATUS = Object.freeze({
    PENDING: 'pending',     // Đang xử lý
    RESOLVED: 'resolved',   // Đã xử lý
    REJECTED: 'rejected'    // Vô hiệu (Báo cáo không chính xác)
});

export const REPORT_ISSUE_TYPE = Object.freeze({
    HISTORICAL_FACT: 'historical_fact', 
    TIMELINE: 'timeline',
    INAPPROPRIATE_BEHAVIOR: 'inappropriate_behavior',
    SPAM: 'spam',                                                   
    TYPO: 'typo',                       
    OTHER: 'other'                      
});

export const REPORT_TARGET_TYPE = Object.freeze({
    DOCUMENT: 'Document',
    QUIZ: 'Quiz',
    FLASHCARD: 'Flashcard',
    USER: 'User' 
});

const reportSchema = new mongoose.Schema(
    {
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        targetType: {
            type: String,
            enum: Object.values(REPORT_TARGET_TYPE),
            required: true
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'targetType' 
        },
        issueType: {
            type: String,
            enum: Object.values(REPORT_ISSUE_TYPE),
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        aiSuggestion: {
            type: String,
            default: null 
        },
        status: {
            type: String,
            enum: Object.values(REPORT_STATUS),
            default: REPORT_STATUS.PENDING
        },
        adminNotes: {
            type: String,
            default: ''
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        resolvedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// --- CẤU HÌNH INDEXES TỐI ƯU TRUY VẤN ---

// Index 1: Phục vụ cho Admin lấy danh sách báo cáo cần xử lý (Lọc theo status, sắp xếp theo thời gian mới nhất)
reportSchema.index({ status: 1, createdAt: -1 });

// Index 2: Phục vụ truy vấn xem một Bài giảng/Quiz cụ thể đang có bao nhiêu báo cáo lỗi chưa xử lý
reportSchema.index({ targetType: 1, targetId: 1, status: 1 });

// Index 3: Phục vụ cho Học sinh xem lại lịch sử các báo cáo mình đã gửi
reportSchema.index({ reporterId: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;