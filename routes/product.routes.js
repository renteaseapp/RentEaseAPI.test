import express from 'express';
import ProductController from '../controllers/product.controller.js';
import ReviewController from '../controllers/review.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import validateRequest from '../middleware/validateRequest.js';
import { uploadMultipleFields } from '../middleware/fileUpload.js';
import { getProductsQuerySchema, getProductReviewsQuerySchema } from '../DTOs/product.dto.js';

const router = express.Router();

// Public routes
router.get('/', validateRequest(getProductsQuerySchema, 'query'), ProductController.getAllProducts);
router.get('/search', validateRequest(getProductsQuerySchema, 'query'), ProductController.getAllProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/popular', ProductController.getTopRentedProducts);
router.get('/top-rented', ProductController.getTopRentedProducts);

// Product creation and update routes (protected)
router.post('/', authenticateJWT, uploadMultipleFields([{ name: 'images[]', maxCount: 10 }]), ProductController.createProduct);
router.put('/:slugOrId', authenticateJWT, uploadMultipleFields([{ name: 'new_images[]', maxCount: 10 }]), ProductController.updateProduct);

// Product reviews (public)
router.get('/:productId/reviews', validateRequest(getProductReviewsQuerySchema, 'query'), ReviewController.getProductReviews);

// Product detail route (public) - must come after other specific routes
router.get('/:slugOrId', ProductController.getProductByIdOrSlug);
router.get('/:productId/availability/:yearMonth', ProductController.getProductAvailability);

// Admin/Maintenance routes (protected)
router.post('/sync-quantities', authenticateJWT, ProductController.syncProductQuantities);
router.post('/:productId/sync-quantity', authenticateJWT, ProductController.syncSingleProductQuantity);

export default router;