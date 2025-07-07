import express from 'express';
import RenterController from '../controllers/renter.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js'; // or verifyJWT
import validateRequest from '../middleware/validateRequest.js';
import { rentalListingQuerySchema } from '../DTOs/rental.dto.js'; // DTO for rental listing
import renterController from '../controllers/renter.controller.js';
import { isRenter } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticateJWT);

router.get(
    '/me/dashboard',
    RenterController.getDashboard
);

router.get(
    '/me/rentals',
    validateRequest(rentalListingQuerySchema, 'query'),
    RenterController.getMyRentals
);

router.get('/rentals/:id/delivery-status', authenticateJWT, isRenter, renterController.getRentalDeliveryStatus);

export default router; 