// CodeSecure Login Register JavaScript Functions

document.addEventListener('DOMContentLoaded', function() {
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const loginForm = document.querySelector('.login-form');
  const registerForm = document.querySelector('.register-form');

  // Handle form toggle between login and register
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
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

  // Show message function
  function showMessage(messageDiv, type, text) {
    messageDiv.style.display = 'block';
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
  }

  // Handle login form submission (Demo version)
  const loginFormElement = document.getElementById('loginForm');
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const messageDiv = document.getElementById('loginMessage');
      
      // Demo login validation
      if (email && password) {
        if (password.length < 6) {
          showMessage(messageDiv, 'error', 'Password must be at least 6 characters long');
          return;
        }
        
        showMessage(messageDiv, 'success', 'Demo login successful! (No backend connected)');
        
        // Simulate redirect delay
        setTimeout(() => {
          showMessage(messageDiv, 'success', 'In a real app, you would be redirected to dashboard...');
        }, 1500);
      } else {
        showMessage(messageDiv, 'error', 'Please fill in all fields');
      }
    });
  }

  // Handle registration form submission (Demo version)
  const registerFormElement = document.getElementById('registerForm');
  if (registerFormElement) {
    registerFormElement.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const role = document.getElementById('userRole').value;
      const messageDiv = document.getElementById('registerMessage');
      
      // Basic validation
      if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
        showMessage(messageDiv, 'error', 'Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        showMessage(messageDiv, 'error', 'Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        showMessage(messageDiv, 'error', 'Password must be at least 6 characters long');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage(messageDiv, 'error', 'Please enter a valid email address');
        return;
      }
      
      // Username validation
      if (username.length < 3) {
        showMessage(messageDiv, 'error', 'Username must be at least 3 characters long');
        return;
      }
      
      showMessage(messageDiv, 'success', 'Demo registration successful! (No backend connected)');
      
      // Simulate redirect delay
      setTimeout(() => {
        showMessage(messageDiv, 'success', 'In a real app, you would be redirected to dashboard...');
      }, 1500);
    });
  }

  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add form field animation effects
  const formInputs = document.querySelectorAll('.form-input');
  formInputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentNode.style.transform = 'scale(1.02)';
      this.parentNode.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
      this.parentNode.style.transform = 'scale(1)';
    });
  });

  // Add loading animation to submit buttons
  const submitBtns = document.querySelectorAll('.submit-btn');
  submitBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const originalText = this.textContent;
      this.textContent = 'Processing...';
      this.disabled = true;
      
      setTimeout(() => {
        this.textContent = originalText;
        this.disabled = false;
      }, 2000);
    });
  });

  // Add benefit item hover effects
  const benefitItems = document.querySelectorAll('.benefit-item');
  benefitItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
});
