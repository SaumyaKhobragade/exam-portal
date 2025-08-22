document.getElementById('requestForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    const messageDiv = document.getElementById('message');
    const submitBtn = this.querySelector('.submit-btn');
    
    // Validate exam date is not in the past
    const examDate = new Date(data.examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (examDate < today) {
        messageDiv.style.display = 'block';
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Exam date cannot be in the past';
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const response = await fetch('/api/v1/exam-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        messageDiv.style.display = 'block';
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Request submitted successfully! We will contact you soon.';
            this.reset();
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message || 'Failed to submit request';
        }
    } catch (error) {
        messageDiv.style.display = 'block';
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Network error. Please try again.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request';
    }
});

// Set minimum date to today
document.getElementById('examDate').min = new Date().toISOString().split('T')[0];
