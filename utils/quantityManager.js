import ProductModel from '../models/product.model.js';
import { ApiError } from './apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

/**
 * Utility class สำหรับจัดการ quantity และ availability status
 */
class QuantityManager {
    /**
     * ตรวจสอบและจอง quantity สำหรับการเช่า
     */
    static async reserveQuantity(productId, quantity = 1, userId = null) {
        try {
            console.log(`Attempting to reserve ${quantity} units of product ${productId} for user ${userId}`);
            
            const result = await ProductModel.checkAndReserveQuantity(productId, quantity);
            
            if (result.success) {
                console.log(`Successfully reserved ${quantity} units of product ${productId}`);
            }
            
            return result;
        } catch (error) {
            console.error(`Failed to reserve quantity for product ${productId}:`, error);
            throw error;
        }
    }

    /**
     * คืน quantity เมื่อการเช่าถูกยกเลิกหรือเสร็จสิ้น
     */
    static async releaseQuantity(productId, quantity = 1, reason = 'unknown', userId = null) {
        try {
            console.log(`Releasing ${quantity} units of product ${productId}. Reason: ${reason}, User: ${userId}`);
            
            const result = await ProductModel.releaseReservedQuantity(productId, quantity, reason);
            
            if (result.success) {
                console.log(`Successfully released ${quantity} units of product ${productId}`);
            }
            
            return result;
        } catch (error) {
            console.error(`Failed to release quantity for product ${productId}:`, error);
            throw error;
        }
    }

    /**
     * ซิงค์ quantity ของสินค้าเฉพาะ
     */
    static async syncProductQuantity(productId) {
        try {
            console.log(`Syncing quantity for product ${productId}`);
            
            const result = await ProductModel.syncProductQuantities(productId);
            
            console.log(`Sync completed for product ${productId}:`, result);
            return result;
        } catch (error) {
            console.error(`Failed to sync quantity for product ${productId}:`, error);
            throw error;
        }
    }

    /**
     * ซิงค์ quantity ของสินค้าทั้งหมด
     */
    static async syncAllProductQuantities() {
        try {
            console.log('Starting bulk quantity sync for all products');
            
            const result = await ProductModel.syncProductQuantities();
            
            console.log('Bulk quantity sync completed:', result);
            return result;
        } catch (error) {
            console.error('Failed to sync all product quantities:', error);
            throw error;
        }
    }

    /**
     * ตรวจสอบสถานะความพร้อมของสินค้า
     */
    static async checkProductAvailability(productId) {
        try {
            const product = await ProductModel.findByIdOrSlug(productId);
            
            if (!product) {
                throw new ApiError(httpStatusCodes.NOT_FOUND, "Product not found");
            }

            const isAvailable = (product.availability_status === 'available' || product.availability_status === 'rented_out') && 
                              product.quantity_available > 0 &&
                              product.admin_approval_status === 'approved' &&
                              !product.deleted_at;

            return {
                product_id: productId,
                is_available: isAvailable,
                availability_status: product.availability_status,
                quantity_available: product.quantity_available,
                admin_approval_status: product.admin_approval_status,
                reasons: this._getUnavailabilityReasons(product)
            };
        } catch (error) {
            console.error(`Failed to check availability for product ${productId}:`, error);
            throw error;
        }
    }

    /**
     * หาเหตุผลที่สินค้าไม่พร้อมให้เช่า
     */
    static _getUnavailabilityReasons(product) {
        const reasons = [];
        
        if (product.availability_status !== 'available' && product.availability_status !== 'rented_out') {
            reasons.push(`Status is ${product.availability_status}`);
        }
        
        if (product.quantity_available <= 0) {
            reasons.push('Out of stock');
        }
        
        if (product.admin_approval_status !== 'approved') {
            reasons.push(`Admin approval status is ${product.admin_approval_status}`);
        }
        
        if (product.deleted_at) {
            reasons.push('Product is deleted');
        }
        
        return reasons;
    }

    /**
     * สร้าง transaction log สำหรับการเปลี่ยนแปลง quantity
     */
    static async logQuantityChange(productId, oldQuantity, newQuantity, reason, userId = null) {
        try {
            const logData = {
                product_id: productId,
                old_quantity: oldQuantity,
                new_quantity: newQuantity,
                quantity_change: newQuantity - oldQuantity,
                reason: reason,
                user_id: userId,
                timestamp: new Date().toISOString()
            };

            console.log('Quantity change log:', logData);
            
            // ในอนาคตอาจบันทึกลงฐานข้อมูลหรือ external logging service
            // await LoggingService.logQuantityChange(logData);
            
            return logData;
        } catch (error) {
            console.error('Failed to log quantity change:', error);
            // ไม่ throw error เพราะ logging ไม่ควรทำให้ main operation ล้มเหลว
        }
    }
}

export default QuantityManager;