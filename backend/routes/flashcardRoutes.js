import express from 'express';
import {
    getFlashcardsByDocument, 
    getAllFlashcardSets,
    reviewFlashcard,
    toggleStarFlashcard,
    deleteFlashcardSet,
    updateFlashcard,
    createManualFlashcardSet,
    getFlashcardSetWithProgress,
    updateFlashcardSet
} from '../controllers/flashcardController.js';
import protect from '../middleware/auth.js';
import { uploadFlashcardImage } from '../config/uploadImage.js';

const router = express.Router();

router.use(protect);

// Các route GET ...
router.get('/', getAllFlashcardSets);
router.get('/document/:documentId', getFlashcardsByDocument);
router.get('/:id', getFlashcardSetWithProgress);

// Báo cho Multer biết hãy bắt lấy 1 file ảnh nằm trong field 'thumbnail'
router.post('/manual', uploadFlashcardImage.single('thumbnail'), createManualFlashcardSet);
router.put('/:id', uploadFlashcardImage.single('thumbnail'), updateFlashcardSet);

// Các route thẻ con và tiến độ ...
router.put('/:setId/cards/:cardId', updateFlashcard);
router.delete('/:id', deleteFlashcardSet);
router.post('/:setId/cards/:cardId/review', reviewFlashcard);
router.put('/:setId/cards/:cardId/star', toggleStarFlashcard);

export default router;