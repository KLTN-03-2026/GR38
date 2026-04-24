import express from 'express';
import {
  getUsers,
  getUserById,
  createUser, 
  updateUser,
  deleteUser
} from '../controllers/adminController.js';
import protect, { authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../models/User.js';

const router = express.Router();

router.use(protect);
router.use(authorize(USER_ROLES.ADMIN));

// Định tuyến các API
router.route('/users')
  .get(getUsers)
  .post(createUser);
router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)  
  .delete(deleteUser);

export default router;