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
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;

    if (!usernameInput || !passwordInput) {
      showToast('Please enter both username and password.', 'error');
      return;
    }

    // Set loading state
    loginBtn.disabled = true;
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<span>Authenticating...</span><div class="spinner"></div>';

    try {
      // 1. Check Supabase
      const res = await fetch(`${SUPABASE_URL}/users?username=eq.${encodeURIComponent(usernameInput)}&password=eq.${encodeURIComponent(passwordInput)}`, {
        headers: sbHeaders
      });
      
      const users = await res.json();

      if (users.length > 0) {
        const user = users[0];
        showToast('Login successful!', 'success');
        
        localStorage.setItem('classwave_admin_logged_in', 'true');
        localStorage.setItem('classwave_admin_user', user.full_name);
        localStorage.setItem('classwave_admin_username', user.username);
        localStorage.setItem('classwave_admin_role', user.role);

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      } else {
        // 2. Local Fallback (for safety during migration)
        const isSuperAdmin = (usernameInput === 'serenaaaronpoe' && passwordInput === 'serenaaaronpoe123');
        if (isSuperAdmin) {
           showToast('Login successful (Override)!', 'success');
           localStorage.setItem('classwave_admin_logged_in', 'true');
           localStorage.setItem('classwave_admin_user', 'Serena Aaron Poe');
           localStorage.setItem('classwave_admin_username', 'serenaaaronpoe');
           localStorage.setItem('classwave_admin_role', 'super_admin');
           setTimeout(() => window.location.href = 'index.html', 1200);
           return;
        }

        showToast('Invalid username or password.', 'error');
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalText;
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
      }
    } catch (error) {
      console.error('Login Error:', error);
      showToast('Connection failed. Please check your internet.', 'error');
      loginBtn.disabled = false;
      loginBtn.innerHTML = originalText;
    }
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
