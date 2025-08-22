// IDE JavaScript Functions

// Timer functionality
let timeRemaining = 45 * 60 + 32; // 45:32 in seconds

function updateTimer() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  const timerElements = document.querySelectorAll('.timer');
  timerElements.forEach(el => el.textContent = formattedTime);
  
  if (timeRemaining > 0) {
    timeRemaining--;
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

// Question navigation
let currentQuestion = 2; // Starting at question 2 as shown in the design
const totalQuestions = 5;

function nextQuestion() {
  if (currentQuestion < totalQuestions) {
    currentQuestion++;
    updateQuestionDisplay();
  }
}

function previousQuestion() {
  if (currentQuestion > 1) {
    currentQuestion--;
    updateQuestionDisplay();
  }
}

function goToQuestion(questionNum) {
  currentQuestion = questionNum;
  updateQuestionDisplay();
}

function updateQuestionDisplay() {
  // Update current question text
  const currentQuestionElement = document.querySelector('.current-question');
  if (currentQuestionElement) {
    currentQuestionElement.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
  }

  // Update progress bar
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    const progress = (currentQuestion / totalQuestions) * 100;
    progressFill.style.width = progress + '%';
  }

  // Update button states
  const buttons = document.querySelectorAll('.question-buttons .question-btn');
  if (buttons.length >= 2) {
    buttons[0].disabled = currentQuestion === 1;
    buttons[1].disabled = currentQuestion === totalQuestions;
  }
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
  const languageSelect = document.querySelector('.language-select') || document.getElementById('language-select');
  
  if (!consoleOutput || !codeEditor) return;
  
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
        stdin: ''
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
  
  if (!codeEditor || testCases.length === 0) return;
  
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
  
  // Test cases data
  const testData = [
    { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]', stdin: '' },
    { input: 'nums = [3,2,4], target = 6', expected: '[1,2]', stdin: '' }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const status = testCase.querySelector('.test-status');
    const outputElement = testCase.querySelector('.test-details p:last-child');
    
    if (status) {
      status.textContent = 'Running...';
      status.className = 'test-status running';
    }
    
    try {
      const response = await fetch('/api/v1/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: languageMap[selectedLanguage] || 63,
          stdin: testData[i] ? testData[i].stdin : ''
        })
      });
      
      const result = await response.json();
      const data = result.data || result;
      
      if ((result.success || data.stdout) && status && outputElement) {
        const output = data.stdout ? data.stdout.trim() : '';
        outputElement.innerHTML = `<strong>Output:</strong> ${output}`;
        
        // Simple output comparison (this can be enhanced)
        const expectedOutput = testData[i] ? testData[i].expected : '';
        const passed = output.includes(expectedOutput.replace(/[\[\]]/g, ''));
        
        status.textContent = passed ? 'Passed' : 'Failed';
        status.className = 'test-status ' + (passed ? 'passed' : 'failed');
      } else if (data && data.stderr && status && outputElement) {
        outputElement.innerHTML = `<strong>Error:</strong> ${data.stderr}`;
        status.textContent = 'Failed';
        status.className = 'test-status failed';
      } else if (status && outputElement) {
        outputElement.innerHTML = `<strong>Output:</strong> No output or error`;
        status.textContent = 'Failed';
        status.className = 'test-status failed';
      }
    } catch (error) {
      console.error('Error running test:', error);
      if (outputElement) outputElement.innerHTML = `<strong>Error:</strong> Failed to run test`;
      if (status) {
        status.textContent = 'Failed';
        status.className = 'test-status failed';
      }
    }
    
    // Add a small delay between test executions
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
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

// Basic IDE integration for Judge0 API (backwards compatibility)
document.addEventListener('DOMContentLoaded', function () {
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

  // Load saved code on page load
  const savedCode = localStorage.getItem('savedCode');
  if (savedCode && codeInput) {
    codeInput.value = savedCode;
    updateLineNumbers();
  }
});
