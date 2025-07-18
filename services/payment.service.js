import PaymentTransactionModel from '../models/payment_transaction.model.js';
import RentalModel from '../models/rental.model.js';
import RentalStatusHistoryModel from '../models/rentalStatusHistory.model.js';
import ProductModel from '../models/product.model.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import NotificationService from './notification.service.js';

const PaymentService = {
    async initiateGatewayPayment(rentalId, renterId, paymentMethodType) {
        const rental = await RentalModel.findByIdentifier(rentalId);
        if (!rental) {
            throw new ApiError(httpStatusCodes.NOT_FOUND, "Rental not found.");
        }
        if (rental.renter_id !== renterId) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "You are not authorized to pay for this rental.");
        }
        if (rental.rental_status !== 'pending_payment') {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, `Rental is not pending payment. Current status: ${rental.rental_status}`);
        }

        // 1. Create a payment transaction record
        const transactionData = {
            rental_id: rental.id,
            user_id: renterId,
            transaction_type: 'rental_payment',
            payment_method_name: paymentMethodType,
            payment_gateway_name: 'MOCK_GATEWAY', // Replace with actual gateway name
            amount: rental.total_amount_due,
            currency: 'THB',
            status: 'pending', // Initial status
            // transaction_uid will be generated by DB default
        };
        const paymentTransaction = await PaymentTransactionModel.create(transactionData);

        // 2. Simulate Payment Gateway Interaction (for Day 4)
        // In a real scenario, you'd call the gateway's API here
        console.log(`Simulating payment initiation for transaction ${paymentTransaction.transaction_uid} with ${paymentMethodType}`);
        const mockPaymentUrl = `https://mock-payment-gateway.com/pay?tx_ref=${paymentTransaction.transaction_uid}&amount=${rental.total_amount_due}`;

        return {
            payment_url: mockPaymentUrl,
            transaction_reference: paymentTransaction.transaction_uid, // Important for webhook
            message: "Payment initiated. Please proceed to the payment gateway."
        };
    },

    async processPaymentWebhook(webhookPayload) {
        console.log("Received payment webhook:", webhookPayload);

        // 1. Validate Webhook Signature (CRITICAL - not implemented for mock)
        // if (!isValidSignature(webhookPayload, req.headers['x-gateway-signature'])) {
        //     throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Invalid webhook signature.");
        // }

        // 2. Extract necessary info (this depends on your gateway's payload structure)
        const transactionReference = webhookPayload.transaction_reference; // e.g., our payment_transactions.transaction_uid
        const gatewayStatus = webhookPayload.status; // e.g., 'successful', 'failed'
        const gatewayTransactionId = webhookPayload.gateway_transaction_id;
        const amountPaid = webhookPayload.amount_paid;

        if (!transactionReference) {
            throw new ApiError(httpStatusCodes.BAD_REQUEST, "Webhook missing transaction reference.");
        }

        // 3. Find our internal payment transaction
        const paymentTransaction = await PaymentTransactionModel.findByUid(transactionReference);
        if (!paymentTransaction) {
            console.error(`Webhook received for unknown transaction reference: ${transactionReference}`);
            // Still return 200 to gateway to acknowledge receipt, but log error
            return { message: "Webhook acknowledged, transaction not found."};
        }

        if (paymentTransaction.status === 'successful' || paymentTransaction.status === 'failed') {
            console.log(`Webhook for already processed transaction ${transactionReference}, status: ${paymentTransaction.status}`);
            return { message: "Webhook for already processed transaction." };
        }
        
        const rental = await RentalModel.findByIdentifier(paymentTransaction.rental_id);
        if(!rental) {
            console.error(`Rental not found for payment transaction ${transactionReference}`);
            return { message: "Webhook acknowledged, rental not found." };
        }

        // 4. Process based on gateway status
        if (gatewayStatus === 'successful') {
            await PaymentTransactionModel.updateByUid(transactionReference, {
                status: 'successful',
                gateway_transaction_id: gatewayTransactionId,
                // gateway_charge_id: webhookPayload.charge_id, // if applicable
                transaction_time: new Date().toISOString() // Or from webhook
            });

            const updatedRental = await RentalModel.update(paymentTransaction.rental_id, {
                payment_status: 'paid',
                rental_status: 'confirmed', // Or 'active' if start_date is today/past
                final_amount_paid: amountPaid || rental.total_amount_due,
            });
            await RentalStatusHistoryModel.create(updatedRental.id, 'confirmed', rental.renter_id, "Payment successful via gateway.");
            
            // Decrease product quantity
            try {
                await ProductModel.updateQuantityAvailable(updatedRental.product_id, -1);
            } catch (qtyError) {
                console.error("Error updating product quantity after payment:", qtyError);
                // Log this error, but payment is already processed.
            }
            
            // Send notification to renter and owner
            await NotificationService.createNotification({
                user_id: rental.renter_id,
                type: 'payment_success',
                title: 'ชำระเงินสำเร็จ',
                message: `การชำระเงินสำหรับการเช่า ‘${rental.product?.title || ''}’ สำเร็จแล้ว`,
                link_url: `/rentals/${rental.id}`,
                related_entity_type: 'rental',
                related_entity_id: rental.id,
                related_entity_uid: rental.rental_uid
            });
            await NotificationService.createNotification({
                user_id: rental.owner_id,
                type: 'payment_success',
                title: 'ผู้เช่าชำระเงินสำเร็จ',
                message: `ผู้เช่าชำระเงินสำหรับการเช่า ‘${rental.product?.title || ''}’ สำเร็จแล้ว`,
                link_url: `/owner/rentals/${rental.id}`,
                related_entity_type: 'rental',
                related_entity_id: rental.id,
                related_entity_uid: rental.rental_uid
            });

            console.log(`Payment for rental ${updatedRental.id} (Tx: ${transactionReference}) successful.`);
        } else if (gatewayStatus === 'failed') {
            await PaymentTransactionModel.updateByUid(transactionReference, {
                status: 'failed',
                gateway_transaction_id: gatewayTransactionId,
                error_code_gateway: webhookPayload.error_code,
                error_message_gateway: webhookPayload.error_message,
            });
            // Optionally update rental payment_status
            await RentalModel.update(paymentTransaction.rental_id, { payment_status: 'failed' });
            await RentalStatusHistoryModel.create(paymentTransaction.rental_id, 'payment_failed', rental.renter_id, "Payment failed via gateway.");
            
            // Send notification to renter about payment failure
            await NotificationService.createNotification({
                user_id: rental.renter_id,
                type: 'payment_failed',
                title: 'ชำระเงินไม่สำเร็จ',
                message: `การชำระเงินสำหรับการเช่า ‘${rental.product?.title || ''}’ ไม่สำเร็จ กรุณาตรวจสอบและลองใหม่`,
                link_url: `/rentals/${rental.id}`,
                related_entity_type: 'rental',
                related_entity_id: rental.id,
                related_entity_uid: rental.rental_uid
            });
            await NotificationService.createNotification({
                user_id: rental.owner_id,
                type: 'payment_failed',
                title: 'ผู้เช่าชำระเงินไม่สำเร็จ',
                message: `ผู้เช่าชำระเงินสำหรับการเช่า ‘${rental.product?.title || ''}’ ไม่สำเร็จ`,
                link_url: `/owner/rentals/${rental.id}`,
                related_entity_type: 'rental',
                related_entity_id: rental.id,
                related_entity_uid: rental.rental_uid
            });
            
            console.log(`Payment for rental ${paymentTransaction.rental_id} (Tx: ${transactionReference}) failed.`);
        } else {
            console.log(`Webhook received with unhandled status: ${gatewayStatus} for tx: ${transactionReference}`);
        }
        return { message: "Webhook processed." };
    }
};

export default PaymentService; 