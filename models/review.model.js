import supabase from '../db/supabaseClient.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

const ReviewModel = {
    async create(reviewData) {
        const { data, error } = await supabase
            .from('reviews')
            .insert(reviewData)
            .select(`
                id,
                rental_id,
                rating_product,
                rating_owner,
                comment,
                created_at,
                updated_at,
                rentals (
                    id,
                    product_id,
                    renter_id,
                    owner_id,
                    products (
                        id,
                        title
                    )
                )
            `)
            .single();

        if (error) {
            console.error("Error creating review:", error);
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to create review");
        }
        return data;
    },

    async findByRentalId(rentalId) {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                id,
                rental_id,
                rating_product,
                rating_owner,
                comment,
                created_at,
                updated_at,
                rentals (
                    id,
                    product_id,
                    renter_id,
                    owner_id,
                    products (
                        id,
                        title
                    )
                )
            `)
            .eq('rental_id', rentalId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }
        return data;
    },

    async findByProductId(productId, query = {}) {
        // Provide default values if query is missing or incomplete
        const page = parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
        const limit = parseInt(query.limit, 10) > 0 ? parseInt(query.limit, 10) : 10;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, error, count } = await supabase
            .from('reviews')
            .select(`
                id,
                rental_id,
                rating_product,
                rating_owner,
                comment,
                created_at,
                updated_at,
                rentals (
                    id,
                    product_id,
                    renter_id,
                    owner_id,
                    products (
                        id,
                        title
                    )
                )
            `, { count: 'exact' })
            .eq('rentals.product_id', productId)
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            console.error("Error fetching product reviews:", error);
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch product reviews");
        }

        // Filter reviews to ensure rentals.product_id matches the requested productId
        const filtered = (data || []).filter(r => r.rentals && String(r.rentals.product_id) === String(productId));

        return {
            reviews: filtered,
            total: filtered.length,
            page,
            limit,
            totalPages: Math.ceil(filtered.length / limit)
        };
    },

    async findByOwnerId(ownerId, { page = 1, limit = 10 }) {
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, error, count } = await supabase
            .from('reviews')
            .select(`
                id,
                rental_id,
                rating_product,
                rating_owner,
                comment,
                created_at,
                updated_at,
                rentals (
                    id,
                    product_id,
                    renter_id,
                    owner_id,
                    products (
                        id,
                        title
                    )
                )
            `, { count: 'exact' })
            .eq('rentals.owner_id', ownerId)
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            console.error("Error fetching owner reviews:", error);
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch owner reviews");
        }

        return {
            reviews: data,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        };
    },

    async updateByRentalId(rentalId, updateData) {
        const { data, error } = await supabase
            .from('reviews')
            .update({ ...updateData, updated_at: new Date().toISOString() })
            .eq('rental_id', rentalId)
            .select('*')
            .single();
        if (error) {
            console.error('Error updating review:', error);
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update review');
        }
        return data;
    },

    async deleteByRentalId(rentalId) {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('rental_id', rentalId);
        if (error) {
            console.error('Error deleting review:', error);
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete review');
        }
        return { success: true };
    }
};

export default ReviewModel; 