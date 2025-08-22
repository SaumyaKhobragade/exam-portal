// Login Register JavaScript Functions

// Password visibility toggle function
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Handle URL parameters for messages
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  const messageType = urlParams.get('type') || 'info';
  
  if (message) {
    showMessage(message, messageType);
    
    // Clean URL by removing the message parameters
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }

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
            fullname: `${firstName} ${lastName}`
          })
        });
        
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          messageDiv.style.display = 'block';
          messageDiv.style.color = 'red';
          messageDiv.textContent = 'Server error. Please try again.';
          return;
        }
        
        if (response.ok) {
          // Show success popup before redirecting
          const emailDomain = email.split('@')[1];
          showOrganizationPopup('success', 'Registration Successful!', 
            `Welcome! Your ${emailDomain} domain registration is approved. You will be redirected to your dashboard shortly.`);
          
          // Redirect to user dashboard after successful registration
          setTimeout(() => {
            if (data.data && data.data.redirectTo) {
              window.location.href = data.data.redirectTo;
            } else {
              window.location.href = '/user-dashboard';
            }
          }, 2000);
        } else {
          // Handle error responses
          console.log('Error response data:', data);
          
          // Check if it's a domain validation error
          if (data.message && (data.message.includes('Domain not approved') || data.message.includes('not registered with us'))) {
            const emailDomain = email.split('@')[1];
            showOrganizationPopup('error', 'Email Domain Not Registered', 
              `The domain '${emailDomain}' is not registered with us. Please check your email address and ensure you're using your institutional email.`);
          } else {
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'red';
            messageDiv.textContent = data.message || 'Registration failed';
          }
        }
      } catch (error) {
        console.error('Network error:', error);
        messageDiv.style.display = 'block';
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Network error. Please try again.';
      }
    });
  }
});

// Function to show messages
function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('authMessage');
  const messageContent = messageDiv.querySelector('.message-content');
  
  if (messageDiv && messageContent) {
    messageContent.textContent = message;
    messageDiv.className = `auth-message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }
  }
}

// Organization Validation Popup Functions
function showOrganizationPopup(type, title, message) {
  const popup = document.getElementById('organizationPopup');
  const icon = document.getElementById('popupIcon');
  const titleElement = document.getElementById('popupTitle');
  const messageElement = document.getElementById('popupMessage');
  const actionsElement = document.getElementById('popupActions');
  
  // Set content
  titleElement.textContent = title;
  messageElement.textContent = message;
  
  // Set icon and actions based on type
  if (type === 'error') {
    icon.textContent = '❌';
    icon.className = 'popup-icon error';
    messageElement.className = 'popup-message error-domain';
    actionsElement.innerHTML = `
      <button class="popup-btn secondary" onclick="closeOrganizationPopup()">Check Email</button>
      <button class="popup-btn primary" onclick="contactSupport()">Contact Support</button>
    `;
  } else if (type === 'success') {
    icon.textContent = '✅';
    icon.className = 'popup-icon success';
    messageElement.className = 'popup-message';
    actionsElement.innerHTML = `
      <button class="popup-btn primary" onclick="closeOrganizationPopup()">Continue</button>
    `;
  }
  
  // Show popup
  popup.classList.add('show');
}

function closeOrganizationPopup() {
  const popup = document.getElementById('organizationPopup');
  popup.classList.remove('show');
  
  // Focus back on the email input for domain issues
  const emailInput = document.getElementById('registerEmail');
  if (emailInput) {
    emailInput.focus();
    emailInput.select();
  }
}

function contactSupport() {
  // Redirect to contact page
  window.location.href = '/contact';
}

// Close popup when clicking outside
document.addEventListener('click', function(event) {
  const popup = document.getElementById('organizationPopup');
  const popupContent = document.querySelector('.popup-content');
  
  if (popup && popup.classList.contains('show') && !popupContent.contains(event.target)) {
    closeOrganizationPopup();
  }
});
