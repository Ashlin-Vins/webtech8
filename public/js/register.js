// Show message function
function showMessage(message, type = 'error') {
  const existingMsg = document.querySelector('.message');
  if (existingMsg) {
    existingMsg.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `alert alert-${type} message`;
  messageDiv.textContent = message;
  
  const form = document.getElementById('registerForm');
  form.parentNode.insertBefore(messageDiv, form);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Client-side validation
  if (password.length < 6) {
    showMessage('❌ Password must be at least 6 characters long', 'danger');
    return;
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password, role })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(`✅ Account created successfully! Welcome, ${data.user.username}!`, 'success');
      setTimeout(() => {
        window.location.href = '/auctions';
      }, 1500);
    } else {
      // Show specific error messages
      if (response.status === 400) {
        if (data.message.includes('already exists')) {
          showMessage('❌ An account with this email or username already exists. Please login instead.', 'danger');
        } else {
          showMessage('❌ ' + data.message, 'danger');
        }
      } else {
        showMessage('❌ ' + (data.message || 'Registration failed. Please try again.'), 'danger');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register';
    }
  } catch (error) {
    console.error('Registration error:', error);
    showMessage('❌ Network error. Please check your connection and try again.', 'danger');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register';
  }
});
