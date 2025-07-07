<<<<<<< HEAD
import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import validateRequest from '../middleware/validateRequest.js';
import { loginSchema, requestPasswordResetSchema, resetPasswordWithOtpSchema } from '../DTOs/auth.dto.js';

const router = express.Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);

router.post('/request-password-reset', validateRequest(requestPasswordResetSchema), AuthController.requestPasswordReset);
router.post('/reset-password-with-otp', validateRequest(resetPasswordWithOtpSchema), AuthController.resetPasswordWithOtp);

=======
import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import validateRequest from '../middleware/validateRequest.js';
import { loginSchema, requestPasswordResetSchema, resetPasswordWithOtpSchema } from '../DTOs/auth.dto.js';

const router = express.Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);

router.post('/request-password-reset', validateRequest(requestPasswordResetSchema), AuthController.requestPasswordReset);
router.post('/reset-password-with-otp', validateRequest(resetPasswordWithOtpSchema), AuthController.resetPasswordWithOtp);

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default router; 