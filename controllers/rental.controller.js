import RentalService from '../services/rental.service.js';
import PaymentService from '../services/payment.service.js'; // For gateway payments
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import { ApiError } from '../utils/apiError.js';
// DTO for createRental will be used in the route

const RentalController = {
    createRentalRequest: asyncHandler(async (req, res) => {
        const renterId = req.user.id; // User making the request is the renter
        const newRental = await RentalService.createRentalRequest(renterId, req.validatedData);
        res.status(httpStatusCodes.CREATED).json(
            new ApiResponse(httpStatusCodes.CREATED, { data: newRental }, "Rental request submitted successfully.")
        );
    }),

    // --- New Handlers for Day 4 ---
    approveRental: asyncHandler(async (req, res) => {
        const ownerId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const updatedRental = await RentalService.approveRentalRequest(rental_id_or_uid, ownerId);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: updatedRental }, "Rental approved successfully.")
        );
    }),

    rejectRental: asyncHandler(async (req, res) => {
        const ownerId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const { reason } = req.validatedData; // From rejectRentalSchema
        const updatedRental = await RentalService.rejectRentalRequest(rental_id_or_uid, ownerId, reason);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: updatedRental }, "Rental rejected successfully.")
        );
    }),

    uploadPaymentProof: asyncHandler(async (req, res) => {
        const renterId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const paymentDetails = req.validatedData || {}; // DTO for transaction_time, amount_paid
        
        if (!req.file) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Payment proof image file is required.");
        }

        const updatedRental = await RentalService.submitPaymentProof(rental_id_or_uid, renterId, req.file, paymentDetails);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: updatedRental }, "Payment proof submitted successfully.")
        );
    }),

    initiateGatewayPayment: asyncHandler(async (req, res) => {
        const renterId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const { payment_method_type } = req.validatedData; // From initiatePaymentSchema
        const result = await PaymentService.initiateGatewayPayment(rental_id_or_uid, renterId, payment_method_type);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, result, result.message)
        );
    }),

    getRentalPaymentStatus: asyncHandler(async (req, res) => {
        const userId = req.user.id; // Can be renter or owner
        const { rental_id_or_uid } = req.params;
        const statusInfo = await RentalService.checkRentalPaymentStatus(rental_id_or_uid, userId);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, statusInfo)
        );
    }),

    cancelRentalByRenter: asyncHandler(async (req, res) => {
        const renterId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const { reason } = req.validatedData; // From cancelRentalSchema
        const updatedRental = await RentalService.cancelRentalByUser(rental_id_or_uid, renterId, reason);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: updatedRental }, "Rental cancelled successfully.")
        );
    }),

    initiateReturnHandler: asyncHandler(async (req, res) => {
        const renterId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const returnDetails = req.validatedData;
        const receiptImage = req.file; // From uploadSingleFile middleware

        const updatedRental = await RentalService.initiateReturn(
            rental_id_or_uid,
            renterId,
            returnDetails,
            receiptImage
        );
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: updatedRental }, "Return process initiated successfully. Owner has been notified.")
        );
    }),

    getRentalDetails: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const rentalDetails = await RentalService.getRentalDetailsForUser(rental_id_or_uid, userId);
        // Map province name for delivery_address if present
        if (rentalDetails && rentalDetails.delivery_address && rentalDetails.delivery_address.province) {
            rentalDetails.delivery_address.province_name = rentalDetails.delivery_address.province.name_th;
        }
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: rentalDetails })
        );
    }),

    processReturnHandler: asyncHandler(async (req, res) => {
        const ownerId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const imageFiles = req.files ? req.files['return_condition_images[]'] : [];
        
        const updatedRental = await RentalService.processReturn(
            rental_id_or_uid, 
            ownerId, 
            req.validatedData, 
            imageFiles
        );
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: updatedRental }, "Return processed successfully.")
        );
    }),

    verifyRentalPayment: asyncHandler(async (req, res) => {
        const ownerId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const { amount_paid } = req.body || {};
        const updatedRental = await RentalService.verifyRentalPaymentByOwner(rental_id_or_uid, ownerId, { amount_paid });
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: updatedRental }, "Payment verified successfully.")
        );
    }),

    verifyPaymentSlip: asyncHandler(async (req, res) => {
        const ownerId = req.user.id; // Or admin ID
        const { rental_id_or_uid } = req.params;

        const result = await RentalService.verifySlipWithThirdParty(rental_id_or_uid, ownerId);

        res.status(httpStatusCodes.OK).json(
            new ApiResponse(
                httpStatusCodes.OK,
                result,
                "Payment slip verification processed successfully."
            )
        );
    }),

    getRentalReturnDetails: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const rental = await RentalService.getRentalDetailsForUser(rental_id_or_uid, userId);
        if (!rental) throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        // ดึงข้อมูล return และ rental ที่เกี่ยวข้องอย่างละเอียด
        const returnInfo = {
            rental_id: rental.id,
            rental_uid: rental.rental_uid,
            rental_status: rental.rental_status,
            start_date: rental.start_date,
            end_date: rental.end_date,
            actual_return_time: rental.actual_return_time,
            return_method: rental.return_method,
            return_details: rental.return_details,
            return_initiated_at: rental.return_initiated_at,
            return_shipping_receipt_url: rental.return_shipping_receipt_url,
            return_condition_status: rental.return_condition_status,
            return_condition_image_urls: rental.return_condition_image_urls,
            notes_from_renter: rental.notes_from_renter,
            notes_from_owner_on_return: rental.notes_from_owner_on_return,
            initiate_claim: rental.initiate_claim,
            product: rental.product ? {
                id: rental.product.id,
                title: rental.product.title,
                slug: rental.product.slug,
                primary_image: rental.product.primary_image?.image_url || null
            } : null,
            renter: rental.renter ? {
                first_name: rental.renter.first_name,
                email: rental.renter.email
            } : null,
            owner: rental.owner ? {
                first_name: rental.owner.first_name,
                email: rental.owner.email
            } : null,
            payment_status: rental.payment_status,
            payment_proof_url: rental.payment_proof_url,
            payment_verified_at: rental.payment_verified_at,
            payment_verification_notes: rental.payment_verification_notes,
            created_at: rental.created_at,
            updated_at: rental.updated_at
        };
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: returnInfo })
        );
    }),

    // Owner/Admin mark payment slip as invalid
    markSlipInvalid: asyncHandler(async (req, res) => {
        const ownerId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const result = await RentalService.markSlipInvalid(rental_id_or_uid, ownerId);
        res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, result, 'Marked slip as invalid.'));
    }),

    setActualPickupTime: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { rental_id_or_uid } = req.params;
        const { actual_pickup_time } = req.body;
        const updatedRental = await RentalService.setActualPickupTime(rental_id_or_uid, userId, actual_pickup_time);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: updatedRental }, "Actual pickup time updated successfully.")
        );
    })
};

export default RentalController; 