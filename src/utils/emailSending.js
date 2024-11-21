import nodemailer from 'nodemailer';
import { ApiError } from './ApiError.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
                <p>Hello,</p>
                <p>Your One-Time Password (OTP) is <strong style="font-size: 20px; color: #007BFF;">${otp}</strong>.</p>
                <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <p>Thank you!</p>
                <p>Best Regards,<br>Aaghaz</p>
            </div>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log(`OTP email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending OTP email: ${error.message}`);
        throw new ApiError('Failed to send OTP email');
    }
};
export const sendResetPasswordLinkEmail = async (email, resetUrl) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
            <p>Hello,</p>
            <p>We received a request to reset the password associated with this email. If you made this request, please reset your password by clicking the link below:</p>
            <p>
                <a href="${resetUrl}" style="color: #007BFF; text-decoration: none;">Reset Password</a>
            </p>
            <p>If you did not request a password reset, please ignore this email or contact our support team if you have concerns.</p>
            <p>Thank you,</p>
            <p>Aaghaz</p>
        </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log(`Password reset link sent to ${email}`);
    } catch (error) {
        console.error(`Error sending reset link email: ${error.message}`);
        throw new ApiError('Failed to send reset link to email');
    }
};

