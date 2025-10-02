import ReviewModel from '../models/review.model.js';
import RentalModel from '../models/rental.model.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import NotificationService from './notification.service.js';
import supabase from '../db/supabaseClient.js';

// Import realtime event emitters
import { 
    emitReviewCreated, 
    emitReviewUpdate, 
    emitReviewDeleted,
    emitProductUpdate,
    emitNotificationToUser
} from '../server.js';

const ReviewService = {
    // อัปเดต average_rating และ total_reviews ในตาราง products
    async updateProductRatingStats(productId) {
        try {
            // ดึงข้อมูลรีวิวของสินค้านี้
            const { data: reviews, error } = await supabase
                .from('reviews')
                .select('rating_product')
                .eq('product_id', productId)
                .not('rating_product', 'is', null);

            if (error) {
                console.error('Error fetching reviews for product rating update:', error);
                return;
            }

            if (!reviews || reviews.length === 0) {
                // ถ้าไม่มีรีวิว ให้ reset เป็น 0
                await supabase
                    .from('products')
                    .update({ 
                        average_rating: 0.00, 
                        total_reviews: 0 
                    })
                    .eq('id', productId);
                return;
            }

            // คำนวณ average_rating และ total_reviews
            const totalReviews = reviews.length;
            const totalRating = reviews.reduce((sum, review) => sum + (parseFloat(review.rating_product) || 0), 0);
            const averageRating = totalRating / totalReviews;

            // อัปเดตในตาราง products
            await supabase
                .from('products')
                .update({ 
                    average_rating: Math.round(averageRating * 100) / 100, // ปัดเศษ 2 ตำแหน่ง
                    total_reviews: totalReviews 
                })
                .eq('id', productId);

        } catch (error) {
            console.error('Error updating product rating stats:', error);
        }
    },

    async createReview(userId, reviewData) {
        // Verify the rental exists and belongs to the user
        const rental = await RentalModel.findByIdentifier(reviewData.rental_id);
        if (!rental) {
            throw new ApiError(
                httpStatusCodes.NOT_FOUND,
                "Rental not found"
            );
        }

        if (rental.renter_id !== userId) {
            throw new ApiError(
                httpStatusCodes.FORBIDDEN,
                "You can only review rentals you have made"
            );
        }

        // Check if rental is completed
        if (rental.rental_status !== 'completed') {
            throw new ApiError(
                httpStatusCodes.BAD_REQUEST,
                "You can only review completed rentals"
            );
        }

        // Check if review already exists
        const existingReview = await ReviewModel.findByRentalId(reviewData.rental_id);
        if (existingReview) {
            throw new ApiError(
                httpStatusCodes.BAD_REQUEST,
                "You have already reviewed this rental"
            );
        }

        const review = await ReviewModel.create({
            ...reviewData,
            rental_id: rental.id,
            renter_id: rental.renter_id,
            product_id: rental.product_id,
            owner_id: rental.owner_id
        });

        // อัปเดต average_rating และ total_reviews ในตาราง products
        await this.updateProductRatingStats(rental.product_id);

        // Emit realtime events
        emitReviewCreated(review);
        
        // Emit product update for rating changes
        const updatedProduct = await supabase
            .from('products')
            .select('*')
            .eq('id', rental.product_id)
            .single();
        
        if (updatedProduct.data) {
            emitProductUpdate(rental.product_id, updatedProduct.data);
        }

        // Send notification to owner
        await NotificationService.createNotification({
            user_id: rental.owner_id,
            type: 'review_created',
            title: 'คุณได้รับรีวิวใหม่',
            message: `สินค้าของคุณ '${rental.product?.title || ''}' ได้รับรีวิวใหม่จากผู้เช่า`,
            link_url: `/products/${rental.product_id}/reviews`,
            related_entity_type: 'review',
            related_entity_id: review.id,
            related_entity_uid: null
        });
        
        return review;
    },

    async getProductReviews(productId, query) {
        return await ReviewModel.findByProductId(productId, query);
    },

    async getOwnerReviews(ownerId, query) {
        return await ReviewModel.findByOwnerId(ownerId, query);
    },

    async getRentalReview(rentalId) {
        return await ReviewModel.findByRentalId(rentalId);
    },

    async updateReview(userId, rentalId, updateData) {
        // ตรวจสอบว่า review นี้เป็นของ user นี้จริง
        const review = await ReviewModel.findByRentalId(rentalId);
        if (!review) throw new ApiError(httpStatusCodes.NOT_FOUND, 'Review not found');
        // ตรวจสอบว่า user เป็นเจ้าของรีวิว (renter)
        if (review.rentals.renter_id !== userId) throw new ApiError(httpStatusCodes.FORBIDDEN, 'You are not allowed to update this review');
        // อัปเดตเฉพาะ field ที่อนุญาต
        const allowed = {};
        if (updateData.rating_product !== undefined) allowed.rating_product = updateData.rating_product;
        if (updateData.rating_owner !== undefined) allowed.rating_owner = updateData.rating_owner;
        if (updateData.comment !== undefined) allowed.comment = updateData.comment;
        const updated = await ReviewModel.updateByRentalId(rentalId, allowed);

        // อัปเดต average_rating และ total_reviews ในตาราง products
        await this.updateProductRatingStats(review.rentals.product_id);

        // Emit realtime events
        emitReviewUpdate(updated.id, updated);
        
        // Emit product update for rating changes
        const updatedProduct = await supabase
            .from('products')
            .select('*')
            .eq('id', review.rentals.product_id)
            .single();
        
        if (updatedProduct.data) {
            emitProductUpdate(review.rentals.product_id, updatedProduct.data);
        }

        // Send notification to owner
        await NotificationService.createNotification({
            user_id: review.rentals.owner_id,
            type: 'review_updated',
            title: 'รีวิวของคุณถูกอัปเดต',
            message: `รีวิวของผู้เช่าสำหรับสินค้า '${review.rentals.products?.name || ''}' ถูกอัปเดต`,
            link_url: `/products/${review.rentals.product_id}/reviews`,
            related_entity_type: 'review',
            related_entity_id: review.id,
            related_entity_uid: null
        });
        
        return updated;
    },

    async deleteReview(userId, rentalId) {
        const review = await ReviewModel.findByRentalId(rentalId);
        if (!review) throw new ApiError(httpStatusCodes.NOT_FOUND, 'Review not found');
        if (review.rentals.renter_id !== userId) throw new ApiError(httpStatusCodes.FORBIDDEN, 'You are not allowed to delete this review');
        
        const productId = review.rentals.product_id;
        const result = await ReviewModel.deleteByRentalId(rentalId);

        // อัปเดต average_rating และ total_reviews ในตาราง products
        await this.updateProductRatingStats(productId);

        // Emit realtime events
        emitReviewDeleted(review.id);
        
        // Emit product update for rating changes
        const updatedProduct = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (updatedProduct.data) {
            emitProductUpdate(productId, updatedProduct.data);
        }

        // Send notification to owner
        await NotificationService.createNotification({
            user_id: review.rentals.owner_id,
            type: 'review_deleted',
            title: 'รีวิวของคุณถูกลบ',
            message: `รีวิวของผู้เช่าสำหรับสินค้า '${review.rentals.products?.name || ''}' ถูกลบ`,
            link_url: `/products/${review.rentals.product_id}/reviews`,
            related_entity_type: 'review',
            related_entity_id: review.id,
            related_entity_uid: null
        });
        
        return result;
    },

    // อัปเดต average_rating และ total_reviews ของสินค้าทั้งหมดที่มีรีวิวอยู่แล้ว
    async updateAllProductRatingStats() {
        try {
            console.log('Starting to update all product rating stats...');
            
            // ดึง product_id ทั้งหมดที่มีรีวิว
            const { data: productsWithReviews, error } = await supabase
                .from('reviews')
                .select('product_id')
                .not('product_id', 'is', null)
                .not('rating_product', 'is', null);

            if (error) {
                console.error('Error fetching products with reviews:', error);
                return;
            }

            // เอา product_id ที่ไม่ซ้ำ
            const uniqueProductIds = [...new Set(productsWithReviews.map(r => r.product_id))];
            console.log(`Found ${uniqueProductIds.length} products with reviews to update`);

            // อัปเดตทีละสินค้า
            let updatedCount = 0;
            for (const productId of uniqueProductIds) {
                try {
                    await this.updateProductRatingStats(productId);
                    updatedCount++;
                    if (updatedCount % 10 === 0) {
                        console.log(`Updated ${updatedCount}/${uniqueProductIds.length} products`);
                    }
                } catch (error) {
                    console.error(`Error updating product ${productId}:`, error);
                }
            }

            console.log(`Successfully updated rating stats for ${updatedCount} products`);
            return { updatedCount, totalProducts: uniqueProductIds.length };

        } catch (error) {
            console.error('Error in updateAllProductRatingStats:', error);
            throw error;
        }
    }
};

export default ReviewService;