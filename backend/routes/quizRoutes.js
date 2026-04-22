import express from 'express';
import {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';
import protect, { authorize, USER_ROLES } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Đã sửa lại để học sinh có thể lấy đề
router.get('/quiz/:id', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getQuizById);
router.get('/:documentId', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getQuizzes);
router.post('/:id/submit', authorize(USER_ROLES.LEARNER), submitQuiz);
router.get('/:id/results', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getQuizResults);
router.delete('/:id', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), deleteQuiz);

export default router;