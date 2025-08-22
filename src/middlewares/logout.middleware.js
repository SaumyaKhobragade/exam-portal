import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Owner from "../models/owner.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware for handling logout without requiring valid authentication
// This is useful when tokens might be expired or invalid
export const handleLogout = asyncHandler(async (req, res, next) => {
    try {
        // Try to get token from cookies or headers
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (token) {
            try {
                // Try to decode token and clear refresh token from database
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
                        console.log(`Logged out owner: ${user.username}`);
                    } else {
                        user = await Admin.findById(decodedToken._id);
                        if (user) {
                            await Admin.findByIdAndUpdate(
                                decodedToken._id,
                                { $unset: { refreshToken: 1 } },
                                { new: true }
                            );
                            console.log(`Logged out admin: ${user.username}`);
                        } else {
                            user = await User.findById(decodedToken._id);
                            if (user) {
                                await User.findByIdAndUpdate(
                                    decodedToken._id,
                                    { $unset: { refreshToken: 1 } },
                                    { new: true }
                                );
                                console.log(`Logged out user: ${user.username}`);
                            }
                        }
                    }
                }
            } catch (tokenError) {
                // Token is invalid, but we still want to clear cookies
                console.log('Invalid token during logout, clearing cookies anyway');
            }
        }

        // Cookie options for clearing
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };

        // Clear cookies and add cache control headers
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        
        // Add headers to prevent caching and ensure logout
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Clear-Site-Data': '"cookies", "storage", "executionContexts"'
        });

        // Check if this is a browser request or API request
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
            // For browser requests, redirect to login with success message
            return res.redirect('/login?message=Successfully logged out');
        } else {
            // For API requests, return JSON
            return res.status(200).json(
                new ApiResponse(200, {}, "Logged out successfully")
            );
        }

    } catch (error) {
        console.error('Logout middleware error:', error);
        
        // Even if there's an error, clear cookies and redirect/respond
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        
        // Add cache control headers
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return res.redirect('/login?message=Logged out');
        } else {
            return res.status(200).json(
                new ApiResponse(200, {}, "Logged out (with errors)")
            );
        }
    }
});

// Optional middleware to try to get user info before logout
// This should be used before handleLogout if you want to attempt authentication first
export const optionalAuth = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (token) {
            try {
                const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                
                // Try to find user in Owner collection first
                let user = await Owner.findById(decodedToken?._id).select("-password -refreshToken");
                
                if (!user) {
                    // Try Admin collection
                    user = await Admin.findById(decodedToken?._id).select("-password -refreshToken");
                }
                
                if (!user) {
                    // Try User collection
                    user = await User.findById(decodedToken?._id).select("-password -refreshToken");
                }

                if (user) {
                    req.user = user;
                }
            } catch (tokenError) {
                // Invalid token, but continue to logout anyway
                console.log('Invalid token in optionalAuth, continuing to logout');
            }
        }
        
        next();
    } catch (error) {
        // Continue to logout even if there's an error
        next();
    }
});
