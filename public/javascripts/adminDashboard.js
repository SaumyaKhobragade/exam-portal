// Admin Dashboard JavaScript Functions

// Load admin info and organization details
async function loadAdminInfo() {
  try {
    const response = await fetch('/api/v1/admin/profile');
    const result = await response.json();
    
    if (result.success) {
      const adminNameElement = document.getElementById('adminName');
      const organizationNameHeaderElement = document.getElementById('organizationNameHeader');
      
      if (adminNameElement) {
        adminNameElement.textContent = result.data.fullname || result.data.username;
      }
      if (organizationNameHeaderElement) {
        organizationNameHeaderElement.textContent = result.data.organization || 'Admin Dashboard';
      }
    }
  } catch (error) {
    console.error('Error loading admin info:', error);
  }
}

// Load exam statistics
async function loadExamStats() {
  try {
    const response = await fetch('/api/v1/admin/exams');
    const result = await response.json();
    
    if (result.success) {
      // Update stats based on exam data
      const totalExams = result.data.length;
      const activeExams = result.data.filter(exam => exam.status === 'active').length;
      const completedExams = result.data.filter(exam => exam.status === 'completed').length;
      
      // Update DOM elements if they exist
      const totalExamsElement = document.getElementById('totalExams');
      const activeExamsElement = document.getElementById('activeExams');
      const completedExamsElement = document.getElementById('completedExams');
      
      if (totalExamsElement) totalExamsElement.textContent = totalExams;
      if (activeExamsElement) activeExamsElement.textContent = activeExams;
      if (completedExamsElement) completedExamsElement.textContent = completedExams;
    }
  } catch (error) {
    console.error('Error loading exam stats:', error);
  }
}

// Load assigned exam requests
async function loadAssignedExams() {
  try {
    const response = await fetch('/api/v1/admin/assigned-exams');
    const result = await response.json();
    
    if (result.success) {
      const examsList = document.getElementById('assignedExamsList');
      
      if (result.data.length === 0) {
        examsList.innerHTML = '<p>No exam requests assigned to you yet.</p>';
        return;
      }
      
      examsList.innerHTML = result.data.map(exam => `
        <div class="exam-item">
          <div class="exam-info">
            <h4>${exam.examTitle}</h4>
            <p><strong>Organization:</strong> ${exam.organizationName}</p>
            <p><strong>Date:</strong> ${new Date(exam.examDate).toLocaleDateString()}</p>
            <p><strong>Type:</strong> ${exam.examType} | <strong>Duration:</strong> ${exam.duration} mins</p>
            <p><strong>Expected Students:</strong> ${exam.expectedStudents}</p>
          </div>
          <div class="exam-actions">
            <span class="status-badge status-approved">Approved</span>
            <button class="btn" onclick="manageExam('${exam._id}')">Manage</button>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading assigned exams:', error);
    document.getElementById('assignedExamsList').innerHTML = '<p>Error loading assigned exams.</p>';
  }
}

// Load dashboard statistics - Updated for role-based display
async function loadDashboardStats() {
  try {
    const response = await fetch('/api/v1/admin/stats');
    const result = await response.json();
    
    if (result.success) {
      // Only update elements that exist (some may be replaced with EJS variables)
      const totalExamsElement = document.getElementById('totalExams');
      const activeExamsElement = document.getElementById('activeExams');
      const completedExamsElement = document.getElementById('completedExams');
      
      if (totalExamsElement && !totalExamsElement.textContent.match(/^\d+$/)) {
        totalExamsElement.textContent = result.data.totalExams || 0;
      }
      if (activeExamsElement && !activeExamsElement.textContent.match(/^\d+$/)) {
        activeExamsElement.textContent = result.data.activeExams || 0;
      }
      if (completedExamsElement && !completedExamsElement.textContent.match(/^\d+$/)) {
        completedExamsElement.textContent = result.data.completedExams || 0;
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Navigation functions
function showCreateExam() {
  alert('Create Exam feature will be implemented next! This will allow you to create coding challenges, MCQs, and mixed format exams.');
}

function showResults() {
  alert('Results feature will be implemented next! This will show detailed analytics and student performance reports.');
}

function showSettings() {
  alert('Settings feature will be implemented next! This will allow you to manage your organization preferences.');
}

function manageExam(examId) {
  alert(`Exam management interface for exam ID: ${examId} will be implemented next!`);
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  loadAdminInfo();
  loadAssignedExams();
  loadExamStats();
});
