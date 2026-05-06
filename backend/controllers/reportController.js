import mongoose from 'mongoose';
import Report, { REPORT_STATUS } from '../models/Report.js';

/**
 * @desc    Học sinh gửi báo cáo lỗi 
 * @route   POST /api/reports
 * @access  Private (Học sinh)
 */
export const createReport = async (req, res) => {
    try {
        const { targetType, targetId, issueType, description } = req.body;
        const reporterId = req.user._id; 

        // 1. Validate targetType có hợp lệ không
        const validTargetTypes = ['Document', 'Quiz', 'Flashcard', 'User'];
        if (!validTargetTypes.includes(targetType)) {
            return res.status(400).json({ 
                success: false, 
                message: `Loại nội dung báo cáo không hợp lệ. Chỉ chấp nhận: ${validTargetTypes.join(', ')}` 
            });
        }

        // 2. Lấy model động dựa trên targetType và kiểm tra targetId có tồn tại không
        const TargetModel = mongoose.model(targetType); 
        const targetExists = await TargetModel.findById(targetId);

        if (!targetExists) {
            return res.status(404).json({ 
                success: false, 
                message: `Không tìm thấy ${targetType} với ID này. Báo cáo bị từ chối.` 
            });
        }

        // 3. Kiểm tra xem user này đã báo cáo lỗi này cho nội dung/người này chưa (tránh spam báo cáo)
        const existingReport = await Report.findOne({
            reporterId,
            targetId,
            status: REPORT_STATUS.PENDING
        });

        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã gửi báo cáo cho nội dung/người này rồi và đang chờ Admin xử lý.'
            });
        }

        // 4. Nếu mọi thứ hợp lệ, lưu báo cáo
        const newReport = await Report.create({
            reporterId,
            targetType,
            targetId,
            issueType,
            description
        });

        res.status(201).json({
            success: true,
            message: 'Báo cáo đã được gửi. Cảm ơn bạn đã đóng góp!',
            data: newReport
        });
    } catch (error) {
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'ID không đúng định dạng hợp lệ.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Admin lấy danh sách báo cáo (có phân trang & lọc)
 * @route   GET /api/reports
 * @access  Private (Admin)
 */
export const getReports = async (req, res) => {
    try {
        const { status, targetType, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (targetType) query.targetType = targetType;

        const reports = await Report.find(query)
            .populate('reporterId', 'fullName email profileImage')
            .populate('targetId')            
            .populate('resolvedBy', 'fullName') 
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Report.countDocuments(query);

        res.status(200).json({
            success: true,
            data: reports,
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Admin cập nhật trạng thái xử lý báo cáo
 * @route   PATCH /api/reports/:id/status
 * @access  Private (Admin)
 */
export const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const adminId = req.user._id;

        const resolvedAt = (status === REPORT_STATUS.RESOLVED || status === REPORT_STATUS.REJECTED) 
            ? Date.now() 
            : null;

        const updatedReport = await Report.findByIdAndUpdate(
            id,
            { 
                status, 
                adminNotes, 
                resolvedBy: adminId,
                resolvedAt 
            },
            { new: true, runValidators: true }
        ).populate('targetId');

        if (!updatedReport) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
        }

        res.status(200).json({
            success: true,
            message: 'Đã cập nhật trạng thái báo cáo',
            data: updatedReport
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Học sinh xem các báo cáo mình đã gửi
 * @route   GET /api/reports/my-reports
 * @access  Private (Học sinh)
 */
export const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ reporterId: req.user._id })
            // SỬA TẠI ĐÂY: Thêm 'fullName' để Mongoose có thể lấy tên nếu targetId là bảng User
            .populate('targetId', 'title name fullName') 
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};