import express from 'express';
import RentalController from '../controllers/rental.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import validateRequest from '../middleware/validateRequest.js';
import { uploadSingleFile, uploadMultipleFields } from '../middleware/fileUpload.js';
import {
    createRentalSchema,
    rejectRentalSchema,
    cancelRentalSchema,
    paymentProofSchema,
    returnProcessSchema,
    initiateReturnSchema
} from '../DTOs/rental.dto.js';
import { initiatePaymentSchema } from '../DTOs/payment.dto.js';

const router = express.Router();

// All rental operations require authentication
router.use(authenticateJWT);

router.post(
    '/', // POST to /api/rentals to create a new rental request
    validateRequest(createRentalSchema, 'body'),
    RentalController.createRentalRequest
);

// Get specific rental details (for owner or renter)
router.get(
    '/:rental_id_or_uid',
    RentalController.getRentalDetails // Authorization is handled in service
);

// Owner approves rental
router.put(
    '/:rental_id_or_uid/approve',
    RentalController.approveRental // Owner authorization in service
);

// Owner rejects rental
router.put(
    '/:rental_id_or_uid/reject',
    validateRequest(rejectRentalSchema, 'body'),
    RentalController.rejectRental // Owner authorization in service
);

// Renter uploads payment proof
router.put(
    '/:rental_id_or_uid/payment-proof',
    uploadSingleFile('payment_proof_image'), // Field name for the image file
    validateRequest(paymentProofSchema, 'body'), // Validates transaction_time, amount_paid
    RentalController.uploadPaymentProof // Renter authorization in service
);

// Renter initiates payment via gateway
router.post(
    '/:rental_id_or_uid/initiate-payment',
    validateRequest(initiatePaymentSchema, 'body'),
    RentalController.initiateGatewayPayment // Renter authorization in service
);

// Frontend checks payment status
router.get(
    '/:rental_id_or_uid/payment-status',
    RentalController.getRentalPaymentStatus // User authorization (renter/owner) in service
);

// Renter cancels rental
router.put(
    '/:rental_id_or_uid/cancel',
    validateRequest(cancelRentalSchema, 'body'),
    RentalController.cancelRentalByRenter // Renter authorization in service
);

// Renter initiates the return process
router.post(
    '/:rental_id_or_uid/initiate-return',
    uploadSingleFile('shipping_receipt_image'), // Optional field for shipping receipt
    validateRequest(initiateReturnSchema, 'body'),
    RentalController.initiateReturnHandler
);

// Owner processes return
router.put(
    '/:rental_id_or_uid/return',
    uploadMultipleFields([ // For return condition images
        { name: 'return_condition_images[]', maxCount: 5 } // Example: max 5 images
    ]),
    validateRequest(returnProcessSchema, 'body'),
    RentalController.processReturnHandler // Owner authorization in service
);

// Owner verifies payment
router.put(
    '/:rental_id_or_uid/verify-payment',
    RentalController.verifyRentalPayment // Owner authorization in service
);

// Endpoint เฉพาะสำหรับข้อมูลการคืนสินค้า
router.get(
    '/:rental_id_or_uid/return',
    RentalController.getRentalReturnDetails
);

// Owner/Admin verifies a payment slip via a 3rd party service
router.post(
    '/:rental_id_or_uid/verify-slip',
    // No body validation needed, just the ID from params
    RentalController.verifyPaymentSlip
);

// Owner/Admin mark payment slip as invalid
router.post('/:rental_id_or_uid/mark-slip-invalid', RentalController.markSlipInvalid);

// Renter sets actual pickup time
router.put(
    '/:rental_id_or_uid/actual-pickup',
    RentalController.setActualPickupTime
);

// Other rental routes (GET specific rental, update status, etc.) will be added later

export default router; 