import express from 'express';

import {
    getAllFlashcardSets,
    getTeacherFlashcardSets,
    createManualFlashcardSet,
    updateFlashcardSet,
    updateFlashcard,
    deleteFlashcardSet
} from '#controllers/Flashcard/flashcardSetController.js';

import {
    getFlashcardSetWithProgress,
    getFlashcardsByDocument,
    getFlashcardCardBack,
    reviewFlashcard,
    toggleStarFlashcard
} from '#controllers/Flashcard/flashcardProgressController.js';

import protect, { authorize, USER_ROLES } from '../middleware/auth.js';
import { uploadFlashcardImage } from '#config/uploadImage.js';

const router = express.Router();


router.use(protect);

// NHÓM 1: CÁC ROUTE CỐ ĐỊNH 


// Lấy danh sách toàn bộ Flashcard trên hệ thống
router.get('/', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getAllFlashcardSets);

// Lấy danh sách flashcard của riêng giáo viên (Quản lý kho đề)
router.get('/my-flashcards', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), getTeacherFlashcardSets);

// Tạo bộ flashcard thủ công (Hỗ trợ upload ảnh bìa)
router.post('/', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), uploadFlashcardImage.single('thumbnail'), createManualFlashcardSet);

// NHÓM 2: CÁC ROUTE PARAMETER ĐỘNG

// Lấy danh sách flashcard theo tài liệu/bài học
router.get('/document/:documentId', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getFlashcardsByDocument);

// Lấy mặt sau của 1 thẻ flashcard
router.get('/:setId/cards/:cardId/back', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getFlashcardCardBack);

// Lấy chi tiết 1 bộ flashcard và tiến độ học tập của User
router.get('/:id', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER, USER_ROLES.ADMIN), getFlashcardSetWithProgress);

// Cập nhật thông tin chung của bộ flashcard (Tiêu đề, ảnh, mô tả)
router.put('/:id', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), uploadFlashcardImage.single('thumbnail'), updateFlashcardSet);

// Xóa bộ flashcard
router.delete('/:id', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), deleteFlashcardSet);

// Cập nhật nội dung 1 thẻ flashcard cụ thể (Mặt trước, mặt sau)
router.put('/:setId/cards/:cardId', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), updateFlashcard);

// Đánh dấu đã ôn tập 1 thẻ (Tăng số lần lật thẻ cho Learner)
router.post('/:setId/cards/:cardId/review', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER), reviewFlashcard);

// Đánh dấu yêu thích 1 thẻ (Gắn sao cho Learner)
router.put('/:setId/cards/:cardId/star', authorize(USER_ROLES.LEARNER, USER_ROLES.TEACHER), toggleStarFlashcard);

export default router;