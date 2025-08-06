import UserModel from '../models/user.model.js';
import EmailService from './email.service.js';
import { ApiError } from '../utils/apiError.js';
import { comparePassword, hashPassword } from '../utils/password.utils.js';
import { generateToken } from '../utils/jwt.utils.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

// In-memory storage for OTPs
const otpStore = new Map();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (data.expiresAt < now) {
            otpStore.delete(email);
        }
    }
}, 5 * 60 * 1000);

const AuthService = {
    async loginUser(emailOrUsername, password) {
        const user = await UserModel.findByEmailOrUsername(emailOrUsername);

        if (!user) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Invalid credentials.");
        }

        if (!user.is_active) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "Account is deactivated.");
        }

        const isPasswordMatch = await comparePassword(password, user.password_hash);
        if (!isPasswordMatch) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Invalid credentials.");
        }

        const isAdmin = await UserModel.checkAdmin(user.id);

        await UserModel.updateLastLogin(user.id);

        // Determine user role based on admin status and other criteria
        let userRole = 'user'; // default role
        if (isAdmin) {
            userRole = 'admin';
        } else {
            // You can add logic here to determine if user is owner or renter
            // For now, we'll use a simple check - you might want to enhance this
            const userDetails = await UserModel.findById(user.id);
            if (userDetails && userDetails.role) {
                userRole = userDetails.role;
            }
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            is_admin: isAdmin,
            role: userRole, // Add role to token payload
        };
        const accessToken = generateToken(tokenPayload);

        const { password_hash, ...userResponseData } = user;
        
        return { 
            accessToken, 
            user: userResponseData,
            is_admin: isAdmin
        };
    },

    async requestPasswordReset(email) {
        try {
            const user = await UserModel.findByEmail(email);
            if (!user) {
                // Don't reveal if email exists for security
                return { message: "If your email is registered, you will receive a password reset OTP." };
            }

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Store OTP in memory with 5-minute expiration
            otpStore.set(email, {
                otp,
                userId: user.id,
                expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
            });

            // Send OTP via email
            try {
                await EmailService.sendOtpEmail(email, otp);
            } catch (error) {
                console.error('Error sending OTP email:', {
                    message: error.message,
                    stack: error.stack,
                    code: error.code,
                    details: error.details
                });
                // Remove OTP if email sending fails
                otpStore.delete(email);
                throw new ApiError(
                    httpStatusCodes.INTERNAL_SERVER_ERROR, 
                    `Failed to send OTP email: ${error.message}`
                );
            }

            return { message: "If your email is registered, you will receive a password reset OTP." };
        } catch (error) {
            console.error('Error in requestPasswordReset:', {
                message: error.message,
                stack: error.stack,
                code: error.code,
                details: error.details
            });
            
            if (error instanceof ApiError) {
                throw error;
            }
            
            throw new ApiError(
                httpStatusCodes.INTERNAL_SERVER_ERROR, 
                `Failed to process password reset request: ${error.message}`
            );
        }
    },

    async resetPasswordWithOtp(email, otp, newPassword) {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid OTP or email.");
        }

        // Get stored OTP data
        const storedData = otpStore.get(email);
        if (!storedData || storedData.userId !== user.id) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid or expired OTP.");
        }

        // Verify OTP
        if (storedData.otp !== otp || storedData.expiresAt < Date.now()) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid or expired OTP.");
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await UserModel.updatePassword(user.id, hashedPassword);

        // Remove used OTP
        otpStore.delete(email);

        return { message: "Password has been reset successfully." };
    }
};

export default AuthService; 