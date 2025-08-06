import express from 'express';
import settingsController from '../controllers/settings.controller.js';

const router = express.Router();

// Public endpoints for fee settings (no authentication required)
router.get('/fee-settings', settingsController.getPublicFeeSettings);
router.post('/calculate-fees', settingsController.calculateEstimatedFees);

export default router; 