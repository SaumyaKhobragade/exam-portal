import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import ExamRequest from "../models/examRequest.model.js"
import { sendExamAcceptedMail } from "../utils/sendExamAcceptedMail.js";
import { sendExamRejectedMail } from "../utils/sendExamRejectedMail.js";
import Owner from "../models/owner.model.js"
import Admin from "../models/admin.model.js"
import ApprovedDomain from "../models/approvedDomain.model.js"

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
        password // Note: In a real app, you'd hash this password
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
    const { status } = req.body;
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

    if (status === 'approved') {
        // Extract domain from email
        const emailDomain = examRequest.email.split('@')[1];
        
        // Create admin account from request
        try {
            const admin = await Admin.create({
                username: examRequest.email.split('@')[0],
                email: examRequest.email,
                fullname: examRequest.contactPerson,
                avatar: '',
                password: examRequest.password,
                organization: examRequest.organizationName,
                domain: emailDomain
            });
            
            // Store approved domain
            await ApprovedDomain.create({
                domain: emailDomain,
                organizationName: examRequest.organizationName,
                contactPerson: examRequest.contactPerson,
                approvedBy: req.user._id, // Owner ID from middleware
                adminId: admin._id,
                isActive: true
            });
            
        } catch (err) {
            console.error('Error creating admin from accepted request:', err);
        }
        // Send acceptance email
        const mailSuccess = await sendExamAcceptedMail(examRequest.email, examRequest.contactPerson);
        // Delete the request after sending mail
        await ExamRequest.findByIdAndDelete(requestId);
        if (mailSuccess) {
            return res.status(200).json(
                new ApiResponse(200, null, 'Exam request approved, admin account created, requester notified, and request removed.')
            );
        } else {
            return res.status(200).json(
                new ApiResponse(200, null, 'Exam request approved, admin account created and removed, but failed to send acceptance email.')
            );
        }
    } else {
        // Send rejection email
        const mailSuccess = await sendExamRejectedMail(examRequest.email, examRequest.contactPerson);
        // Delete the request after sending mail
        await ExamRequest.findByIdAndDelete(requestId);
        if (mailSuccess) {
            return res.status(200).json(
                new ApiResponse(200, null, 'Exam request rejected, requester notified, and request removed.')
            );
        } else {
            return res.status(200).json(
                new ApiResponse(200, null, 'Exam request rejected and removed, but failed to send rejection email.')
            );
        }
    }
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
        .sort({ createdAt: -1 });

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
        .select('organizationName contactPerson status createdAt');

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
