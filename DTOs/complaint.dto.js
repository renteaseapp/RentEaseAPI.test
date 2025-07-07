import Joi from 'joi';

export const createComplaintSchema = Joi.object({
  title: Joi.string().min(5).max(255).required(),
  details: Joi.string().min(20).required(),
  complaint_type: Joi.string().max(100).required(),
  related_rental_id: Joi.number().integer().positive().optional().allow(null),
  related_product_id: Joi.number().integer().positive().optional().allow(null),
  subject_user_id: Joi.number().integer().positive().optional().allow(null)
});

export const updateComplaintSchema = Joi.object({
    message: Joi.string().min(1).required()
}); 