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
            // Only update approvedRequests if it exists in the main stats section (not the exam requests section)
            var approvedRequestsElem = document.getElementById('approvedRequests');
            if (approvedRequestsElem && approvedRequestsElem.closest('.stats-grid')) {
                // Only update if this is the main stats section
                // (If you want to update both, remove this check)
                // approvedRequestsElem.textContent = result.data.adminCount;
            }
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
                        <div class="admin-name">${admin.fullname || 'N/A'} (@${admin.username || 'N/A'})</div>
                        <div class="admin-email">${admin.email || 'N/A'}</div>
                        <div class="admin-organization">${admin.organization || admin.domain || 'N/A'}</div>
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
            loadAdmins(); 
            loadDashboardStats(); 
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
        console.error('Error loading organization access request stats:', error);
    }
}

// Load organization access requests
async function loadExamRequests() {
    try {
        let url = '/api/v1/exam-requests/all';
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            const requestsList = document.getElementById('examRequestsList');
            
            if (result.data.requests.length === 0) {
                requestsList.innerHTML = '<p>No organization access requests found.</p>';
                return;
            }
            
            requestsList.innerHTML = result.data.requests.map(request => `
                <div class="request-item">
                    <div class="request-header">
                        <div>
                            <div class="request-title">${request.organizationName || 'N/A'}</div>
                            <div class="request-org">Contact: ${request.contactPerson || 'N/A'}</div>
                        </div>
                        <span class="request-status status-${request.status}">${request.status.toUpperCase()}</span>
                    </div>
                    
                    <div class="request-details">
                        <div class="detail-item">
                            <span class="detail-label">Contact Person</span>
                            <span class="detail-value">${request.contactPerson || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${request.email || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Designation</span>
                            <span class="detail-value">${request.designation || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Phone</span>
                            <span class="detail-value">${request.phone || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Submitted</span>
                            <span class="detail-value">${request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</span>
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
        console.error('Error loading organization access requests:', error);
        document.getElementById('examRequestsList').innerHTML = '<p>Error loading organization access requests.</p>';
    }
}

// Open review modal
async function openReviewModal(requestId) {
    console.log('Opening review modal for request:', requestId);
    
    // Wire up modal buttons to review actions
    setTimeout(() => {
        const approveBtn = document.getElementById('approveRequestBtn');
        const rejectBtn = document.getElementById('rejectRequestBtn');
        const closeBtn = document.getElementById('closeReviewModal');
        const closeFooterBtn = document.getElementById('closeReviewModalBtn');
        
        console.log('Setting up modal buttons:', {approveBtn, rejectBtn, closeBtn, closeFooterBtn});
        
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
                document.getElementById('requestDetails').innerHTML = `
                    <div class="request-details">
                        <h4>${request.organizationName || 'N/A'}</h4>
                        <p><strong>Contact:</strong> ${request.contactPerson || 'N/A'} (${request.email || 'N/A'})</p>
                        <p><strong>Designation:</strong> ${request.designation || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${request.phone || 'N/A'}</p>
                        <p><strong>Submitted:</strong> ${request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</p>
                        ${request.description ? `<p><strong>Description:</strong> ${request.description}</p>` : ''}
                    </div>
                `;
                document.getElementById('reviewModal').style.display = 'block';
            } else {
                console.error('Request not found with ID:', requestId);
                alert('Request not found');
            }
        } else {
            console.error('Failed to load requests:', result);
            alert('Failed to load request details');
        }
    } catch (error) {
        console.error('Error opening review modal:', error);
        alert('Error opening review modal: ' + error.message);
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
                    <option value="${admin._id}">${admin.fullname || 'N/A'} (${admin.organization || admin.domain || 'N/A'})</option>
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
