import crypto from 'crypto';

export const generateOTP = () => {
    // Generate a 6-digit OTP
    return crypto.randomInt(100000, 999999).toString();
};

export const isOTPExpired = (otpExpiresAt) => {
    return new Date() > otpExpiresAt;
};
