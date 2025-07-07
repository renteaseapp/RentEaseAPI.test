import PayoutService from '../services/payout.service.js';
import { payoutMethodSchema } from '../DTOs/payout.dto.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import validateRequest from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const PayoutController = {
    getPayoutMethods: asyncHandler(async function (req, res, next) {
        const ownerId = req.user.id;
        const result = await PayoutService.getPayoutMethods(ownerId);
        res.status(httpStatusCodes.OK).json({
            success: true,
            data: result
        });
    }),

    getPayoutMethod: asyncHandler(async function (req, res, next) {
        const ownerId = req.user.id;
        const { methodId } = req.params;
        const result = await PayoutService.getPayoutMethod(ownerId, methodId);
        res.status(httpStatusCodes.OK).json({
            success: true,
            data: result
        });
    }),

    createPayoutMethod: asyncHandler(async function (req, res, next) {
        const ownerId = req.user.id;
        const methodData = req.body;
        const result = await PayoutService.createPayoutMethod(ownerId, methodData);
        res.status(httpStatusCodes.CREATED).json({
            success: true,
            data: result
        });
    }),

    updatePayoutMethod: asyncHandler(async function (req, res, next) {
        const ownerId = req.user.id;
        const { methodId } = req.params;
        const methodData = req.body;
        const result = await PayoutService.updatePayoutMethod(
            ownerId,
            methodId,
            methodData
        );
        res.status(httpStatusCodes.OK).json({
            success: true,
            data: result
        });
    }),

    deletePayoutMethod: asyncHandler(async function (req, res, next) {
        const ownerId = req.user.id;
        const { methodId } = req.params;
        const result = await PayoutService.deletePayoutMethod(ownerId, methodId);
        res.status(httpStatusCodes.OK).json({
            success: true,
            data: result
        });
    }),

    setPrimaryPayoutMethod: asyncHandler(async function (req, res, next) {
        const ownerId = req.user.id;
        const { methodId } = req.params;
        const result = await PayoutService.setPrimaryPayoutMethod(ownerId, methodId);
        res.status(httpStatusCodes.OK).json({
            success: true,
            data: result
        });
    }),

    // Public: Get payout methods by ownerId (for renters to see owner's bank details)
    getPayoutMethodsByOwnerId: asyncHandler(async function (req, res, next) {
        const { ownerId } = req.params;
        const result = await PayoutService.getPayoutMethods(ownerId);
        // Return only public fields
        const publicFields = result.map(method => ({
            id: method.id,
            method_type: method.method_type,
            account_name: method.account_name,
            account_number: method.account_number,
            bank_name: method.bank_name,
            is_primary: method.is_primary
        }));
        res.status(httpStatusCodes.OK).json({
            success: true,
            data: publicFields
        });
    })
};

export default PayoutController; 