// Base API Client
const API_URL = ''; // Empty string since frontend is served statically by the backend

// Toast helper
export const showToast = (message, type = 'success') => {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <span class="toast-close" style="cursor:pointer;font-weight:bold;">&times;</span>
  `;

  container.appendChild(toast);

  // Close toast on click
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 4000);
};

// Fetch client wrapping authorization header inclusion
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };

  // If payload is not FormData (e.g. for image uploads), set Content-Type to JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
};
