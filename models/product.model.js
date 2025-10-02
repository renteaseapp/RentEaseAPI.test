import supabase from '../db/supabaseClient.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import { emitQuantityUpdate } from '../server.js';

const ProductModel = {
    async findAll(filters = {}) {
        // Parse location parameters to ensure they are numbers
        let parsedLat = filters.lat !== undefined ? parseFloat(filters.lat) : undefined;
        let parsedLng = filters.lng !== undefined ? parseFloat(filters.lng) : undefined;
        let parsedRadiusKm = filters.radius_km !== undefined ? parseFloat(filters.radius_km) : 50;
        
        const {
            q,
            featured,
            category_id,
            province_ids,
            min_price,
            max_price,
            sort = 'updated_at_desc',
            page = 1,
            limit = 10
        } = filters;

        const offset = (page - 1) * limit;

        // Keyword mapping for Thai/English synonyms
        const keywordMappings = {
            'กล้อง': ['camera', 'canon', 'nikon', 'sony', 'fujifilm', 'olympus', 'panasonic', 'mirrorless', 'dslr', 'eos'],
            'camera': ['กล้อง', 'canon', 'nikon', 'sony', 'fujifilm', 'olympus', 'panasonic', 'mirrorless', 'dslr', 'eos'],
            'มือถือ': ['phone', 'smartphone', 'mobile', 'iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'realme', 'android'],
            'โทรศัพท์': ['phone', 'smartphone', 'mobile', 'iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'realme', 'android'],
            'คอมพิวเตอร์': ['computer', 'laptop', 'notebook', 'pc', 'macbook', 'dell', 'hp', 'asus', 'acer', 'lenovo'],
            'พีซี': ['computer', 'laptop', 'notebook', 'pc', 'macbook', 'dell', 'hp', 'asus', 'acer', 'lenovo'],
            'แท็บเล็ต': ['tablet', 'ipad', 'samsung', 'huawei', 'lenovo', 'android'],
            'ไอแพด': ['ipad', 'tablet', 'apple'],
            'เลนส์': ['lens', 'canon', 'nikon', 'sony', 'sigma', 'tamron', 'zeiss'],
            'ขาตั้ง': ['tripod', 'gimbal', 'stand', 'mount', 'stabilizer'],
            'ไฟ': ['light', 'flash', 'led', 'softbox', 'studio', 'strobe'],
            'เสียง': ['audio', 'microphone', 'mic', 'speaker', 'headphone', 'sound'],
            'เกม': ['game', 'gaming', 'playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'ps4'],
            'game': ['เกม', 'gaming', 'playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'ps4'],
            'รถ': ['car', 'vehicle', 'automobile', 'รถยนต์'],
            'car': ['รถ', 'รถยนต์', 'vehicle', 'automobile'],
            'จักรยาน': ['bike', 'bicycle', 'cycle', 'จักรยานเสือภูเขา', 'จักรยานเสือหมอบ'],
            'bike': ['จักรยาน', 'bicycle', 'cycle', 'จักรยานเสือภูเขา', 'จักรยานเสือหมอบ']
        };

        // Build search conditions
        let searchConditions = [];
        if (q) {
            const lowerQ = q.toLowerCase().trim();
            
            // Direct search conditions
            searchConditions.push(`title.ilike.%${q}%`);
            searchConditions.push(`description.ilike.%${q}%`);
            
            // Check for keyword mapping matches
            let foundKeywordMatch = false;
            Object.keys(keywordMappings).forEach(keyword => {
                if (lowerQ.includes(keyword.toLowerCase())) {
                    foundKeywordMatch = true;
                    keywordMappings[keyword].forEach(synonym => {
                        searchConditions.push(`title.ilike.%${synonym}%`);
                        searchConditions.push(`description.ilike.%${synonym}%`);
                    });
                }
            });
            
            // Only add partial word matching if no specific keyword mapping was found
            if (!foundKeywordMatch) {
                const fuzzyKeywords = q.split(' ').filter(word => word.length > 2);
                fuzzyKeywords.forEach(word => {
                    searchConditions.push(`title.ilike.%${word}%`);
                    searchConditions.push(`description.ilike.%${word}%`);
                });
            }
        }

        // ดึงจำนวนทั้งหมดก่อน
        let countQuery = supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('admin_approval_status', 'approved')
            .in('availability_status', ['available', 'rented_out'])
            .is('deleted_at', null);
            
        if (featured) countQuery = countQuery.eq('is_featured', true);
        if (searchConditions.length > 0) {
            // Use OR only for search conditions, but AND with other filters
            countQuery = countQuery.or(searchConditions.join(','));
        }
        if (category_id) countQuery = countQuery.eq('category_id', category_id);
        if (province_ids && province_ids.length > 0) countQuery = countQuery.in('province_id', province_ids);
        if (min_price !== undefined) countQuery = countQuery.gte('rental_price_per_day', min_price);
        if (max_price !== undefined) countQuery = countQuery.lte('rental_price_per_day', max_price);
        
        // Add location-based filtering if lat/lng are provided
        if (parsedLat !== undefined && parsedLng !== undefined) {
            console.log('Location-based search parameters:', { lat: parsedLat, lng: parsedLng, radius_km: parsedRadiusKm });
            // Calculate bounding box for initial filtering
            const latDiff = parsedRadiusKm / 111.045; // Approximate km per degree latitude
            const lngDiff = parsedRadiusKm / (111.045 * Math.cos(parsedLat * Math.PI / 180)); // Adjust for longitude
            
            countQuery = countQuery
                .gte('latitude', parsedLat - latDiff)
                .lte('latitude', parsedLat + latDiff)
                .gte('longitude', parsedLng - lngDiff)
                .lte('longitude', parsedLng + lngDiff);
        }
        
        const { count: total, error: countError } = await countQuery;
        if (countError) {
            console.error('Error counting products:', countError);
            throw countError;
        }

        // ถ้า offset เกินจำนวนข้อมูลจริง ให้คืน array ว่าง
        if (offset >= total) {
            return { products: [], total };
        }

        let query = supabase
            .from('products')
            .select(`
                id, title, slug, rental_price_per_day, average_rating, total_reviews, view_count, quantity_available, availability_status,
                province:provinces (id, name_th),
                category:categories (id, name),
                primary_image:product_images (image_url)
            `, { count: 'exact' })
            .eq('admin_approval_status', 'approved')
            .in('availability_status', ['available', 'rented_out'])
            .is('deleted_at', null);
        if (featured) {
            query = query.eq('is_featured', true);
        }
        if (searchConditions.length > 0) {
            // Use OR only for search conditions, but AND with other filters
            query = query.or(searchConditions.join(','));
        }
        if (category_id) {
            query = query.eq('category_id', category_id);
        }
        if (province_ids && province_ids.length > 0) {
            query = query.in('province_id', province_ids);
        }
        if (min_price !== undefined) {
            query = query.gte('rental_price_per_day', min_price);
        }
        if (max_price !== undefined) {
            query = query.lte('rental_price_per_day', max_price);
        }

        // Add location-based filtering if lat/lng are provided
        if (parsedLat !== undefined && parsedLng !== undefined) {
            console.log('Adding location-based filtering to query');
            // Calculate bounding box for initial filtering
            const latDiff = parsedRadiusKm / 111.045; // Approximate km per degree latitude
            const lngDiff = parsedRadiusKm / (111.045 * Math.cos(parsedLat * Math.PI / 180)); // Adjust for longitude
            
            query = query
                .gte('latitude', parsedLat - latDiff)
                .lte('latitude', parsedLat + latDiff)
                .gte('longitude', parsedLng - lngDiff)
                .lte('longitude', parsedLng + lngDiff)
                // Order by distance (closest first)
                .order(`latitude`, { ascending: true });
        }

        query = query.eq('primary_image.is_primary', true);

        const [sortFieldDb, sortOrderDb] = sort.split('_');
        let actualSortField = sortFieldDb;
        if (sortFieldDb === 'price') actualSortField = 'rental_price_per_day';
        if (sortFieldDb === 'rating') actualSortField = 'average_rating';
        if (sortFieldDb === 'views') actualSortField = 'view_count';
        if (sortFieldDb === 'updated') actualSortField = 'updated_at';
        if (sortFieldDb === 'created') actualSortField = 'created_at';
        if (sortFieldDb === 'newest') actualSortField = 'created_at';

        query = query.order(actualSortField, { ascending: sortFieldDb === 'newest' ? false : sortOrderDb === 'asc' });
        if (actualSortField !== 'id') {
            query = query.order('id', { ascending: true });
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching products:", error);
            throw error;
        }

        // If using location-based search, calculate actual distances and filter by radius
        let products = data;
        if (parsedLat !== undefined && parsedLng !== undefined) {
            console.log('Calculating distances for', data.length, 'products');
            products = data.map(p => {
                // Calculate distance using Haversine formula
                if (p.latitude && p.longitude) {
                    const distance = this.calculateDistance(parsedLat, parsedLng, p.latitude, p.longitude);
                    return { ...p, distance };
                }
                return { ...p, distance: null };
            })
            // Filter by actual radius
            .filter(p => p.distance === null || p.distance <= parsedRadiusKm)
            // Sort by distance
            .sort((a, b) => {
                if (a.distance === null && b.distance === null) return 0;
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }

        products = products.map(p => ({
            ...p,
            primary_image: p.primary_image && p.primary_image.length > 0 ? p.primary_image[0] : { image_url: null },
            category: p.category || null
        }));

        return { products, total };
    },

    // Haversine formula to calculate distance between two points
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    },

    async findByIdOrSlug(identifier) {
        const isNumericId = /^\d+$/.test(identifier);
        let matchField = isNumericId ? 'id' : 'slug';
        let matchValue = isNumericId ? parseInt(identifier, 10) : identifier;

        // RLS Policy Note: This function is intended for fetching publicly viewable products (approved and available)
        // View count increment only for successfully retrieved (approved) products
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select(`
                *,
                province:provinces (id, name_th, name_en),
                category:categories (id, name, slug, description),
                owner:users!fk_products_owner (id, first_name, last_name, profile_picture_url, created_at),
                images:product_images (id, image_url, alt_text, is_primary, sort_order)
            `)
            .eq(matchField, matchValue)
            .eq('admin_approval_status', 'approved')
            .is('deleted_at', null)
            .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'No rows found'
            console.error(`Error fetching product by ${matchField}:`, fetchError);
            throw fetchError;
        }
        if (!product) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Product not found or not approved.");
        }

         // Increment view count after successful fetch for an approved product
        if (product.id) {
             supabase
                .rpc('increment_view_count', { 
                    p_id_input: product.id,
                    p_slug_input: null // Assuming RPC handles ID or slug, but ID is safer here
                 })
                .then(({ error: rpcError }) => {
                    if (rpcError) console.error("Error incrementing view_count:", rpcError);
                });
        }

        if (product.images) {
            product.images.sort((a, b) => {
                if (a.is_primary && !b.is_primary) return -1;
                if (!a.is_primary && b.is_primary) return 1;
                return a.sort_order - b.sort_order;
            });
        } else {
            product.images = [];
        }

        return product;
    },

    async getProductAvailability(productId, yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const monthEnd = new Date(year, month, 0).toISOString().split('T')[0];

        // Get buffer time settings
        const SystemSettingModel = (await import('./systemSetting.model.js')).default;
        const [enableBufferSetting, deliveryBufferSetting, returnBufferSetting] = await Promise.all([
            SystemSettingModel.getSetting('enable_buffer_time', 'true'),
            SystemSettingModel.getSetting('delivery_buffer_days', '1'),
            SystemSettingModel.getSetting('return_buffer_days', '1')
        ]);

        const enableBuffer = enableBufferSetting.setting_value === 'true';
        const deliveryBufferDays = parseInt(deliveryBufferSetting.setting_value) || 1;
        const returnBufferDays = parseInt(returnBufferSetting.setting_value) || 1;

        const { data, error } = await supabase
            .from('rentals')
            .select('start_date, end_date')
            .eq('product_id', productId)
            .in('rental_status', ['pending_owner_approval', 'pending_payment', 'confirmed', 'active'])
            .lte('start_date', monthEnd)
            .gte('end_date', monthStart);

        if (error) {
            console.error("Error fetching product availability:", error);
            throw error;
        }

        const bookedDates = [];
        if (data) {
            data.forEach(rental => {
                // Calculate buffer dates
                let bufferStartDate = new Date(rental.start_date + 'T00:00:00Z');
                let bufferEndDate = new Date(rental.end_date + 'T00:00:00Z');
                
                if (enableBuffer) {
                    // Add delivery buffer before start date
                    bufferStartDate.setUTCDate(bufferStartDate.getUTCDate() - deliveryBufferDays);
                    // Add return buffer after end date
                    bufferEndDate.setUTCDate(bufferEndDate.getUTCDate() + returnBufferDays);
                }

                let currentDate = new Date(bufferStartDate);
                while (currentDate <= bufferEndDate) {
                    const currentDateStr = currentDate.toISOString().split('T')[0];
                    if (currentDateStr >= monthStart && currentDateStr <= monthEnd && !bookedDates.includes(currentDateStr)) {
                        bookedDates.push(currentDateStr);
                    }
                    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
                }
            });
        }
        return bookedDates.sort();
    },

    async checkAvailabilityWithBuffer(productId, startDate, endDate) {
        // Get product information first
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, quantity, quantity_available, availability_status, title')
            .eq('id', productId)
            .eq('admin_approval_status', 'approved')
            .is('deleted_at', null)
            .single();

        if (productError) {
            console.error('Error fetching product:', productError);
            throw productError;
        }

        if (!product) {
            return {
                available: false,
                reason: 'Product not found or not approved',
                conflicts: [],
                buffer_settings: {}
            };
        }

        // Check product status
        if (product.availability_status !== 'available' && product.availability_status !== 'rented_out') {
            return {
                available: false,
                reason: `Product is currently ${product.availability_status}`,
                conflicts: [],
                buffer_settings: {},
                product_info: {
                    quantity: product.quantity,
                    quantity_available: product.quantity_available,
                    status: product.availability_status
                }
            };
        }

        // Check if there's available quantity
        if (product.quantity_available < 1) {
            return {
                available: false,
                reason: `No available quantity. Available: ${product.quantity_available}, Total: ${product.quantity}`,
                conflicts: [],
                buffer_settings: {},
                product_info: {
                    quantity: product.quantity,
                    quantity_available: product.quantity_available,
                    status: product.availability_status
                }
            };
        }

        // Get buffer time settings
        const SystemSettingModel = (await import('./systemSetting.model.js')).default;
        const [enableBufferSetting, deliveryBufferSetting, returnBufferSetting] = await Promise.all([
            SystemSettingModel.getSetting('enable_buffer_time', 'true'),
            SystemSettingModel.getSetting('delivery_buffer_days', '1'),
            SystemSettingModel.getSetting('return_buffer_days', '1')
        ]);

        const enableBuffer = enableBufferSetting.setting_value === 'true';
        const deliveryBufferDays = parseInt(deliveryBufferSetting.setting_value) || 1;
        const returnBufferDays = parseInt(returnBufferSetting.setting_value) || 1;

        // Ensure dates are handled correctly whether they are strings or Date objects
        const start = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
        const end = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];

        // Calculate the actual date range we need to check (including buffer)
        let checkStartDate = new Date(start + 'T00:00:00Z');
        let checkEndDate = new Date(end + 'T00:00:00Z');
        
        if (enableBuffer) {
            // Extend the check range to include buffer time
            checkStartDate.setUTCDate(checkStartDate.getUTCDate() - deliveryBufferDays);
            checkEndDate.setUTCDate(checkEndDate.getUTCDate() + returnBufferDays);
        }

        const checkStartDateStr = checkStartDate.toISOString().split('T')[0];
        const checkEndDateStr = checkEndDate.toISOString().split('T')[0];

        // Find any conflicting rentals
        const { data, error } = await supabase
            .from('rentals')
            .select('id, start_date, end_date, rental_status')
            .eq('product_id', productId)
            .in('rental_status', ['pending_owner_approval', 'pending_payment', 'confirmed', 'active'])
            .or(`and(start_date.lte.${checkEndDateStr},end_date.gte.${checkStartDateStr})`);

        if (error) {
            console.error("Error checking product availability:", error);
            throw error;
        }

        // Count overlapping rentals to check if we have enough quantity
        const overlappingRentals = [];
        if (data && data.length > 0) {
            data.forEach(rental => {
                let rentalBufferStart = new Date(rental.start_date + 'T00:00:00Z');
                let rentalBufferEnd = new Date(rental.end_date + 'T00:00:00Z');
                
                if (enableBuffer) {
                    rentalBufferStart.setUTCDate(rentalBufferStart.getUTCDate() - deliveryBufferDays);
                    rentalBufferEnd.setUTCDate(rentalBufferEnd.getUTCDate() + returnBufferDays);
                }

                const requestStart = new Date(start + 'T00:00:00Z');
                const requestEnd = new Date(end + 'T00:00:00Z');

                // Check if the requested dates overlap with existing rental + buffer
                if (requestStart <= rentalBufferEnd && requestEnd >= rentalBufferStart) {
                    overlappingRentals.push({
                        rental_id: rental.id,
                        rental_start: rental.start_date,
                        rental_end: rental.end_date,
                        rental_status: rental.rental_status,
                        buffer_start: rentalBufferStart.toISOString().split('T')[0],
                        buffer_end: rentalBufferEnd.toISOString().split('T')[0]
                    });
                }
            });
        }

        // Check if we have enough available quantity considering overlapping rentals
        const overlappingRentalCount = overlappingRentals.length;
        const availableForNewRental = product.quantity - overlappingRentalCount;
        const isAvailable = availableForNewRental > 0;

        return {
            available: isAvailable,
            reason: isAvailable ? null : `Not enough quantity available. Total: ${product.quantity}, Overlapping rentals: ${overlappingRentalCount}, Available for new rental: ${availableForNewRental}`,
            conflicts: overlappingRentals,
            buffer_settings: {
                enabled: enableBuffer,
                delivery_buffer_days: deliveryBufferDays,
                return_buffer_days: returnBufferDays
            },
            product_info: {
                quantity: product.quantity,
                quantity_available: product.quantity_available,
                status: product.availability_status,
                overlapping_rentals: overlappingRentalCount,
                available_for_new_rental: availableForNewRental
            }
        };
    },

    async getProductRentals(productId, yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const monthEnd = new Date(year, month, 0).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('rentals')
            .select(`
                id,
                start_date,
                end_date,
                rental_status,
                total_amount_due,
                users!fk_rentals_renter(
                    id,
                    first_name,
                    last_name,
                    email
                )
            `)
            .eq('product_id', productId)
            .in('rental_status', ['pending_owner_approval', 'pending_payment', 'confirmed', 'active'])
            .lte('start_date', monthEnd)
            .gte('end_date', monthStart)
            .order('start_date', { ascending: true });

        if (error) {
            console.error("Error fetching product rentals:", error);
            throw error;
        }

        // เพิ่ม quantity = 1 เนื่องจากระบบเช่าได้ทีละชิ้น
        const rentalsWithQuantity = (data || []).map(rental => ({
            ...rental,
            quantity: 1
        }));

        return rentalsWithQuantity;
    },

    async create(productData) {
        // Separate image_urls from productData
        const { image_urls, ...productToInsert } = productData;

        console.log("Attempting to insert product data:", productToInsert); // Log data being inserted

        // Insert product into the products table
        const { data: newProductData, error: productError } = await supabase
            .from('products')
            .insert(productToInsert)
            .select('id') // Select only the ID of the newly created product
            .single();

        if (productError || !newProductData) {
            console.error("Error creating product record:", productError); // Log the actual Supabase error object
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to create product record in database.");
        }

        const newProductId = newProductData.id;
        const imagesToInsert = [];

        // Prepare image data for insertion into product_images table
        if (image_urls && image_urls.length > 0) {
            image_urls.forEach((imageUrl, index) => {
                imagesToInsert.push({
                    product_id: newProductId,
                    image_url: imageUrl,
                    alt_text: '', // Default alt text (can be added later)
                    is_primary: index === 0, // Set the first image as primary
                    sort_order: index // Set sort order
                });
            });

            // Insert image data into the product_images table
            const { error: imageError } = await supabase
                .from('product_images')
                .insert(imagesToInsert);

            if (imageError) {
                console.error("Error inserting product images:", imageError); // Log image insertion error
                // Note: In a production app, you might want to delete the created product here
                // to avoid orphaned product records without images.
                throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to save product images.");
            }
        }

        // Fetch the newly created product details by ID without the approval status filter
        const { data: createdProduct, error: fetchCreatedError } = await supabase
            .from('products')
            .select(`
                *,
                province:provinces (id, name_th, name_en),
                category:categories (id, name, slug, description),
                owner:users!fk_products_owner (id, first_name, last_name, profile_picture_url, created_at),
                images:product_images (id, image_url, alt_text, is_primary, sort_order)
            `)
            .eq('id', newProductId)
            .maybeSingle();

         if (fetchCreatedError || !createdProduct) {
             console.error("Error fetching created product details:", fetchCreatedError);
             throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve created product details.");
        }

        // Sort images for the returned product object
        if (createdProduct.images) {
            createdProduct.images.sort((a, b) => {
                if (a.is_primary && !b.is_primary) return -1;
                if (!a.is_primary && b.is_primary) return 1;
                return a.sort_order - b.sort_order;
            });
        } else {
            createdProduct.images = [];
        }

        return createdProduct;
    },

    async findByOwnerId(ownerId, filters = {}) {
        const { page = 1, limit = 10, availability_status, q } = filters;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('products')
            .select(`
                *,
                province:provinces (id, name_th, name_en),
                category:categories (id, name),
                images:product_images (id, image_url, alt_text, is_primary)
            `, { count: 'exact' })
            .eq('owner_id', ownerId)
            .is('deleted_at', null);

        if (availability_status) {
            query = query.eq('availability_status', availability_status);
        }
        
        if (q) {
             query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
        }

        // Default sort for owner products? Maybe by creation date or update date?
        // For now, let's add a default sort.
        query = query.order('created_at', { ascending: false });

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching owner products:", error);
            throw error;
        }

        // Process images to ensure primary image is at the front if needed
        const products = data.map(p => {
            if (p.images) {
                 p.images.sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : 0));
            } else {
                 p.images = [];
            }
            return p;
        });

        return {
            data: products,
            meta: {
                current_page: page,
                per_page: limit,
                total: count,
                last_page: Math.ceil(count / limit),
                from: count > 0 ? offset + 1 : 0,
                to: count > 0 ? Math.min(count, offset + limit) : 0,
            },
             links: {
                // Links can be added here similar to findAll if needed
            }
        };
    },

    // ดึงสินค้ายอดนิยมจากยอดการเช่า (top N)
    async getRentalCountForProduct(productId) {
        const { data: rentals, error: rentalError } = await supabase
            .from('rentals')
            .select('id')
            .eq('product_id', productId)
            .eq('rental_status', 'completed');
        
        if (rentalError) {
            console.error('Error fetching rental count for product:', rentalError);
            throw rentalError;
        }
        
        return (rentals || []).length;
    },

    async getTopRentedProducts(limit = 5) {
        // 1. ดึง rentals ที่ completed และ product_id ไม่เป็น null
        const { data: rentals, error: rentalError } = await supabase
            .from('rentals')
            .select('product_id')
            .eq('rental_status', 'completed')
            .not('product_id', 'is', null);
        if (rentalError) {
            console.error('Error fetching rentals:', rentalError);
            throw rentalError;
        }
        // 2. Group by product_id ใน JS
        const rentalCountMap = {};
        (rentals || []).forEach(r => {
            if (!r.product_id) return;
            rentalCountMap[r.product_id] = (rentalCountMap[r.product_id] || 0) + 1;
        });
        // 3. เรียงลำดับ top N
        const topProductIds = Object.entries(rentalCountMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([productId]) => parseInt(productId, 10));
        
        // ถ้าไม่มีสินค้าที่เช่าแล้ว ให้ fallback เป็นสินค้าล่าสุด
        if (topProductIds.length === 0) {
            const { data: fallbackProducts, error: fallbackError } = await supabase
                .from('products')
                .select(`
                    id, title, slug, rental_price_per_day, average_rating, total_reviews, view_count, quantity_available, availability_status,
                    province:provinces (id, name_th),
                    category:categories (id, name),
                    primary_image:product_images (image_url)
                `)
                .eq('admin_approval_status', 'approved')
                .in('availability_status', ['available', 'rented_out'])
                .is('deleted_at', null)
                .eq('primary_image.is_primary', true)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (fallbackError) {
                console.error('Error fetching fallback products:', fallbackError);
                return [];
            }
            
            return (fallbackProducts || []).map(p => ({
                ...p,
                primary_image: p.primary_image && p.primary_image.length > 0 ? p.primary_image[0] : { image_url: null },
                category: p.category || null,
                rental_count: 0
            }));
        }
        // 4. ดึงข้อมูลสินค้า
        const { data: products, error: productError } = await supabase
            .from('products')
            .select(`
                id, title, slug, rental_price_per_day, average_rating, total_reviews, view_count, quantity_available, availability_status,
                province:provinces (id, name_th),
                category:categories (id, name),
                primary_image:product_images (image_url)
            `)
            .in('id', topProductIds)
            .eq('admin_approval_status', 'approved')
            .in('availability_status', ['available', 'rented_out'])
            .is('deleted_at', null);
        if (productError) {
            console.error('Error fetching products for top rented:', productError);
            throw productError;
        }
        // 5. Join ข้อมูลยอดเช่าเข้าไปในสินค้า
        const productMap = {};
        (products || []).forEach(p => {
            productMap[p.id] = {
                ...p,
                primary_image: p.primary_image && p.primary_image.length > 0 ? p.primary_image[0] : { image_url: null },
                category: p.category || null,
                rental_count: rentalCountMap[p.id] || 0
            };
        });
        // 6. คืน array ตามลำดับยอดเช่า
        return topProductIds.map(id => productMap[id]).filter(Boolean);
    },

    // อัปเดตจำนวนสินค้าที่พร้อมให้เช่า และจัดการ availability_status อัตโนมัติ
    async updateQuantityAvailable(productId, quantityChange) {
        try {
            // ดึงข้อมูลสินค้าปัจจุบัน
            const { data: currentProduct, error: fetchError } = await supabase
                .from('products')
                .select('quantity, quantity_available, availability_status')
                .eq('id', productId)
                .single();

            if (fetchError) {
                console.error('Error fetching product for quantity update:', fetchError);
                throw fetchError;
            }

            if (!currentProduct) {
                throw new ApiError(httpStatusCodes.NOT_FOUND, "Product not found for quantity update.");
            }

            // คำนวณ quantity_available ใหม่
            const newQuantityAvailable = Math.max(0, currentProduct.quantity_available + quantityChange);
            
            // ป้องกันไม่ให้ quantity_available เกิน quantity
            const finalQuantityAvailable = Math.min(newQuantityAvailable, currentProduct.quantity);

            // กำหนด availability_status ใหม่ตาม business logic
            let newAvailabilityStatus = currentProduct.availability_status;
            
            // ถ้าสินค้าหมด (quantity_available = 0) และเดิมเป็น available
            if (finalQuantityAvailable === 0 && currentProduct.availability_status === 'available') {
                newAvailabilityStatus = 'rented_out';
            }
            // ถ้าสินค้ากลับมามี (quantity_available > 0) และเดิมเป็น rented_out
            else if (finalQuantityAvailable > 0 && currentProduct.availability_status === 'rented_out') {
                newAvailabilityStatus = 'available';
            }

            // อัปเดตฐานข้อมูล
            const { data: updatedProduct, error: updateError } = await supabase
                .from('products')
                .update({
                    quantity_available: finalQuantityAvailable,
                    availability_status: newAvailabilityStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', productId)
                .select('id, quantity, quantity_available, availability_status')
                .single();

            if (updateError) {
                console.error('Error updating product quantity:', updateError);
                throw updateError;
            }

            console.log(`Product ${productId} quantity updated: ${currentProduct.quantity_available} → ${finalQuantityAvailable}, status: ${currentProduct.availability_status} → ${newAvailabilityStatus}`);
            
            // Emit real-time quantity update via WebSocket
            try {
                emitQuantityUpdate(productId, {
                    product_id: productId,
                    quantity_available: finalQuantityAvailable,
                    quantity_reserved: currentProduct.quantity - finalQuantityAvailable,
                    availability_status: newAvailabilityStatus,
                    old_quantity_available: currentProduct.quantity_available,
                    old_availability_status: currentProduct.availability_status
                });
            } catch (socketError) {
                console.error('Error emitting quantity update:', socketError);
                // Don't throw error as socket emission failure shouldn't break the main operation
            }
            
            return updatedProduct;

        } catch (error) {
            console.error('Error in updateQuantityAvailable:', error);
            throw error;
        }
    },

    // ตรวจสอบความพร้อมของสินค้าก่อนการเช่า (Race Condition Protection)
    async checkAndReserveQuantity(productId, requestedQuantity = 1) {
        try {
            // ใช้ transaction เพื่อป้องกัน race condition
            const { data: product, error: fetchError } = await supabase
                .from('products')
                .select('id, quantity, quantity_available, availability_status, title')
                .eq('id', productId)
                .eq('admin_approval_status', 'approved')
                .is('deleted_at', null)
                .single();

            if (fetchError) {
                console.error('Error fetching product for reservation:', fetchError);
                throw fetchError;
            }

            if (!product) {
                throw new ApiError(httpStatusCodes.NOT_FOUND, "Product not found or not approved.");
            }

            // ตรวจสอบสถานะสินค้า - อนุญาตให้เช่าได้ถ้าเป็น available หรือ rented_out แต่มี quantity_available เพียงพอ
            if (product.availability_status !== 'available' && product.availability_status !== 'rented_out') {
                throw new ApiError(httpStatusCodes.BAD_REQUEST, 
                    `Product "${product.title}" is currently not available for rental. Status: ${product.availability_status}`);
            }

            // ตรวจสอบจำนวนที่พร้อมให้เช่า
            if (product.quantity_available < requestedQuantity) {
                throw new ApiError(httpStatusCodes.BAD_REQUEST, 
                    `Product "${product.title}" is currently out of stock. Available: ${product.quantity_available}, Requested: ${requestedQuantity}`);
            }

            // ถ้าผ่านการตรวจสอบทั้งหมด ให้จอง quantity ไว้ชั่วคราว
            // (ในระบบจริงอาจใช้ Redis หรือ database lock)
            await this.updateQuantityAvailable(productId, -requestedQuantity);

            return {
                success: true,
                product: product,
                reserved_quantity: requestedQuantity
            };

        } catch (error) {
            console.error('Error in checkAndReserveQuantity:', error);
            throw error;
        }
    },

    // คืน quantity เมื่อการเช่าถูกยกเลิกหรือล้มเหลว (Rollback)
    async releaseReservedQuantity(productId, quantityToRelease = 1, reason = 'rental_cancelled') {
        try {
            console.log(`Releasing ${quantityToRelease} units for product ${productId}. Reason: ${reason}`);
            
            const updatedProduct = await this.updateQuantityAvailable(productId, quantityToRelease);
            
            return {
                success: true,
                product: updatedProduct,
                released_quantity: quantityToRelease,
                reason: reason
            };

        } catch (error) {
            console.error('Error in releaseReservedQuantity:', error);
            throw error;
        }
    },

    // ตรวจสอบและซิงค์ quantity_available กับการเช่าจริง (Maintenance function)
    async syncProductQuantities(productId = null) {
        try {
            let query = supabase
                .from('products')
                .select('id, quantity, quantity_available, title');

            if (productId) {
                query = query.eq('id', productId);
            } else {
                // ซิงค์เฉพาะสินค้าที่ active
                query = query.in('availability_status', ['available', 'rented_out'])
                           .is('deleted_at', null);
            }

            const { data: products, error: fetchError } = await query;

            if (fetchError) {
                console.error('Error fetching products for sync:', fetchError);
                throw fetchError;
            }

            const syncResults = [];

            for (const product of products) {
                // นับจำนวนการเช่าที่ active
                const { data: activeRentals, error: rentalError } = await supabase
                    .from('rentals')
                    .select('id')
                    .eq('product_id', product.id)
                    .in('rental_status', ['confirmed', 'active']);

                if (rentalError) {
                    console.error(`Error fetching rentals for product ${product.id}:`, rentalError);
                    continue;
                }

                const activeRentalCount = activeRentals?.length || 0;
                const correctQuantityAvailable = Math.max(0, product.quantity - activeRentalCount);

                // ถ้า quantity_available ไม่ตรงกับที่คำนวณได้
                if (product.quantity_available !== correctQuantityAvailable) {
                    console.log(`Syncing product ${product.id}: ${product.quantity_available} → ${correctQuantityAvailable}`);
                    
                    const quantityDiff = correctQuantityAvailable - product.quantity_available;
                    await this.updateQuantityAvailable(product.id, quantityDiff);
                    
                    syncResults.push({
                        product_id: product.id,
                        title: product.title,
                        old_quantity_available: product.quantity_available,
                        new_quantity_available: correctQuantityAvailable,
                        active_rentals: activeRentalCount
                    });
                }
            }

            return {
                success: true,
                synced_products: syncResults.length,
                details: syncResults
            };

        } catch (error) {
            console.error('Error in syncProductQuantities:', error);
            throw error;
        }
    }
};

export default ProductModel;