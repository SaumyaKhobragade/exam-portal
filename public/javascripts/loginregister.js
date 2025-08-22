// Login Register JavaScript Functions

document.addEventListener('DOMContentLoaded', function() {
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const loginForm = document.querySelector('.login-form');
  const registerForm = document.querySelector('.register-form');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const formType = this.getAttribute('data-form');
      
      toggleBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      if (formType === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
      } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
      }
    });
  });

  // Handle login form submission
  const loginFormElement = document.getElementById('loginForm');
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const messageDiv = document.getElementById('loginMessage');
      
      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          messageDiv.style.display = 'block';
          messageDiv.style.color = 'green';
          messageDiv.textContent = 'Login successful! Redirecting...';
          
          // Redirect based on user type
          setTimeout(() => {
            window.location.href = result.data.redirectTo;
          }, 1000);
        } else {
          messageDiv.style.display = 'block';
          messageDiv.style.color = 'red';
          messageDiv.textContent = result.message || 'Login failed';
        }
      } catch (error) {
        messageDiv.style.display = 'block';
        messageDiv.style.color = 'red';
        // Try to detect user not found from error or result
        if (result && result.message && (result.message.toLowerCase().includes('user not found') || result.message.toLowerCase().includes('user does not exist'))) {
          messageDiv.textContent = 'User not found';
        } else if (error && error.message && (error.message.toLowerCase().includes('user not found') || error.message.toLowerCase().includes('user does not exist'))) {
          messageDiv.textContent = 'User not found';
        } else {
          messageDiv.textContent = 'Network error. Please try again.';
        }
      }
    });
  }

  // Handle registration form submission
  const registerFormElement = document.getElementById('registerForm');
  if (registerFormElement) {
    registerFormElement.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const messageDiv = document.getElementById('registerMessage');
      
      if (password !== confirmPassword) {
        messageDiv.style.display = 'block';
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Passwords do not match';
        return;
      }
      
      try {
        const response = await fetch('/api/v1/users/register-no-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            fullname: `${firstName} ${lastName}`,
            // role removed
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          messageDiv.style.display = 'block';
          messageDiv.style.color = 'green';
          messageDiv.textContent = 'Registration successful! Redirecting to dashboard...';
          
          // Redirect to user dashboard after successful registration
          setTimeout(() => {
            if (data.data && data.data.redirectTo) {
              window.location.href = data.data.redirectTo;
            } else {
              window.location.href = '/user-dashboard';
            }
          }, 1500);
        } else {
          messageDiv.style.display = 'block';
          messageDiv.style.color = 'red';
          messageDiv.textContent = data.message || 'Registration failed';
        }
      } catch (error) {
        messageDiv.style.display = 'block';
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Network error. Please try again.';
      }
    });
  }
});
