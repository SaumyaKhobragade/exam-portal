import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import Admin from "../models/admin.model.js"
import ExamRequest from "../models/examRequest.model.js"
import Exam from "../models/exam.model.js"

// Get admin profile
const getAdminProfile = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    
    const admin = await Admin.findById(adminId).select("-password -refreshToken");
    
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    return res.status(200).json(
        new ApiResponse(200, admin, "Admin profile retrieved successfully")
    );
});

// Get assigned exam requests for admin
const getAssignedExams = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    
    // Verify requester is admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new ApiError(403, "Only admin can view assigned exam requests");
    }

    const examRequests = await ExamRequest.find({ 
        assignedAdmin: adminId,
        status: 'approved'
    })
        .populate('reviewedBy', 'username fullname')
        .sort({ examDate: 1 });

    return res.status(200).json(
        new ApiResponse(200, examRequests, "Assigned exam requests retrieved successfully")
    );
});

// Get admin dashboard statistics
const getAdminStats = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    
    // Verify requester is admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new ApiError(403, "Only admin can view dashboard stats");
    }

    // Get assigned exams count
    const totalExams = await ExamRequest.countDocuments({ 
        assignedAdmin: adminId,
        status: 'approved'
    });

    // Get upcoming exams
    const upcomingExams = await ExamRequest.countDocuments({
        assignedAdmin: adminId,
        status: 'approved',
        examDate: { $gte: new Date() }
    });

    // Get past exams
    const completedExams = await ExamRequest.countDocuments({
        assignedAdmin: adminId,
        status: 'approved',
        examDate: { $lt: new Date() }
    });

    // Calculate total expected students from all assigned exams
    const examsWithStudents = await ExamRequest.find({
        assignedAdmin: adminId,
        status: 'approved'
    }).select('expectedStudents');

    const totalStudents = examsWithStudents.reduce((sum, exam) => sum + exam.expectedStudents, 0);

    const stats = {
        totalExams,
        upcomingExams,
        completedExams,
        totalStudents,
        avgScore: 0, // This would be calculated from actual exam results
        organization: admin.organization
    };

    return res.status(200).json(
        new ApiResponse(200, stats, "Admin dashboard stats retrieved successfully")
    );
});

// Update admin profile
const updateAdminProfile = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { fullname, email } = req.body;

    // Validation
    if (!fullname && !email) {
        throw new ApiError(400, "At least one field is required to update");
    }

    // Check if email already exists (if updating email)
    if (email) {
        const existingAdmin = await Admin.findOne({ 
            email: email.toLowerCase(),
            _id: { $ne: adminId }
        });
        
        if (existingAdmin) {
            throw new ApiError(409, "Email already exists");
        }
    }

    // Build update object
    const updateData = {};
    if (fullname) updateData.fullname = fullname;
    if (email) updateData.email = email.toLowerCase();

    const updatedAdmin = await Admin.findByIdAndUpdate(
        adminId,
        updateData,
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!updatedAdmin) {
        throw new ApiError(500, "Error updating admin profile");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedAdmin, "Admin profile updated successfully")
    );
});

// Get all exams created by the admin
const getAdminExams = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    
    // Verify requester is admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new ApiError(403, "Only admin can view their exams");
    }

    const exams = await Exam.find({ adminId: adminId })
        .sort({ createdAt: -1 })
        .select('title description startDateTime duration status questions totalMarks createdAt');

    return res.status(200).json(
        new ApiResponse(200, exams, "Admin exams retrieved successfully")
    );
});

// Activate an exam (change status from draft to active)
const activateExam = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { examId } = req.params;
    
    // Verify requester is admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new ApiError(403, "Only admin can activate exams");
    }

    // Find the exam and verify ownership
    const exam = await Exam.findOne({ _id: examId, adminId: adminId });
    if (!exam) {
        throw new ApiError(404, "Exam not found or you don't have permission to modify it");
    }

    // Check if exam is in draft status
    if (exam.status !== 'draft') {
        throw new ApiError(400, "Only draft exams can be activated");
    }

    // Activate the exam
    exam.status = 'active';
    await exam.save();

    return res.status(200).json(
        new ApiResponse(200, exam, "Exam activated successfully")
    );
});

// Deactivate an exam (change status from active to draft)
const deactivateExam = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { examId } = req.params;
    
    // Verify requester is admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new ApiError(403, "Only admin can deactivate exams");
    }

    // Find the exam and verify ownership
    const exam = await Exam.findOne({ _id: examId, adminId: adminId });
    if (!exam) {
        throw new ApiError(404, "Exam not found or you don't have permission to modify it");
    }

    // Check if exam is in active status
    if (exam.status !== 'active') {
        throw new ApiError(400, "Only active exams can be deactivated");
    }

    // Deactivate the exam
    exam.status = 'draft';
    await exam.save();

    return res.status(200).json(
        new ApiResponse(200, exam, "Exam deactivated successfully")
    );
});

// Delete an exam
const deleteExam = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { examId } = req.params;
    
    // Verify requester is admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new ApiError(403, "Only admin can delete exams");
    }

    // Find the exam and verify ownership
    const exam = await Exam.findOne({ _id: examId, adminId: adminId });
    if (!exam) {
        throw new ApiError(404, "Exam not found or you don't have permission to delete it");
    }

    // Don't allow deletion of active exams that are currently running
    const now = new Date();
    const startTime = new Date(exam.startDateTime);
    const endTime = new Date(startTime.getTime() + (exam.duration * 60000));
    
    if (exam.status === 'active' && now >= startTime && now <= endTime) {
        throw new ApiError(400, "Cannot delete an exam that is currently running");
    }

    // Delete the exam
    await Exam.findByIdAndDelete(examId);

    return res.status(200).json(
        new ApiResponse(200, null, "Exam deleted successfully")
    );
});

export {
    getAdminProfile,
    getAssignedExams,
    getAdminStats,
    updateAdminProfile,
    getAdminExams,
    activateExam,
    deactivateExam,
    deleteExam
};
