<<<<<<< HEAD
import { verifyToken } from '../utils/jwt.utils.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import UserModel from '../models/user.model.js';

export async function verifyJWT(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "No token provided");
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "No token provided");
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Invalid token");
        }

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "User not found");
        }

        if (!user.is_active) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "Account is deactivated");
        }

        // ตรวจสอบ admin จากฐานข้อมูล admin_users
        const isAdmin = await UserModel.checkAdmin(user.id);

        // Attach user to request object
        req.user = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            role: user.role || (isAdmin ? 'admin' : 'user'),
            is_admin: isAdmin
        };

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(httpStatusCodes.UNAUTHORIZED, "Invalid token"));
        }
    }
};

export function isAdmin(req, res, next) {
  if (
    req.user &&
    (req.user.role === 'admin' || req.user.is_admin === true)
  ) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Admins only' });
}

export function isRenter(req, res, next) {
  if (
    req.user &&
    (!req.user.is_admin && req.user.role !== 'admin')
  ) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Renters only' });
=======
import { verifyToken } from '../utils/jwt.utils.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import UserModel from '../models/user.model.js';

export async function verifyJWT(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "No token provided");
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "No token provided");
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Invalid token");
        }

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, "User not found");
        }

        if (!user.is_active) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, "Account is deactivated");
        }

        // ตรวจสอบ admin จากฐานข้อมูล admin_users
        const isAdmin = await UserModel.checkAdmin(user.id);

        // Attach user to request object
        req.user = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            role: user.role || (isAdmin ? 'admin' : 'user'),
            is_admin: isAdmin
        };

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(httpStatusCodes.UNAUTHORIZED, "Invalid token"));
        }
    }
};

export function isAdmin(req, res, next) {
  if (
    req.user &&
    (req.user.role === 'admin' || req.user.is_admin === true)
  ) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Admins only' });
}

export function isRenter(req, res, next) {
  if (
    req.user &&
    (!req.user.is_admin && req.user.role !== 'admin')
  ) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Renters only' });
>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
} 