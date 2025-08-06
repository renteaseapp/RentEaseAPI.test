import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import validateRequest from '../middleware/validateRequest.js';
import { loginSchema, requestPasswordResetSchema, resetPasswordWithOtpSchema } from '../DTOs/auth.dto.js';

const router = express.Router();

// Regular auth routes
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/request-password-reset', validateRequest(requestPasswordResetSchema), AuthController.requestPasswordReset);
router.post('/reset-password-with-otp', validateRequest(resetPasswordWithOtpSchema), AuthController.resetPasswordWithOtp);

// Google OAuth routes
router.get('/google/auth-url', AuthController.getGoogleAuthUrl);
router.get('/google/callback', AuthController.googleCallback);
router.post('/google/callback', AuthController.googleCallback);
router.post('/google/verify-id-token', AuthController.verifyGoogleIdToken);

export default router; 