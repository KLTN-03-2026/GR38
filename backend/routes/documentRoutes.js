import express from 'express'
import {
    uploadsDocument,
    getDocuments,
    getDocument,
    deleteDocument,
} from '../controllers/documentController.js';
import protect, {authorize} from '../middleware/auth.js';
import { USER_ROLES } from '../models/User.js';
import upload from '../config/multer.js';

const router = express.Router();

//Tất cả router đều cần xác thực người dùng
router.use(protect);

router.post(
    '/upload', 
    authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), 
    upload.single('file'), 
    uploadsDocument
);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', authorize(USER_ROLES.TEACHER, USER_ROLES.ADMIN), deleteDocument);


export default router;