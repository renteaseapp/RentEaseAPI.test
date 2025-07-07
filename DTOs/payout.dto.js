<<<<<<< HEAD
import Joi from 'joi';

// ENUM values from DB (payout_method_type_enum)
const PAYOUT_METHOD_TYPES = ['bank_account', 'promptpay'];

export const payoutMethodSchema = Joi.object({
    method_type: Joi.string().valid(...PAYOUT_METHOD_TYPES).required(),
    account_name: Joi.string().max(255).required(),
    account_number: Joi.string().max(100).required(), // Can be bank account or PromptPay ID
    bank_name: Joi.when('method_type', {
        is: 'bank_account',
        then: Joi.string().max(100).required(),
        otherwise: Joi.string().max(100).optional().allow(null, '')
    }),
    is_primary: Joi.boolean().optional().default(false)
=======
import Joi from 'joi';

// ENUM values from DB (payout_method_type_enum)
const PAYOUT_METHOD_TYPES = ['bank_account', 'promptpay'];

export const payoutMethodSchema = Joi.object({
    method_type: Joi.string().valid(...PAYOUT_METHOD_TYPES).required(),
    account_name: Joi.string().max(255).required(),
    account_number: Joi.string().max(100).required(), // Can be bank account or PromptPay ID
    bank_name: Joi.when('method_type', {
        is: 'bank_account',
        then: Joi.string().max(100).required(),
        otherwise: Joi.string().max(100).optional().allow(null, '')
    }),
    is_primary: Joi.boolean().optional().default(false)
>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
}); 