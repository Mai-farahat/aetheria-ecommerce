import express from 'express';
import {
  createCheckoutSession,
  verifyPayment,
  stripeWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/session', protect, createCheckoutSession);
router.get('/verify/:sessionId', verifyPayment);

// Note: Stripe Webhook path (does not use protect)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
