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
  const examCountElement = document.getElementById('examCount');
  
  if (!examsContainer) return;
  
  // Update exam count
  if (examCountElement) {
    examCountElement.textContent = `${exams.length} exam${exams.length !== 1 ? 's' : ''}`;
  }
  
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
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    loadRankings();
    loadExamOptions();
  }
}

function hideResults() {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.style.display = 'none';
  }
}

// Load exam options for filter dropdown
async function loadExamOptions() {
  try {
    const response = await fetch('/api/v1/admin/exams');
    const result = await response.json();
    
    if (result.success) {
      const examFilter = document.getElementById('examFilter');
      if (examFilter) {
        // Clear existing options except "All Exams"
        examFilter.innerHTML = '<option value="all">All Exams</option>';
        
        // Add exam options
        result.data.forEach(exam => {
          const option = document.createElement('option');
          option.value = exam._id;
          option.textContent = exam.title;
          examFilter.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Error loading exam options:', error);
  }
}

// Load rankings data
async function loadRankings() {
  try {
    const examFilter = document.getElementById('examFilter');
    const examId = examFilter ? examFilter.value : 'all';
    
    const url = examId === 'all' ? '/api/v1/admin/rankings' : `/api/v1/admin/rankings?examId=${examId}`;
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      displayRankings(result.data.rankings);
      updatePerformanceMetrics(result.data.stats);
    } else {
      showRankingsError(result.message || 'Failed to load rankings');
    }
  } catch (error) {
    console.error('Error loading rankings:', error);
    showRankingsError('Error loading rankings data');
  }
}

// Display rankings in the table
function displayRankings(rankings) {
  const tableBody = document.getElementById('rankingsTableBody');
  if (!tableBody) return;
  
  if (!rankings || rankings.length === 0) {
    tableBody.innerHTML = `
      <tr class="loading-row">
        <td colspan="10">
          <i class="fas fa-info-circle"></i> No ranking data available yet. Students need to complete exams to generate rankings.
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = rankings.map((student, index) => {
    const rank = index + 1;
    const rankBadgeClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'default';
    
    return `
      <tr>
        <td>
          <div class="rank-badge ${rankBadgeClass}">${rank}</div>
        </td>
        <td>
          <div class="student-info">
            <div class="student-avatar">
              ${student.fullname ? student.fullname.charAt(0).toUpperCase() : 'U'}
            </div>
            <div class="student-details">
              <h4>${student.fullname || student.username}</h4>
              <p>${student.email}</p>
            </div>
          </div>
        </td>
        <td><span class="score-badge ${getScoreClass(student.overallScore)}">${student.overallScore}/10</span></td>
        <td><span class="score-badge ${getScoreClass(student.correctness)}">${student.correctness}/10</span></td>
        <td><span class="score-badge ${getScoreClass(student.codeQuality)}">${student.codeQuality}/10</span></td>
        <td><span class="score-badge ${getScoreClass(student.efficiency)}">${student.efficiency}/10</span></td>
        <td><span class="score-badge ${getScoreClass(student.bestPractices)}">${student.bestPractices}/10</span></td>
        <td><span class="score-badge ${getScoreClass(student.timeScore)}">${student.timeScore}/10</span></td>
        <td>${student.examCount || 0}</td>
        <td>${student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `;
  }).join('');
}

// Get CSS class based on score
function getScoreClass(score) {
  if (score >= 8.5) return 'score-excellent';
  if (score >= 7.0) return 'score-good';
  if (score >= 5.0) return 'score-average';
  return 'score-poor';
}

// Update performance metrics
function updatePerformanceMetrics(stats) {
  if (!stats) return;
  
  const elements = {
    avgOverallScore: stats.averageOverallScore || 0,
    topPerformer: stats.topPerformer || 'N/A',
    mostImproved: stats.mostImproved || 'N/A',
    activeStudents: stats.activeStudents || 0
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      if (id === 'avgOverallScore') {
        element.textContent = `${value.toFixed(1)}/10`;
      } else {
        element.textContent = value;
      }
    }
  });
}

// Filter rankings by exam
function filterRankings() {
  loadRankings();
}

// Sort rankings
function sortRankings() {
  const sortBy = document.getElementById('sortBy');
  if (sortBy) {
    // For now, just reload rankings - could be enhanced to sort client-side
    loadRankings();
  }
}

// Show rankings error
function showRankingsError(message) {
  const tableBody = document.getElementById('rankingsTableBody');
  if (tableBody) {
    tableBody.innerHTML = `
      <tr class="loading-row">
        <td colspan="10" style="color: #e74c3c;">
          <i class="fas fa-exclamation-triangle"></i> ${message}
        </td>
      </tr>
    `;
  }
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
