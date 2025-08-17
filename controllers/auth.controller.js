// Authentication controller 
import AuthService from '../services/auth.service.js';
import googleAuthService from '../services/googleAuth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import { generateToken } from '../utils/jwt.utils.js';
import UserModel from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';

const AuthController = {
    login: asyncHandler(async (req, res) => {
        const { email_or_username, password } = req.body;
        const result = await AuthService.loginUser(email_or_username, password);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(
                httpStatusCodes.OK, 
                { access_token: result.accessToken, user: result.user, is_admin: result.is_admin }, 
                "Login successful."
            )
        );
    }),

    // Google OAuth endpoints
    getGoogleAuthUrl: asyncHandler(async (req, res) => {
        const authUrl = googleAuthService.getAuthUrl();
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { authUrl }, "Google auth URL generated successfully.")
        );
    }),

    googleCallback: asyncHandler(async (req, res) => {
        const { code } = req.query;
        if (!code) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Authorization code is required");
        }

        const result = await googleAuthService.handleCallback(code);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(
                httpStatusCodes.OK, 
                { access_token: result.accessToken, user: result.user, is_admin: result.is_admin }, 
                "Google login successful."
            )
        );
    }),

    // Google ID token verification (for mobile apps)
    verifyGoogleIdToken: asyncHandler(async (req, res) => {
        const { idToken } = req.body;
        if (!idToken) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "ID token is required");
        }

        const payload = await googleAuthService.verifyIdToken(idToken);
        const user = await googleAuthService.findOrCreateUser(payload);
        
        const isAdmin = await UserModel.checkAdmin(user.id);
        const tokenPayload = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            is_admin: isAdmin,
            role: isAdmin ? 'admin' : 'user',
        };
        const accessToken = generateToken(tokenPayload);

        const { password_hash, ...userResponseData } = user;

        res.status(httpStatusCodes.OK).json(
            new ApiResponse(
                httpStatusCodes.OK, 
                { access_token: accessToken, user: userResponseData, is_admin: isAdmin }, 
                "Google ID token verification successful."
            )
        );
    }),

    // Google OAuth callback สำหรับ frontend
    googleCallback: asyncHandler(async (req, res) => {
        console.log('🔍 Google callback received');
        console.log('🔍 Request body:', req.body);
        console.log('🔍 Request headers:', req.headers);
        console.log('🔍 Content-Type:', req.headers['content-type']);
        
        const { code, userInfo } = req.body;
        
        console.log('🔍 Extracted code:', code);
        console.log('🔍 Extracted userInfo:', userInfo);
        
        if (userInfo) {
            console.log('🔍 Processing userInfo from frontend');
            try {
                // ถ้ามี userInfo จาก frontend ให้ใช้ข้อมูลนั้น
                const user = await googleAuthService.findOrCreateUser(userInfo);
                console.log('🔍 User processed:', user);
            
            const isAdmin = await UserModel.checkAdmin(user.id);
            console.log('🔍 Is admin:', isAdmin);
            const tokenPayload = {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                is_admin: isAdmin,
                role: isAdmin ? 'admin' : 'user',
            };
            const accessToken = generateToken(tokenPayload);
            console.log('🔍 Token generated');

            // อัปเดต last login
            await UserModel.updateLastLogin(user.id);

            const { password_hash, ...userResponseData } = user;
            
            console.log('🔍 Sending response to frontend:', {
                access_token: accessToken ? 'present' : 'missing',
                user: userResponseData,
                is_admin: isAdmin,
                verification_status: userResponseData.id_verification_status
            });

            res.status(httpStatusCodes.OK).json(
                new ApiResponse(
                    httpStatusCodes.OK, 
                    { access_token: accessToken, user: userResponseData, is_admin: isAdmin }, 
                    "Google login successful."
                )
            );
            } catch (error) {
                console.error('❌ Error in Google callback:', error);
                throw error;
            }
        } else if (code) {
            console.log('🔍 Processing code from OAuth flow');
            // ถ้ามี code ให้ใช้ OAuth flow ปกติ
            const result = await googleAuthService.handleCallback(code);
            res.status(httpStatusCodes.OK).json(
                new ApiResponse(
                    httpStatusCodes.OK, 
                    { access_token: result.accessToken, user: result.user, is_admin: result.is_admin }, 
                    "Google login successful."
                )
            );
        } else {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Either code or userInfo is required");
        }
    }),

    requestPasswordReset: asyncHandler(async (req, res) => {
        const { email } = req.body;
        const result = await AuthService.requestPasswordReset(email);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, result, result.message)
        );
    }),

    resetPasswordWithOtp: asyncHandler(async (req, res) => {
        const { email, otp, new_password } = req.body;
        const result = await AuthService.resetPasswordWithOtp(email, otp, new_password);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, result, result.message)
        );
    }),
};

export default AuthController; 