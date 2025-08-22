import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import User from "../models/user.model.js"
import Admin from "../models/admin.model.js"
import Owner from "../models/owner.model.js"

// Create Owner account (only one owner should exist)
const createOwnerAccount = asyncHandler(async (req, res) => {
    const { username, email, password, fullname } = req.body;
    
    // Validation
    if([fullname, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }
    
    // Check if owner already exists
    const existingOwner = await Owner.findOne({});
    if(existingOwner){
        throw new ApiError(409, "Owner account already exists. Only one owner is allowed.");
    }
    
    // Check if user already exists in other collections
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    const existedAdmin = await Admin.findOne({
        $or: [{ username }, { email }]
    });
    
    if(existedUser || existedAdmin){
        throw new ApiError(409, "User with email or username already exists");
    }
    
    // Create owner with default avatar
    const owner = await Owner.create({
        fullname,
        avatar: "https://res.cloudinary.com/dz89s3j1b/image/upload/v1735028282/default-avatar.png",
        coverImage: "",
        email,
        password,
        username: username.toLowerCase(),
        role: 'owner'
    });
    
    // Remove password and refresh token from response
    const createdOwner = await Owner.findById(owner._id).select(
        "-password -refreshToken"
    );
    
    if(!createdOwner){
        throw new ApiError(500, "Something went wrong while creating owner account");
    }
    
    // Send response
    return res.status(201).json(
        new ApiResponse(200, createdOwner, "Owner account created successfully")
    );
});

// Create Admin by Owner
const createAdminByOwner = asyncHandler(async (req, res) => {
    const { username, email, password, fullname, organization } = req.body;
    const ownerId = req.user._id; // Assuming middleware sets this
    
    // Validation
    if([fullname, email, username, password, organization].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }
    
    // Verify requester is owner
    const owner = await Owner.findById(ownerId);
    if(!owner){
        throw new ApiError(403, "Only owner can create admin accounts");
    }
    
    // Check if admin already exists in any collection
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    const existedAdmin = await Admin.findOne({
        $or: [{ username }, { email }]
    });
    
    const existedOwner = await Owner.findOne({
        $or: [{ username }, { email }]
    });
    
    if(existedUser || existedAdmin || existedOwner){
        throw new ApiError(409, "User with email or username already exists");
    }
    
    // Create admin account
    const admin = await Admin.create({
        fullname,
        avatar: "https://res.cloudinary.com/dz89s3j1b/image/upload/v1735028282/default-avatar.png",
        coverImage: "",
        email,
        password,
        username: username.toLowerCase(),
        role: 'admin',
        organization,
        createdBy: ownerId
    });
    
    // Add admin to owner's created admins list
    await Owner.findByIdAndUpdate(
        ownerId,
        { $push: { createdAdmins: admin._id } },
        { new: true }
    );
    
    // Remove password and refresh token from response
    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );
    
    if(!createdAdmin){
        throw new ApiError(500, "Something went wrong while creating admin account");
    }
    
    // Send response
    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "Admin account created successfully by owner")
    );
});

// Get all admins created by owner
const getAdminsByOwner = asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    
    // Verify requester is owner
    const owner = await Owner.findById(ownerId);
    if(!owner){
        throw new ApiError(403, "Only owner can view admin accounts");
    }
    
    // Get all admins
    const admins = await Admin.find({}).select("-password -refreshToken");
    
    return res.status(200).json(
        new ApiResponse(200, admins, "Admins retrieved successfully")
    );
});

// Delete admin by owner
const deleteAdminByOwner = asyncHandler(async (req, res) => {
    const { adminId } = req.params;
    const ownerId = req.user._id;
    
    // Verify requester is owner
    const owner = await Owner.findById(ownerId);
    if(!owner){
        throw new ApiError(403, "Only owner can delete admin accounts");
    }
    
    // Find and delete admin
    const admin = await Admin.findById(adminId);
    if(!admin){
        throw new ApiError(404, "Admin not found");
    }
    
    await Admin.findByIdAndDelete(adminId);
    
    // Remove admin from owner's created admins list
    await Owner.findByIdAndUpdate(
        ownerId,
        { $pull: { createdAdmins: adminId } },
        { new: true }
    );
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Admin account deleted successfully")
    );
});

// Get owner dashboard stats
const getOwnerDashboardStats = asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    
    // Verify requester is owner
    const owner = await Owner.findById(ownerId);
    if(!owner){
        throw new ApiError(403, "Access denied");
    }
    
    // Get counts
    const adminCount = await Admin.countDocuments();
    const userCount = await User.countDocuments();
    const totalUsers = adminCount + userCount + 1; // +1 for owner
    
    const stats = {
        totalUsers,
        adminCount,
        userCount,
        ownerInfo: {
            username: owner.username,
            email: owner.email,
            fullname: owner.fullname,
            createdAt: owner.createdAt
        }
    };
    
    return res.status(200).json(
        new ApiResponse(200, stats, "Dashboard stats retrieved successfully")
    );
});

// Update Owner Password
const updateOwnerPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    // Validation
    if(!currentPassword || !newPassword){
        throw new ApiError(400, "Current password and new password are required");
    }
    
    if(newPassword.length < 6){
        throw new ApiError(400, "New password must be at least 6 characters long");
    }
    
    // Get the owner (there should be only one)
    const owner = await Owner.findOne({});
    if(!owner){
        throw new ApiError(404, "Owner not found");
    }
    
    // Verify current password
    const isPasswordValid = await owner.isPasswordCorrect(currentPassword);
    if(!isPasswordValid){
        throw new ApiError(400, "Current password is incorrect");
    }
    
    // Update password
    owner.password = newPassword;
    await owner.save();
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Owner password updated successfully")
    );
});

export { 
    createOwnerAccount,
    createAdminByOwner,
    getAdminsByOwner,
    deleteAdminByOwner,
    getOwnerDashboardStats,
    updateOwnerPassword
};
