import ProductService from '../services/product.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import validateRequest from '../middleware/validateRequest.js';
import { getProductReviewsQuerySchema } from '../DTOs/product.dto.js';
import ReviewService from '../services/review.service.js';
import { createReviewSchema } from '../DTOs/review.dto.js';
import Joi from 'joi';

const ReviewController = {
    getProductReviews: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const result = await ProductService.getProductReviews(productId, req.query);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, result)
        );
    }),
    // POST /reviews
    createReview: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const review = await ReviewService.createReview(userId, req.body);
        res.status(httpStatusCodes.CREATED).json(new ApiResponse(httpStatusCodes.CREATED, review, 'Review created successfully.'));
    }),
    // GET /reviews/:rentalId
    getReviewByRental: asyncHandler(async (req, res) => {
        const { rentalId } = req.params;
        const review = await ReviewService.getRentalReview(rentalId);
        if (!review) {
            return res.status(httpStatusCodes.NOT_FOUND).json(new ApiResponse(httpStatusCodes.NOT_FOUND, null, 'Review not found.'));
        }
        res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, review));
    }),
    // PUT /reviews/:rentalId
    updateReview: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { rentalId } = req.params;
        // validate body (ใช้ schema เดิมแต่ไม่ required)
        const schema = Joi.object({
            rating_product: Joi.number().integer().min(1).max(5),
            rating_owner: Joi.number().integer().min(1).max(5),
            comment: Joi.string().trim().max(1000).allow(null, '')
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            return res.status(httpStatusCodes.BAD_REQUEST).json(new ApiResponse(httpStatusCodes.BAD_REQUEST, null, error.details.map(e => e.message).join(', ')));
        }
        const updated = await ReviewService.updateReview(userId, rentalId, value);
        res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, updated, 'Review updated successfully.'));
    }),
    // DELETE /reviews/:rentalId
    deleteReview: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { rentalId } = req.params;
        await ReviewService.deleteReview(userId, rentalId);
        res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, null, 'Review deleted successfully.'));
    })
};

export default ReviewController; 