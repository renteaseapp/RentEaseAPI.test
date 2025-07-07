<<<<<<< HEAD
import dotenv from 'dotenv';
dotenv.config();

const serverConfig = {
    PORT: process.env.PORT || 3000,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    NODE_ENV: process.env.NODE_ENV || 'development',
};

=======
import dotenv from 'dotenv';
dotenv.config();

const serverConfig = {
    PORT: process.env.PORT || 3000,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    NODE_ENV: process.env.NODE_ENV || 'development',
};

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default serverConfig; 