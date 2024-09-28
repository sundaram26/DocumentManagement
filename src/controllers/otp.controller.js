import { User } from "../models/user.model.js";
import { generateOTP, isOTPExpired } from "../utils/otpGenerator.js";
import { sendOTPEmail } from "../utils/emailSending.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAndSendOTP = asyncHandler(async (email) => {

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000); 

    const user = await User.findOneAndUpdate(
        { email },
        { otp, otpExpiresAt },
        { new: true }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await sendOTPEmail(email, otp);

    return new ApiResponse(200, { message: 'OTP sent to your email' });
});

const verifyOTP = asyncHandler(async (req, res, next) => {
    try {
        console.log('Session:', req.session.userEmail);

        const email = req.session.userEmail;
        const otp = req.body.verificationCode;
        
        console.log('Email:', email);
        console.log('OTP:', otp);

        // Validate input
        if (!email || !otp) {
            return next(new ApiError(400, 'Email and OTP are required'));
        }

        const user = await User.findOne({ email });
        // console.log('User found:', user);

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Check OTP and expiry
        if (user.otp !== otp || isOTPExpired(user.otpExpiresAt)) {
            return next(new ApiError(400, 'Invalid or expired OTP'));
        }

        // Mark user as verified and clean up OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        // Destroy session and send response
        req.session.destroy(err => {
            if (err) {
                console.error('Session destroy error:', err);
                return next(new ApiError(500, 'Session cleanup failed'));
            }
            res.status(200).json(new ApiResponse(200, { message: 'OTP verified, you can now log in' }));
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        next(new ApiError(500, 'Internal Server Error'));
    }
});


const resendOTP = asyncHandler(async (req, res, next) => {

    const email = req.session.userEmail;

    // console.log('Email:', email);

    // Validate input
    if (!email) {
        return next(new ApiError(400, 'Email is required'));
    }

    const user = await User.findOne({ email }); // Assumes req.user is set after authentication
    if (!user) {
        return next(new ApiError(404, 'User not found'));
    }

    const now = new Date();
    if (user.lastVerificationEmailSent && (now - user.lastVerificationEmailSent) < 1 * 60 * 1000) {
        return next(new ApiError(429, 'Please wait before requesting a new OTP'));
    }

    await generateAndSendOTP(user.email); // Call the function to generate and send OTP

    user.lastVerificationEmailSent = now;
    await user.save();

    res.status(200).json(new ApiResponse(200, { message: 'OTP resent successfully' }));
});

export { generateAndSendOTP, verifyOTP, resendOTP };
