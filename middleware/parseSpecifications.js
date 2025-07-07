<<<<<<< HEAD
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

const parseSpecifications = (req, res, next) => {
    // Check if specifications exist in body and is a string
    if (req.body && typeof req.body.specifications === 'string') {
        try {
            // Attempt to parse the JSON string
            req.body.specifications = JSON.parse(req.body.specifications);
        } catch (error) {
            // If parsing fails, return a BAD_REQUEST error
            return next(new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid JSON format for specifications"));
        }
    }
    // Continue to the next middleware/controller
    next();
};

=======
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

const parseSpecifications = (req, res, next) => {
    // Check if specifications exist in body and is a string
    if (req.body && typeof req.body.specifications === 'string') {
        try {
            // Attempt to parse the JSON string
            req.body.specifications = JSON.parse(req.body.specifications);
        } catch (error) {
            // If parsing fails, return a BAD_REQUEST error
            return next(new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid JSON format for specifications"));
        }
    }
    // Continue to the next middleware/controller
    next();
};

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default parseSpecifications; 