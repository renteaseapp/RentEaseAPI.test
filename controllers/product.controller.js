import ProductService from '../services/product.service.js';
import ProductModel from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import validateRequest from '../middleware/validateRequest.js';
import { getProductsQuerySchema, createProductSchema, updateProductSchema } from '../DTOs/product.dto.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import parseSpecifications from '../middleware/parseSpecifications.js';
import Joi from 'joi';
import { ApiError } from '../utils/apiError.js';

const ProductController = {
    getAllProducts: asyncHandler(async (req, res) => {
        const result = await ProductService.getProducts(req.query);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, result)
        );
    }),

    getProductByIdOrSlug: asyncHandler(async (req, res) => {
        const { slugOrId } = req.params;
        const product = await ProductService.getProductDetails(slugOrId);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: product })
        );
    }),

    getProductAvailability: asyncHandler(async (req, res) => {
        const { productId, yearMonth } = req.params;

        const availability = await ProductService.getProductAvailability(productId, yearMonth);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, availability)
        );
    }),

    getProductRentals: asyncHandler(async (req, res) => {
        const { productId, yearMonth } = req.params;

        const rentals = await ProductService.getProductRentals(productId, yearMonth);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, rentals)
        );
    }),

    checkProductAvailabilityWithBuffer: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const {
            startDate: camelStart,
            endDate: camelEnd,
            start_date: snakeStart,
            end_date: snakeEnd,
        } = req.query;

        const startDate = camelStart || snakeStart;
        const endDate = camelEnd || snakeEnd;

        // Validate required parameters
        if (!startDate || !endDate) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, 'start_date and end_date are required');
        }

        const result = await ProductModel.checkAvailabilityWithBuffer(
            parseInt(productId, 10),
            String(startDate),
            String(endDate)
        );

        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, result)
        );
    }),

    createProduct: asyncHandler(async (req, res, next) => {
        console.log('Create Product Request:');
        console.log('Request Body:', req.body);
        console.log('Request Files:', req.files);
        console.log('Content-Type:', req.headers['content-type']);
        
        if (!req.body) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Request body is required");
        }

        const ownerId = req.user.id;
        let productData = req.body;
        
        // Parse specifications string to object if it exists and is a string
        if (productData.specifications && typeof productData.specifications === 'string') {
            try {
                productData.specifications = JSON.parse(productData.specifications);
            } catch (error) {
                throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid JSON format for specifications");
            }
        }

        if (!productData.title) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Product title is required");
        }

        // Access files from req.files properly - files are stored by field name
        const productImages = req.files && req.files['images[]'] ? req.files['images[]'] : []; 

        // Pass productData and productImages to the service
        const newProduct = await ProductService.createProduct(ownerId, productData, productImages);
        
        res.status(httpStatusCodes.CREATED).json(
            new ApiResponse(httpStatusCodes.CREATED, newProduct, "Product created successfully")
        );
    }),

    updateProduct: asyncHandler(async (req, res, next) => {
        const { slugOrId } = req.params;
        const ownerId = req.user.id;
        let productData = req.body;

        console.log('Update Product Request:');
        console.log('Product ID/Slug:', slugOrId);
        console.log('Owner ID:', ownerId);
        console.log('Request Body:', productData);

        // Parse specifications string to object if it exists and is a string
        if (productData.specifications && typeof productData.specifications === 'string') {
            try {
                productData.specifications = JSON.parse(productData.specifications);
                console.log('Parsed specifications:', productData.specifications);
            } catch (error) {
                throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid JSON format for specifications");
            }
        }

        // Access files from req.files properly
        const newImages = req.files && req.files['new_images[]'] ? req.files['new_images[]'] : [];
        console.log('New images count:', newImages.length);
        
        // Get remove_image_ids from request body (text field)
        let removeImageIds = [];
        if (productData.remove_image_ids) {
            if (typeof productData.remove_image_ids === 'string') {
                removeImageIds = productData.remove_image_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            } else if (Array.isArray(productData.remove_image_ids)) {
                removeImageIds = productData.remove_image_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
            }
            console.log('Remove image IDs:', removeImageIds);
        }
        
        // Remove remove_image_ids from productData since it's not a product field
        delete productData.remove_image_ids;

        console.log('Final product data to update:', productData);

        // Pass data to the service
        const updatedProduct = await ProductService.updateProduct(slugOrId, ownerId, productData, newImages, removeImageIds);
        
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, updatedProduct, "Product updated successfully")
        );
    }),

    updateProductStatus: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const ownerId = req.user.id;
        const { availability_status } = req.validatedData;

        const updatedProduct = await ProductService.updateProductStatus(
            productId,
            ownerId,
            availability_status
        );

        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, updatedProduct, "Product status updated successfully")
        );
    }),

    deleteProductImage: asyncHandler(async (req, res) => {
        const { productId, imageId } = req.params;
        const ownerId = req.user.id;

        await ProductService.deleteProductImage(productId, imageId, ownerId);

        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, null, "Product image deleted successfully")
        );
    }),

    deleteProduct: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const ownerId = req.user.id;

        await ProductService.deleteProduct(productId, ownerId);

        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, null, "Product deleted successfully")
        );
    }),

    // สินค้ายอดนิยมจากยอดการเช่า (public)
    getFeaturedProducts: asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit, 10) || 8;
        const result = await ProductService.getProducts({ featured: true, limit });
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, result, 'Featured products')
        );
    }),

    getRentalCountForProduct: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const rentalCount = await ProductService.getRentalCountForProduct(parseInt(productId, 10));
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { rental_count: rentalCount }, 'Product rental count')
        );
    }),

    getTopRentedProducts: asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit, 10) || 5;
        const products = await ProductService.getTopRentedProducts(limit);
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: products }, 'Top rented products')
        );
    }),

    // ซิงค์ quantity ของสินค้าทั้งหมด (Admin/Maintenance)
    syncProductQuantities: asyncHandler(async (req, res) => {
        // ตรวจสอบสิทธิ์ admin (ถ้าจำเป็น)
        // if (!req.user.isAdmin) {
        //     throw new ApiError(httpStatusCodes.FORBIDDEN, "Admin access required");
        // }

        const result = await ProductModel.syncProductQuantities();
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, result, 'Product quantities synchronized successfully')
        );
    }),

    // ซิงค์ quantity ของสินค้าเฉพาะ ID
    syncSingleProductQuantity: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        
        if (!productId || isNaN(productId)) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Valid product ID is required");
        }

        const result = await ProductModel.syncProductQuantities(parseInt(productId));
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, result, `Product ${productId} quantity synchronized successfully`)
        );
    })
};

export default ProductController;