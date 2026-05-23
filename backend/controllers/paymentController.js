import Stripe from 'stripe';
import Order from '../models/Order.js';

const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;
let stripe;
if (isStripeConfigured) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// @desc    Create Stripe checkout session (or mock fallback session)
// @route   POST /api/payments/session
// @access  Private
export const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const host = req.headers.origin || `${req.protocol}://${req.get('host')}`;

    if (isStripeConfigured) {
      // Prepare Stripe line items
      const line_items = order.items.map((item) => {
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100), // in cents
          },
          quantity: item.qty,
        };
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${host}/pages/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${host}/pages/cart.html`,
        client_reference_id: orderId,
      });

      // Save Stripe session ID to order
      order.stripeSessionId = session.id;
      await order.save();

      return res.json({
        success: true,
        data: {
          id: session.id,
          url: session.url,
        },
      });
    } else {
      // Fallback Mock checkout session
      const mockSessionId = `mock_session_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
      order.stripeSessionId = mockSessionId;
      await order.save();

      return res.json({
        success: true,
        data: {
          id: mockSessionId,
          url: `${host}/pages/success.html?session_id=${mockSessionId}&mock=true`,
        },
      });
    }
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Stripe Session or Mock session locally (Fallback helper)
// @route   GET /api/payments/verify/:sessionId
// @access  Private/Public
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const order = await Order.findOne({ stripeSessionId: sessionId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order with this session ID not found' });
    }

    if (sessionId.startsWith('mock_session_')) {
      // If it's a mock session, update status to paid
      if (order.status === 'pending') {
        order.status = 'paid';
        await order.save();
      }
      return res.json({ success: true, message: 'Mock payment verified successfully', orderId: order._id });
    }

    if (isStripeConfigured) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        if (order.status === 'pending') {
          order.status = 'paid';
          await order.save();
        }
        return res.json({ success: true, message: 'Stripe payment verified successfully', orderId: order._id });
      } else {
        return res.status(400).json({ success: false, message: 'Stripe payment session is unpaid' });
      }
    }

    return res.status(400).json({ success: false, message: 'Unable to verify session' });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  if (!isStripeConfigured) {
    return res.status(400).send('Stripe is not configured on the backend');
  }

  try {
    // stripe.webhooks.constructEvent needs raw request body
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Find order and mark as paid
    const order = await Order.findOne({ stripeSessionId: session.id });
    if (order) {
      order.status = 'paid';
      await order.save();
      console.log(`Order ${order._id} was successfully marked as PAID via webhook`);
    }
  }

  return res.json({ received: true });
};
