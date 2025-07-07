<<<<<<< HEAD
import dotenv from 'dotenv';
dotenv.config();

const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
};

if (!jwtConfig.secret) {
    console.error("FATAL ERROR: JWT Secret is not defined. Check your .env file.");
    process.exit(1);
}

=======
import dotenv from 'dotenv';
dotenv.config();

const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
};

if (!jwtConfig.secret) {
    console.error("FATAL ERROR: JWT Secret is not defined. Check your .env file.");
    process.exit(1);
}

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default jwtConfig; 