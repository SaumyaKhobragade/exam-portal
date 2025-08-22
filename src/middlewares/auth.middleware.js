import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Owner from "../models/owner.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Try to find user in Owner collection first (highest priority)
        let user = await Owner.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (!user) {
            // Try Admin collection
            user = await Admin.findById(decodedToken?._id).select("-password -refreshToken");
        }
        
        if (!user) {
            // Try User collection
            user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        }

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

// Middleware to verify if user is an owner
export const verifyOwner = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const owner = await Owner.findById(decodedToken?._id).select("-password -refreshToken");

        if (!owner) {
            throw new ApiError(403, "Access denied. Owner privileges required.");
        }

        req.user = owner;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

// Middleware to verify if user is an admin or owner
export const verifyAdminOrOwner = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Try Owner first
        let user = await Owner.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (!user) {
            // Try Admin
            user = await Admin.findById(decodedToken?._id).select("-password -refreshToken");
        }

        if (!user) {
            throw new ApiError(403, "Access denied. Admin or Owner privileges required.");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
