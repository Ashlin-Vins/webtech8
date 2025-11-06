// Show message function
function showMessage(message, type = 'error') {
  const existingMsg = document.querySelector('.message');
  if (existingMsg) {
    existingMsg.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `alert alert-${type} message`;
  messageDiv.textContent = message;
  
  const form = document.getElementById('loginForm');
  form.parentNode.insertBefore(messageDiv, form);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(`Welcome back, ${data.user.username}!`, 'success');
      setTimeout(() => {
        window.location.href = '/auctions';
      }, 1000);
    } else {
      // Show specific error messages
      if (response.status === 401) {
        if (data.message.includes('credentials')) {
          showMessage('❌ Invalid email or password. Please try again.', 'danger');
        } else {
          showMessage('❌ ' + data.message, 'danger');
        }
      } else {
        showMessage('❌ ' + (data.message || 'Login failed. Please try again.'), 'danger');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';2348
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('❌ Network error. Please check your connection and try again.', 'danger');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
});
