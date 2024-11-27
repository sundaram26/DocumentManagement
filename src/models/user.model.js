import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["DMS", "Rotaract", "admin"],
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        otp: {
            type: String,
        },
        otpExpiresAt: {
            type: Date,
        },
        lastVerificationEmailSent: {  // New field
            type: Date,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String
        }
    },
    { 
        timestamps: true 
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generatePasswordResetToken = function () {
    // Generate a random reset token or a JWT
    const resetToken = jwt.sign(
        { _id: this._id },
        process.env.RESET_TOKEN_SECRET, // Use a separate secret for reset tokens
        { expiresIn: '1h' } // Set expiration time for security
    );

    // Store the token and expiration in the user's record
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration

    return resetToken;
};


export const User = mongoose.model("User", userSchema)