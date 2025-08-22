import Router from 'express';
import { registerUser, createAdminAccount, simpleRegisterUser } from '../controllers/user.controller.js';
const router = Router();
import upload from "../middlewares/multer.middleware.js";

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
);

// Route for creating admin accounts (no file upload required)
router.route('/create-admin').post(createAdminAccount);

// Simple registration route without file upload
router.route('/simple-register').post(simpleRegisterUser);

// Alternative registration route (no multer middleware)
router.route('/register-no-upload').post(simpleRegisterUser);

// Route for creating simple user accounts (for testing - no file upload)
router.route('/create-simple-user').post(async (req, res) => {
    try {
        const { username, email, password, fullname, role } = req.body;
        
        // Validation
        if([fullname, email, username, password].some((field) => field?.trim() === "")){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        
        // Check if user already exists in both collections
        const User = (await import('../models/user.model.js')).default;
        const Admin = (await import('../models/admin.model.js')).default;
        
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        });
        
        const existedAdmin = await Admin.findOne({
            $or: [{ username }, { email }]
        });
        
        if(existedUser || existedAdmin){
            return res.status(409).json({
                success: false,
                message: "User with email or username already exists"
            });
        }
        
        // Create user with default avatar
        const user = await User.create({
            fullname,
            avatar: "https://res.cloudinary.com/dz89s3j1b/image/upload/v1735028282/default-avatar.png",
            coverImage: "",
            email,
            password,
            username: username.toLowerCase(),
            role: role || 'student'
        });
        
        // Remove password and refresh token from response
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );
        
        res.status(201).json({
            success: true,
            data: createdUser,
            message: "User created successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
});

export default router;
