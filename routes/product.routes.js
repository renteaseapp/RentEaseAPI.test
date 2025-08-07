import express from 'express';
import ProductController from '../controllers/product.controller.js';
import ReviewController from '../controllers/review.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import validateRequest from '../middleware/validateRequest.js';
import { uploadMultipleFields } from '../middleware/fileUpload.js';
import parseSpecifications from '../middleware/parseSpecifications.js';
import { getProductsQuerySchema, getProductReviewsQuerySchema, createProductSchema, updateProductSchema, updateProductStatusSchema } from '../DTOs/product.dto.js';

const router = express.Router();

// Public routes
router.get('/', validateRequest(getProductsQuerySchema, 'query'), ProductController.getAllProducts);
router.get('/search', validateRequest(getProductsQuerySchema, 'query'), ProductController.getAllProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/popular', ProductController.getTopRentedProducts);
router.get('/top-rented', ProductController.getTopRentedProducts);
router.get('/:slugOrId', ProductController.getProductByIdOrSlug);
router.get('/:productId/availability/:yearMonth', ProductController.getProductAvailability);

// Product reviews (public)
router.get('/:productId/reviews', validateRequest(getProductReviewsQuerySchema, 'query'), ReviewController.getProductReviews);

// Owner routes (protected)
router.post('/', 
    authenticateJWT, 
    uploadMultipleFields([{ name: 'images[]', maxCount: 10 }]),
    parseSpecifications, // Parse specifications before validation
    validateRequest(createProductSchema, 'body'), 
    ProductController.createProduct
);

router.put('/:productId', 
    authenticateJWT, 
    uploadMultipleFields([{ name: 'new_images[]', maxCount: 10 }]),
    parseSpecifications, // Parse specifications before validation
    validateRequest(updateProductSchema, 'body'), 
    ProductController.updateProduct
);

router.put('/:productId/status', 
    authenticateJWT, 
    validateRequest(updateProductStatusSchema, 'body'), 
    ProductController.updateProductStatus
);

router.delete('/:productId', 
    authenticateJWT, 
    ProductController.deleteProduct
);

// Admin/Maintenance routes (protected)
router.post('/sync-quantities', authenticateJWT, ProductController.syncProductQuantities);
router.post('/:productId/sync-quantity', authenticateJWT, ProductController.syncSingleProductQuantity);

export default router;