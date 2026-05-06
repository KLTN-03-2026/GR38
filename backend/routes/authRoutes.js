import express from 'express';
import { 
    register, 
    login, 
    googleAuth, 
    forgotPassword, 
    resetPassword 
} 
from '#controllers/Auth/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;