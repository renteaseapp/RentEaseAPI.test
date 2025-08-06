import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

const parseReturnDetails = (req, res, next) => {
    try {
        // Parse return_details from FormData bracket notation
        const returnDetails = {};
        
        // Check for return_details[carrier]
        if (req.body['return_details[carrier]']) {
            returnDetails.carrier = req.body['return_details[carrier]'];
        }
        
        // Check for return_details[tracking_number]
        if (req.body['return_details[tracking_number]']) {
            returnDetails.tracking_number = req.body['return_details[tracking_number]'];
        }
        
        // Check for return_details[return_datetime]
        if (req.body['return_details[return_datetime]']) {
            returnDetails.return_datetime = req.body['return_details[return_datetime]'];
        }
        
        // Check for return_details[location] (for in_person returns)
        if (req.body['return_details[location]']) {
            returnDetails.location = req.body['return_details[location]'];
        }
        
        // If we found any return_details, replace the flat fields with the nested object
        if (Object.keys(returnDetails).length > 0) {
            req.body.return_details = returnDetails;
            
            // Remove the flat fields to avoid confusion
            delete req.body['return_details[carrier]'];
            delete req.body['return_details[tracking_number]'];
            delete req.body['return_details[return_datetime]'];
            delete req.body['return_details[location]'];
        }
        
        next();
    } catch (error) {
        console.error('Error in parseReturnDetails middleware:', error);
        return next(new ApiError(httpStatusCodes.BAD_REQUEST, "Error parsing return details from form data"));
    }
};

export default parseReturnDetails; 