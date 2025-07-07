<<<<<<< HEAD
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config.js';

export const generateToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
        return null;
    }
=======
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config.js';

export const generateToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
        return null;
    }
>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
}; 