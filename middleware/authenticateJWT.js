// JWT authentication middleware 
import { verifyToken } from '../utils/jwt.utils.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import UserModel from '../models/user.model.js';

const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Authorization header with Bearer token is missing.");
        }

        const token = authHeader.substring(7, authHeader.length);
        const decoded = verifyToken(token);

        if (!decoded || !decoded.id) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Invalid or expired token.");
        }

        // ตรวจสอบผู้ใช้ในฐานข้อมูลและสถานะ is_active
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "User not found");
        }

        if (!user.is_active) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "Account is deactivated");
        }

        console.log('🔍 JWT decoded user:', decoded);
         req.user = decoded;
         next();
     } catch (error) {
         if (error instanceof ApiError) {
             next(error);
         } else {
             next(new ApiError(httpStatusCodes.UNAUTHORIZED, "Invalid token"));
         }
     }
};

export default authenticateJWT;