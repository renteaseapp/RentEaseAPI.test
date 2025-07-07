<<<<<<< HEAD
import Joi from 'joi';

export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10), // Max 100 items per page
=======
import Joi from 'joi';

export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10), // Max 100 items per page
>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
}); 