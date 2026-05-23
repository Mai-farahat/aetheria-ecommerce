import express from 'express';
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/my')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

export default router;
