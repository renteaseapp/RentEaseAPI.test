import UserModel from '../models/user.model.js';
import FileService from './file.service.js';
import WishlistModel from '../models/wishlist.model.js';
import storageConfig from '../config/storage.config.js';
import { ApiError } from '../utils/apiError.js';
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import { generateToken } from '../utils/jwt.utils.js';
import supabase from '../db/supabaseClient.js';

const UserService = {
    async registerUser(userData, clientIp) {
        const { email, username, password, first_name, last_name, phone_number } = userData;

        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail) {
            throw new ApiError(httpStatusCodes.UNPROCESSABLE_ENTITY, "Validation Error", [{ field: "email", message: "The email has already been taken." }]);
        }

        const existingUsername = await UserModel.findByUsername(username);
        if (existingUsername) {
            throw new ApiError(httpStatusCodes.UNPROCESSABLE_ENTITY, "Validation Error", [{ field: "username", message: "The username has already been taken." }]);
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await UserModel.create({
            username,
            email,
            password_hash: hashedPassword,
            first_name,
            last_name,
            phone_number,
            registration_ip: clientIp,
        });
        
        const isAdmin = await UserModel.checkAdmin(newUser.id);
        const tokenPayload = {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            is_admin: isAdmin,
        };
        const accessToken = generateToken(tokenPayload);

        return { user: newUser, accessToken };
    },

    async getUserProfile(userId) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "User not found.");
        }
        return user;
    },

    async updateUserProfile(userId, profileData) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "User not found.");
        }
        const updatedUser = await UserModel.update(userId, profileData);
        return updatedUser;
    },

    async updateUserAvatar(userId, fileObject) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "User not found.");
        }
        if (!fileObject) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "No avatar file provided.");
        }

        if (user.profile_picture_url) {
            try {
                const oldPath = new URL(user.profile_picture_url).pathname.split(`/${storageConfig.avatarBucketName}/`)[1];
                if (oldPath) {
                    await FileService.deleteFileFromSupabaseStorage(storageConfig.avatarBucketName, oldPath);
                }
            } catch (e) {
                console.warn("Could not parse or delete old avatar URL:", user.profile_picture_url, e.message);
            }
        }
        
        const fileName = `user-${userId}-avatar-${Date.now()}.${fileObject.originalname.split('.').pop()}`;
        const filePath = `public/${fileName}`;

        const { publicUrl } = await FileService.uploadFileToSupabaseStorage(
            fileObject,
            storageConfig.avatarBucketName,
            filePath
        );

        if (!publicUrl) {
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to get public URL for avatar.");
        }
        
        await UserModel.update(userId, { profile_picture_url: publicUrl });
        return { profile_picture_url: publicUrl };
    },

    async changeUserPassword(userId, currentPassword, newPassword) {
        const userWithPassword = await UserModel.findByEmailOrUsername((await UserModel.findById(userId)).email);
        if (!userWithPassword) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "User not found.");
        }

        const isPasswordMatch = await comparePassword(currentPassword, userWithPassword.password_hash);
        if (!isPasswordMatch) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Current password does not match.");
        }

        const hashedNewPassword = await hashPassword(newPassword);
        await UserModel.update(userId, { password_hash: hashedNewPassword });
        return { message: "Password updated successfully." };
    },

    // Wishlist Methods
    async addProductToWishlist(userId, productId) {
        console.log('🔍 addProductToWishlist called with:', { userId, productId });
        try {
            // Check if product exists and is approved
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('id')
                .eq('id', productId)
                .eq('admin_approval_status', 'approved')
                .is('deleted_at', null)
                .single();

            if (productError || !product) {
                throw new ApiError(httpStatusCodes.NOT_FOUND, 'Product not found or not approved');
            }

            // Check if already in wishlist
            const { data: existingWishlist, error: wishlistError } = await supabase
                .from('wishlist')
                .select('product_id')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .single();

            if (wishlistError && wishlistError.code !== 'PGRST116') {
                throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Error checking wishlist');
            }

            if (existingWishlist) {
                throw new ApiError(httpStatusCodes.CONFLICT, 'Product already in wishlist');
            }

            // Add to wishlist
            console.log('🔍 Inserting into wishlist:', { user_id: userId, product_id: productId });
            const { error: insertError } = await supabase
                .from('wishlist')
                .insert([
                    {
                        user_id: userId,
                        product_id: productId
                    }
                ]);

            if (insertError) {
                console.error('❌ Insert error:', insertError);
                throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Error adding to wishlist');
            }
            console.log('✅ Successfully added to wishlist');

            return { success: true, message: 'Product added to wishlist' };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Error adding to wishlist');
        }
    },

    async removeProductFromWishlist(userId, productId) {
        console.log('🔍 removeProductFromWishlist called with:', { userId, productId });
        try {
            console.log('🔍 Deleting from wishlist:', { user_id: userId, product_id: productId });
            const { error } = await supabase
                .from('wishlist')
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (error) {
                console.error('❌ Delete error:', error);
                throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Error removing from wishlist');
            }
            console.log('✅ Successfully removed from wishlist');

            return { success: true, message: 'Product removed from wishlist' };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Error removing from wishlist');
        }
    },

    async getProductWishlistStatus(userId, productId) {
        try {
            const { data, error } = await supabase
                .from('wishlist')
                .select('product_id')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Error checking wishlist status');
            }

            return { isInWishlist: !!data };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Error checking wishlist status');
        }
    },

    async getMyWishlist(userId, queryParams) {
        console.log('🔍 getMyWishlist called with:', { userId, queryParams });
        const { page = 1, limit = 10 } = queryParams;
        const offset = (page - 1) * limit;

        console.log('🔍 Querying wishlist with:', { userId, offset, limit });

        const { data: wishlistItems, error: wishlistError } = await supabase
            .from('wishlist')
            .select(`
                product_id,
                added_at,
                products (
                    id,
                    title,
                    description,
                    rental_price_per_day,
                    rental_price_per_week,
                    rental_price_per_month,
                    category_id,
                    owner_id,
                    availability_status,
                    created_at,
                    product_images (
                        id,
                        image_url,
                        is_primary
                    )
                )
            `)
            .eq('user_id', userId)
            .order('added_at', { ascending: false })
            .range(offset, offset + limit - 1);

        console.log('🔍 Wishlist query result:', { wishlistItems, wishlistError });

        if (wishlistError) {
            console.error("❌ Error fetching wishlist:", wishlistError);
            console.error("❌ Error details:", {
                code: wishlistError.code,
                message: wishlistError.message,
                details: wishlistError.details,
                hint: wishlistError.hint
            });
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, `Failed to fetch wishlist: ${wishlistError.message}`);
        }

        const { count, error: countError } = await supabase
            .from('wishlist')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countError) {
            console.error("Error counting wishlist items:", countError);
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to count wishlist items.");
        }

        return {
            items: wishlistItems || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        };
    },

    // Get public user profile information
    async getPublicUserProfile(userId) {
        const { data: user, error } = await supabase
            .from('users')
            .select(`
                id,
                username,
                email,
                first_name,
                last_name,
                phone_number,
                profile_picture_url,
                address_line1,
                address_line2,
                city,
                province_id,
                postal_code,
                id_verification_status,
                created_at
            `)
            .eq('id', userId)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new ApiError(httpStatusCodes.NOT_FOUND, "User not found.");
            }
            console.error("Error fetching public user profile:", error);
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch user profile.");
        }

        return user;
    }
};

export default UserService;