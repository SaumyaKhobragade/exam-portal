// IDE JavaScript Functions

// Initialize timer and exam data from JSON script tag
let timeRemaining = 2732; // Default fallback
let examData = null;

// Copy-Paste Prevention System
function initializeCopyPastePrevention() {
  console.log('Initializing copy-paste prevention...');
  
  // Prevent copy, cut, paste, and select all keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
    if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
      e.preventDefault();
      e.stopPropagation();
      showSecurityAlert('Copy/Paste operations are disabled during the exam');
      return false;
    }
    
    // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (Developer tools and view source)
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      showSecurityAlert('Developer tools are disabled during the exam');
      return false;
    }
    
    // Prevent Alt+Tab (minimize/switch windows)
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      showSecurityAlert('Window switching is discouraged during the exam');
      return false;
    }
    
    // Prevent Ctrl+Shift+T (reopen closed tab)
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      e.stopPropagation();
      showSecurityAlert('Tab operations are disabled during the exam');
      return false;
    }
    
    // Prevent F11 (manual fullscreen toggle)
    if (e.key === 'F11') {
      e.preventDefault();
      e.stopPropagation();
      showSecurityAlert('Manual fullscreen toggle is disabled during the exam');
      return false;
    }
    
    // Prevent Escape key when in fullscreen (to prevent exiting fullscreen)
    if (e.key === 'Escape' && document.fullscreenElement) {
      e.preventDefault();
      e.stopPropagation();
      showSecurityAlert('Exiting fullscreen is not allowed during the exam');
      return false;
    }
  });
  
  // Prevent right-click context menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    e.stopPropagation();
    showSecurityAlert('Right-click is disabled during the exam');
    return false;
  });
  
  // Prevent clipboard API access
  document.addEventListener('copy', function(e) {
    e.preventDefault();
    e.stopPropagation();
    showSecurityAlert('Copy operation is disabled during the exam');
    return false;
  });
  
  document.addEventListener('cut', function(e) {
    e.preventDefault();
    e.stopPropagation();
    showSecurityAlert('Cut operation is disabled during the exam');
    return false;
  });
  
  document.addEventListener('paste', function(e) {
    e.preventDefault();
    e.stopPropagation();
    showSecurityAlert('Paste operation is disabled during the exam');
    return false;
  });
  
  // Prevent text selection in specific areas (but allow in code editor)
  document.addEventListener('selectstart', function(e) {
    // Allow selection only in the code editor and input fields
    const allowedElements = ['TEXTAREA', 'INPUT'];
    const codeEditor = document.querySelector('.code-editor');
    
    if (!allowedElements.includes(e.target.tagName) && 
        e.target !== codeEditor && 
        !codeEditor?.contains(e.target)) {
      e.preventDefault();
      return false;
    }
  });
  
  // Additional protection for code editor
  const codeEditor = document.querySelector('.code-editor');
  if (codeEditor) {
    // Override clipboard operations specifically for code editor
    codeEditor.addEventListener('keydown', function(e) {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityAlert('Copy/Paste operations are disabled in the code editor');
        return false;
      }
    });
    
    codeEditor.addEventListener('paste', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showSecurityAlert('Paste operation is disabled in the code editor');
      return false;
    });
  }
  
  // Disable drag and drop
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  });
  
  document.addEventListener('drop', function(e) {
    e.preventDefault();
    return false;
  });
  
  // Monitor for developer tools opening (basic detection)
  let devtools = {
    open: false,
    threshold: 160
  };
  
  function detectDevTools() {
    if (window.outerHeight - window.innerHeight > devtools.threshold || 
        window.outerWidth - window.innerWidth > devtools.threshold) {
      if (!devtools.open) {
        devtools.open = true;
        showSecurityAlert('Developer tools detected. Please close them during the exam.');
        console.warn('Developer tools opened');
      }
    } else {
      devtools.open = false;
    }
  }
  
  // Check for developer tools every 500ms
  setInterval(detectDevTools, 500);
  
  // Prevent opening new windows/tabs
  window.addEventListener('beforeunload', function(e) {
    const message = 'Are you sure you want to leave? Your exam progress might be lost.';
    e.returnValue = message;
    return message;
  });
  
  // Disable print functionality
  window.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      e.stopPropagation();
      showSecurityAlert('Printing is disabled during the exam');
      return false;
    }
  });
  
  // Override print function
  window.print = function() {
    showSecurityAlert('Printing is disabled during the exam');
    return false;
  };
  
  // Disable selection of all text
  document.onselectstart = function(e) {
    const allowedElements = ['TEXTAREA', 'INPUT'];
    const codeEditor = document.querySelector('.code-editor');
    
    if (!allowedElements.includes(e.target.tagName) && 
        e.target !== codeEditor && 
        !codeEditor?.contains(e.target)) {
      return false;
    }
  };
  
  // Monitor window focus for potential tab switching
  let isWindowFocused = true;
  let focusWarningCount = 0;
  
  window.addEventListener('blur', function() {
    isWindowFocused = false;
    focusWarningCount++;
    if (focusWarningCount <= 3) {
      showSecurityAlert(`Warning ${focusWarningCount}/3: Please stay focused on the exam`);
    }
  });
  
  window.addEventListener('focus', function() {
    isWindowFocused = true;
  });
  
  console.log('Copy-paste prevention initialized successfully');
}

// Fullscreen Management System
function initializeFullscreenMode() {
  console.log('Initializing fullscreen mode...');
  
  let fullscreenAttempts = 0;
  let maxAttempts = 3;
  let fullscreenWarningShown = false;
  
  // Set global flag to prevent any interference
  window.examTerminated = false;
  
  // Function to enter fullscreen
  function enterFullscreen() {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      return element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      return element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      return element.msRequestFullscreen();
    }
    
    return Promise.reject('Fullscreen not supported');
  }
  
  // Function to check if in fullscreen
  function isInFullscreen() {
    return document.fullscreenElement || 
           document.mozFullScreenElement || 
           document.webkitFullscreenElement || 
           document.msFullscreenElement;
  }
  
  // Function to handle fullscreen requirement
  function enforceFullscreen() {
    // Check if exam is already terminated
    if (window.examTerminated) {
      console.log('Exam already terminated, skipping fullscreen enforcement');
      return;
    }
    
    if (!isInFullscreen()) {
      console.log('Not in fullscreen. Current attempts:', fullscreenAttempts, 'Max:', maxAttempts);
      
      if (fullscreenAttempts >= maxAttempts) {
        // Already exceeded max attempts, terminate immediately
        console.error('TERMINATING: Exceeded max attempts');
        handleMaxAttemptsReached();
        return;
      }
      
      fullscreenAttempts++;
      console.log('Fullscreen attempt:', fullscreenAttempts, '/', maxAttempts);
      
      showFullscreenPrompt().then((userConfirmed) => {
        if (userConfirmed) {
          enterFullscreen().then(() => {
            // Successfully entered fullscreen
            console.log('Fullscreen enabled successfully');
          }).catch((error) => {
            console.error('Failed to enter fullscreen:', error);
            showSecurityAlert('Please enable fullscreen manually for exam security');
            
            // If this was the last attempt and still failed
            if (fullscreenAttempts >= maxAttempts) {
              console.error('TERMINATING: Last attempt failed');
              setTimeout(() => {
                handleMaxAttemptsReached();
              }, 1000);
            } else {
              // Retry after delay
              setTimeout(enforceFullscreen, 2000);
            }
          });
        } else {
          // User cancelled/refused
          console.log('User cancelled fullscreen attempt:', fullscreenAttempts, '/', maxAttempts);
          if (fullscreenAttempts >= maxAttempts) {
            // No more attempts left, terminate
            console.error('TERMINATING: User refused final attempt');
            handleMaxAttemptsReached();
          } else {
            // Still have attempts left, try again
            setTimeout(enforceFullscreen, 2000);
          }
        }
      });
    }
  }
  
  // Function to handle max attempts reached
  function handleMaxAttemptsReached() {
    console.error('EXAM TERMINATION: Maximum fullscreen attempts reached!');
    console.log('Termination initiated - attempts:', fullscreenAttempts, 'max:', maxAttempts);
    
    // Prevent any further fullscreen attempts
    fullscreenAttempts = maxAttempts + 1;
    
    // Log security violation
    logSecurityViolation('FULLSCREEN_VIOLATION', `User exceeded maximum fullscreen attempts (${fullscreenAttempts-1}/${maxAttempts})`);
    
    // Show final warning modal
    showExamTerminationModal();
    
    // Clear all code immediately
    eraseAllCode();
    
    // Submit exam automatically after 5 seconds
    setTimeout(() => {
      forceSubmitExam();
    }, 5000);
    
    // Disable any further security checks
    window.examTerminated = true;
  }
  
  // Function to log security violations
  function logSecurityViolation(violationType, details) {
    const violationData = {
      type: violationType,
      details: details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      examId: window.examData?.exam?._id || 'unknown',
      userId: window.examData?.user?._id || 'unknown'
    };
    
    console.error('SECURITY VIOLATION:', violationData);
    
    // Try to send to server (optional - can fail silently)
    try {
      fetch('/api/security-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(violationData)
      }).catch(error => {
        console.warn('Failed to log security violation to server:', error);
      });
    } catch (error) {
      console.warn('Failed to send security violation log:', error);
    }
    
    // Store locally as backup
    try {
      const violations = JSON.parse(localStorage.getItem('securityViolations') || '[]');
      violations.push(violationData);
      localStorage.setItem('securityViolations', JSON.stringify(violations));
    } catch (error) {
      console.warn('Failed to store security violation locally:', error);
    }
  }
  
  // Function to erase all code from the IDE
  function eraseAllCode() {
    const codeEditor = document.querySelector('.code-editor');
    if (codeEditor) {
      codeEditor.value = '';
      codeEditor.disabled = true;
      codeEditor.style.background = '#ffebee';
      codeEditor.style.color = '#c62828';
      codeEditor.placeholder = 'Code cleared due to security violation';
    }
    
    // Clear any saved code in localStorage
    try {
      localStorage.removeItem('examCode');
      localStorage.removeItem('currentCode');
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
    
    // Disable all IDE functionality
    disableIDEFunctionality();
  }
  
  // Function to disable IDE functionality
  function disableIDEFunctionality() {
    // Disable all buttons
    const buttons = document.querySelectorAll('.action-btn, .question-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    });
    
    // Disable language selector
    const languageSelect = document.querySelector('.language-select, #language-select');
    if (languageSelect) {
      languageSelect.disabled = true;
      languageSelect.style.opacity = '0.5';
    }
    
    // Show disabled overlay
    showDisabledOverlay();
  }
  
  // Function to show exam termination modal
  function showExamTerminationModal() {
    const modal = document.createElement('div');
    modal.id = 'examTerminationModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      backdrop-filter: blur(10px);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #ffebee;
      padding: 3rem;
      border-radius: 12px;
      text-align: center;
      max-width: 600px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 3px solid #f44336;
    `;
    
    modalContent.innerHTML = `
      <div style="color: #c62828; font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
      <h2 style="color: #c62828; margin-bottom: 1rem; font-size: 1.8rem;">Exam Session Terminated</h2>
      <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.6; font-size: 1.1rem;">
        You have exceeded the maximum number of attempts (3/3) to enter fullscreen mode.
        For exam security and integrity, your session has been terminated.
      </p>
      <div style="background: #ffcdd2; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
        <p style="color: #c62828; font-weight: bold; margin: 0;">
          🔒 All code has been cleared<br>
          📝 Exam will be auto-submitted in 5 seconds<br>
          ❌ Session cannot be resumed
        </p>
      </div>
      <div id="autoSubmitCountdown" style="color: #f44336; font-weight: bold; font-size: 1.2rem; margin-top: 1rem;">
        Auto-submitting in: 5 seconds
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Countdown timer
    let countdown = 5;
    const countdownElement = document.getElementById('autoSubmitCountdown');
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdownElement) {
        countdownElement.textContent = `Auto-submitting in: ${countdown} seconds`;
      }
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }
  
  // Function to show disabled overlay
  function showDisabledOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'disabledOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 71, 87, 0.1);
      z-index: 1000;
      pointer-events: none;
      backdrop-filter: grayscale(100%);
    `;
    
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(196, 40, 40, 0.95);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      font-weight: bold;
      font-size: 1.2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 1001;
    `;
    
    message.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 1rem;">🚫</div>
      <div>EXAM SESSION TERMINATED</div>
      <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">
        Security violation detected
      </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(message);
  }
  
  // Function to force submit exam
  function forceSubmitExam() {
    console.log('Force submitting exam due to security violation...');
    
    // Show submission message
    showSecurityAlert('Exam submitted due to security violation');
    
    // Try to submit via existing submit function if available
    if (typeof submitCode === 'function') {
      try {
        submitCode();
      } catch (error) {
        console.error('Error submitting via submitCode:', error);
        // Fallback to redirect
        redirectToExamEnd();
      }
    } else {
      // Fallback to redirect
      redirectToExamEnd();
    }
  }
  
  // Function to redirect to exam end or dashboard
  function redirectToExamEnd() {
    // Clear any remaining data
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
    
    // Show final message before redirect
    setTimeout(() => {
      const finalMessage = document.createElement('div');
      finalMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #c62828;
        color: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        font-weight: bold;
        z-index: 999999;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      `;
      
      finalMessage.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 1rem;">📝</div>
        <div>Redirecting to dashboard...</div>
      `;
      
      document.body.appendChild(finalMessage);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/user/dashboard';
      }, 2000);
    }, 1000);
  }
  
  // Function to show fullscreen prompt
  function showFullscreenPrompt() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.id = 'fullscreenModal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        backdrop-filter: blur(5px);
      `;
      
      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        ${fullscreenAttempts === maxAttempts ? 'border: 3px solid #f44336;' : ''}
      `;
      
      const warningColor = fullscreenAttempts === maxAttempts ? '#f44336' : '#333';
      const warningText = fullscreenAttempts === maxAttempts ? 
        'FINAL ATTEMPT: Exam will be terminated if fullscreen is not enabled!' : 
        'For exam security and integrity, you must enable fullscreen mode.';
      
      modalContent.innerHTML = `
        <h2 style="color: ${warningColor}; margin-bottom: 1rem;">
          ${fullscreenAttempts === maxAttempts ? '⚠️ FINAL WARNING' : '🔒 Fullscreen Required'}
        </h2>
        <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.5;">
          ${warningText}
          This prevents window switching and ensures a controlled exam environment.
        </p>
        ${fullscreenAttempts === maxAttempts ? `
          <div style="background: #ffebee; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #f44336;">
            <p style="color: #c62828; margin: 0; font-weight: bold;">
              ⚠️ If you cancel this attempt:<br>
              • Your code will be erased<br>
              • Exam will be auto-submitted<br>
              • Session cannot be resumed
            </p>
          </div>
        ` : ''}
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="enableFullscreen" style="
            background: ${fullscreenAttempts === maxAttempts ? '#4CAF50' : '#4CAF50'};
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
          ">Enable Fullscreen</button>
          <button id="cancelFullscreen" style="
            background: ${fullscreenAttempts === maxAttempts ? '#d32f2f' : '#f44336'};
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
          ">${fullscreenAttempts === maxAttempts ? 'Terminate Exam' : 'Cancel'}</button>
        </div>
        <p style="color: ${fullscreenAttempts === maxAttempts ? '#f44336' : '#999'}; margin-top: 1rem; font-size: 0.9rem; font-weight: ${fullscreenAttempts === maxAttempts ? 'bold' : 'normal'};">
          Attempt ${fullscreenAttempts}/${maxAttempts}
          ${fullscreenAttempts === maxAttempts ? ' - LAST CHANCE!' : ''}
        </p>
      `;
      
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      document.getElementById('enableFullscreen').onclick = () => {
        document.body.removeChild(modal);
        resolve(true);
      };
      
      document.getElementById('cancelFullscreen').onclick = () => {
        document.body.removeChild(modal);
        resolve(false);
      };
      
      // Prevent closing modal by clicking outside on final attempt
      if (fullscreenAttempts === maxAttempts) {
        modal.onclick = (e) => {
          e.stopPropagation();
        };
      }
    });
  }
  
  // Monitor fullscreen changes
  document.addEventListener('fullscreenchange', function() {
    if (window.examTerminated) return; // Skip if exam already terminated
    
    if (!isInFullscreen()) {
      console.log('Fullscreen exited, current attempts:', fullscreenAttempts, 'max:', maxAttempts);
      setTimeout(() => {
        if (!isInFullscreen() && !window.examTerminated) {
          if (fullscreenAttempts >= maxAttempts) {
            // Already used all attempts, terminate
            console.error('TERMINATING: Fullscreen exit after max attempts');
            showSecurityAlert('Maximum fullscreen attempts exceeded. Terminating exam...');
            handleMaxAttemptsReached();
          } else {
            // Still have attempts left
            showSecurityAlert('Fullscreen mode exited. Re-entering for exam security...');
            enforceFullscreen();
          }
        }
      }, 1000);
    } else {
      // Show fullscreen active indicator
      showFullscreenIndicator(true);
    }
  });
  
  // Also monitor for other vendor prefixes
  document.addEventListener('mozfullscreenchange', function() {
    if (window.examTerminated) return;
    
    if (!isInFullscreen()) {
      setTimeout(() => {
        if (!isInFullscreen() && !window.examTerminated) {
          if (fullscreenAttempts >= maxAttempts) {
            console.error('TERMINATING: Mozilla fullscreen exit after max attempts');
            showSecurityAlert('Maximum fullscreen attempts exceeded. Terminating exam...');
            handleMaxAttemptsReached();
          } else {
            showSecurityAlert('Fullscreen mode exited. Re-entering for exam security...');
            enforceFullscreen();
          }
        }
      }, 1000);
    } else {
      showFullscreenIndicator(true);
    }
  });
  
  document.addEventListener('webkitfullscreenchange', function() {
    if (window.examTerminated) return;
    
    if (!isInFullscreen()) {
      setTimeout(() => {
        if (!isInFullscreen() && !window.examTerminated) {
          if (fullscreenAttempts >= maxAttempts) {
            console.error('TERMINATING: Webkit fullscreen exit after max attempts');
            showSecurityAlert('Maximum fullscreen attempts exceeded. Terminating exam...');
            handleMaxAttemptsReached();
          } else {
            showSecurityAlert('Fullscreen mode exited. Re-entering for exam security...');
            enforceFullscreen();
          }
        }
      }, 1000);
    } else {
      showFullscreenIndicator(true);
    }
  });
  
  // Function to show/hide fullscreen indicator
  function showFullscreenIndicator(show) {
    let indicator = document.getElementById('fullscreenIndicator');
    
    if (show && !indicator) {
      indicator = document.createElement('div');
      indicator.id = 'fullscreenIndicator';
      indicator.className = 'fullscreen-indicator active';
      indicator.innerHTML = '📺 Fullscreen Active';
      document.body.appendChild(indicator);
      
      // Hide after 3 seconds
      setTimeout(() => {
        if (indicator && indicator.parentNode) {
          indicator.style.opacity = '0';
          setTimeout(() => {
            if (indicator && indicator.parentNode) {
              indicator.parentNode.removeChild(indicator);
            }
          }, 300);
        }
      }, 3000);
    }
  }
  
  // Initial fullscreen enforcement after a short delay
  setTimeout(() => {
    if (!isInFullscreen()) {
      enforceFullscreen();
    }
  }, 2000);
  
  console.log('Fullscreen mode initialized successfully');
}

// Show security alert function
function showSecurityAlert(message) {
  // Create a temporary notification
  const notification = document.createElement('div');
  notification.className = 'security-alert';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4757;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 9999;
    font-weight: bold;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
  
  // Log security violation
  console.warn('Security violation detected:', message);
}

// Load data from script tag
function loadExamData() {
  try {
    const dataScript = document.getElementById('exam-data');
    if (dataScript) {
      const data = JSON.parse(dataScript.textContent);
      window.examData = data;
      examData = data;
      timeRemaining = data.initialTimeRemaining || 2732;
      console.log('Exam data loaded successfully:', data);
      console.log('Number of questions:', data.exam?.questions?.length || 0);
      if (data.exam?.questions?.length > 0) {
        console.log('First question:', data.exam.questions[0]);
        console.log('First question test cases:', data.exam.questions[0].testCases?.length || 0);
        console.log('First question constraints:', data.exam.questions[0].constraints?.length || 0);
      }
    } else {
      console.warn('No exam-data script tag found');
    }
  } catch (error) {
    console.error('Error loading exam data:', error);
    // Set fallback data
    window.examData = {
      exam: null,
      currentQuestionIndex: 0,
      isExamMode: false
    };
    examData = window.examData;
  }
}

// Timer functionality
function updateTimer() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  const timerElements = document.querySelectorAll('.timer, #examTimer');
  timerElements.forEach(el => el.textContent = formattedTime);
  
  // Change color when time is running out
  if (timeRemaining <= 300) { // 5 minutes
    timerElements.forEach(el => el.style.color = '#ff4757');
  } else if (timeRemaining <= 600) { // 10 minutes
    timerElements.forEach(el => el.style.color = '#ffa726');
  }
  
  if (timeRemaining > 0) {
    timeRemaining--;
  } else if (window.examData && window.examData.isExamMode) {
    // Auto-submit when time runs out in exam mode
    alert('Time is up! Your exam will be submitted automatically.');
    submitCode();
  }
}

setInterval(updateTimer, 1000);

// Code editor line numbers
const editor = document.querySelector('.code-editor');
const lineNumbers = document.querySelector('.line-numbers');

function updateLineNumbers() {
  if (!editor || !lineNumbers) return;
  
  const lines = editor.value.split('\n');
  const lineCount = lines.length;
  
  lineNumbers.innerHTML = '';
  for (let i = 1; i <= Math.max(lineCount, 15); i++) {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'line-number';
    lineDiv.textContent = i;
    lineNumbers.appendChild(lineDiv);
  }
}

if (editor) {
  editor.addEventListener('input', updateLineNumbers);
  editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 4;
    }
  });
}

// Resizable slider functionality
let isResizing = false;
const resizer = document.getElementById('resizer');
const problemSection = document.getElementById('problemSection');
const codeSection = document.getElementById('codeSection');

if (resizer) {
  resizer.addEventListener('mousedown', function(e) {
    isResizing = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
  });
}

function handleMouseMove(e) {
  if (!isResizing) return;
  
  const container = document.querySelector('.ide-content');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  const mouseX = e.clientX - containerRect.left;
  const containerWidth = containerRect.width;
  const percentage = (mouseX / containerWidth) * 100;
  
  if (percentage >= 20 && percentage <= 80) {
    if (problemSection) problemSection.style.width = percentage + '%';
    if (codeSection) codeSection.style.width = (100 - percentage) + '%';
  }
}

function stopResize() {
  isResizing = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResize);
}

// Tab switching functionality
let activeTab = 'console';

function switchTab(tabName) {
  // Remove active class from all tabs and content
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // Add active class to selected tab and content
  if (event && event.target) event.target.classList.add('active');
  const tabContent = document.getElementById(tabName + 'Tab');
  if (tabContent) tabContent.classList.add('active');
  
  activeTab = tabName;
}

// Question navigation - Enhanced for exam mode
let currentQuestion = 1; // Starting at question 1
let totalQuestions = 5;

// Initialize question data from exam if available
if (window.examData && window.examData.exam && window.examData.exam.questions) {
  totalQuestions = window.examData.exam.questions.length;
}

function nextQuestion() {
  if (currentQuestion < totalQuestions) {
    currentQuestion++;
    updateQuestionDisplay();
    loadQuestionData();
  }
}

function previousQuestion() {
  if (currentQuestion > 1) {
    currentQuestion--;
    updateQuestionDisplay();
    loadQuestionData();
  }
}

function goToQuestion(questionNum) {
  if (questionNum >= 1 && questionNum <= totalQuestions) {
    currentQuestion = questionNum;
    updateQuestionDisplay();
    loadQuestionData();
  }
}

function updateQuestionDisplay() {
  // Update current question number
  const currentQuestionElement = document.getElementById('currentQuestionNum');
  if (currentQuestionElement) {
    currentQuestionElement.textContent = currentQuestion;
  }

  // Update total questions
  const totalQuestionsElement = document.getElementById('totalQuestions');
  if (totalQuestionsElement) {
    totalQuestionsElement.textContent = totalQuestions;
  }

  // Update progress bar
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    const progress = (currentQuestion / totalQuestions) * 100;
    progressFill.style.width = Math.round(progress) + '%';
  }

  // Update button states
  const buttons = document.querySelectorAll('.question-buttons .question-btn');
  if (buttons.length >= 2) {
    buttons[0].disabled = currentQuestion === 1;
    buttons[1].disabled = currentQuestion === totalQuestions;
  }
}

function loadQuestionData() {
  console.log('loadQuestionData called, currentQuestion:', currentQuestion);
  
  if (!window.examData || !window.examData.exam || !window.examData.exam.questions) {
    console.warn('No exam data available in loadQuestionData');
    return; // No exam data available
  }
  
  const questionIndex = currentQuestion - 1;
  const question = window.examData.exam.questions[questionIndex];
  
  console.log('Loading question data for index:', questionIndex, 'question:', question);
  
  if (!question) {
    console.warn('No question found at index:', questionIndex);
    return;
  }
  
  // Update problem title
  const titleElement = document.getElementById('problemTitle');
  if (titleElement) {
    titleElement.textContent = question.title || `Question ${currentQuestion}`;
  }
  
  // Update problem points
  const pointsElement = document.getElementById('problemPoints');
  if (pointsElement) {
    pointsElement.textContent = `${question.points || 25} Points`;
  }
  
  // Update problem description
  const descElement = document.getElementById('problemDescription');
  if (descElement) {
    descElement.innerHTML = question.description || 'No description available.';
  }
  
  // Update examples
  const examplesElement = document.getElementById('problemExamples');
  if (examplesElement && question.examples) {
    let examplesHtml = '<h3 class="section-subtitle">Examples</h3>';
    question.examples.forEach((example, index) => {
      examplesHtml += `
        <div class="example-item">
          <h4 class="example-title">Example ${index + 1}:</h4>
          <div class="code-block">
            <strong>Input:</strong> ${example.input}<br>
            <strong>Output:</strong> ${example.output}${example.explanation ? '<br><strong>Explanation:</strong> ' + example.explanation : ''}
          </div>
        </div>
      `;
    });
    examplesElement.innerHTML = examplesHtml;
  }
  
  // Update constraints
  const constraintsElement = document.getElementById('problemConstraints');
  
  if (constraintsElement) {
    if (question.constraints) {
      let constraintsHtml = '<h3 class="section-subtitle">Constraints</h3><ul>';
      
      let constraintsArray = [];
      
      if (Array.isArray(question.constraints)) {
        // Constraints from sample data (already an array)
        constraintsArray = question.constraints;
      } else if (typeof question.constraints === 'string') {
        // Constraints from database (stored as string)
        try {
          // Try to parse as JSON first (in case it's stored as JSON string)
          constraintsArray = JSON.parse(question.constraints);
          if (!Array.isArray(constraintsArray)) {
            // If it's not an array after parsing, split by newlines or other delimiters
            constraintsArray = [question.constraints];
          }
        } catch (e) {
          // If JSON parsing fails, split by common delimiters
          if (question.constraints.includes('\n')) {
            constraintsArray = question.constraints.split('\n').filter(c => c.trim());
          } else if (question.constraints.includes('•')) {
            constraintsArray = question.constraints.split('•').filter(c => c.trim());
          } else if (question.constraints.includes('-')) {
            constraintsArray = question.constraints.split('-').filter(c => c.trim());
          } else {
            // Treat as single constraint
            constraintsArray = [question.constraints];
          }
        }
      } else {
        // Fallback for other data types
        constraintsArray = [String(question.constraints)];
      }
      
      constraintsArray.forEach(constraint => {
        // Clean up the constraint text
        const cleanConstraint = constraint.trim().replace(/^[-•*]\s*/, ''); // Remove leading bullets
        if (cleanConstraint) {
          constraintsHtml += `<li>${cleanConstraint}</li>`;
        }
      });
      
      constraintsHtml += '</ul>';
      constraintsElement.innerHTML = constraintsHtml;
    } else {
      constraintsElement.innerHTML = `
        <h3 class="section-subtitle">Constraints</h3>
        <ul>
          <li>Standard problem constraints apply</li>
          <li>Optimize for time and space complexity</li>
        </ul>
      `;
    }
  }
  
  // Update test cases
  loadTestCases();
  
  // Load saved code for this question if available
  loadSavedCodeForQuestion();
}

// Collapsible functionality
let isCollapsed = false;

function toggleCollapse() {
  const tabbedSection = document.querySelector('.tabbed-section');
  if (!tabbedSection) return;
  
  isCollapsed = !isCollapsed;
  if (isCollapsed) {
    tabbedSection.classList.add('collapsed');
  } else {
    tabbedSection.classList.remove('collapsed');
  }
}

// IDE functionality functions
function saveCode() {
  const codeEditor = document.querySelector('.code-editor');
  if (!codeEditor) return;
  
  const code = codeEditor.value;
  localStorage.setItem('savedCode', code);
  showNotification('Code saved successfully!');
}

async function runCode() {
  const consoleOutput = document.querySelector('.console-output');
  const codeEditor = document.querySelector('.code-editor');
  const inputEditor = document.querySelector('.input-editor');
  const languageSelect = document.querySelector('.language-select') || document.getElementById('language-select');
  
  if (!consoleOutput || !codeEditor) return;
  
  const sourceCode = codeEditor.value;
  const inputData = inputEditor ? inputEditor.value.trim() : '';
  const selectedLanguage = languageSelect ? languageSelect.value : 'javascript';
  
  // Language ID mapping for Judge0 API
  const languageMap = {
    'javascript': 63,
    'python': 71,
    'java': 62,
    'cpp': 54,
    'csharp': 51,
    '63': 63,
    '71': 71,
    '62': 62,
    '54': 54,
    '51': 51
  };
  
  if (!sourceCode.trim()) {
    consoleOutput.innerHTML = '<div class="console-line error">Error: No code to execute</div><div class="console-cursor">&gt;</div>';
    switchTab('console');
    return;
  }
  
  consoleOutput.innerHTML = '<div class="console-line">Running code...</div>';
  switchTab('console');
  
  try {
    const response = await fetch('/api/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageMap[selectedLanguage] || 63,
        stdin: inputData
      })
    });
    
    const result = await response.json();
    
    if (result.success || result.stdout || result.stderr) {
      let output = '';
      
      const data = result.data || result;
      
      if (data.stdout) {
        output += `<div class="console-line success">Output:</div>`;
        output += `<div class="console-line">${data.stdout}</div>`;
      }
      
      if (data.stderr) {
        output += `<div class="console-line error">Error:</div>`;
        output += `<div class="console-line error">${data.stderr}</div>`;
      }
      
      if (data.compile_output) {
        output += `<div class="console-line warning">Compilation Output:</div>`;
        output += `<div class="console-line warning">${data.compile_output}</div>`;
      }
      
      if (!data.stdout && !data.stderr && !data.compile_output) {
        output += `<div class="console-line">Code executed successfully (no output)</div>`;
      }
      
      output += `<div class="console-line">Execution time: ${data.time || '0'}s</div>`;
      output += `<div class="console-line">Memory used: ${data.memory || '0'}KB</div>`;
      
      consoleOutput.innerHTML = output + '<div class="console-cursor">&gt;</div>';
    } else {
      consoleOutput.innerHTML = `<div class="console-line error">Error: ${result.error || 'Unknown error occurred'}</div><div class="console-cursor">&gt;</div>`;
    }
  } catch (error) {
    console.error('Error running code:', error);
    consoleOutput.innerHTML = `<div class="console-line error">Error: Failed to execute code. Please try again.</div><div class="console-cursor">&gt;</div>`;
  }
}

function submitCode() {
  if (confirm('Are you sure you want to submit your code? This action cannot be undone.')) {
    showNotification('Code submitted successfully!');
    // Mark current question as completed
    const currentBox = document.querySelector('.question-box.current');
    if (currentBox) {
      currentBox.classList.remove('current');
      currentBox.classList.add('completed');
      const icon = currentBox.querySelector('.question-icon');
      if (icon) icon.textContent = '✓';
    }
  }
}

function resetCode() {
  const codeEditor = document.querySelector('.code-editor');
  if (!codeEditor) return;
  
  if (confirm('Are you sure you want to reset your code? All changes will be lost.')) {
    codeEditor.value = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your solution here
    
};

// Test cases
console.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]
console.log(twoSum([3,2,4], 6));     // Expected: [1,2]`;
    updateLineNumbers();
  }
}

function formatCode() {
  const codeEditor = document.querySelector('.code-editor');
  if (!codeEditor) return;
  
  let code = codeEditor.value;
  
  // Simple formatting - add proper indentation
  const lines = code.split('\n');
  let indentLevel = 0;
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    
    if (trimmed.includes('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    const formatted = '    '.repeat(indentLevel) + trimmed;
    
    if (trimmed.includes('{')) {
      indentLevel++;
    }
    
    return formatted;
  });
  
  codeEditor.value = formattedLines.join('\n');
  updateLineNumbers();
}

async function runTests() {
  const testCases = document.querySelectorAll('.test-case');
  const codeEditor = document.querySelector('.code-editor');
  const languageSelect = document.querySelector('.language-select') || document.getElementById('language-select');
  
  if (!codeEditor || testCases.length === 0) {
    console.log('No code editor or test cases found');
    return;
  }
  
  const sourceCode = codeEditor.value;
  const selectedLanguage = languageSelect ? languageSelect.value : 'javascript';
  
  // Language ID mapping for Judge0 API
  const languageMap = {
    'javascript': 63,
    'python': 71,
    'java': 62,
    'cpp': 54,
    'csharp': 51,
    '63': 63,
    '71': 71,
    '62': 62,
    '54': 54,
    '51': 51
  };
  
  if (!sourceCode.trim()) {
    console.log('No source code provided');
    testCases.forEach(testCase => {
      const status = testCase.querySelector('.test-status');
      if (status) {
        status.textContent = 'Failed';
        status.className = 'test-status failed';
      }
    });
    switchTab('tests');
    return;
  }
  
  switchTab('tests');
  
  // Get test cases data from exam
  let testData = [];
  
  if (window.examData && window.examData.exam && window.examData.exam.questions) {
    const questionIndex = currentQuestion - 1;
    const question = window.examData.exam.questions[questionIndex];
    
    if (question && question.testCases && question.testCases.length > 0) {
      testData = question.testCases.map(testCase => ({
        input: testCase.input || '',
        expected_output: testCase.expectedOutput || '',
        stdin: testCase.input || ''
      }));
      console.log(`Running ${testData.length} test cases from database`);
    }
  }
  
  if (testData.length === 0) {
    console.log('No test cases available from database');
    testCases.forEach(testCase => {
      const status = testCase.querySelector('.test-status');
      if (status) {
        status.textContent = 'No Tests';
        status.className = 'test-status failed';
      }
    });
    return;
  }

  // Use the enhanced API endpoint for multiple test cases
  try {
    console.log('Sending test cases to Judge0:', testData);
    
    const response = await fetch('/api/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageMap[selectedLanguage] || 63,
        test_cases: testData
      })
    });
    
    const result = await response.json();
    console.log('Judge0 API response:', result);
    
    if (result.success && result.test_results) {
      // Store test results for AI grading
      window.lastTestResults = result.test_results;
      
      // Update each test case with results
      result.test_results.forEach((testResult, index) => {
        if (index < testCases.length) {
          const testCase = testCases[index];
          const status = testCase.querySelector('.test-status');
          const actualOutputDiv = testCase.querySelector('.test-actual');
          const actualOutputPre = actualOutputDiv ? actualOutputDiv.querySelector('.test-content') : null;
          
          if (status) {
            status.textContent = testResult.passed ? 'Passed' : 'Failed';
            status.className = testResult.passed ? 'test-status passed' : 'test-status failed';
          }
          
          // Show actual output
          if (actualOutputDiv && actualOutputPre) {
            actualOutputDiv.style.display = 'block';
            actualOutputPre.textContent = testResult.actual_output || '(no output)';
          }
          
          if (!testResult.passed) {
            console.log(`Test case ${index + 1} failed:`);
            console.log('Expected:', testResult.expected_output);
            console.log('Actual:', testResult.actual_output);
          }
        }
      });
      
      // Show summary
      if (result.summary) {
        console.log(`Test Summary: ${result.summary.passed_tests}/${result.summary.total_tests} passed (${result.summary.pass_rate}%)`);
        
        // Enable AI grading button if we have results
        const aiGradeBtn = document.getElementById('aiGradeBtn');
        if (aiGradeBtn) {
          aiGradeBtn.disabled = false;
          aiGradeBtn.textContent = 'Get AI Feedback';
        }
      }
    } else {
      console.error('Failed to execute test cases:', result.error);
      testCases.forEach(testCase => {
        const status = testCase.querySelector('.test-status');
        if (status) {
          status.textContent = 'Error';
          status.className = 'test-status failed';
        }
      });
    }
  } catch (error) {
    console.error('Network error running tests:', error);
    testCases.forEach(testCase => {
      const status = testCase.querySelector('.test-status');
      if (status) {
        status.textContent = 'Error';
        status.className = 'test-status failed';
      }
    });
  }
}

// AI Code Grading Function
async function getAIFeedback() {
  const codeEditor = document.querySelector('.code-editor');
  const languageSelect = document.querySelector('.language-select') || document.getElementById('language-select');
  
  if (!codeEditor || !codeEditor.value.trim()) {
    showNotification('Please write some code before requesting AI feedback.');
    return;
  }
  
  const sourceCode = codeEditor.value;
  const selectedLanguage = languageSelect ? languageSelect.value : 'javascript';
  
  // Get current question data
  let questionData = {};
  if (window.examData && window.examData.exam && window.examData.exam.questions) {
    const questionIndex = currentQuestion - 1;
    const question = window.examData.exam.questions[questionIndex];
    if (question) {
      questionData = {
        title: question.title || 'Coding Problem',
        statement: question.statement || question.description || 'No description provided',
        constraints: question.constraints || 'No constraints specified'
      };
    }
  }
  
  const aiGradeBtn = document.getElementById('aiGradeBtn');
  const originalText = aiGradeBtn ? aiGradeBtn.textContent : '';
  
  try {
    if (aiGradeBtn) {
      aiGradeBtn.textContent = 'Getting AI Feedback...';
      aiGradeBtn.disabled = true;
    }
    
    showNotification('Requesting AI feedback on your code...');
    
    const response = await fetch('/api/v1/grade-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language: selectedLanguage,
        problem_title: questionData.title,
        problem_statement: questionData.statement,
        constraints: questionData.constraints,
        test_results: window.lastTestResults || []
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('AI Grading Response:', result);
    
    if (result.success && result.aiGrading) {
      displayAIGrading(result.aiGrading);
      showNotification('AI feedback received!');
    } else {
      console.error('AI Grading failed:', result);
      showNotification('Failed to get AI feedback: ' + (result.error || 'Unknown error'));
    }
    
  } catch (error) {
    console.error('AI grading error:', error);
    showNotification('Error getting AI feedback. Please try again.');
  } finally {
    if (aiGradeBtn) {
      aiGradeBtn.textContent = originalText || 'Get AI Feedback';
      aiGradeBtn.disabled = false;
    }
  }
}

// Display AI Grading Results
function displayAIGrading(grading) {
  // Create or update AI feedback section
  let feedbackSection = document.getElementById('aiFeedbackSection');
  
  if (!feedbackSection) {
    feedbackSection = document.createElement('div');
    feedbackSection.id = 'aiFeedbackSection';
    feedbackSection.className = 'ai-feedback-section';
    
    // Insert after test cases or in the results area
    const testCasesContainer = document.getElementById('testCasesContainer');
    if (testCasesContainer && testCasesContainer.parentNode) {
      testCasesContainer.parentNode.insertBefore(feedbackSection, testCasesContainer.nextSibling);
    } else {
      document.querySelector('.tabbed-section').appendChild(feedbackSection);
    }
  }
  
  // Handle both old format (grading.grade) and new format (grading.data)
  const gradingData = grading.data || grading;
  const overallScore = gradingData.overallScore || grading.score || 0;
  const categoryScores = gradingData.categoryScores || {};
  const feedback = gradingData.feedback || [];
  const summary = gradingData.summary || grading.overallFeedback || 'Analysis completed';
  const suggestions = gradingData.suggestions || grading.improvements || [];
  const gradingMethod = gradingData.gradingMethod || 'AI Analysis';
  const note = gradingData.note || '';
  
  const gradeColor = getGradeColorFromScore(overallScore);
  const letterGrade = getLetterGrade(overallScore);
  
  feedbackSection.innerHTML = `
    <div class="ai-feedback-header">
      <h3>🤖 AI Code Feedback</h3>
      <div class="ai-grade-badge" style="background-color: ${gradeColor}">
  Score: ${overallScore}/10 (${letterGrade})
      </div>
      ${note ? `<div class="grading-method">${note}</div>` : ''}
    </div>
    
    <div class="ai-feedback-content">
      <div class="feedback-section">
        <h4>📋 Overall Assessment</h4>
        <p>${summary}</p>
      </div>
      
      <div class="feedback-grid">
        <div class="feedback-item">
          <h5>✅ Correctness (${categoryScores.correctness || 0}/10)</h5>
          <div class="score-bar">
            <div class="score-fill" style="width: ${(categoryScores.correctness || 0) / 10 * 100}%"></div>
          </div>
        </div>
        
        <div class="feedback-item">
          <h5>🎨 Code Quality (${categoryScores.codeQuality || 0}/10)</h5>
          <div class="score-bar">
            <div class="score-fill" style="width: ${(categoryScores.codeQuality || 0) / 10 * 100}%"></div>
          </div>
        </div>
        
        <div class="feedback-item">
          <h5>⚡ Efficiency (${categoryScores.efficiency || 0}/10)</h5>
          <div class="score-bar">
            <div class="score-fill" style="width: ${(categoryScores.efficiency || 0) / 10 * 100}%"></div>
          </div>
        </div>
        
        <div class="feedback-item">
          <h5>📖 Best Practices (${categoryScores.bestPractices || 0}/10)</h5>
          <div class="score-bar">
            <div class="score-fill" style="width: ${(categoryScores.bestPractices || 0) / 10 * 100}%"></div>
          </div>
        </div>
      </div>
      
      ${feedback && feedback.length > 0 ? `
        <div class="feedback-section">
          <h4>📝 Detailed Feedback</h4>
          <ul>
            ${feedback.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${suggestions && suggestions.length > 0 ? `
        <div class="feedback-section">
          <h4>� Suggestions for Improvement</h4>
          <ul>
            ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <div class="feedback-section">
        <small style="color: #666; font-style: italic;">
          Powered by ${gradingMethod} • Feedback generated in real-time
        </small>
      </div>
    </div>
  `;
  
  // Scroll to feedback section
  feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Helper function to get grade colors from score
function getGradeColorFromScore(score) {
  if (score >= 90) return '#4CAF50';
  if (score >= 80) return '#8BC34A';
  if (score >= 70) return '#FFC107';
  if (score >= 60) return '#FF9800';
  return '#F44336';
}

// Helper function to get letter grade from score
function getLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Helper function to get grade colors
function getGradeColor(grade) {
  switch(grade) {
    case 'A': return '#4CAF50';
    case 'B': return '#8BC34A';
    case 'C': return '#FFC107';
    case 'D': return '#FF9800';
    case 'F': return '#F44336';
    default: return '#9E9E9E';
  }
}

function clearConsole() {
  const consoleOutput = document.querySelector('.console-output');
  if (consoleOutput) {
    consoleOutput.innerHTML = '<div class="console-line">Console cleared</div><div class="console-cursor">&gt;</div>';
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Enhanced DOM ready initialization
document.addEventListener('DOMContentLoaded', function() {
  // Initialize copy-paste prevention first
  initializeCopyPastePrevention();
  
  // Initialize fullscreen mode
  initializeFullscreenMode();
  
  // Hide security banner after 5 seconds
  setTimeout(function() {
    const securityBanner = document.getElementById('securityBanner');
    if (securityBanner) {
      securityBanner.style.transition = 'opacity 0.5s ease';
      securityBanner.style.opacity = '0';
      setTimeout(() => {
        securityBanner.style.display = 'none';
      }, 500);
    }
  }, 5000);
  
  // Console warning message
  console.clear();
  console.log('%c🔒 SECURE EXAM MODE ACTIVATED', 'color: #ff4757; font-size: 20px; font-weight: bold;');
  console.log('%cCopy/Paste operations and developer tools are disabled during this exam.', 'color: #333; font-size: 14px;');
  console.log('%cAny attempt to bypass security measures will be logged.', 'color: #333; font-size: 14px;');
  console.log('%c⚠️ This exam session is being monitored for integrity.', 'color: #ff6b00; font-size: 14px; font-weight: bold;');
  console.log('%c📺 Fullscreen mode is enforced for exam security.', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
  
  // Initialize exam mode if exam data is available
  if (window.examData) {
    console.log('Exam mode initialized with data:', window.examData);
    
    // Set up exam timer if available
    if (window.examData.exam && window.examData.exam.duration) {
      setupExamTimer();
    }
    
    // Load first question data
    loadQuestionData();
  }
  
  // Initialize test cases display
  loadTestCases();
  
  // Initialize code editor functionality
  updateLineNumbers();
  
  // Add auto-save for code changes
  const codeEditor = document.querySelector('.code-editor');
  if (codeEditor) {
    codeEditor.addEventListener('input', autoSaveCode);
  }
  
  // Add language change listener for auto-save
  const languageSelect = document.querySelector('.language-select') || document.getElementById('language-select');
  if (languageSelect) {
    languageSelect.addEventListener('change', function() {
      autoSaveCode();
    });
  }
  
  // Initialize question navigation
  updateQuestionDisplay();
  
  // Add submit button functionality
  addSubmitButton();
  
  // Basic IDE integration for Judge0 API (backwards compatibility)
  const runBtn = document.querySelector('.run-btn');
  const codeInput = document.querySelector('.code-editor');
  const langSelect = document.getElementById('language-select');
  const consoleOutput = document.querySelector('.console-output');

  if (runBtn) {
    runBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      runCode(); // Use the enhanced runCode function
    });
  }

  // Load saved code on page load (fallback for non-exam mode)
  if (!window.examData) {
    const savedCode = localStorage.getItem('savedCode');
    if (savedCode && codeInput) {
      codeInput.value = savedCode;
      updateLineNumbers();
    }
  }
});

// Exam timer functionality
function setupExamTimer() {
  if (!window.examData || !window.examData.exam || !window.examData.exam.duration) return;
  
  const duration = window.examData.exam.duration; // Duration in minutes
  const startTime = window.examData.startTime ? new Date(window.examData.startTime) : new Date();
  const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));
  
  function updateTimer() {
    const now = new Date();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) {
      // Time's up - auto-submit exam
      autoSubmitExam();
      return;
    }
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const timerDisplay = document.querySelector('.timer') || document.getElementById('timer');
    if (timerDisplay) {
      timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Add warning styles when time is running low
      if (timeLeft < 5 * 60 * 1000) { // Less than 5 minutes
        timerDisplay.classList.add('timer-warning');
      }
    }
  }
  
  // Update timer every second
  updateTimer();
  setInterval(updateTimer, 1000);
}

// Exam submission functionality
async function submitExam() {
  if (!window.examData) {
    alert('No exam data available for submission.');
    return;
  }
  
  if (!confirm('Are you sure you want to submit your exam? This action cannot be undone.')) {
    return;
  }
  
  try {
    // Collect all saved code for each question
    const examId = window.examData.exam._id;
    const answers = [];
    
    for (let i = 1; i <= totalQuestions; i++) {
      const key = `exam_${examId}_question_${i}`;
      try {
        const savedData = localStorage.getItem(key);
        if (savedData) {
          const codeData = JSON.parse(savedData);
          answers.push({
            questionIndex: i - 1,
            code: codeData.code || '',
            language: codeData.language || 'python',
            timestamp: codeData.timestamp
          });
        } else {
          answers.push({
            questionIndex: i - 1,
            code: '',
            language: 'python',
            timestamp: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn(`Could not retrieve answer for question ${i}:`, e);
        answers.push({
          questionIndex: i - 1,
          code: '',
          language: 'python',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    const submissionData = {
      examId: examId,
      answers: answers,
      submittedAt: new Date().toISOString(),
      timeTaken: calculateTimeTaken()
    };
    
    // Submit to server
    const response = await fetch('/exams/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Clear saved code from localStorage
      for (let i = 1; i <= totalQuestions; i++) {
        const key = `exam_${examId}_question_${i}`;
        localStorage.removeItem(key);
      }
      
      alert('Exam submitted successfully!');
      window.location.href = '/user/dashboard';
    } else {
      alert('Failed to submit exam: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error submitting exam:', error);
    alert('Failed to submit exam. Please try again.');
  }
}

function calculateTimeTaken() {
  if (!window.examData || !window.examData.startTime) {
    return 0;
  }
  
  const startTime = new Date(window.examData.startTime);
  const now = new Date();
  return Math.round((now - startTime) / 1000 / 60); // Time taken in minutes
}

// Add submit button functionality
function addSubmitButton() {
  const submitBtn = document.querySelector('.submit-exam-btn') || document.getElementById('submit-exam');
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      submitExam();
    });
  }
}

// Enhanced test cases loading function
function loadTestCases() {
  console.log('loadTestCases called, currentQuestion:', currentQuestion);
  
  const testCasesContainer = document.getElementById('testCasesContainer');
  console.log('Test cases container found:', !!testCasesContainer);
  
  if (!testCasesContainer) {
    console.error('testCasesContainer not found');
    return;
  }

  let testCases = [];
  
  // Get test cases from exam data if available
  if (window.examData && window.examData.exam && window.examData.exam.questions) {
    const questionIndex = currentQuestion - 1;
    const question = window.examData.exam.questions[questionIndex];
    
    console.log('Question for test cases:', question);
    console.log('Question test cases:', question?.testCases);
    
    if (question && question.testCases && question.testCases.length > 0) {
      testCases = question.testCases;
      console.log(`Successfully loaded ${testCases.length} test cases for question ${currentQuestion}`);
    } else {
      console.warn('No test cases found for question', currentQuestion);
    }
  } else {
    console.warn('No exam data available for test cases');
  }
  
  // If no test cases from database, show a message
  if (testCases.length === 0) {
    console.log('Displaying no test cases message');
    testCasesContainer.innerHTML = `
      <div class="no-test-cases">
        <p>No test cases available for this question.</p>
        <p>Please contact your instructor if this is unexpected.</p>
      </div>
    `;
    return;
  }

  let testCasesHTML = '';
  testCases.forEach((testCase, index) => {
    testCasesHTML += `
      <div class="test-case" data-test-index="${index}">
        <div class="test-header">
          <span class="test-name">Test Case ${index + 1}</span>
          <span class="test-status pending">Pending</span>
        </div>
        <div class="test-details">
          <div class="test-input">
            <p><strong>Input:</strong></p>
            <pre class="test-content">${escapeHtml(testCase.input || 'No input provided')}</pre>
          </div>
          <div class="test-expected">
            <p><strong>Expected Output:</strong></p>
            <pre class="test-content">${escapeHtml(testCase.expectedOutput || 'No expected output provided')}</pre>
          </div>
          <div class="test-actual" style="display: none;">
            <p><strong>Actual Output:</strong></p>
            <pre class="test-content"></pre>
          </div>
        </div>
      </div>
    `;
  });

  testCasesContainer.innerHTML = testCasesHTML;
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize the IDE when the page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('IDE initializing...');
  
  // Load exam data from JSON script tag
  loadExamData();
  
  // Initialize exam data
  if (window.examData) {
    console.log('Exam data loaded:', window.examData);
    
    // Load the first question if available
    if (window.examData.exam && window.examData.exam.questions && window.examData.exam.questions.length > 0) {
      console.log('Loading first question...');
      currentQuestion = 1; // Set to first question
      loadQuestionData(); // Load question content, constraints, and test cases
      
      // Test if constraints and test cases are properly loaded
      setTimeout(() => {
        console.log('=== IDE Integration Test ===');
        
        // Check if constraints are loaded
        const constraintsElement = document.getElementById('problemConstraints');
        if (constraintsElement && constraintsElement.innerHTML.includes('Constraints')) {
          console.log('✅ Constraints loaded successfully');
        } else {
          console.log('❌ Constraints not loaded');
        }
        
        // Check if test cases are loaded
        const testCasesContainer = document.getElementById('testCasesContainer');
        const testCases = testCasesContainer ? testCasesContainer.querySelectorAll('.test-case') : [];
        if (testCases.length > 0) {
          console.log(`✅ ${testCases.length} test cases loaded successfully`);
          
          // Check first test case content
          const firstTestCase = testCases[0];
          const inputContent = firstTestCase.querySelector('.test-input .test-content');
          const expectedContent = firstTestCase.querySelector('.test-expected .test-content');
          
          if (inputContent && expectedContent) {
            console.log('✅ Test case structure is correct');
            console.log('First test case input:', inputContent.textContent);
            console.log('First test case expected output:', expectedContent.textContent);
          } else {
            console.log('❌ Test case structure is incorrect');
          }
        } else {
          console.log('❌ No test cases found in container');
        }
        
        console.log('=== End Integration Test ===');
      }, 500);
    } else {
      console.log('No questions available in exam data');
    }
  } else {
    console.log('No exam data available');
  }
  
  // Initialize line numbers
  updateLineNumbers();
  
  // Initialize progress display
  updateQuestionDisplay();
  
  console.log('IDE initialization complete');
});
