import  jwt  from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { userModel } from "../models/user.model.js"
import  {ApiError}  from "../utils/Apierror.js";


export const verifyJwt=asyncHandler(async(req, _ ,next)=>{
try {
        const token= req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", ""  );
//         console.log("TOKEN:", token);
//         console.log("req.cookies:", req.cookies);
// console.log("req.headers:", req.header);

        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
        
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user= await userModel.findById(decodedToken._id).select("-password -refreshTokken")
        if(!user){
            throw new ApiError(401,"invalid access token")
        }
        req.user=user
        next()
} catch (error) {
    throw new ApiError(401,error.message ||"invalid accesss token")
    
}

}) 