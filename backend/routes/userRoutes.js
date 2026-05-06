import express from 'express';
import { 
    getProfile, 
    updateProfile, 
    changePassword 
}
from '#controllers/Auth/userController.js';
import protect  from '#middleware/auth.js'; 
import {uploadAvatar} from '../config/uploadImage.js';

const router = express.Router();


router.use(protect); 

router.get('/profile', getProfile);
router.put('/profile', uploadAvatar.single('avatar'), updateProfile);
router.post('/change-password', changePassword);

export default router;