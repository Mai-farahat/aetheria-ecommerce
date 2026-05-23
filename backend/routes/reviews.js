import express from 'express';
import { deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/:id')
  .delete(protect, deleteReview);

export default router;
