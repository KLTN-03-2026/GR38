import express from 'express';
import { body, validationResult } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import { USER_ROLES } from '../models/User.js';

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

/**
 * Public Routes
 */

// POST /api/auth/register - Đăng ký tài khoản
router.post('/register', validateRegister, handleValidationErrors, register);

// POST /api/auth/login - Đăng nhập
router.post('/login', validateLogin, handleValidationErrors, login);

export default router;