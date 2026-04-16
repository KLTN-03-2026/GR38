import express from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser
} from '../controllers/adminController.js';
import protect, { authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

// Định tuyến các API
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);

export default router;