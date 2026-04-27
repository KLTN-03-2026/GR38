import express from 'express';
import {
    uploadsDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    updateDocument 
} from '../controllers/documentController.js';
import protect, { authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../models/User.js';

// Import đúng middleware
import uploadPdf from '../config/uploadPdf.js';
import { uploadDocumentImage } from '../config/uploadImage.js';

const router = express.Router();

router.use(protect);

// 1. Route up file PDF 
router.post(
    '/upload-pdf', 
    authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), 
    uploadPdf.single('file'), 
    uploadsDocument
);

// 2. Route up ảnh bìa tài liệu độc lập 
router.post(
    '/upload-thumbnail', 
    authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), 
    uploadDocumentImage.single('thumbnail'), 
    (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'Chưa có ảnh' });
        res.json({ success: true, url: req.file.path }); 
    }
);

// 3. Các route lấy dữ liệu (Get)
router.get('/', getDocuments);
router.get('/:id', getDocument);

// 4. Route cập nhật thông tin tài liệu (Tiêu đề, Ảnh bìa)
router.put(
    '/:id', 
    authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), 
    uploadDocumentImage.single('thumbnail'), 
    updateDocument
);

router.delete(
    '/:id', 
    authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), 
    deleteDocument
);

export default router;