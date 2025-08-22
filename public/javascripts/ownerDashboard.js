// Owner Dashboard JavaScript Functions

// Global variable for current request ID
let currentRequestId = null;

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/v1/owner/dashboard-stats');
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('totalUsers').textContent = result.data.totalUsers;
            document.getElementById('adminCount').textContent = result.data.adminCount;
            document.getElementById('userCount').textContent = result.data.userCount;
            document.getElementById('approvedRequests').textContent = result.data.adminCount;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load admins list
async function loadAdmins() {
    try {
        const response = await fetch('/api/v1/owner/admins');
        const result = await response.json();
        
        if (result.success) {
            const adminsList = document.getElementById('adminsList');
            
            if (result.data.length === 0) {
                adminsList.innerHTML = '<p>No admins found.</p>';
                return;
            }
            
            adminsList.innerHTML = result.data.map(admin => `
                <div class="admin-item">
                    <div class="admin-info">
                        <div class="admin-name">${admin.fullname} (@${admin.username})</div>
                        <div class="admin-email">${admin.email}</div>
                        <div class="admin-organization">${admin.organization}</div>
                    </div>
                    <button class="btn btn-danger" onclick="deleteAdmin('${admin._id}')">Delete</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading admins:', error);
        document.getElementById('adminsList').innerHTML = '<p>Error loading admins.</p>';
    }
}

// Delete admin
async function deleteAdmin(adminId) {
    if (!confirm('Are you sure you want to delete this admin account?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/v1/owner/delete-admin/${adminId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        const messageDiv = document.getElementById('message');
        
        messageDiv.style.display = 'block';
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Admin account deleted successfully!';
            loadAdmins(); // Reload admins list
            loadDashboardStats(); // Reload stats
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message || 'Failed to delete admin account';
        }
    } catch (error) {
        const messageDiv = document.getElementById('message');
        messageDiv.style.display = 'block';
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Network error. Please try again.';
    }
}

// Load exam request statistics
async function loadExamRequestStats() {
    try {
        const response = await fetch('/api/v1/exam-requests/stats');
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('pendingRequests').textContent = result.data.stats.pending;
            // Make approvedRequests always match adminCount, fallback to 0 if missing
            let adminCount = result.data.adminCount;
            if (adminCount === undefined || adminCount === null || isNaN(adminCount)) adminCount = 0;
            document.getElementById('approvedRequests').textContent = adminCount;
            document.getElementById('totalRequests').textContent = result.data.stats.total;
        }
    } catch (error) {
        console.error('Error loading exam request stats:', error);
    }
}

// Load exam requests with optional status filter
async function loadExamRequests(status = 'all') {
    try {
        let url = '/api/v1/exam-requests/all';
        if (status !== 'all') {
            url += `?status=${status}`;
        }
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            const requestsList = document.getElementById('examRequestsList');
            
            if (result.data.requests.length === 0) {
                requestsList.innerHTML = '<p>No exam requests found.</p>';
                return;
            }
            
            requestsList.innerHTML = result.data.requests.map(request => `
                <div class="request-item">
                    <div class="request-header">
                        <div>
                            <div class="request-title">${request.examTitle}</div>
                            <div class="request-org">${request.organizationName}</div>
                        </div>
                        <span class="request-status status-${request.status}">${request.status.toUpperCase()}</span>
                    </div>
                    
                    <div class="request-details">
                        <div class="detail-item">
                            <span class="detail-label">Contact Person</span>
                            <span class="detail-value">${request.contactPerson}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${request.email}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Exam Date</span>
                            <span class="detail-value">${new Date(request.examDate).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Expected Students</span>
                            <span class="detail-value">${request.expectedStudents}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Exam Type</span>
                            <span class="detail-value">${request.examType}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Duration</span>
                            <span class="detail-value">${request.duration} minutes</span>
                        </div>
                    </div>
                    
                    <div class="request-actions">
                        ${request.status === 'pending' ? 
                            `<button class="btn btn-primary" onclick="openReviewModal('${request._id}')">Review Request</button>` : 
                            `<button class="btn" onclick="viewRequestDetails('${request._id}')">View Details</button>`
                        }
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading exam requests:', error);
        document.getElementById('examRequestsList').innerHTML = '<p>Error loading exam requests.</p>';
    }
}

// Open review modal
async function openReviewModal(requestId) {
    // Wire up modal buttons to review actions
    setTimeout(() => {
        const approveBtn = document.getElementById('approveRequestBtn');
        const rejectBtn = document.getElementById('rejectRequestBtn');
        const closeBtn = document.getElementById('closeReviewModal');
        const closeFooterBtn = document.getElementById('closeReviewModalBtn');
        if (approveBtn) approveBtn.onclick = () => submitReview('approved');
        if (rejectBtn) rejectBtn.onclick = () => submitReview('rejected');
        if (closeBtn) closeBtn.onclick = closeReviewModal;
        if (closeFooterBtn) closeFooterBtn.onclick = closeReviewModal;
    }, 0);
    currentRequestId = requestId;
    
    try {
        // Get request details
        const response = await fetch(`/api/v1/exam-requests/all`);
        const result = await response.json();
        
        if (result.success) {
            const request = result.data.requests.find(r => r._id === requestId);
            if (request) {
                // Populate modal body with request details
                document.getElementById('reviewModalBody').innerHTML = `
                    <div class="request-details">
                        <h4>${request.examTitle}</h4>
                        <p><strong>Organization:</strong> ${request.organizationName}</p>
                        <p><strong>Contact:</strong> ${request.contactPerson} (${request.email})</p>
                        <div style="height:16px;"></div>
                        <p><strong>Date:</strong> ${new Date(request.examDate).toLocaleDateString()}</p>
                        <p><strong>Duration:</strong> ${request.duration} minutes</p>
                        <p><strong>Expected Students:</strong> ${request.expectedStudents}</p>
                        <p><strong>Type:</strong> ${request.examType}</p>
                        ${request.description ? `<p><strong>Description:</strong> ${request.description}</p>` : ''}
                        ${request.requirements ? `<p><strong>Requirements:</strong> ${request.requirements}</p>` : ''}
                    </div>
                `;
                document.getElementById('reviewModal').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading request details:', error);
    }
}

// Load admins for assignment dropdown
async function loadAdminsForAssignment() {
    try {
        const response = await fetch('/api/v1/owner/admins');
        const result = await response.json();
        
        if (result.success) {
            const adminSelect = document.getElementById('assignedAdmin');
            adminSelect.innerHTML = '<option value="">Select Admin</option>' + 
                result.data.map(admin => `
                    <option value="${admin._id}">${admin.fullname} (${admin.organization})</option>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading admins:', error);
    }
}

// Submit review
async function submitReview(status) {
    try {
        const response = await fetch(`/api/v1/exam-requests/${currentRequestId}/review`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        const messageDiv = document.getElementById('dashboardMessage');
        if (response.ok) {
            if (messageDiv) {
                messageDiv.style.display = 'block';
                messageDiv.className = 'message success';
                messageDiv.textContent = result.message || `Request ${status} and removed!`;
            }
            closeReviewModal();
            // Dynamically update stats and requests list
            loadExamRequestStats();
            loadExamRequests();
        } else {
            if (messageDiv) {
                messageDiv.style.display = 'block';
                messageDiv.className = 'message error';
                messageDiv.textContent = result.message || 'Failed to submit review';
            }
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        const messageDiv = document.getElementById('dashboardMessage');
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Network error. Please try again.';
        }
    }
}

// Close review modal
function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    currentRequestId = null;
}

// View request details (for non-pending requests)
function viewRequestDetails(requestId) {
    // This would open a read-only modal with full request details
    alert('View details feature - would show full request information');
}

// Handle form submission for creating admin
function initializeCreateAdminForm() {
    document.getElementById('createAdminForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const fullname = document.getElementById('adminFullname').value;
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const organization = document.getElementById('adminOrganization').value;
        const messageDiv = document.getElementById('message');
        
        try {
            const response = await fetch('/api/v1/owner/create-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, fullname, email, password, organization })
            });
            
            const result = await response.json();
            
            messageDiv.style.display = 'block';
            if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Admin account created successfully!';
                document.getElementById('createAdminForm').reset();
                loadAdmins(); // Reload admins list
                loadDashboardStats(); // Reload stats
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = result.message || 'Failed to create admin account';
            }
        } catch (error) {
            messageDiv.style.display = 'block';
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Network error. Please try again.';
        }
    });
}

// Handle review status change
function initializeReviewStatusHandler() {
    document.getElementById('reviewStatus').addEventListener('change', function() {
        const adminGroup = document.getElementById('adminAssignmentGroup');
        if (this.value === 'approved') {
            adminGroup.style.display = 'block';
        } else {
            adminGroup.style.display = 'none';
        }
    });
}

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
    loadAdmins();
    loadExamRequestStats();
    loadExamRequests();
    initializeCreateAdminForm();
    initializeReviewStatusHandler();
});

// Navigation functions for the header menu
function showAnalytics() {
    alert('Analytics feature will be implemented next! This will show detailed platform analytics and insights.');
}

function showSettings() {
    alert('Settings feature will be implemented next! This will allow you to configure platform settings and preferences.');
}

function showReports() {
    alert('Reports feature will be implemented next! This will provide comprehensive reports and data exports.');
}
