import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import ExamRequest from "../models/examRequest.model.js"
import Owner from "../models/owner.model.js"
import Admin from "../models/admin.model.js"

// Create new exam request
const createExamRequest = asyncHandler(async (req, res) => {
    const {
        organizationName,
        contactPerson,
        designation,
        email,
        phone,
        password
    } = req.body;

    // Validation for required fields only
    if ([organizationName, contactPerson, designation, email, phone, password].some((field) => {
        return field === undefined || field === null || (typeof field === 'string' && field.trim() === "")
    })) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    // Create exam request with simplified fields
    const examRequest = await ExamRequest.create({
        organizationName,
        contactPerson,
        designation,
        email,
        phone,
        password, // Note: In a real app, you'd hash this password
        // Set default values for removed fields
        examTitle: "TBD",
        examDate: new Date(),
        duration: 0,
        expectedStudents: 0,
        examType: "TBD",
        requirements: "",
        description: "Hosting access request"
    });

    if (!examRequest) {
        throw new ApiError(500, "Something went wrong while creating exam request");
    }

    return res.status(201).json(
        new ApiResponse(200, examRequest, "Exam request submitted successfully")
    );
});

// Get all exam requests (Owner only)
const getAllExamRequests = asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    
    // Verify requester is owner
    const owner = await Owner.findById(ownerId);
    if (!owner) {
        throw new ApiError(403, "Only owner can view all exam requests");
    }

    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter
    let filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        filter.status = status;
    }

    // Get requests with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const examRequests = await ExamRequest.find(filter)
        .populate('reviewedBy', 'username fullname')
        .populate('assignedAdmin', 'username fullname organization')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await ExamRequest.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            requests: examRequests,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalRequests: total,
                hasNext: skip + examRequests.length < total,
                hasPrev: parseInt(page) > 1
            }
        }, "Exam requests retrieved successfully")
    );
});

// Review exam request (Approve/Reject)
const reviewExamRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status, reviewNotes, assignedAdminId } = req.body;
    const ownerId = req.user._id;

    // Verify requester is owner
    const owner = await Owner.findById(ownerId);
    if (!owner) {
        throw new ApiError(403, "Only owner can review exam requests");
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
        throw new ApiError(400, "Status must be either 'approved' or 'rejected'");
    }

    // Find the exam request
    const examRequest = await ExamRequest.findById(requestId);
    if (!examRequest) {
        throw new ApiError(404, "Exam request not found");
    }

    if (examRequest.status !== 'pending') {
        throw new ApiError(400, "This request has already been reviewed");
    }

    // If approving, validate assigned admin
    if (status === 'approved' && assignedAdminId) {
        const admin = await Admin.findById(assignedAdminId);
        if (!admin) {
            throw new ApiError(404, "Assigned admin not found");
        }
    }

    // Update the request
    examRequest.status = status;
    examRequest.reviewedBy = ownerId;
    examRequest.reviewDate = new Date();
    examRequest.reviewNotes = reviewNotes || '';
    
    if (status === 'approved' && assignedAdminId) {
        examRequest.assignedAdmin = assignedAdminId;
    }

    await examRequest.save();

    // Populate the updated request for response
    const updatedRequest = await ExamRequest.findById(requestId)
        .populate('reviewedBy', 'username fullname')
        .populate('assignedAdmin', 'username fullname organization');

    return res.status(200).json(
        new ApiResponse(200, updatedRequest, `Exam request ${status} successfully`)
    );
});

// Get exam requests for specific admin
const getAdminExamRequests = asyncHandler(async (req, res) => {
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
        new ApiResponse(200, examRequests, "Admin exam requests retrieved successfully")
    );
});

// Get dashboard stats for exam requests
const getExamRequestStats = asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    
    // Verify requester is owner
    const owner = await Owner.findById(ownerId);
    if (!owner) {
        throw new ApiError(403, "Only owner can view exam request stats");
    }

    const stats = await ExamRequest.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const formattedStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    };

    stats.forEach(stat => {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
    });

    // Get recent requests
    const recentRequests = await ExamRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('organizationName examTitle status createdAt');

    return res.status(200).json(
        new ApiResponse(200, {
            stats: formattedStats,
            recentRequests
        }, "Exam request stats retrieved successfully")
    );
});

export {
    createExamRequest,
    getAllExamRequests,
    reviewExamRequest,
    getAdminExamRequests,
    getExamRequestStats
};
