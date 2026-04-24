import express from 'express'
import {
    uploadsDocument,
    getDocuments,
    getDocument,
    deleteDocument,
} from '../controllers/documentController.js';
import protect, {authorize} from '../middleware/auth.js';
import { USER_ROLES } from '../models/User.js';
import uploadPdf from '../config/uploadPdf.js';
import { uploadDocumentImage } from '../config/uploadImage.js';


const router = express.Router();

//Tất cả router đều cần xác thực người dùng
router.use(protect);

// 1. Route up file PDF (Lưu local)
router.post(
    '/upload-pdf', 
    authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), 
    uploadPdf.single('file'), 
    uploadsDocument
);

// 2. Route up ảnh bìa tài liệu (Lưu Cloudinary)
router.post(
    '/upload-thumbnail', 
    authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), 
    uploadDocumentImage.single('thumbnail'), 
    (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'Chưa có ảnh' });
        // Trả URL về cho Frontend, Frontend sẽ dùng URL này kết hợp với ID của PDF để tạo thành 1 bài giảng hoàn chỉnh
        res.json({ success: true, url: req.file.path }); 
    }
);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), deleteDocument);


export default router;