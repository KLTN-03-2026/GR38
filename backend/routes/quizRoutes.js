import express from 'express';

import {
    getQuizzes,
    getQuizById,
    deleteQuiz,
    createQuizManual,
    updateQuiz,           
    updateQuizQuestion,
    getTeacherQuizzes  
} from '#controllers/Quiz/quizController.js';

import {
    submitQuiz,
    getQuizResultDetail,
    getMyHistory,
    getAllQuizzesForLearner,
    getQuizForPlay
} from '#controllers/Quiz/quizResultController.js';

import protect, { authorize, USER_ROLES } from '#middleware/auth.js';
import { uploadQuizImage } from '#config/uploadImage.js'; 

const router = express.Router();


router.use(protect);

// ==========================================
// NHÓM 1: CÁC ROUTE CỐ ĐỊNH 
// ==========================================

// Tạo đề thủ công
router.post('/', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), createQuizManual);

// Xem lịch sử toàn bộ bài đã làm (Dashboard Người học)
router.get('/my-history', authorize(USER_ROLES.LEARNER,USER_ROLES.TEACHER), getMyHistory);

// Xem chi tiết lại 1 bài thi đã nộp (Xem câu đúng/sai)
router.get('/detail/:resultId', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getQuizResultDetail);

// Lấy 1 đề thi cụ thể để làm
router.get('/quiz/:id', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getQuizById);

//Lấy danh sách quiz của giáo viên
router.get('/my-quizzes', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), getTeacherQuizzes);

// Lấy danh sách quiz cho Người học
router.get('/', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getAllQuizzesForLearner);

// ==========================================
// NHÓM 2: CÁC ROUTE PARAMETER ĐỘNG  
// ==========================================

router.get('/document/:documentId', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getQuizzes);
router.post('/:quizId/submit', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER), submitQuiz);

// THÊM MỚI: Cập nhật thông tin chung của đề thi (Tiêu đề, ảnh bìa, mô tả...)
router.put('/:id', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), uploadQuizImage.single('thumbnail'), updateQuiz);

// THÊM MỚI: Cập nhật nội dung 1 câu hỏi cụ thể trong đề thi
router.put('/:quizId/questions/:questionId', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), updateQuizQuestion);

router.delete('/:id', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), deleteQuiz);

router.get('/play/:id', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getQuizForPlay);

export default router;