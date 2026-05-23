import { showToast } from './api.js';

// Get cart items
export const getCartItems = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

// Save cart items
const saveCartItems = (items) => {
  localStorage.setItem('cart', JSON.stringify(items));
  updateCartBadge();
};

// Add item to cart
export const addToCart = (product, qty = 1) => {
  const items = getCartItems();
  const existItem = items.find((x) => x.product === product._id);

  const productImg = (product.images && product.images.length > 0)
    ? product.images[0]
    : '/assets/images/placeholder.jpg';

  if (existItem) {
    // Check stock limit
    if (existItem.qty + qty > product.stock) {
      showToast(`Cannot add more. Only ${product.stock} items left in stock.`, 'error');
      return;
    }
    existItem.qty += qty;
  } else {
    if (qty > product.stock) {
      showToast(`Cannot add. Only ${product.stock} items left in stock.`, 'error');
      return;
    }
    items.push({
      product: product._id,
      name: product.name,
      qty,
      price: product.price,
      image: productImg,
      stock: product.stock, // cache stock limit
    });
  }

  saveCartItems(items);
  showToast(`${product.name} added to cart!`, 'success');
};

// Update item quantity
export const updateCartQty = (productId, qty) => {
  const items = getCartItems();
  const existItem = items.find((x) => x.product === productId);

  if (existItem) {
    if (qty > existItem.stock) {
      showToast(`Only ${existItem.stock} items available in stock.`, 'error');
      return;
    }
    existItem.qty = Number(qty);
    if (existItem.qty <= 0) {
      removeFromCart(productId);
    } else {
      saveCartItems(items);
    }
  }
};

// Remove item from cart
export const removeFromCart = (productId) => {
  let items = getCartItems();
  items = items.filter((x) => x.product !== productId);
  saveCartItems(items);
  showToast('Item removed from cart');
};

// Clear cart
export const clearCart = () => {
  localStorage.removeItem('cart');
  updateCartBadge();
};

// Get items count
export const getCartCount = () => {
  const items = getCartItems();
  return items.reduce((acc, item) => acc + item.qty, 0);
};

// Get subtotal price
export const getCartSubtotal = () => {
  const items = getCartItems();
  return items.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);
};

// Update cart badge indicator in navbar
export const updateCartBadge = () => {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.innerText = getCartCount();
  }
};

// Auto-run badge calculation on module initialization
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
