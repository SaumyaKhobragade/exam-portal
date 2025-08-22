import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import User from "../models/user.model.js"
import Admin from "../models/admin.model.js"
import Owner from "../models/owner.model.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (user, userType = 'user') => {
    try {
        const accessToken = user.generateAccess();
        const refreshToken = user.generateRefresh();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Priority: Owner -> Admin -> User
    let user = await Owner.findOne({ email });
    let userType = 'owner';
    let ModelClass = Owner;

    // If not found in Owner, try Admin collection
    if (!user) {
        user = await Admin.findOne({ email });
        userType = 'admin';
        ModelClass = Admin;
    }

    // If not found in Admin, try User collection
    if (!user) {
        user = await User.findOne({ email });
        userType = 'user';
        ModelClass = User;
    }

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user, userType);

    const loggedInUser = await ModelClass.findById(user._id).select("-password -refreshToken");

    // Determine redirect URL based on user type
    let redirectTo;
    switch(userType) {
        case 'owner':
            redirectTo = '/owner-dashboard';
            break;
        case 'admin':
            redirectTo = '/admin-dashboard';
            break;
        default:
            redirectTo = '/user-dashboard';
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                    userType,
                    redirectTo
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
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

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // Try to find in Owner first, then Admin, then User
        let user = await Owner.findById(decodedToken?._id);
        let userType = 'owner';
        let ModelClass = Owner;

        if (!user) {
            user = await Admin.findById(decodedToken?._id);
            userType = 'admin';
            ModelClass = Admin;
        }

        if (!user) {
            user = await User.findById(decodedToken?._id);
            userType = 'user';
            ModelClass = User;
        }

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user, userType);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

export { 
    loginUser,
    logoutUser,
    refreshAccessToken
};
