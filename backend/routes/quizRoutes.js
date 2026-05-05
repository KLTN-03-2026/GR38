import express from "express";
import {
  getQuizzes,
  getQuizById,
  deleteQuiz,
  createQuizManual,
  updateQuiz,
  updateQuizQuestion,
  getTeacherQuizzes,
  getAllQuizzesForAdmin, // Đảm bảo đã import hàm này
} from "#controllers/Quiz/quizController.js";

import {
  submitQuiz,
  getQuizResultDetail,
  getMyHistory,
} from "#controllers/Quiz/quizResultController.js";

import protect, { authorize, USER_ROLES } from "#middleware/auth.js";
import { uploadQuizImage } from "#config/uploadImage.js";

const router = express.Router();

router.use(protect);

// ==========================================
// NHÓM 1: CÁC ROUTE CỐ ĐỊNH (STATIC ROUTES)
// Phải để lên trên cùng để tránh bị nhầm với :id
// ==========================================

// 1. Route cho Admin (Đây là cái bạn đang thiếu)
router.get("/admin/all", authorize(USER_ROLES.ADMIN), getAllQuizzesForAdmin);

// 2. Lấy danh sách quiz của riêng giáo viên đó
router.get(
  "/my-quizzes",
  authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN),
  getTeacherQuizzes,
);

// 3. Xem lịch sử làm bài
router.get("/my-history", authorize(USER_ROLES.LEARNER), getMyHistory);

// 4. Tạo đề thủ công
router.post(
  "/manual",
  authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN),
  uploadQuizImage.single("thumbnail"),
  createQuizManual,
);

// ==========================================
// NHÓM 2: CÁC ROUTE CÓ PARAMETER (DYNAMIC ROUTES)
// ==========================================

// Lấy 1 đề thi cụ thể để làm bài
router.get(
  "/quiz/:id",
  authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN),
  getQuizById,
);

// Xem chi tiết kết quả một bài thi đã nộp
router.get(
  "/detail/:resultId",
  authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN),
  getQuizResultDetail,
);

// Lấy danh sách quiz dựa trên ID tài liệu
router.get(
  "/document/:documentId",
  authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN),
  getQuizzes,
);

// Nộp bài thi
router.post(
  "/:quizId/submit",
  authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER),
  submitQuiz,
);

// Cập nhật thông tin chung của đề thi
router.put(
  "/:id",
  authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN),
  uploadQuizImage.single("thumbnail"),
  updateQuiz,
);

// Cập nhật nội dung 1 câu hỏi cụ thể
router.put(
  "/:quizId/questions/:questionId",
  authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN),
  updateQuizQuestion,
);

// Xóa đề thi
router.delete(
  "/:id",
  authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN),
  deleteQuiz,
);

export default router;
