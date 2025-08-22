import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Owner from "../models/owner.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Enhanced session validation middleware
export const validateSession = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return handleUnauthenticated(req, res);
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Find user and verify refresh token still exists (not logged out)
        let user = null;
        let userModel = null;

        // Check Owner first
        user = await Owner.findById(decodedToken?._id).select("-password");
        if (user) {
            userModel = "owner";
        } else {
            // Check Admin
            user = await Admin.findById(decodedToken?._id).select("-password");
            if (user) {
                userModel = "admin";
            } else {
                // Check User
                user = await User.findById(decodedToken?._id).select("-password");
                if (user) {
                    userModel = "user";
                }
            }
        }

        // If user not found or no refresh token (logged out), deny access
        if (!user || !user.refreshToken) {
            console.log(`Session validation failed: User ${decodedToken?._id} not found or logged out`);
            return handleUnauthenticated(req, res, true);
        }

        // Verify refresh token is still valid
        try {
            jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (refreshError) {
            console.log(`Refresh token invalid for user ${user._id}`);
            return handleUnauthenticated(req, res, true);
        }

        // Add cache control headers to prevent caching of protected pages
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        req.user = user;
        req.userModel = userModel;
        next();

    } catch (error) {
        console.log(`Session validation error: ${error.message}`);
        return handleUnauthenticated(req, res, true);
    }
});

// Helper function to handle unauthenticated requests
function handleUnauthenticated(req, res, clearCookies = false) {
    if (clearCookies) {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
    }

    // Add cache control headers
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    // Handle different request types
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
        // For browser requests, redirect to login with a message
        const redirectUrl = `/login?message=Session expired. Please login again.&redirect=${encodeURIComponent(req.originalUrl)}`;
        return res.redirect(redirectUrl);
    } else {
        // For API requests, return JSON error
        return res.status(401).json({
            success: false,
            message: "Session expired. Please login again.",
            code: "SESSION_EXPIRED"
        });
    }
}

// Middleware specifically for pages that should never be cached
export const noCacheMiddleware = (req, res, next) => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    });
    next();
};

// Enhanced owner verification with session validation
export const verifyOwnerSession = asyncHandler(async (req, res, next) => {
    try {
        await validateSession(req, res, () => {
            if (req.userModel !== 'owner') {
                return handleUnauthenticated(req, res, true);
            }
            next();
        });
    } catch (error) {
        return handleUnauthenticated(req, res, true);
    }
});

// Enhanced admin/owner verification with session validation
export const verifyAdminOrOwnerSession = asyncHandler(async (req, res, next) => {
    try {
        await validateSession(req, res, () => {
            if (req.userModel !== 'admin' && req.userModel !== 'owner') {
                return handleUnauthenticated(req, res, true);
            }
            next();
        });
    } catch (error) {
        return handleUnauthenticated(req, res, true);
    }
});

// Enhanced user verification with session validation
export const verifyUserSession = asyncHandler(async (req, res, next) => {
    try {
        await validateSession(req, res, () => {
            if (req.userModel !== 'user') {
                return handleUnauthenticated(req, res, true);
            }
            next();
        });
    } catch (error) {
        return handleUnauthenticated(req, res, true);
    }
});

// General JWT verification with session validation
export const verifyJWTSession = asyncHandler(async (req, res, next) => {
    try {
        await validateSession(req, res, next);
    } catch (error) {
        return handleUnauthenticated(req, res, true);
    }
});
