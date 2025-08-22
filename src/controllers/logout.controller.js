import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Owner from "../models/owner.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Universal logout controller that handles all user types
const logoutController = asyncHandler(async (req, res) => {
    try {
        // Try to get user from request (if middleware was used)
        let userId = req.user?._id;
        let userModel = null;

        if (userId) {
            // Determine user type by checking which model the user belongs to
            let user = await Owner.findById(userId);
            if (user) {
                userModel = Owner;
            } else {
                user = await Admin.findById(userId);
                if (user) {
                    userModel = Admin;
                } else {
                    user = await User.findById(userId);
                    if (user) {
                        userModel = User;
                    }
                }
            }

            // Clear refresh token from database if user found
            if (userModel && userId) {
                await userModel.findByIdAndUpdate(
                    userId,
                    {
                        $unset: {
                            refreshToken: 1
                        }
                    },
                    {
                        new: true
                    }
                );
            }
        } else {
            // If no user in request, try to decode token directly
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
            
            if (token) {
                try {
                    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                    
                    if (decodedToken?._id) {
                        // Try to find user in any collection and clear refresh token
                        let user = await Owner.findById(decodedToken._id);
                        if (user) {
                            await Owner.findByIdAndUpdate(
                                decodedToken._id,
                                { $unset: { refreshToken: 1 } },
                                { new: true }
                            );
                        } else {
                            user = await Admin.findById(decodedToken._id);
                            if (user) {
                                await Admin.findByIdAndUpdate(
                                    decodedToken._id,
                                    { $unset: { refreshToken: 1 } },
                                    { new: true }
                                );
                            } else {
                                user = await User.findById(decodedToken._id);
                                if (user) {
                                    await User.findByIdAndUpdate(
                                        decodedToken._id,
                                        { $unset: { refreshToken: 1 } },
                                        { new: true }
                                    );
                                }
                            }
                        }
                    }
                } catch (tokenError) {
                    console.log('Invalid token during logout, clearing cookies anyway');
                }
            }
        }

        // Cookie options for clearing
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        }

        // For browser requests, redirect to login page
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return res
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .redirect('/login');
        }

        // For API requests, return JSON response
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully"));

    } catch (error) {
        console.error('Logout error:', error);
        
        // Clear cookies anyway and redirect/respond
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        }

        if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return res
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .redirect('/login');
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "Logged out (with errors)"));
    }
});

// Simple logout for direct use in routes
const simpleLogout = (req, res) => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    };

    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);
    
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
        res.redirect('/login');
    } else {
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
};

export { 
    logoutController,
    simpleLogout
};
