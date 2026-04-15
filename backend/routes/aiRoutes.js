import express from 'express'
import {
    generateFlashcard,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate-flashcard', generateFlashcard);
router.post('/generate-quiz', generateQuiz);
router.post('./generate-summary', generateSummary);
router.post('./chat', chat);
router.post('/expain-concept', explainConcept);
router.get('./chat-history/:documentId', getChatHistory);

export default router;
