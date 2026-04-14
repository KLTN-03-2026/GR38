import express, { Router } from 'express';
import {body} from 'express-validator';
import{
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

//Xac thuc nguoi dung
const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Tên người dùng phải có ít nhất 3 ký tự'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Vui lòng nhập địa chỉ email hợp lệ'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Vui lòng nhập địa chỉ email hợp lệ'),
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống')
];

//Public routes
router.post('/register', validateRegister, register);
router.post('/login', loginValidation, login);

//Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;