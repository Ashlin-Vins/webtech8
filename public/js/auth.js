// Authentication helper functions
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const user = await response.json();
      updateNavbar(user);
      return user;
    } else {
      updateNavbar(null);
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    updateNavbar(null);
    return null;
  }
}

function updateNavbar(user) {
  const guestElements = document.querySelectorAll('.guest-only');
  const userElements = document.querySelectorAll('.user-only');
  const adminElements = document.querySelectorAll('.admin-only');
  const usernameDisplay = document.getElementById('usernameDisplay');

  if (user) {
    // Hide guest elements, show user elements
    guestElements.forEach(el => el.style.display = 'none');
    userElements.forEach(el => el.style.display = '');
    
    if (usernameDisplay) {
      usernameDisplay.textContent = `👤 ${user.username}`;
    }

    // Show admin elements if user is admin
    if (user.role === 'admin') {
      adminElements.forEach(el => el.style.display = '');
    } else {
      adminElements.forEach(el => el.style.display = 'none');
    }
  } else {
    // Show guest elements, hide user elements
    guestElements.forEach(el => el.style.display = '');
    userElements.forEach(el => el.style.display = 'none');
    adminElements.forEach(el => el.style.display = 'none');
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Logout failed. Please try again.');
  }
}

function requireAuth() {
  checkAuth().then(user => {
    if (!user) {
      alert('Please login to access this page');
      window.location.href = '/login';
    }
  });
}

function requireAdmin() {
  checkAuth().then(user => {
    if (!user || user.role !== 'admin') {
      alert('Admin access required');
      window.location.href = '/';
    }
  });
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});
