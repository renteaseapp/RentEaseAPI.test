import RentalModel from '../models/rental.model.js';
import ProductModel from '../models/product.model.js';
import UserAddressModel from '../models/userAddress.model.js';
import SystemSettingModel from '../models/systemSetting.model.js';
import RentalStatusHistoryModel from '../models/rentalStatusHistory.model.js';
import PaymentTransactionModel from '../models/payment_transaction.model.js'; // For manual payment proof
import FileService from './file.service.js'; // For payment proof upload
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import NotificationService from './notification.service.js';
import supabase from '../db/supabaseClient.js';
import { getCurrentDateISO, formatDate, startOfDay, endOfDay } from '../utils/timezoneUtils.js';

// Import realtime event emitters
import { 
    emitRentalCreated, 
    emitRentalUpdate, 
    emitProductUpdate,
    emitQuantityUpdate,
    emitNotificationToUser,
    emitNotificationToRole
} from '../server.js';

const RentalService = {
    /**
     * คำนวณค่าปรับล่าช้าสำหรับการเช่า
     * @param {Object} rental - ข้อมูลการเช่า
     * @param {Date} actualReturnTime - เวลาคืนจริง
     * @returns {number} - จำนวนค่าปรับ
     */
    async calculateLateFee(rental, actualReturnTime) {
        const endDate = new Date(rental.end_date);
        const returnTime = new Date(actualReturnTime);
        
        // ถ้าคืนก่อนหรือตรงเวลา ไม่มีค่าปรับ
        if (returnTime <= endDate) {
            return 0;
        }
        
        // คำนวณจำนวนวันที่ล่าช้า
        const timeDiff = returnTime.getTime() - endDate.getTime();
        const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysLate <= 0) {
            return 0;
        }
        
        // ดึงค่า late fee per day จาก system settings
        const lateFeeSetting = await SystemSettingModel.getSetting('late_fee_per_day', '0');
        const lateFeePerDay = parseFloat(lateFeeSetting.setting_value) || 0;
        
        // คำนวณค่าปรับรวม
        const totalLateFee = daysLate * lateFeePerDay;
        
        return totalLateFee;
    },

    async createRentalRequest(renterId, rentalRequestData) {
        const { product_id, start_date, end_date, pickup_method, delivery_address_id, notes_from_renter } = rentalRequestData;

        const product = await ProductModel.findByIdOrSlug(product_id); // Uses forUpdate = false by default
        if (!product || (product.availability_status !== 'available' && product.availability_status !== 'rented_out') || product.admin_approval_status !== 'approved') {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Product not available or not found.");
        }
        if (product.owner_id === renterId) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "You cannot rent your own product.");
        }

        // ตรวจสอบว่าสินค้ามีจำนวนเพียงพอสำหรับการเช่า (ไม่จองไว้ตอนนี้)
        if (product.quantity_available < 1) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Product is currently out of stock.");
        }

        const startDateObj = new Date(start_date);
        const endDateObj = new Date(end_date);
        const rentalDurationDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;

        if (rentalDurationDays < (product.min_rental_duration_days || 1)) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, `Minimum rental duration is ${product.min_rental_duration_days || 1} days.`);
        }
        if (product.max_rental_duration_days && rentalDurationDays > product.max_rental_duration_days) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, `Maximum rental duration is ${product.max_rental_duration_days} days.`);
        }

        let validDeliveryAddressId = null;
        if (pickup_method === 'delivery') {
            if (!delivery_address_id) {
                throw new ApiError(httpStatusCodes.BAD_REQUEST, "Delivery address is required for delivery pickup method.");
            }
            const address = await UserAddressModel.findByIdAndUserId(delivery_address_id, renterId);
            if (!address) {
                throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid delivery address ID.");
            }
            validDeliveryAddressId = address.id;
        }

        const subtotalRentalFee = product.rental_price_per_day * rentalDurationDays;
        let deliveryFee = 0;
        if (pickup_method === 'delivery') {
            const deliveryFeeBaseSetting = await SystemSettingModel.getSetting('delivery_fee_base', '0');
            deliveryFee = parseFloat(deliveryFeeBaseSetting.setting_value) || 0;
        }
        let platformFeeRenter = 0;
        const platformFeeRenterPercentSetting = await SystemSettingModel.getSetting('platform_fee_percentage', '0');
        const platformFeeRenterPercent = parseFloat(platformFeeRenterPercentSetting.setting_value) / 100 || 0;
        if (platformFeeRenterPercent > 0) {
            platformFeeRenter = subtotalRentalFee * platformFeeRenterPercent;
        }
        let platformFeeOwner = 0;
        const platformFeeOwnerPercentSetting = await SystemSettingModel.getSetting('platform_fee_owner_percentage', '0');
        const platformFeeOwnerPercent = parseFloat(platformFeeOwnerPercentSetting.setting_value) / 100 || 0;
        if (platformFeeOwnerPercent > 0) {
            platformFeeOwner = subtotalRentalFee * platformFeeOwnerPercent;
        }
        const securityDeposit = product.security_deposit || 0;
        
        // ตรวจสอบความถูกต้องของการคำนวณ
        if (subtotalRentalFee < 0) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid rental fee calculation.");
        }
        if (deliveryFee < 0) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid delivery fee calculation.");
        }
        if (platformFeeRenter < 0) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid platform fee calculation for renter.");
        }
        if (platformFeeOwner < 0) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid platform fee calculation for owner.");
        }
        if (securityDeposit < 0) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid security deposit amount.");
        }
        
        const totalAmountDue = subtotalRentalFee + securityDeposit + deliveryFee + platformFeeRenter;
        
        // ตรวจสอบยอดรวมสุดท้าย
        if (totalAmountDue < 0) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid total amount calculation.");
        }
        
        // const requiresOwnerApproval = product.settings?.requires_approval ?? true; // Example if product has such setting
        const requiresOwnerApproval = true; // Default for now
        let initialRentalStatus = requiresOwnerApproval ? 'pending_owner_approval' : 'pending_payment';
        let initialPaymentStatus = 'unpaid';

        const rentalPayload = {
            renter_id: renterId, product_id: product.id, owner_id: product.owner_id,
            start_date, end_date,
            rental_price_per_day_at_booking: product.rental_price_per_day,
            security_deposit_at_booking: securityDeposit,
            calculated_subtotal_rental_fee: subtotalRentalFee, delivery_fee: deliveryFee,
            platform_fee_renter: platformFeeRenter, platform_fee_owner: platformFeeOwner, total_amount_due: totalAmountDue,
            pickup_method, return_method: pickup_method === 'delivery' ? 'owner_pickup' : 'self_return',
            delivery_address_id: validDeliveryAddressId, rental_status: initialRentalStatus,
            payment_status: initialPaymentStatus, notes_from_renter,
            return_condition_status: 'not_yet_returned',
        };
        const rental = await RentalModel.create(rentalPayload);
        
        // Emit realtime events
        emitRentalCreated(rental);
        
        // Emit product quantity update
        emitQuantityUpdate(product.id, {
            product_id: product.id,
            quantity_available: product.quantity_available - 1,
            quantity_reserved: product.quantity_reserved + 1
        });
        
        // แจ้งเตือน owner ว่ามีคำขอเช่าใหม่
        await NotificationService.createNotification({
            user_id: product.owner_id,
            type: 'rental_requested',
            title: 'คุณได้รับคำขอเช่าใหม่',
            message: `มีคำขอเช่าสินค้า '${product.title}' จากผู้เช่าใหม่ กรุณาตรวจสอบและอนุมัติ`,
            link_url: `/owner/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        });
        
        return rental;
    },

    async approveRentalRequest(rentalIdOrUid, ownerId) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental request not found.");
        }
        if (rental.owner_id !== ownerId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "You are not authorized to approve this rental.");
        }
        if (rental.rental_status !== 'pending_owner_approval') {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, `Rental is not pending owner approval. Current status: ${rental.rental_status}`);
        }

        let quantityReserved = false;
        
        try {
            // ใช้ checkAndReserveQuantity เพื่อตรวจสอบและจองจำนวนสินค้าอย่างปลอดภัย
            await ProductModel.checkAndReserveQuantity(rental.product_id, 1);
            quantityReserved = true;
        } catch (error) {
            if (error.message.includes('insufficient quantity') || error.message.includes('unavailable') || error.message.includes('not available for rental') || error.message.includes('out of stock')) {
                throw new ApiError(httpStatusCodes.BAD_REQUEST, 
                    "Product became unavailable while pending approval. Please reject this rental request.");
            }
            throw error;
        }

        try {
            const updatedRental = await RentalModel.update(rental.id, { rental_status: 'pending_payment' });
            await RentalStatusHistoryModel.create(rental.id, 'pending_payment', ownerId, "Rental approved by owner.", rental.rental_status);
            
            // ดึงข้อมูลสินค้าเพื่อใช้ในการแจ้งเตือน
            const product = await ProductModel.findByIdOrSlug(rental.product_id);
            
            // Emit realtime events
            emitRentalUpdate(updatedRental.id, updatedRental);
            
            // Notification: แจ้ง renter ว่าได้รับการอนุมัติ
            await NotificationService.createNotification({
                user_id: rental.renter_id,
                type: 'rental_approved',
                title: 'คำขอเช่าของคุณได้รับการอนุมัติ',
                message: `คำขอเช่าสินค้า ${product.title} ได้รับการอนุมัติ`,
                link_url: `/rentals/${rental.id}`,
                related_entity_type: 'rental',
                related_entity_id: rental.id,
                related_entity_uid: rental.rental_uid
            });
            
            return updatedRental;
        } catch (error) {
            // หากการอัปเดต rental ล้มเหลว ให้คืน quantity ที่จองไว้
            if (quantityReserved) {
                try {
                    await ProductModel.releaseReservedQuantity(rental.product_id, 1, 'rental_approval_failed');
                } catch (rollbackError) {
                    console.error('Failed to rollback quantity reservation:', rollbackError);
                }
            }
            throw error;
        }
    },

    async rejectRentalRequest(rentalIdOrUid, ownerId, reason) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }
        if (rental.owner_id !== ownerId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "You are not authorized to reject this rental.");
        }
        if (rental.rental_status !== 'pending_owner_approval') {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, `Rental is not pending owner approval. Current status: ${rental.rental_status}`);
        }

        const updatePayload = {
            rental_status: 'rejected_by_owner',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString(),
            cancelled_by_user_id: ownerId
        };
        const updatedRental = await RentalModel.update(rental.id, updatePayload);
        await RentalStatusHistoryModel.create(rental.id, 'rejected_by_owner', ownerId, `Rejected: ${reason}`, rental.rental_status);
        
        // Emit realtime events
        emitRentalUpdate(updatedRental.id, updatedRental);
        
        // Notification: แจ้ง renter ว่าถูกปฏิเสธ
        await NotificationService.createNotification({
            user_id: rental.renter_id,
            type: 'rental_rejected',
            title: 'คำขอเช่าของคุณถูกปฏิเสธ',
            message: `คำขอเช่าสินค้า ${rental.product_id} ถูกปฏิเสธ: ${reason}`,
            link_url: `/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        });
        return updatedRental;
    },

    async submitPaymentProof(rentalIdOrUid, renterId, fileObject, paymentDetails) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }
        if (rental.renter_id !== renterId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "You are not authorized for this rental.");
        }
        if (rental.rental_status !== 'pending_payment') {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, `Rental is not pending payment. Current status: ${rental.rental_status}`);
        }
        if (!fileObject) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Payment proof image is required.");
        }

        // Upload proof (e.g., to 'payment-proofs' bucket)
        const fileName = `rental-${rental.id}-proof-${Date.now()}.${fileObject.originalname.split('.').pop()}`;
        const filePath = `public/${fileName}`; // Adjust path as needed
        const { publicUrl: proofUrl } = await FileService.uploadFileToSupabaseStorage(fileObject, 'payment-proofs', filePath);

        if (!proofUrl) {
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to upload payment proof.");
        }

        const amountPaid = paymentDetails.amount_paid ? parseFloat(paymentDetails.amount_paid) : rental.total_amount_due;

        const updatePayload = {
            payment_proof_url: proofUrl,
            rental_status: 'confirmed',
            payment_status: 'pending_verification', // Or 'paid' if auto-verified
            final_amount_paid: amountPaid
        };
        const updatedRental = await RentalModel.update(rental.id, updatePayload);
        await RentalStatusHistoryModel.create(rental.id, 'confirmed', renterId, "Payment proof submitted.", rental.rental_status);

        // Emit realtime events
        emitRentalUpdate(updatedRental.id, updatedRental);

        // Create payment transaction record
        await PaymentTransactionModel.create({
            rental_id: rental.id,
            user_id: renterId,
            transaction_type: 'rental_payment',
            amount: amountPaid,
            currency: 'THB', // Assuming THB
            status: 'pending', // Or 'successful' if auto-verified
            payment_method_name: 'manual_bank_transfer',
            payment_method_details: {
                transaction_time: paymentDetails.transaction_time || new Date().toISOString(),
                proof_url: proofUrl
            },
            transaction_time: paymentDetails.transaction_time ? new Date(paymentDetails.transaction_time) : new Date(),
        });
        
        // หมายเหตุ: quantity ถูกจองไว้แล้วตอน createRental
        // เมื่อชำระเงินสำเร็จ quantity จะถูกหักจริงใน payment verification

        // แจ้งเตือน owner ว่ามีการอัปโหลดสลิป รอการตรวจสอบ
        await NotificationService.createNotification({
            user_id: rental.owner_id,
            type: 'payment_proof_uploaded',
            title: 'ผู้เช่าอัปโหลดสลิปการชำระเงิน',
            message: `ผู้เช่าสำหรับสินค้า '${rental.product?.title || ''}' ได้อัปโหลดสลิปการชำระเงิน กรุณาตรวจสอบและยืนยันการชำระเงิน`,
            link_url: `/owner/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        });

        return updatedRental;
    },

    async checkRentalPaymentStatus(rentalIdOrUid, userId) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }
        // Ensure user is either renter or owner (or admin later)
        if (rental.renter_id !== userId && rental.owner_id !== userId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "You are not authorized to view this rental's payment status.");
        }
        return { payment_status: rental.payment_status, rental_status: rental.rental_status };
    },

    async cancelRentalByUser(rentalIdOrUid, userId, reason) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }

        // Policy: Renter can cancel if pending_owner_approval, pending_payment.
        // Owner can cancel if ... (different logic, maybe different endpoint)
        // For this function, assume it's the renter cancelling.
        if (rental.renter_id !== userId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "You are not authorized to cancel this rental.");
        }

        const cancellableStatuses = ['pending_owner_approval', 'pending_payment', 'confirmed'];
        if (!cancellableStatuses.includes(rental.rental_status)) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, `Rental cannot be cancelled. Current status: ${rental.rental_status}`);
        }
        // Add more specific cancellation policies (e.g., before X days of start_date if 'confirmed')

        const updatePayload = {
            rental_status: 'cancelled_by_renter',
            cancellation_reason: reason,
            cancelled_at: getCurrentDateISO(),
            cancelled_by_user_id: userId
        };
        const updatedRental = await RentalModel.update(rental.id, updatePayload);
        await RentalStatusHistoryModel.create(rental.id, 'cancelled_by_renter', userId, `Cancelled by renter: ${reason}`, rental.rental_status);

        // Emit realtime events
        emitRentalUpdate(updatedRental.id, updatedRental);

        // If product quantity was decremented, increment it back
        if (['confirmed', 'active'].includes(rental.rental_status) && rental.product?.id) {
            try {
                await ProductModel.releaseReservedQuantity(rental.product.id, 1, 'rental_cancelled');
            } catch (qtyError) {
                console.error("Error restoring product quantity after cancellation:", qtyError);
            }
        }

        // Notification: แจ้ง owner ว่าผู้เช่ายกเลิก
        await NotificationService.createNotification({
            user_id: rental.owner_id,
            type: 'rental_cancelled',
            title: 'ผู้เช่ายกเลิกการเช่า',
            message: `ผู้เช่ายกเลิกการเช่าสินค้า รหัส ${rental.id}`,
            link_url: `/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        });
        return updatedRental;
    },

    async getRentalsForUser(userId, userRole, filters = {}) {
        return RentalModel.findForUser(userId, userRole, filters);
    },

    async getRentalDetailsForUser(rentalIdOrUid, userId) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }
        if (rental.renter_id !== userId && rental.owner_id !== userId) {
            // Later, an admin check can be added here
            throw new ApiError(httpStatusCodes.FORBIDDEN, "You are not authorized to view this rental.");
        }
        // Optionally, fetch more related data like full payment transaction history
        // rental.payment_transactions = await PaymentTransactionModel.findByRentalId(rental.id);
        return rental;
    },

    // Placeholder for Renter Dashboard specific data fetching
    async getRenterDashboardData(renterId) {
        const activeRentals = await RentalModel.findForUser(renterId, 'renter', { status: 'active', limit: 5 });
        const confirmed = await RentalModel.findForUser(renterId, 'renter', { status: 'confirmed', limit: 3 });
        const pendingPayment = await RentalModel.findForUser(renterId, 'renter', { status: 'pending_payment', limit: 3 });
        const pendingApproval = await RentalModel.findForUser(renterId, 'renter', { status: 'pending_owner_approval', limit: 3 });
        const completed = await RentalModel.findForUser(renterId, 'renter', { status: 'completed', limit: 3 });
        const cancelled = await RentalModel.findForUser(renterId, 'renter', { status: ['cancelled_by_renter','cancelled_by_owner','rejected_by_owner'], limit: 3 });
        const lateReturn = await RentalModel.findForUser(renterId, 'renter', { status: 'late_return', limit: 3 });
        // TODO: ดึง wishlist_summary จาก WishlistService ถ้ามี
        return {
            current_active_rentals: {
                data: activeRentals.data,
                total: activeRentals.pagination.total
            },
            confirmed_rentals: {
                data: confirmed.data,
                total: confirmed.pagination.total
            },
            pending_action_rentals: {
                data: pendingPayment.data,
                total: pendingPayment.pagination.total
            },
            pending_approval_rentals: {
                data: pendingApproval.data,
                total: pendingApproval.pagination.total
            },
            completed_rentals: {
                data: completed.data,
                total: completed.pagination.total
            },
            cancelled_rentals: {
                data: cancelled.data,
                total: cancelled.pagination.total
            },
            late_return_rentals: {
                data: lateReturn.data,
                total: lateReturn.pagination.total
            },
            // wishlist_summary: ...
        };
    },

    async initiateReturn(rentalIdOrUid, renterId, returnDetails, receiptImage = null) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }
        if (rental.renter_id !== renterId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "You are not authorized to initiate a return for this rental.");
        }
        if (!["active", "confirmed"].includes(rental.rental_status)) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, `Cannot initiate return. Rental status is currently '${rental.rental_status}'.`);
        }
        if (returnDetails.return_method === 'shipping' && (!returnDetails.return_details || !returnDetails.return_details.carrier)) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Carrier is required for shipping return.");
        }

        // Map FE value to DB enum
        let dbReturnMethod = returnDetails.return_method;
        if (dbReturnMethod === 'shipping') dbReturnMethod = 'owner_pickup';
        if (dbReturnMethod === 'in_person') dbReturnMethod = 'self_return';



        const updatePayload = {
            rental_status: 'return_pending',
            return_method: dbReturnMethod,
            return_details: {}, // We'll populate this based on the method
            return_initiated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        let notificationMessage = `ผู้เช่า (${rental.renter.first_name}) ได้เริ่มขั้นตอนการคืนสินค้า '${rental.product.title}'.`;

        if (returnDetails.return_method === 'shipping') {
            updatePayload.return_details = returnDetails.return_details;
            notificationMessage += `\n- วิธีการ: ส่งพัสดุ`;
            notificationMessage += `\n- บริษัทขนส่ง: ${returnDetails.return_details.carrier}`;
            notificationMessage += `\n- เลข Tracking: ${returnDetails.return_details.tracking_number}`;
            if (receiptImage) {
                const bucketName = 'shipping-receipts';
                // Sanitize filename to remove invalid characters for Supabase storage
                const sanitizedOriginalName = receiptImage.originalname
                    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars with underscore
                    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
                    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
                
                const fileName = `rental-${rental.id}-receipt-${Date.now()}-${sanitizedOriginalName}`;
                const { publicUrl } = await FileService.uploadFileToSupabaseStorage(receiptImage, bucketName, `public/${fileName}`);
                updatePayload.return_shipping_receipt_url = publicUrl;
                notificationMessage += `\n- มีการแนบสลิปการส่ง`;
            }
        } else if (returnDetails.return_method === 'in_person') {
            updatePayload.return_details = returnDetails.return_details;
            notificationMessage += `\n- วิธีการ: นัดรับ`;
            notificationMessage += `\n- สถานที่: ${returnDetails.return_details.location}`;
            notificationMessage += `\n- วันเวลา: ${returnDetails.return_details.return_datetime}`;
        }
        if(returnDetails.notes) {
            notificationMessage += `\n- หมายเหตุ: ${returnDetails.notes}`;
        }

        const updatedRental = await RentalModel.update(rental.id, updatePayload);

        await RentalStatusHistoryModel.create(
            rental.id,
            'return_pending',
            renterId,
            `Renter initiated return process. Method: ${returnDetails.return_method}.`,
            rental.rental_status
        );

        // Emit realtime events
        emitRentalUpdate(updatedRental.id, updatedRental);

        await NotificationService.createNotification({
            user_id: rental.owner_id,
            type: 'renter_initiated_return',
            title: 'ผู้เช่าเริ่มขั้นตอนการคืนสินค้า',
            message: notificationMessage,
            link_url: `/owner/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        });

        return updatedRental;
    },

    // --- เพิ่มฟังก์ชัน payout อัตโนมัติ ---
    async createPayoutTransactionForRental(rental) {
        // ตรวจสอบว่ามี payout transaction นี้แล้วหรือยัง (ป้องกันซ้ำ)
        const { data: existing } = await supabase
            .from('payment_transactions')
            .select('id')
            .eq('user_id', rental.owner_id)
            .eq('rental_id', rental.id)
            .eq('transaction_type', 'rental_fee_payout')
            .maybeSingle();
        if (existing) return; // มีแล้ว ไม่ต้องสร้างซ้ำ
        
        // คำนวณยอด payout (ไม่รวมค่าปรับล่าช้า เพราะหักจากเงินประกันแล้ว)
        const base = rental.final_amount_paid ?? rental.total_amount_due ?? 0;
        const payout = base - (rental.platform_fee_owner ?? 0);
        
        // สร้าง transaction สำหรับค่าปรับล่าช้า (ถ้ามี) - เป็นการบันทึกการหักจากเงินประกัน
        const lateFee = rental.late_fee_calculated ?? 0;
        if (lateFee > 0) {
            await supabase.from('payment_transactions').insert([{
                user_id: rental.owner_id,
                rental_id: rental.id,
                transaction_type: 'late_fee_payment',
                amount: lateFee,
                status: 'successful',
                transaction_time: new Date().toISOString(),
                notes: `Late fee deducted from security deposit for ${Math.ceil(lateFee / (rental.rental_price_per_day_at_booking || 1))} days overdue`
            }]);
        }
        
        await supabase.from('payment_transactions').insert([{
            user_id: rental.owner_id,
            rental_id: rental.id,
            transaction_type: 'rental_fee_payout',
            amount: payout,
            status: 'successful',
            transaction_time: new Date().toISOString()
        }]);
    },

    async processReturn(rentalIdOrUid, ownerId, returnData, imageFiles = []) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }
        if (rental.owner_id !== ownerId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "You are not authorized to process return for this rental.");
        }
        const validStatusesForReturn = ['active', 'return_pending', 'late_return'];
        if (!validStatusesForReturn.includes(rental.rental_status)) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, `Cannot process return. Rental status is '${rental.rental_status}'.`);
        }
        const { actual_return_time, return_condition_status, notes_from_owner_on_return, initiate_claim } = returnData;
        const updatePayload = {
            actual_return_time,
            return_condition_status,
            notes_from_owner_on_return,
            updated_at: new Date().toISOString()
        };
        let newRentalStatus = 'completed';
        if (initiate_claim && (return_condition_status === 'damaged' || return_condition_status === 'lost')) {
            newRentalStatus = 'dispute';
        }
        updatePayload.rental_status = newRentalStatus;

        // คำนวณค่าปรับล่าช้า (ถ้ามี) และหักจากเงินประกัน
        let lateFee = 0;
        let securityDepositRefund = rental.security_deposit_at_booking || 0;
        if (actual_return_time) {
            lateFee = await this.calculateLateFee(rental, actual_return_time);
            updatePayload.late_fee_calculated = lateFee;
            
            // ตรวจสอบความถูกต้องของการคำนวณค่าปรับล่าช้า
            if (lateFee < 0) {
                throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid late fee calculation.");
            }
            
            // หักค่าปรับล่าช้าจากเงินประกัน
            if (lateFee > 0) {
                securityDepositRefund = Math.max(0, securityDepositRefund - lateFee);
                updatePayload.security_deposit_refund_amount = securityDepositRefund;
            }
            
            // ตรวจสอบความถูกต้องของการคำนวณเงินประกันที่จะคืน
            if (securityDepositRefund < 0) {
                throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid security deposit refund calculation.");
            }
        }

        // Handle return condition images
        if (imageFiles && imageFiles.length > 0) {
            const imageUrls = [];
            const bucketName = 'return-condition-images';
            for (const file of imageFiles) {
                // Sanitize filename to remove invalid characters for Supabase storage
                const sanitizedOriginalName = file.originalname
                    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars with underscore
                    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
                    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
                
                const fileName = `rental-${rental.id}-return-${Date.now()}-${sanitizedOriginalName}`;
                const { publicUrl } = await FileService.uploadFileToSupabaseStorage(file, bucketName, `public/${fileName}`);
                if (publicUrl) imageUrls.push(publicUrl);
            }
            updatePayload.return_condition_image_urls = imageUrls;
        }
        const updatedRental = await RentalModel.update(rental.id, updatePayload);
        await RentalStatusHistoryModel.create(
            rental.id, 
            newRentalStatus, 
            ownerId, 
            `Return processed. Condition: ${return_condition_status}. Notes: ${notes_from_owner_on_return || ''}`, 
            rental.rental_status
        );

        // Emit realtime events
        emitRentalUpdate(updatedRental.id, updatedRental);

        if (newRentalStatus === 'completed') {
            try {
                if (rental.product_id) {
                    await ProductModel.releaseReservedQuantity(rental.product_id, 1, 'rental_completed');
                }
            } catch (qtyError) {
                console.error("Error restoring product quantity after completion:", qtyError);
            }
            // --- เรียก payout อัตโนมัติ ---
            await this.createPayoutTransactionForRental({ ...rental, ...updatePayload });
            
            // ส่งการแจ้งเตือนให้ผู้เช่าทราบเรื่องการคืนเงินประกัน
            let notificationMessage = `การคืนสินค้าสำหรับ '${rental.product?.title || ''}' ได้รับการยืนยันเรียบร้อยแล้ว`;
            
            if (lateFee > 0) {
                notificationMessage += `\n\nค่าปรับล่าช้า: ฿${lateFee.toLocaleString()} (หักจากเงินประกัน)`;
                notificationMessage += `\nเงินประกันที่จะได้รับคืน: ฿${securityDepositRefund.toLocaleString()}`;
                notificationMessage += `\n\nกรุณาติดต่อเจ้าของสินค้าผ่านแชทเพื่อรับเงินประกันคืน`;
            } else {
                notificationMessage += `\n\nเงินประกัน: ฿${securityDepositRefund.toLocaleString()}`;
                notificationMessage += `\nกรุณาติดต่อเจ้าของสินค้าผ่านแชทเพื่อรับเงินประกันคืน`;
            }
            
            // Send notification to renter about completion
            await NotificationService.createNotification({
                user_id: rental.renter_id,
                type: 'return_confirmed',
                title: 'การคืนสินค้าของคุณได้รับการยืนยัน',
                message: notificationMessage,
                link_url: `/rentals/${rental.id}`,
                related_entity_type: 'rental',
                related_entity_id: rental.id,
                related_entity_uid: rental.rental_uid
            });
            
            // ส่งการแจ้งเตือนให้เจ้าของสินค้าทราบเรื่องการคืนเงินประกัน
            let ownerNotificationMessage = `การคืนสินค้า '${rental.product?.title || ''}' เสร็จสิ้นแล้ว`;
            
            if (lateFee > 0) {
                ownerNotificationMessage += `\n\nค่าปรับล่าช้า: ฿${lateFee.toLocaleString()} (หักจากเงินประกันแล้ว)`;
                ownerNotificationMessage += `\nเงินประกันที่ต้องคืนให้ผู้เช่า: ฿${securityDepositRefund.toLocaleString()}`;
                ownerNotificationMessage += `\n\nกรุณาติดต่อผู้เช่าผ่านแชทเพื่อคืนเงินประกัน`;
            } else {
                ownerNotificationMessage += `\n\nเงินประกันที่ต้องคืนให้ผู้เช่า: ฿${securityDepositRefund.toLocaleString()}`;
                ownerNotificationMessage += `\nกรุณาติดต่อผู้เช่าผ่านแชทเพื่อคืนเงินประกัน`;
            }
            
            await NotificationService.createNotification({
                user_id: rental.owner_id,
                type: 'return_confirmed',
                title: 'การคืนสินค้าเสร็จสิ้นแล้ว',
                message: ownerNotificationMessage,
                link_url: `/owner/rentals/${rental.id}`,
                related_entity_type: 'rental',
                related_entity_id: rental.id,
                related_entity_uid: rental.rental_uid
            });
        } else if (newRentalStatus === 'dispute') {
            // Send notification to renter about dispute
            await NotificationService.createNotification({
                user_id: rental.renter_id,
                type: 'return_disputed',
                title: 'การคืนสินค้าของคุณถูกแจ้งปัญหา',
                message: `การคืนสินค้าสำหรับ '${rental.product?.title || ''}' ถูกแจ้งปัญหา โปรดตรวจสอบรายละเอียดในระบบ` ,
                link_url: `/rentals/${rental.id}`,
                related_entity_type: 'rental',
                related_entity_id: rental.id,
                related_entity_uid: rental.rental_uid
            });
        }
        
        return updatedRental;
    },

    async verifySlipWithThirdParty(rentalIdOrUid, userId) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }
        if (rental.owner_id !== userId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "Only the owner can verify payment slips.");
        }
        if (rental.rental_status !== 'confirmed' || rental.payment_status !== 'pending_verification') {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Rental is not pending payment verification.");
        }
        if (!rental.payment_proof_url) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "No payment proof found for verification.");
        }

        // Mock 3rd Party Slip Verification API
        async function mockSlipVerificationAPI(paymentProofUrl, expectedAmount) {
            console.log(`Verifying slip: ${paymentProofUrl} for amount: ${expectedAmount}`);
            // In a real scenario, you'd use axios or fetch to call the actual API
            const results = [
                { status: 'successful', message: 'Payment confirmed.', amount: expectedAmount },
                { status: 'amount_mismatch', message: 'Amount does not match expected value.', amount: expectedAmount - 100 },
                { status: 'invalid_qr', message: 'QR code is invalid or could not be read.', amount: null },
                { status: 'duplicate_slip', message: 'This slip has already been used.', amount: null },
            ];
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            const randomResult = results[Math.floor(Math.random() * results.length)];
            console.log('Verification Result:', randomResult);
            return randomResult;
        }

        // 2. Call 3rd Party API
        const verificationResult = await mockSlipVerificationAPI(rental.payment_proof_url, parseFloat(rental.total_amount_due));

        // 3. Handle the result and prepare update payload
        const updatePayload = {
            payment_verification_notes: `[${verificationResult.status}] ${verificationResult.message}`
        };
        let newRentalStatus = rental.rental_status;
        let newPaymentStatus = rental.payment_status;
        let wasSuccessful = false;

        // Prepare notification variables
        let renterNotification = {
            user_id: rental.renter_id,
            type: '',
            title: '',
            message: '',
            link_url: `/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        };

        let ownerNotification = {
            user_id: rental.owner_id,
            type: '',
            title: '',
            message: '',
            link_url: `/owner/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        };

        switch (verificationResult.status) {
            case 'successful':
                if (verificationResult.amount !== parseFloat(rental.total_amount_due)) {
                    newPaymentStatus = 'failed';
                    newRentalStatus = 'pending_payment';
                    updatePayload.payment_verification_notes = `[amount_mismatch] Verified amount (${verificationResult.amount}) does not match expected amount (${rental.total_amount_due}).`;
                    
                    // Renter notification for amount mismatch
                    renterNotification.type = 'payment_failed';
                    renterNotification.title = 'การชำระเงินไม่สำเร็จ - ยอดเงินไม่ถูกต้อง';
                    renterNotification.message = `ยอดเงินที่ชำระสำหรับการเช่า '${rental.product.title}' (${verificationResult.amount} บาท) ไม่ตรงกับยอดที่ต้องชำระ (${rental.total_amount_due} บาท) กรุณาตรวจสอบและอัปโหลดสลิปอีกครั้ง`;

                    // Owner notification for amount mismatch
                    ownerNotification.type = 'payment_verification_failed';
                    ownerNotification.title = 'การตรวจสอบสลิปไม่ผ่าน - ยอดเงินไม่ถูกต้อง';
                    ownerNotification.message = `การตรวจสอบสลิปการชำระเงินสำหรับการเช่า '${rental.product.title}' ไม่ผ่าน เนื่องจากยอดเงินไม่ตรงกัน (ได้รับ ${verificationResult.amount} บาท, ต้องการ ${rental.total_amount_due} บาท)`;
                } else {
                    newPaymentStatus = 'paid';
                    newRentalStatus = 'confirmed';
                    wasSuccessful = true;

                    // Renter notification for successful payment
                    renterNotification.type = 'payment_verified';
                    renterNotification.title = 'การชำระเงินได้รับการยืนยันแล้ว';
                    renterNotification.message = `การชำระเงินสำหรับการเช่า '${rental.product.title}' ได้รับการยืนยันเรียบร้อยแล้ว คุณสามารถติดต่อผู้ให้เช่าเพื่อนัดรับสินค้าได้`;

                    // Owner notification for successful payment
                    ownerNotification.type = 'payment_verified';
                    ownerNotification.title = 'การชำระเงินถูกต้อง - เตรียมส่งมอบสินค้า';
                    ownerNotification.message = `การชำระเงินสำหรับการเช่า '${rental.product.title}' ถูกต้องและได้รับการยืนยันแล้ว คุณสามารถติดต่อผู้เช่าเพื่อนัดส่งมอบสินค้าได้`;
                }
                break;

            case 'amount_mismatch':
            case 'invalid_qr':
            case 'duplicate_slip':
                newPaymentStatus = 'failed';
                newRentalStatus = 'pending_payment';

                // Renter notification for verification failure
                renterNotification.type = 'payment_failed';
                renterNotification.title = 'การชำระเงินไม่สำเร็จ';
                renterNotification.message = `สลิปการชำระเงินสำหรับการเช่า '${rental.product.title}' ไม่ถูกต้อง: ${verificationResult.message} กรุณาตรวจสอบและอัปโหลดสลิปอีกครั้ง`;

                // Owner notification for verification failure
                ownerNotification.type = 'payment_verification_failed';
                ownerNotification.title = 'การตรวจสอบสลิปไม่ผ่าน';
                ownerNotification.message = `การตรวจสอบสลิปการชำระเงินสำหรับการเช่า '${rental.product.title}' ไม่ผ่าน: ${verificationResult.message}`;
                break;

            default:
                throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Unknown verification status from service.");
        }

        updatePayload.rental_status = newRentalStatus;
        updatePayload.payment_status = newPaymentStatus;

        // 4. Update Database
        const updatedRental = await RentalModel.update(rental.id, updatePayload);
        await RentalStatusHistoryModel.create(
            rental.id,
            newRentalStatus,
            userId,
            `Slip verification result: ${verificationResult.status}.`,
            rental.rental_status
        );

        // 5. Send notifications to both parties
        await NotificationService.createNotification(renterNotification);
        await NotificationService.createNotification(ownerNotification);

        // 6. If payment was successful, quantity was already reserved during createRental
        // No need to update quantity again here as it's already handled
        if (wasSuccessful) {
            console.log(`Payment verified for rental ${rental.id}. Product quantity already reserved.`);
        }

        return updatedRental;
    },

    async markSlipInvalid(rentalIdOrUid, ownerId) {
        // ตรวจสอบสิทธิ์ owner
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) throw new ApiError(httpStatusCodes.NOT_FOUND, 'Rental not found.');
        if (rental.owner_id !== ownerId) throw new ApiError(httpStatusCodes.FORBIDDEN, 'You are not authorized to mark this slip.');
        if (!rental.payment_proof_url) throw new ApiError(httpStatusCodes.BAD_REQUEST, 'No payment proof has been submitted for this rental.');
        // อัปเดตสถานะ payment_status เป็น 'failed' (ตาม enum) และ rental_status เป็น 'pending_payment'
        const updatePayload = {
            payment_status: 'failed',
            rental_status: 'pending_payment',
            payment_verified_at: null,
            payment_verified_by_user_id: null
        };
        await RentalModel.update(rental.id, updatePayload);
        await RentalStatusHistoryModel.create(rental.id, 'pending_payment', ownerId, "Payment proof marked as invalid by owner.", rental.rental_status);

        // Emit realtime events
        emitRentalUpdate(rental.id, { ...rental, ...updatePayload });

        // Notification: แจ้ง renter ว่าสลิปไม่ถูกต้อง
        await NotificationService.createNotification({
            user_id: rental.renter_id,
            type: 'payment_slip_invalid',
            title: 'สลิปการชำระเงินไม่ถูกต้อง',
            message: `สลิปการชำระเงินสำหรับการเช่า '${rental.product?.title || ''}' ไม่ถูกต้อง กรุณาตรวจสอบและอัปโหลดสลิปอีกครั้ง`,
            link_url: `/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        });
        return { success: true };
    },

    /**
     * ตรวจสอบและแจ้งเตือน rental ที่ใกล้ครบกำหนดคืนและเลยกำหนดคืน (ควรเรียกใช้จาก cron job หรือ scheduler)
     */
    async notifyDueAndOverdueRentals() {
        // 1. หา rental ที่จะครบกำหนดคืนใน 1 วัน (หรือกำหนดเอง)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const todayStr = now.toISOString().slice(0, 10);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);
        // Rental ที่ยัง active และ end_date = พรุ่งนี้
        const { data: dueSoonRentals, error: dueSoonError } = await supabase
            .from('rentals')
            .select('*')
            .eq('rental_status', 'active')
            .eq('end_date', tomorrowStr);
        if (dueSoonError) throw dueSoonError;
        for (const rental of dueSoonRentals || []) {
            await NotificationService.createNotification({
                user_id: rental.renter_id,
                type: 'rental_due_soon',
                title: 'ใกล้ถึงวันคืนสินค้า',
                message: `การเช่าสินค้า '${rental.product_id}' จะครบกำหนดคืนในวันพรุ่งนี้ (${tomorrowStr})` ,
                link_url: `/rentals/${rental.id}`,
                related_entity_type: 'rental',
                related_entity_id: rental.id,
                related_entity_uid: rental.rental_uid
            });
        }
        // 2. หา rental ที่เลยกำหนดคืน (end_date < วันนี้) และยังไม่ completed/cancelled
        const { data: overdueRentals, error: overdueError } = await supabase
            .from('rentals')
            .select('*')
            .eq('rental_status', 'active')
            .lt('end_date', todayStr);
        if (overdueError) throw overdueError;
        for (const rental of overdueRentals || []) {
            // อัปเดตสถานะเป็น late_return
            await RentalModel.update(rental.id, { rental_status: 'late_return' });
            await RentalStatusHistoryModel.create(
                rental.id, 
                'late_return', 
                null, 
                'System automatically marked as late return', 
                rental.rental_status
            );
            
            // Emit realtime events
            emitRentalUpdate(rental.id, { ...rental, rental_status: 'late_return' });

            await NotificationService.createNotification({
                user_id: rental.renter_id,
                type: 'rental_overdue',
                title: 'เลยกำหนดคืนสินค้า',
                message: `คุณเลยกำหนดคืนสินค้า '${rental.product_id}' แล้ว กรุณาดำเนินการคืนสินค้าโดยเร็วที่สุด` ,
                link_url: `/rentals/${rental.id}`,
                related_entity_type: 'rental',
                related_entity_id: rental.id,
                related_entity_uid: rental.rental_uid
            });
        }
        return { dueSoon: (dueSoonRentals || []).length, overdue: (overdueRentals || []).length };
    },

    async verifyRentalPaymentByOwner(rentalIdOrUid, ownerId, { amount_paid }) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }
        if (rental.owner_id !== ownerId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "You are not authorized to verify payment for this rental.");
        }
        if (rental.payment_status !== 'pending_verification' || rental.rental_status !== 'confirmed') {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, `Rental is not pending payment verification. Current status: ${rental.rental_status}, payment_status: ${rental.payment_status}`);
        }
        
        // ตรวจสอบความถูกต้องของจำนวนเงินที่ชำระ
        const finalAmountPaid = amount_paid ? parseFloat(amount_paid) : rental.final_amount_paid || rental.total_amount_due;
        if (finalAmountPaid < 0) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid payment amount.");
        }
        if (finalAmountPaid < rental.total_amount_due) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Payment amount is less than the total amount due.");
        }
        
        const now = new Date().toISOString();
        const updatePayload = {
            payment_status: 'paid',
            payment_verified_at: now,
            payment_verified_by_user_id: ownerId,
            final_amount_paid: finalAmountPaid,
            // Optionally, set rental_status: 'active' if needed
        };
        const updatedRental = await RentalModel.update(rental.id, updatePayload);
        await RentalStatusHistoryModel.create(
            rental.id,
            updatedRental.rental_status,
            ownerId,
            `Owner verified payment.`,
            rental.rental_status
        );

        // Emit realtime events
        emitRentalUpdate(updatedRental.id, updatedRental);

        // Notify renter
        await NotificationService.createNotification({
            user_id: rental.renter_id,
            type: 'payment_verified',
            title: 'การชำระเงินได้รับการยืนยัน',
            message: `เจ้าของได้ยืนยันการชำระเงินสำหรับการเช่า '${rental.product?.title || ''}' แล้ว`,
            link_url: `/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        });
        // Notify owner
        await NotificationService.createNotification({
            user_id: rental.owner_id,
            type: 'payment_verified',
            title: 'คุณได้ยืนยันการชำระเงินแล้ว',
            message: `คุณได้ยืนยันการชำระเงินสำหรับการเช่า '${rental.product?.title || ''}' แล้ว`,
            link_url: `/owner/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        });
        return updatedRental;
    },

    async setActualPickupTime(rentalIdOrUid, userId, actualPickupTime) {
        const rental = await RentalModel.findByIdentifier(rentalIdOrUid);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }
        if (rental.renter_id !== userId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "Only the renter can set actual pickup time.");
        }
        if (rental.actual_pickup_time) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Actual pickup time has already been set.");
        }
        if (!actualPickupTime) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "actual_pickup_time is required.");
        }
        
        // Update both actual_pickup_time and delivery_status to 'delivered'
        const updatePayload = {
            actual_pickup_time: actualPickupTime,
            delivery_status: 'delivered'
        };
        
        const updatedRental = await RentalModel.update(rental.id, updatePayload);
        await RentalStatusHistoryModel.create(
            rental.id,
            updatedRental.rental_status,
            userId,
            `Renter set actual pickup time: ${actualPickupTime} and marked as delivered`,
            rental.rental_status
        );

        // Emit realtime events
        emitRentalUpdate(updatedRental.id, updatedRental);

        // Notify owner that item has been delivered
        await NotificationService.createNotification({
            user_id: rental.owner_id,
            type: 'item_delivered',
            title: 'สินค้าถูกจัดส่งแล้ว',
            message: `ผู้เช่าได้ยืนยันการรับสินค้า '${rental.product?.title || ''}' แล้ว`,
            link_url: `/owner/rentals/${rental.id}`,
            related_entity_type: 'rental',
            related_entity_id: rental.id,
            related_entity_uid: rental.rental_uid
        });
        
        return updatedRental;
    }
};

export default RentalService; 