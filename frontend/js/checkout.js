import { apiRequest, showToast } from './api.js';
import { getCartItems, getCartSubtotal, clearCart } from './cart.js';
import { isAuthenticated } from './auth.js';

export const processCheckout = async (shippingAddress) => {
  if (!isAuthenticated()) {
    showToast('Please login first to place an order', 'error');
    setTimeout(() => {
      window.location.href = `/pages/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    }, 1500);
    return;
  }

  const cartItems = getCartItems();
  if (cartItems.length === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }

  const totalAmount = getCartSubtotal();

  try {
    // 1. Create order on the backend
    const orderData = {
      orderItems: cartItems.map((item) => ({
        product: item.product,
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      shippingAddress,
      totalAmount: Number(totalAmount),
    };

    const orderRes = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (orderRes.success) {
      const orderId = orderRes.data._id;
      showToast('Order created! Preparing payment...', 'success');

      // 2. Clear local cart
      clearCart();

      // 3. Initiate payment session
      const paymentRes = await apiRequest('/api/payments/session', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      });

      if (paymentRes.success && paymentRes.data.url) {
        // Redirect to Stripe checkout (or mock gateway page)
        window.location.href = paymentRes.data.url;
      }
    }
  } catch (error) {
    console.error('Checkout processing error:', error);
  }
};
