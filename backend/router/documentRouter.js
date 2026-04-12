import express from 'express'
import {
    uploadsDocument,
    getDocuments,
    getDocument,
    deleteDocument,
} from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

//Tất cả router đều cần xác thực người dùng
router.use(protect);

router.post('/upload', upload.single('file'), uploadsDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);


export default router;