import  userModel  from "../models/user.model.js";
import  ApiError  from "../utils/Apierror.js";
import ApiResponse from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import asyncHandler from "../utils";





const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await userModel.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        console.log("TOKEN ERROR:", error);
        throw new ApiError(500, "Something went wrong while generating referesh and access token")

    }
}



// register user 
const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password, username } = req.body;
    const normalizedUsername = username?.toLowerCase().trim();
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedFullname = fullname?.trim();

    if (
        [normalizedFullname, normalizedEmail, password, normalizedUsername].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required");
    }

    // ================= USERNAME VALIDATION =================

    // 1. Username must be 3-20 characters
    if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
        throw new ApiError(400, "username must be between 3 and 20 characters");
    }

    // 2. Username can only contain letters, numbers, _ and -
    if (!/^[a-zA-Z0-9_-]+$/.test(normalizedUsername)) {
        throw new ApiError(
            400,
            "username can only contain letters, numbers, underscore (_) and hyphen (-)"
        );
    }

    // 3. Username must contain at least one letter and at least one number
    const hasLetter = /[a-zA-Z]/.test(normalizedUsername);
    const hasNumber = /[0-9]/.test(normalizedUsername);

    if (!hasLetter || !hasNumber) {
        throw new ApiError(
            400,
            "username must contain at least one letter and one number"
        );
    }

    // ================= PASSWORD VALIDATION =================

    // Password must be at least 8 characters
    if (password.length < 8) {
        throw new ApiError(400, "password must be at least 8 characters");
    }

    // ================= EXISTING CODE =================

    const existedUser = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (existedUser) {
        throw new ApiError(409, "user with username, email already exists");
    }
    
    const avatarLocalPath = req.file?.buffer || req.file?.path;
    let avatar = null;
    if (avatarLocalPath) {
        avatar = await uploadOnCloudinary(avatarLocalPath);
    }
    
 



    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken",
    );
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user ");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdUser,
                "user registerd successfully",
            ),
        );
});;



// login section
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "user not found with this email");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  if (!user.isVerified) {
    return res.status(403).json({
      message:
        "Account not verified. Please verify your account before logging in.",
    });
  }
  const { accessToken, refreshToken } =
    await generateaccessTokenAndRefreshToken(user._id);

  const logggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  logggedInUser.refreshToken = refreshToken;
  const updatedUser = await logggedInUser.save({ validateBeforeSave: false });
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none"
    // by enabling these options you can oly modify cookies from server  and can not modify from frontend
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: updatedUser, accessToken, refreshToken },
        "User logged In Successfully",
      ),
    );
});

// ==========================================
// 3. GOOGLE AUTH CALLBACK CONTROLLER
// ==========================================
export const googleAuthCallback = async (req, res) => {
    try {
        // req.user is populated by Passport.js after a successful Google login
        const user = req.user;

        if (!user) {
            return res.redirect("http://localhost:5173/login?error=GoogleAuthFailed");
        }

        // Generate tokens using your custom model methods
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        // Redirect user back to frontend dashboard with tokens in cookies, 
        // or pass them via query parameters if your frontend prefers reading them directly.
        return res
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .redirect("http://localhost:5173/dashboard");
    } catch (error) {
        return res.redirect("http://localhost:5173/login?error=ServerError");
    }
};
//   logout  


const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user_id, {
        $set: { refreshToken: undefined }
    }
        , {
            // the new instance will update the current value
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out successfully"))


})

export { registerUser, loginUser, logoutUser };