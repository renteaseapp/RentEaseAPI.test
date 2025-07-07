<<<<<<< HEAD
import Joi from 'joi';

// Example payment method types (align with your payment gateway options)
const PAYMENT_METHOD_TYPES = ['credit_card', 'promptpay_qr', 'bank_transfer'];

export const initiatePaymentSchema = Joi.object({
    payment_method_type: Joi.string().valid(...PAYMENT_METHOD_TYPES).required()
=======
import Joi from 'joi';

// Example payment method types (align with your payment gateway options)
const PAYMENT_METHOD_TYPES = ['credit_card', 'promptpay_qr', 'bank_transfer'];

export const initiatePaymentSchema = Joi.object({
    payment_method_type: Joi.string().valid(...PAYMENT_METHOD_TYPES).required()
>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
}); 