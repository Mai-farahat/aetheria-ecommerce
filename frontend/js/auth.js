import { apiRequest, showToast } from './api.js';

// Get logged in user details from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is logged in
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Check if user is admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

// Register user
export const register = async (name, email, password) => {
  try {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (res.success) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      }));
      showToast('Registration successful!', 'success');
      setTimeout(() => {
        window.location.href = '/pages/index.html';
      }, 1000);
    }
  } catch (error) {
    console.error(error);
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      }));
      showToast('Login successful!', 'success');
      setTimeout(() => {
        if (res.data.role === 'admin') {
          window.location.href = '/pages/admin/dashboard.html';
        } else {
          window.location.href = '/pages/index.html';
        }
      }, 1000);
    }
  } catch (error) {
    console.error(error);
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out successfully');
  setTimeout(() => {
    window.location.href = '/pages/login.html';
  }, 1000);
};

// Update profile details
export const updateProfile = async (profileData) => {
  try {
    const res = await apiRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if (res.success) {
      localStorage.setItem('user', JSON.stringify(res.data));
      showToast('Profile updated successfully!', 'success');
      return res.data;
    }
  } catch (error) {
    console.error(error);
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const res = await apiRequest('/api/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.success) {
      showToast('Password changed successfully!', 'success');
      return true;
    }
  } catch (error) {
    console.error(error);
  }
};

// Update navigation UI links depending on login status
export const updateNavigationUI = () => {
  const navLinksContainer = document.getElementById('nav-auth-links');
  if (!navLinksContainer) return;

  if (isAuthenticated()) {
    const user = getCurrentUser();
    let adminLink = '';

    if (user && user.role === 'admin') {
      adminLink = `<li><a href="/pages/admin/dashboard.html" class="nav-item">Admin Dashboard</a></li>`;
    }

    navLinksContainer.innerHTML = `
      ${adminLink}
      <li><a href="/pages/profile.html" class="nav-item">My Profile</a></li>
      <li><a href="#" id="logout-btn" class="nav-item">Logout (${user.name})</a></li>
    `;

    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    navLinksContainer.innerHTML = `
      <li><a href="/pages/login.html" class="nav-item">Login</a></li>
      <li><a href="/pages/register.html" class="nav-item">Register</a></li>
    `;
  }
};

// Auto-run on load to initialize navbar
document.addEventListener('DOMContentLoaded', () => {
  updateNavigationUI();
});
