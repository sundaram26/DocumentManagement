import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import { generateAndSendOTP } from "./otp.controller.js";
import { sendResetPasswordLinkEmail } from "../utils/emailSending.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })


        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

//register
const registerUser = asyncHandler(async (req, res) => {
    const {firstName, lastName, email, role, password } = req.body
    // console.log("register: ", req.body)

    if(
        [firstName, lastName, email, role, password ].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({email})

    if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        firstName,
        lastName,
        role,
        email,
        password,
        // isVerified,
        // isApproved,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    await generateAndSendOTP(user.email);
    
    // stores user email in session while registration
    req.session.userEmail = email
    req.session.save();

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

// login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // console.log('Request Body:', req.body);

    if(
        [ email, password ].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({ email })

    
    if (!user) {
        throw new ApiError(404, "User doesn't exists")
    }

    const response = {
        isVerified: user.isVerified,
        isApproved: user.isApproved,
    };
    
    // console.log('Backend Login Response:', response); // Log response
    // console.log('User is verified:', user.isVerified);
    // console.log('Negated isVerified:', !user?.isVerified);
    
    
    if(!user?.isVerified){
        // console.log("email: ", user.email)
        req.session.userEmail = email
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).send('Server Error');
            }
        })
        // console.log('Stored in session (user is not verified):', req.session.userEmail);
        // Store data
        // localStorage.setItem('userEmail', user.email);
        await generateAndSendOTP(user.email);
        return res
                .status(200)
                .json(
                    new ApiResponse(
                        201, 
                        { response },
                        "User email is not verified"
                    )
                )
        // throw new ApiError(401, "User email is not verified")
    }

    if(!user?.isApproved){
        return res
                .status(200)
                .json(
                    new ApiResponse(
                        201, 
                        { response },
                        "User's request is not accepted till now."
                    )
                )
        // console.log("response: ", response)
        // throw new ApiError(401, "User request is not accepted till now")
    }

    // console.log("password: ", password)
    const isPasswordValid = await user.isPasswordCorrect(password)
    // console.log("password valid or not: ", isPasswordValid)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const accessTokenOtions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 60 * 60 * 1000
    }
    const refreshTokenOtions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }

    return res
            .status(200)
            .cookie("accessToken", accessToken, accessTokenOtions)
            .cookie("refreshToken", refreshToken, refreshTokenOtions)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        response,
                        accessToken,
                        refreshToken
                    },
                    "User logged in successfully",
                    
                )
            )
})

// forgot password
const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, "No account found with this email address");
        }

        // console.log("User from forgot password: ", user)

        // Generate a reset token and save it to the user record
        const resetToken = user.generatePasswordResetToken(); 
        // console.log("Reset Token: ", resetToken)
        await user.save();

        // Generate the reset URL to include in the email
        const resetUrl = `https://aaghazbirla.netlify.app/auth/reset-password/${resetToken}`;
        // console.log("reset Url: ", resetUrl)

        // Send the reset password link via email
        await sendResetPasswordLinkEmail(email, resetUrl);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { email },
                    "A password reset link has been sent to your email. Please check your inbox."
                )
            );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to process password reset request");
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params; // Get the token from the URL
    const { password } = req.body; // New password

    // Verify the token and find the user associated with it
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET); // Use your reset token secret
    } catch (error) {
        console.error("decode jwt error: ", error.message)
        throw new ApiError(400, "Invalid or expired token");
    }

    const user = await User.findById(decoded._id); // Get the user by ID

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's password (the pre-save hook will hash the password)
    user.password = password; // Set the new password directly

    await user.save(); // Save the updated user document

    return res.status(200).json({ message: 'Password has been reset successfully' });
});



// logout
const logoutUser = asyncHandler ( async (req, res) => {
    //cookies hata do
    //refresh token hata do

    await User.findByIdAndUpdate(
        req.user.id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }

    return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out"))
})

//Fetch User Profile
const checkAuth = asyncHandler(async (req, res) => {
    
    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    try {
        const user = await User.findById(req.user._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            user: user
                        },
                        "User logged in successfully", 
                    )
                )
    } catch (error) {
        throw new ApiError(500, error.message || "Error fetching user profile");
    }
});

// refresh Access token
const refreshAccessToken = asyncHandler( async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthourized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
        
        
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
        
        const accessTokenOtions = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 60 * 60 * 1000
        }

        const refreshTokenOtions = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }

        return res
                .status(200)
                .cookie("accessToken", accessToken, accessTokenOtions)
                .cookie("refreshToken", newRefreshToken, refreshTokenOtions)
                .json(
                    new ApiResponse(
                        200,
                        {
                            accessToken,
                            refreshToken: newRefreshToken
                        },
                        "Access token refreshed"
                    )
                )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    logoutUser,
    refreshAccessToken,
    checkAuth,
}