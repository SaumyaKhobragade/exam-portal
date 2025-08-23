import mongoose from 'mongoose';

/**
 * Utility functions for exam lifecycle management
 */

/**
 * Update expired exams status to 'completed'
 * This function can be called periodically to clean up expired exams
 */
export async function updateExpiredExams() {
    try {
        const Exam = mongoose.model('Exam');
        const now = new Date();
        
        // Find exams that have expired (current time > start time + duration)
        const expiredExams = await Exam.updateMany(
            {
                status: 'active',
                $expr: {
                    $lt: [
                        { $add: ['$startDateTime', { $multiply: ['$duration', 60000] }] },
                        now
                    ]
                }
            },
            {
                $set: { 
                    status: 'completed',
                    completedAt: now
                }
            }
        );
        
        console.log(`Updated ${expiredExams.modifiedCount} expired exams to completed status`);
        return expiredExams.modifiedCount;
    } catch (error) {
        console.error('Error updating expired exams:', error);
        throw error;
    }
}

/**
 * Get all available exams for a user's organization
 * @param {string} userDomain - User's organization domain
 * @returns {Array} Array of available exams (active and completed) for the user's organization
 */
export async function getAvailableExamsForOrganization(userDomain) {
    try {
        const Exam = mongoose.model('Exam');
        const Admin = mongoose.model('Admin');
        
        console.log(`Fetching exams for organization domain: ${userDomain}`);
        
        if (!userDomain) {
            console.log('No domain provided, returning empty array');
            return [];
        }
        
        // Find admins from the same organization
        const organizationAdmins = await Admin.find({ domain: userDomain }).select('_id');
        const adminIds = organizationAdmins.map(admin => admin._id);
        
        console.log(`Found ${organizationAdmins.length} admins in organization`);
        
        // Find all exams from the organization (active and completed, but not draft)
        // Draft exams are not shown to users until they are activated by admin
        const exams = await Exam.find({
            adminId: { $in: adminIds },
            status: { $in: ['active', 'completed'] }  // Show active and completed exams to users
        })
        .populate('adminId', 'username fullname')
        .sort({ startDateTime: -1 })  // Sort by newest first
        .select('title description startDateTime duration status createdAt totalMarks questions');
        
        console.log(`Found ${exams.length} available exams for user dashboard`);
        
        // Log exam details for debugging
        exams.forEach((exam, index) => {
            const now = new Date();
            const startTime = new Date(exam.startDateTime);
            const endTime = new Date(startTime.getTime() + (exam.duration * 60000));
            console.log(`Exam ${index + 1}: ${exam.title}`);
            console.log(`  Status: ${exam.status}`);
            console.log(`  Start: ${startTime.toISOString()}`);
            console.log(`  End: ${endTime.toISOString()}`);
            console.log(`  Now: ${now.toISOString()}`);
            console.log(`  Time state: ${now < startTime ? 'FUTURE' : now > endTime ? 'PAST' : 'CURRENT'}`);
        });
        
        return exams;
    } catch (error) {
        console.error('Error fetching organization exams:', error);
        throw error;
    }
}

// Keep the old function name for backward compatibility but use the new implementation
export async function getNonExpiredExamsForOrganization(userDomain) {
    return getAvailableExamsForOrganization(userDomain);
}

/**
 * Check if an exam is currently active (within its time window)
 * @param {Object} exam - Exam object
 * @returns {Object} Status information about the exam
 */
export function getExamStatus(exam) {
    const now = new Date();
    const startTime = new Date(exam.startDateTime);
    const endTime = new Date(startTime.getTime() + (exam.duration * 60000));
    
    return {
        isActive: now >= startTime && now <= endTime && exam.status === 'active',
        isPast: now > endTime,
        isFuture: now < startTime,
        isDraft: exam.status === 'draft',
        startTime,
        endTime,
        timeRemaining: endTime > now ? endTime - now : 0
    };
}

/**
 * Schedule periodic cleanup of expired exams
 * @param {number} intervalMinutes - How often to run cleanup (default: 60 minutes)
 */
export function scheduleExamCleanup(intervalMinutes = 60) {
    const interval = intervalMinutes * 60 * 1000; // Convert to milliseconds
    
    console.log(`Scheduling exam cleanup every ${intervalMinutes} minutes`);
    
    // Run immediately
    updateExpiredExams().catch(console.error);
    
    // Schedule periodic runs
    return setInterval(() => {
        updateExpiredExams().catch(console.error);
    }, interval);
}

export default {
    updateExpiredExams,
    getNonExpiredExamsForOrganization,
    getAvailableExamsForOrganization,
    getExamStatus,
    scheduleExamCleanup
};
