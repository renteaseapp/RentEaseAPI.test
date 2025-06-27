import ReviewModel from '../models/review.model.js';
import RentalModel from '../models/rental.model.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import NotificationService from './notification.service.js';

const ReviewService = {
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
        // Send notification to owner
        await NotificationService.createNotification({
            user_id: rental.owner_id,
            type: 'review_created',
            title: 'คุณได้รับรีวิวใหม่',
            message: `สินค้าของคุณ ‘${rental.product?.title || ''}’ ได้รับรีวิวใหม่จากผู้เช่า`,
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
        // Send notification to owner
        await NotificationService.createNotification({
            user_id: review.rentals.owner_id,
            type: 'review_updated',
            title: 'รีวิวของคุณถูกอัปเดต',
            message: `รีวิวของผู้เช่าสำหรับสินค้า ‘${review.rentals.products?.name || ''}’ ถูกอัปเดต`,
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
        // Send notification to owner
        await NotificationService.createNotification({
            user_id: review.rentals.owner_id,
            type: 'review_deleted',
            title: 'รีวิวของคุณถูกลบ',
            message: `รีวิวของผู้เช่าสำหรับสินค้า ‘${review.rentals.products?.name || ''}’ ถูกลบ`,
            link_url: `/products/${review.rentals.product_id}/reviews`,
            related_entity_type: 'review',
            related_entity_id: review.id,
            related_entity_uid: null
        });
        return await ReviewModel.deleteByRentalId(rentalId);
    }
};

export default ReviewService; 