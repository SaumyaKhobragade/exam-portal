// IDE JavaScript Functions

// Initialize timer and exam data from JSON script tag
let timeRemaining = 2732; // Default fallback
let examData = null;

// Load data from script tag
function loadExamData() {
  try {
    const dataScript = document.getElementById('exam-data');
    if (dataScript) {
      const data = JSON.parse(dataScript.textContent);
      window.examData = data;
      examData = data;
      timeRemaining = data.initialTimeRemaining || 2732;
      console.log('Exam data loaded:', data);
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
  if (!window.examData || !window.examData.exam || !window.examData.exam.questions) {
    return; // No exam data available
  }
  
  const questionIndex = currentQuestion - 1;
  const question = window.examData.exam.questions[questionIndex];
  
  if (!question) return;
  
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
  if (constraintsElement && question.constraints) {
    let constraintsHtml = '<h3 class="section-subtitle">Constraints</h3><ul>';
    question.constraints.forEach(constraint => {
      constraintsHtml += `<li>${constraint}</li>`;
    });
    constraintsHtml += '</ul>';
    constraintsElement.innerHTML = constraintsHtml;
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
        expectedOutput: testCase.expectedOutput || '',
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

  // Run each test case
  for (let i = 0; i < testCases.length && i < testData.length; i++) {
    const testCase = testCases[i];
    const testInfo = testData[i];
    const status = testCase.querySelector('.test-status');
    const actualOutputDiv = testCase.querySelector('.test-actual');
    const actualOutputPre = actualOutputDiv ? actualOutputDiv.querySelector('.test-content') : null;
    
    if (status) {
      status.textContent = 'Running...';
      status.className = 'test-status running';
    }
    
    try {
      console.log(`Running test case ${i + 1}:`, testInfo);
      
      const response = await fetch('/api/v1/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: languageMap[selectedLanguage] || 63,
          stdin: testInfo.stdin
        })
      });
      
      const result = await response.json();
      console.log(`Test case ${i + 1} result:`, result);
      
      if (result.success && result.data) {
        const actualOutput = (result.data.stdout || '').trim();
        const expectedOutput = testInfo.expectedOutput.trim();
        const passed = actualOutput === expectedOutput;
        
        if (status) {
          status.textContent = passed ? 'Passed' : 'Failed';
          status.className = passed ? 'test-status passed' : 'test-status failed';
        }
        
        // Show actual output
        if (actualOutputDiv && actualOutputPre) {
          actualOutputDiv.style.display = 'block';
          actualOutputPre.textContent = actualOutput || '(no output)';
        }
        
        if (!passed) {
          console.log(`Test case ${i + 1} failed:`);
          console.log('Expected:', expectedOutput);
          console.log('Actual:', actualOutput);
        }
      } else {
        if (status) {
          status.textContent = 'Error';
          status.className = 'test-status failed';
        }
        
        if (actualOutputDiv && actualOutputPre) {
          actualOutputDiv.style.display = 'block';
          actualOutputPre.textContent = result.error || 'Execution error';
        }
        
        console.error(`Test case ${i + 1} execution error:`, result.error);
      }
    } catch (error) {
      if (status) {
        status.textContent = 'Error';
        status.className = 'test-status failed';
      }
      
      if (actualOutputDiv && actualOutputPre) {
        actualOutputDiv.style.display = 'block';
        actualOutputPre.textContent = 'Network error';
      }
      
      console.error(`Test case ${i + 1} network error:`, error);
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

// Enhanced DOM ready initialization
document.addEventListener('DOMContentLoaded', function() {
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
  const testCasesContainer = document.getElementById('testCasesContainer');
  if (!testCasesContainer) return;

  let testCases = [];
  
  // Get test cases from exam data if available
  if (window.examData && window.examData.exam && window.examData.exam.questions) {
    const questionIndex = currentQuestion - 1;
    const question = window.examData.exam.questions[questionIndex];
    
    if (question && question.testCases && question.testCases.length > 0) {
      testCases = question.testCases;
      console.log(`Loaded ${testCases.length} test cases for question ${currentQuestion}`);
    }
  }
  
  // If no test cases from database, show a message
  if (testCases.length === 0) {
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
      loadQuestion(0);
    }
  }
  
  // Initialize line numbers
  updateLineNumbers();
  
  // Initialize progress display
  updateQuestionDisplay();
  
  console.log('IDE initialization complete');
});
