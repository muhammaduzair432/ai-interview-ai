import  userModel  from "../models/user.model.js";
import  ApiError  from "../utils/Apierror.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullname } = req.body;

        if (!username || !email || !password || !fullname) {
            throw new ApiError(400, "All fields are required");
        }
        const existingUser = await userModel.findOne({ $or: [{ username }, { email }] }); 
        if (existingUser) {
            throw new ApiError(400, "Username or email already exists");
        }
        const avatarlocalpath = req.file ? req.file.path 
        let avatar=null
        if(avatarlocalpath){