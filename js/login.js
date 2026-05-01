/**
 * ClassWave — Admin Login Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');
  const toast = document.getElementById('login-toast');

  // Hardcoded credentials for demo/local dev
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'password123'
  };

  /**
   * Show toast notification
   */
  function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `login-toast ${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 4000);
  }

  /**
   * Handle Form Submission
   */
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;

    // Set loading state
    loginBtn.disabled = true;
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<span>Authenticating...</span><div class="spinner"></div>';

    // Simulate network delay
    setTimeout(async () => {
      // 1. FRONTEND FALLBACK (For local development/server issues)
      // If server is down, we still allow the super admin and default admin to enter
      const isSuperAdmin = (usernameInput === 'serenaaaronpoe' && passwordInput === 'serenaaaronpoe123');
      const isDefaultAdmin = (usernameInput === 'admin' && passwordInput === 'password123');

      if (isSuperAdmin || isDefaultAdmin) {
        showToast('Login successful (Local Override)!', 'success');
        
        localStorage.setItem('classwave_admin_logged_in', 'true');
        localStorage.setItem('classwave_admin_user', isSuperAdmin ? 'Serena Aaron Poe' : 'System Administrator');
        localStorage.setItem('classwave_admin_username', usernameInput);
        localStorage.setItem('classwave_admin_role', isSuperAdmin ? 'super_admin' : 'admin');

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
        return;
      }

      // 2. BACKEND AUTH (For real users/database)
      try {
        const response = await fetch('api/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await response.json();

        if (response.ok) {
          showToast('Login successful!', 'success');
          localStorage.setItem('classwave_admin_logged_in', 'true');
          localStorage.setItem('classwave_admin_user', data.user.full_name);
          localStorage.setItem('classwave_admin_username', data.user.username);
          localStorage.setItem('classwave_admin_role', data.user.role);

          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1200);
        } else {
          showToast(data.message || 'Invalid username or password.', 'error');
          loginBtn.disabled = false;
          loginBtn.innerHTML = originalText;
          loginForm.classList.add('shake');
          setTimeout(() => loginForm.classList.remove('shake'), 500);
        }
      } catch (error) {
        // If we reach here, it means the server is really down, 
        // but since we checked common credentials above, this is only for non-dev accounts
        showToast('Server connection failed. Using local fallback...', 'warning');
        console.error('Login error:', error);
      }
    }, 1000);
  });
});

// Add some CSS dynamically for the spinner and shake
const style = document.createElement('style');
style.textContent = `
  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-10px); }
    40%, 80% { transform: translateX(10px); }
  }
  .shake {
    animation: shake 0.4s ease-in-out;
  }
`;
document.head.appendChild(style);
