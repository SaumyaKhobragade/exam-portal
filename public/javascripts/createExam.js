let questionCount = 0;
const MAX_QUESTIONS = 10;
const MIN_QUESTIONS = 1;

document.addEventListener('DOMContentLoaded', function() {
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const questionsContainer = document.getElementById('questionsContainer');
    const form = document.getElementById('createExamForm');

    // Add initial question
    addQuestion();

    addQuestionBtn.addEventListener('click', addQuestion);
    form.addEventListener('submit', handleFormSubmit);

    function addQuestion() {
        if (questionCount >= MAX_QUESTIONS) {
            alert(`Maximum ${MAX_QUESTIONS} questions allowed`);
            return;
        }

        questionCount++;
        const questionCard = createQuestionCard(questionCount);
        questionsContainer.appendChild(questionCard);
        updateAddQuestionButton();
    }

    function createQuestionCard(questionNum) {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.dataset.questionId = questionNum;

        card.innerHTML = `
            <div class="question-header">
                <h3 class="q-title">Question ${questionNum}</h3>
                <div class="q-controls">
                    <label class="q-weight">
                        Weight/Score *
                        <input type="number" name="question${questionNum}_weight" min="1" max="100" value="10" required>
                    </label>
                    <button type="button" class="danger" onclick="removeQuestion(${questionNum})" ${questionCount <= MIN_QUESTIONS ? 'disabled' : ''}>
                        Remove
                    </button>
                </div>
            </div>

            <label>
                Question Title *
                <input type="text" name="question${questionNum}_title" required>
            </label>

            <label>
                Problem Statement *
                <textarea name="question${questionNum}_statement" rows="4" required></textarea>
            </label>

            <div class="inline-grid">
                <label>
                    Input Format
                    <textarea name="question${questionNum}_inputFormat" rows="3"></textarea>
                </label>
                <label>
                    Output Format
                    <textarea name="question${questionNum}_outputFormat" rows="3"></textarea>
                </label>
            </div>

            <label>
                Constraints
                <textarea name="question${questionNum}_constraints" rows="2"></textarea>
            </label>

            <div class="testcases">
                <h4>Test Cases</h4>
                <div class="testcases-container" data-question="${questionNum}">
                    <!-- Test cases will be added here -->
                </div>
                <button type="button" class="add-testcase-btn bottom" onclick="addTestCase(${questionNum})">
                    + Add Test Case
                </button>
            </div>
        `;

        // Add initial test case
        setTimeout(() => addTestCase(questionNum), 0);
        
        return card;
    }

    function removeQuestion(questionNum) {
        if (questionCount <= MIN_QUESTIONS) {
            alert(`Minimum ${MIN_QUESTIONS} question required`);
            return;
        }

        const card = document.querySelector(`[data-question-id="${questionNum}"]`);
        if (card) {
            card.remove();
            questionCount--;
            updateQuestionNumbers();
            updateAddQuestionButton();
        }
    }

    function updateQuestionNumbers() {
        const cards = questionsContainer.querySelectorAll('.question-card');
        cards.forEach((card, index) => {
            const newNum = index + 1;
            const oldNum = card.dataset.questionId;
            
            card.dataset.questionId = newNum;
            card.querySelector('.q-title').textContent = `Question ${newNum}`;
            
            // Update all form field names
            card.querySelectorAll('[name^="question"]').forEach(input => {
                input.name = input.name.replace(`question${oldNum}_`, `question${newNum}_`);
            });
            
            // Update test case container
            const testContainer = card.querySelector('.testcases-container');
            testContainer.dataset.question = newNum;
            
            // Update remove button onclick
            const removeBtn = card.querySelector('.danger');
            removeBtn.setAttribute('onclick', `removeQuestion(${newNum})`);
            removeBtn.disabled = questionCount <= MIN_QUESTIONS;
            
            // Update add test case button
            const addTcBtn = card.querySelector('.add-testcase-btn');
            addTcBtn.setAttribute('onclick', `addTestCase(${newNum})`);
        });
    }

    function updateAddQuestionButton() {
        addQuestionBtn.style.display = questionCount >= MAX_QUESTIONS ? 'none' : 'block';
        
        // Update remove button states
        document.querySelectorAll('.question-card .danger').forEach(btn => {
            btn.disabled = questionCount <= MIN_QUESTIONS;
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        if (questionCount < MIN_QUESTIONS) {
            alert(`Minimum ${MIN_QUESTIONS} question required`);
            return;
        }

        // Validate each question has at least one test case
        let allValid = true;
        for (let i = 1; i <= questionCount; i++) {
            const testCases = document.querySelectorAll(`[data-question="${i}"] .testcase-row`);
            if (testCases.length === 0) {
                alert(`Question ${i} must have at least one test case`);
                allValid = false;
                break;
            }
        }

        if (allValid) {
            // Add question count to form data before submission
            const questionCountInput = document.createElement('input');
            questionCountInput.type = 'hidden';
            questionCountInput.name = 'questionCount';
            questionCountInput.value = questionCount;
            form.appendChild(questionCountInput);

            // Submit the form normally
            form.submit();
        }
    }

    // Make functions global for onclick handlers
    window.removeQuestion = removeQuestion;
    window.addTestCase = addTestCase;
    window.removeTestCase = removeTestCase;
});

function addTestCase(questionNum) {
    const container = document.querySelector(`[data-question="${questionNum}"]`);
    const testCaseCount = container.children.length + 1;
    
    const testCaseRow = document.createElement('div');
    testCaseRow.className = 'testcase-row';
    
    testCaseRow.innerHTML = `
        <div class="tc-fields">
            <label>
                Input
                <textarea name="question${questionNum}_tc${testCaseCount}_input" rows="2" required></textarea>
            </label>
            <label>
                Expected Output
                <textarea name="question${questionNum}_tc${testCaseCount}_output" rows="2" required></textarea>
            </label>
        </div>
        <button type="button" class="remove-tc-btn" onclick="removeTestCase(this)">×</button>
    `;
    
    container.appendChild(testCaseRow);
}

function removeTestCase(button) {
    const testCaseRow = button.parentElement;
    const container = testCaseRow.parentElement;
    
    if (container.children.length <= 1) {
        alert('At least one test case is required');
        return;
    }
    
    testCaseRow.remove();
}