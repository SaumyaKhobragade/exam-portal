// Admin Dashboard JavaScript Functions

// Load admin info and organization details
async function loadAdminInfo() {
  try {
    const response = await fetch('/api/v1/admin/profile');
    const result = await response.json();
    
    if (result.success) {
      document.getElementById('adminName').textContent = result.data.fullname;
      document.getElementById('organizationName').textContent = result.data.organization;
    }
  } catch (error) {
    console.error('Error loading admin info:', error);
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

// Load dashboard statistics
async function loadDashboardStats() {
  try {
    const response = await fetch('/api/v1/admin/stats');
    const result = await response.json();
    
    if (result.success) {
      document.getElementById('totalExams').textContent = result.data.totalExams || 0;
      document.getElementById('totalStudents').textContent = result.data.totalStudents || 0;
      document.getElementById('completedExams').textContent = result.data.completedExams || 0;
      document.getElementById('avgScore').textContent = (result.data.avgScore || 0) + '%';
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
  loadDashboardStats();
});
