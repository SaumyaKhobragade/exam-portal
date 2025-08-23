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
            <h4>${exam.organizationName || 'N/A'}</h4>
            <p><strong>Contact Person:</strong> ${exam.contactPerson || 'N/A'}</p>
            <p><strong>Designation:</strong> ${exam.designation || 'N/A'}</p>
            <p><strong>Email:</strong> ${exam.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${exam.phone || 'N/A'}</p>
            <p><strong>Status:</strong> ${exam.status || 'pending'}</p>
            <p><strong>Submitted:</strong> ${exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div class="exam-actions">
            <span class="status-badge status-${exam.status || 'pending'}">${exam.status ? exam.status.charAt(0).toUpperCase() + exam.status.slice(1) : 'Pending'}</span>
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

// Load and display admin's exams
async function loadAdminExams() {
  try {
    const response = await fetch('/api/v1/admin/exams');
    const result = await response.json();
    
    if (result.success) {
      displayExams(result.data);
    } else {
      console.error('Error loading exams:', result.message);
      displayExams([]);
    }
  } catch (error) {
    console.error('Error loading admin exams:', error);
    displayExams([]);
  }
}

// Display exams in the admin dashboard
function displayExams(exams) {
  const examsContainer = document.getElementById('examsContainer');
  if (!examsContainer) return;
  
  if (exams.length === 0) {
    examsContainer.innerHTML = '<p class="no-exams">No exams created yet. <a href="/admin/exams/create">Create your first exam</a></p>';
    return;
  }
  
  let examsHTML = '';
  exams.forEach(exam => {
    const startDate = new Date(exam.startDateTime);
    const endDate = new Date(startDate.getTime() + (exam.duration * 60000));
    const now = new Date();
    
    const isActive = exam.status === 'active';
    const isDraft = exam.status === 'draft';
    const isCompleted = exam.status === 'completed';
    const isExpired = now > endDate;
    
    examsHTML += `
      <div class="exam-item ${exam.status}">
        <div class="exam-header">
          <h3 class="exam-title">${exam.title}</h3>
          <span class="exam-status status-${exam.status}">${exam.status.toUpperCase()}</span>
        </div>
        <div class="exam-details">
          <p class="exam-description">${exam.description || 'No description'}</p>
          <div class="exam-meta">
            <span class="exam-duration">⏱️ ${exam.duration} minutes</span>
            <span class="exam-questions">📝 ${exam.questions ? exam.questions.length : 0} questions</span>
            <span class="exam-points">🎯 ${exam.totalMarks || 0} points</span>
          </div>
          <div class="exam-schedule">
            <strong>Start:</strong> ${startDate.toLocaleString()}
            <br>
            <strong>End:</strong> ${endDate.toLocaleString()}
          </div>
        </div>
        <div class="exam-actions">
          ${isDraft ? `<button class="btn btn-primary" onclick="activateExam('${exam._id}')">Activate Exam</button>` : ''}
          ${isActive && !isExpired ? `<button class="btn btn-warning" onclick="deactivateExam('${exam._id}')">Deactivate</button>` : ''}
          <button class="btn btn-secondary" onclick="viewExamDetails('${exam._id}')">View Details</button>
          <button class="btn btn-danger" onclick="deleteExam('${exam._id}')">Delete</button>
        </div>
      </div>
    `;
  });
  
  examsContainer.innerHTML = examsHTML;
}

// Activate an exam (change status from draft to active)
async function activateExam(examId) {
  if (!confirm('Are you sure you want to activate this exam? Students will be able to see and take it.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/v1/admin/exams/${examId}/activate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Exam activated successfully! Students can now see and take this exam.');
      loadAdminExams(); // Reload the exams list
      loadExamStats(); // Update stats
    } else {
      alert('Error activating exam: ' + result.message);
    }
  } catch (error) {
    console.error('Error activating exam:', error);
    alert('Error activating exam. Please try again.');
  }
}

// Deactivate an exam (change status from active to draft)
async function deactivateExam(examId) {
  if (!confirm('Are you sure you want to deactivate this exam? Students will no longer be able to take it.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/v1/admin/exams/${examId}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Exam deactivated successfully!');
      loadAdminExams(); // Reload the exams list
      loadExamStats(); // Update stats
    } else {
      alert('Error deactivating exam: ' + result.message);
    }
  } catch (error) {
    console.error('Error deactivating exam:', error);
    alert('Error deactivating exam. Please try again.');
  }
}

// View exam details
function viewExamDetails(examId) {
  // For now, just show an alert. In a full implementation, this would open a detailed view
  alert(`View details for exam ${examId}. Feature coming soon!`);
}

// View exam results (for completed exams)
function viewExamResults(examId) {
  // For now, just show an alert. In a full implementation, this would show detailed results
  alert(`View results for completed exam ${examId}. This will show:\n- Student submissions\n- Score analytics\n- Pass/fail rates\n- Individual performance\n\nFeature coming soon!`);
}

// Delete an exam
async function deleteExam(examId) {
  if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/v1/admin/exams/${examId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Exam deleted successfully!');
      loadAdminExams(); // Reload the exams list
      loadExamStats(); // Update stats
    } else {
      alert('Error deleting exam: ' + result.message);
    }
  } catch (error) {
    console.error('Error deleting exam:', error);
    alert('Error deleting exam. Please try again.');
  }
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
  loadAdminExams(); // Load the admin's exams
});
