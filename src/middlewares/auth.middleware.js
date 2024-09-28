//verify karega user hai ya nhi hai
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        console.log("all cookies: ", req.cookies)
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log("Token: ",token);
        console.log("Token by cookies: ", req.cookies?.accessToken)
        console.log("Token by bearer: ", req.header("Authorization")?.replace("Bearer ", ""))

        if(!token) {
            throw new ApiError(401, "Unauthourized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        console.log("decoded token: ",decodedToken._id);
        

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        
        req.user = user;
        console.log("user: ",user);
        
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})