import express from 'express';

// 1. Import từ Quiz Controller (Quản lý đề thi)
import {
    getQuizzes,
    getQuizById,
    deleteQuiz,
    createQuizManual,
} from '#controllers/Quiz/quizController.js';

// 2. Import từ Quiz Result Controller (Quản lý điểm và bài làm)
import {
    submitQuiz,
    getQuizResultDetail,
    getMyHistory
} from '#controllers/Quiz/quizResultController.js';

import protect, { authorize, USER_ROLES } from '#middleware/auth.js';

const router = express.Router();

// Tất cả các API dưới đây đều cần đăng nhập
router.use(protect);


// NHÓM 1: CÁC ROUTE CỐ ĐỊNH 

// Tạo đề thủ công
router.post('/', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), createQuizManual);
// Xem lịch sử toàn bộ bài đã làm (Dashboard Học sinh)
router.get('/my-history', authorize(USER_ROLES.LEARNER), getMyHistory);
// Xem chi tiết lại 1 bài thi đã nộp (Xem câu đúng/sai)
router.get('/detail/:resultId', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getQuizResultDetail);
// Lấy 1 đề thi cụ thể để làm
router.get('/quiz/:id', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getQuizById);

// NHÓM 2: CÁC ROUTE PARAMETER ĐỘNG  

// Lấy danh sách đề thi theo Document (Bài học)
router.get('/document/:documentId', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getQuizzes);
// Nộp bài thi
router.post('/:quizId/submit', authorize(USER_ROLES.LEARNER), submitQuiz);
// Xóa đề thi
router.delete('/:id', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), deleteQuiz);

export default router;