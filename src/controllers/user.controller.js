import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import User from "../models/user.model.js"
import Admin from "../models/admin.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const registerUser = asyncHandler(async (req,res)=>{
    const { username, email, password, fullname, role } = req.body;
    
    // Validation
    if([fullname, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }
    
    // Check if user already exists in both collections
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    const existedAdmin = await Admin.findOne({
        $or: [{ username }, { email }]
    });
    
    if(existedUser || existedAdmin){
        throw new ApiError(409, "User with email or username already exists");
    }
    
    // Handle file uploads (optional)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath;
    
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    
    // Upload to cloudinary if files provided, otherwise use default
    let avatarUrl = "https://res.cloudinary.com/dz89s3j1b/image/upload/v1735028282/default-avatar.png"; // Default avatar
    let coverImageUrl = "";
    
    if(avatarLocalPath){
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if(avatar){
            avatarUrl = avatar.url;
        }
    }
    
    if(coverImageLocalPath){
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if(coverImage){
            coverImageUrl = coverImage.url;
        }
    }
    
    // Create user
    const user = await User.create({
        fullname,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
        email,
        password,
        username: username.toLowerCase(),
        role: role || 'student'
    });
    
    // Remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    
    // Send response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
})

// Simple registration without file upload
const simpleRegisterUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullname, role } = req.body;
    
    // Validation
    if([fullname, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }
    
    // Check if user already exists in both collections
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    const existedAdmin = await Admin.findOne({
        $or: [{ username }, { email }]
    });
    
    if(existedUser || existedAdmin){
        throw new ApiError(409, "User with email or username already exists");
    }
    
    // Create user with default avatar (no file upload)
    const user = await User.create({
        fullname,
        avatar: "https://res.cloudinary.com/dz89s3j1b/image/upload/v1735028282/default-avatar.png",
        coverImage: "",
        email,
        password,
        username: username.toLowerCase(),
        role: role || 'student'
    });
    
    // Get user for token generation (without excluding password for methods)
    const userForTokens = await User.findById(user._id);
    
    // Generate tokens for auto-login
    const accessToken = userForTokens.generateAccess();
    const refreshToken = userForTokens.generateRefresh();
    
    // Update user with refresh token
    userForTokens.refreshToken = refreshToken;
    await userForTokens.save({ validateBeforeSave: false });
    
    // Get user for response (excluding sensitive fields)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    
    const options = {
        httpOnly: true,
        secure: true
    };
    
    // Send response with tokens and redirect info
    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    user: createdUser,
                    accessToken,
                    refreshToken,
                    userType: "user",
                    redirectTo: "/user-dashboard"
                }, 
                "User registered successfully"
            )
        );
});

// Create admin account function
const createAdminAccount = asyncHandler(async (req, res) => {
    const { username, email, password, fullname } = req.body;
    
    // Validation
    if([fullname, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }
    
    // Check if admin already exists in both collections
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    const existedAdmin = await Admin.findOne({
        $or: [{ username }, { email }]
    });
    
    if(existedUser || existedAdmin){
        throw new ApiError(409, "User with email or username already exists");
    }
    
    // Create admin user with default avatar
    const admin = await Admin.create({
        fullname,
        avatar: "https://res.cloudinary.com/dz89s3j1b/image/upload/v1735028282/default-avatar.png",
        coverImage: "",
        email,
        password,
        username: username.toLowerCase(),
        role: 'admin'
    });
    
    // Remove password and refresh token from response
    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );
    
    if(!createdAdmin){
        throw new ApiError(500, "Something went wrong while creating admin account");
    }
    
    // Send response
    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "Admin account created successfully")
    );
})

export { registerUser, createAdminAccount, simpleRegisterUser };