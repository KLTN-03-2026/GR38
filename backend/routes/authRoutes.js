import express from 'express';
import { body, validationResult } from 'express-validator';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    googleAuth
} from '../controllers/authController.js';
import { USER_ROLES } from '../models/User.js';
import protect from '../middleware/auth.js';
import {uploadAvatar} from '../config/uploadImage.js';

const router = express.Router();

/**
 * Middleware: Xử lý validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array()[0].msg
        });
    }
    next();
};

/**
 * Validation cho Register
 */
const validateRegister = [
    body('fullName')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Họ tên phải có ít nhất 3 ký tự'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Vui lòng nhập địa chỉ email hợp lệ'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('passwordConfirm')
        .notEmpty()
        .withMessage('Vui lòng xác nhận mật khẩu')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Xác nhận mật khẩu không khớp');
            }
            return true;
        }),
    body('role')
        .isIn(Object.values(USER_ROLES))
        .withMessage(`Role phải là một trong: ${Object.values(USER_ROLES).join(', ')}`)
];

/**
 * Validation cho Login
 */
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Vui lòng nhập địa chỉ email hợp lệ'),
    body('password')
        .notEmpty()
        .withMessage('Vui lòng nhập mật khẩu')
];

const validateUpdateProfile = [
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Họ tên phải có ít nhất 3 ký tự'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Vui lòng nhập địa chỉ email hợp lệ')
];

const validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Vui lòng nhập mật khẩu hiện tại'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
    body('newPasswordConfirm')
        .notEmpty()
        .withMessage('Vui lòng xác nhận mật khẩu mới')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Xác nhận mật khẩu mới không khớp');
            }
            return true;
        })
];

/**
 * Public Routes
 */

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/google', googleAuth); 
// Protected Routes (Cần đăng nhập)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadAvatar.single('avatar'), validateUpdateProfile, handleValidationErrors, updateProfile);
router.post('/change-password', protect, validateChangePassword, handleValidationErrors, changePassword);

export default router; 