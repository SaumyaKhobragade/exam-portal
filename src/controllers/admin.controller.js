import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import Admin from "../models/admin.model.js"
import ExamRequest from "../models/examRequest.model.js"

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

export {
    getAdminProfile,
    getAssignedExams,
    getAdminStats,
    updateAdminProfile
};
