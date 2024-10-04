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
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log(`OTP email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending OTP email: ${error.message}`);
        throw new ApiError('Failed to send OTP email');
    }
};
