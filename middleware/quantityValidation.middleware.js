import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import ProductModel from '../models/product.model.js';

/**
 * Middleware สำหรับตรวจสอบและจัดการ quantity ก่อนการเช่า
 */
export const validateProductQuantity = async (req, res, next) => {
    try {
        const { product_id } = req.body;
        
        if (!product_id) {
            return next(new ApiError(httpStatusCodes.BAD_REQUEST, "Product ID is required"));
        }

        // ตรวจสอบและจอง quantity
        const reservationResult = await ProductModel.checkAndReserveQuantity(product_id, 1);
        
        if (!reservationResult.success) {
            return next(new ApiError(httpStatusCodes.BAD_REQUEST, "Product is not available for rental"));
        }

        // เก็บข้อมูลการจองไว้ใน request object
        req.productReservation = reservationResult;
        
        next();
    } catch (error) {
        console.error('Error in validateProductQuantity middleware:', error);
        next(error);
    }
};

/**
 * Middleware สำหรับคืน quantity เมื่อเกิดข้อผิดพลาด
 */
export const rollbackQuantityOnError = (error, req, res, next) => {
    // ถ้ามีการจอง quantity ไว้และเกิดข้อผิดพลาด ให้คืน quantity
    if (req.productReservation && req.productReservation.product) {
        ProductModel.releaseReservedQuantity(
            req.productReservation.product.id, 
            req.productReservation.reserved_quantity,
            'error_rollback'
        ).catch(rollbackError => {
            console.error('Error rolling back quantity reservation:', rollbackError);
        });
    }
    
    next(error);
};

/**
 * Middleware สำหรับตรวจสอบสถานะสินค้าก่อนการดำเนินการ
 */
export const checkProductAvailability = async (req, res, next) => {
    try {
        const productId = req.params.productId || req.body.product_id;
        
        if (!productId) {
            return next(new ApiError(httpStatusCodes.BAD_REQUEST, "Product ID is required"));
        }

        const product = await ProductModel.findByIdOrSlug(productId);
        
        if (!product) {
            return next(new ApiError(httpStatusCodes.NOT_FOUND, "Product not found"));
        }

        if (product.availability_status !== 'available' && product.availability_status !== 'rented_out') {
            return next(new ApiError(httpStatusCodes.BAD_REQUEST, 
                `Product is currently ${product.availability_status} and cannot be rented`));
        }

        if (product.quantity_available < 1) {
            return next(new ApiError(httpStatusCodes.BAD_REQUEST, 
                "Product is currently out of stock"));
        }

        req.product = product;
        next();
    } catch (error) {
        console.error('Error in checkProductAvailability middleware:', error);
        next(error);
    }
};

export default {
    validateProductQuantity,
    rollbackQuantityOnError,
    checkProductAvailability
};