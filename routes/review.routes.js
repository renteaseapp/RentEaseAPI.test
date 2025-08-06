import express from 'express';
import ReviewController from '../controllers/review.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import validateRequest from '../middleware/validateRequest.js';
import { createReviewSchema } from '../DTOs/review.dto.js';

const router = express.Router();

// All review operations require authentication
router.use(authenticateJWT);

// POST /reviews - Create a new review
router.post('/', validateRequest(createReviewSchema, 'body'), ReviewController.createReview);

// GET /reviews/:rentalId - Get review by rental ID
router.get('/:rentalId', ReviewController.getReviewByRental);

// PUT /reviews/:rentalId - Update review
router.put('/:rentalId', ReviewController.updateReview);

// DELETE /reviews/:rentalId - Delete review
router.delete('/:rentalId', ReviewController.deleteReview);

// GET /products/:productId/reviews - Get product reviews (this should be in product routes)
// router.get('/products/:productId', ReviewController.getProductReviews);

// Admin route to update all product rating stats
router.post('/admin/update-all-stats', ReviewController.updateAllProductRatingStats);

export default router; 