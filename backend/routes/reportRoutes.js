import express from 'express';
import { 
    createReport, 
    getReports, 
    updateReportStatus, 
    getMyReports 
} from '../controllers/report.controller.js';

// Import middleware xác thực 
import { protect, authorize } from '#middlewares/auth.js'; 

import { USER_ROLES } from '../models/User.js';

const router = express.Router();

// Bắt buộc đăng nhập cho tất cả các route bên dưới
router.use(protect);

// ROUTES CHUNG (HỌC VIÊN / GIÁO VIÊN / ADMIN đều có thể gọi)

// Tạo báo cáo lỗi 
router.post('/', createReport);

// Xem lịch sử báo cáo của chính mình 
router.get('/my-reports', getMyReports);

// ROUTES XEM DANH SÁCH (DÀNH CHO QUẢN LÝ)
// ADMIN và TEACHER đều được phép XEM danh sách báo cáo
router.get('/', authorize(USER_ROLES.ADMIN, USER_ROLES.TEACHER), getReports);

// CHỈ CÓ ADMIN mới được quyền thay đổi trạng thái 
router.patch('/:id/status', authorize(USER_ROLES.ADMIN), updateReportStatus);

export default router;