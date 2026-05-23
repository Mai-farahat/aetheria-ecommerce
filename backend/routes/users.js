import express from 'express';
import { getUsers, updateUserProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers);

router.route('/profile')
  .put(protect, updateUserProfile);

router.route('/password')
  .put(protect, changePassword);

export default router;
