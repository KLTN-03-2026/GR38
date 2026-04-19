import express from 'express'
import {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory
} from '../controllers/aiController.js';
import protect, { authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../models/User.js';

const router = express.Router();

router.use(protect);

// --- NHÓM 1: CHỈ GIÁO VIÊN & ADMIN ĐƯỢC TẠO ---
router.post('/generate-flashcards', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), generateFlashcards);
router.post('/generate-quiz', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), generateQuiz);

// --- NHÓM 2: CÔNG CỤ HỌC TẬP (MỞ CHO TẤT CẢ, BAO GỒM LEARNER) ---
router.post('/generate-summary', generateSummary); 
router.post('/chat', chat);
router.post('/explain-concept', explainConcept);
router.get('/chat-history/:documentId', getChatHistory);

export default router;

