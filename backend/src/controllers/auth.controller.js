
import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// Generate Access Token and Refresh Token
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await userModel.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        console.log("TOKEN ERROR:", error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

// ==========================================
// REGISTER USER
// ==========================================

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, email, password, username } = req.body;

    const normalizedUsername = username?.toLowerCase().trim();
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedFullname = fullname?.trim();

    // Required fields validation
    if (
        !normalizedFullname ||
        !normalizedEmail ||
        !password ||
        !normalizedUsername ||
        !password.trim()
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // Username validation
    if (
        normalizedUsername.length < 3 ||
        normalizedUsername.length > 20
    ) {
        throw new ApiError(
            400,
            "Username must be between 3 and 20 characters"
        );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(normalizedUsername)) {
        throw new ApiError(
            400,
            "Username can only contain letters, numbers, underscore and hyphen"
        );
    }

    const hasLetter = /[a-zA-Z]/.test(normalizedUsername);
    const hasNumber = /[0-9]/.test(normalizedUsername);

    if (!hasLetter || !hasNumber) {
        throw new ApiError(
            400,
            "Username must contain at least one letter and one number"
        );
    }

    // Password validation
    if (password.length < 8) {
        throw new ApiError(
            400,
            "Password must be at least 8 characters"
        );
    }

    // Check existing user
    const existedUser = await userModel.findOne({
        $or: [
            { email: normalizedEmail },
            { username: normalizedUsername }
        ],
    });

    if (existedUser) {
        throw new ApiError(
            409,
            "User with this email or username already exists"
        );
    }

    // Avatar upload
    const avatarLocalPath = req.files?.avatar?.[0]?.path || req.file?.path;

    let avatar = null;

    if (avatarLocalPath) {
        try {
            avatar = await uploadOnCloudinary(avatarLocalPath);
        } catch (error) {
            throw new ApiError(
                502,
                error.message || "Profile picture upload failed"
            );
        }
    }

    // Create user
    const createdUser = await userModel.create({
        fullname: normalizedFullname,
        email: normalizedEmail,
        password,
        username: normalizedUsername,
        avatar: avatar?.url || "",
    });

    // Get registered user without sensitive fields
    const registeredUser = await userModel.findById(createdUser._id)
        .select("-password -refreshToken");

    if (!registeredUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            registeredUser,
            "User registered successfully"
        )
    );
});

// ==========================================
// LOGIN USER
// ==========================================

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (
        !email?.trim() ||
        !password?.trim()
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await userModel.findOne({
        email: normalizedEmail
    });

    if (!user) {
        throw new ApiError(
            404,
            "Email is incorrect or not registered"
        );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(
            401,
            "Password is incorrect"
        );
    }

  
    // Generate tokens
    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);

    // Get logged-in user
    const loggedInUser = await userModel.findById(user._id)
        .select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

// ==========================================
// GOOGLE AUTH CALLBACK
// ==========================================

export const googleAuthCallback = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5173";

    try {

        const user = req.user;

        if (!user) {
            return res.redirect(
                `${frontendUrl}/login?error=GoogleAuthFailed`
            );
        }

        const { accessToken, refreshToken } =
            await generateAccessTokenAndRefreshToken(user._id);

        return res
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .redirect(`${frontendUrl}/dashboard`);

    } catch (error) {

        console.error("Google Auth Error:", error);

        return res.redirect(
            `${frontendUrl}/login?error=ServerError`
        );
    }
};

// ==========================================
// LOGOUT USER
// ==========================================

const logoutUser = asyncHandler(async (req, res) => {

    await userModel.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    return res
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});
//    get current user

   const getCurrentUser = asyncHandler(async (req, res) => {
    
    res.status(200)
        .json(new ApiResponse(200, req.user, "user fetched successfully"))

})

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

export {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser
};
