import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
} from '../controllers/productController.js';
import { createProductReview, getProductReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Categories routes
router.route('/categories')
  .get(getCategories)
  .post(protect, admin, createCategory);

// Products routes
router.route('/')
  .get(getProducts)
  .post(protect, admin, upload.array('images', 5), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.array('images', 5), updateProduct)
  .delete(protect, admin, deleteProduct);

// Reviews routes
router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, createProductReview);

export default router;
