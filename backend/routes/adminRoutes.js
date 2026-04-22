import express from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser
} from '../controllers/adminController.js';
import protect, { authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../models/User.js';

const router = express.Router();

router.use(protect);
router.use(authorize(USER_ROLES.ADMIN));

// Định tuyến các API
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);

export default router;