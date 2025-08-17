import express from 'express';
import authRouter from './auth.routes.js';
import userRouter from './user.routes.js';
import provinceRouter from './province.routes.js';
import categoryRouter from './category.routes.js';
import productRouter from './product.routes.js';
import ownerRouter from './owner.routes.js';
import rentalRouter from './rental.routes.js';
import userAddressRouter from './userAddress.routes.js';
import renterRouter from './renter.routes.js';
import webhookRouter from './webhook.routes.js';

import chatRouter from './chat.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRouter from './admin.routes.js';
import complaintRoutes from './complaint.routes.js';
import settingsRouter from './settings.routes.js';
import reviewRouter from './review.routes.js';
// Import other routers as they are created in subsequent days

const router = express.Router();

// Log request body for debugging
router.use((req, res, next) => {
    // console.log('Router Request Body:', req.body); // Keep for debugging if needed
    next();
});

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/users/me/addresses', userAddressRouter);
router.use('/provinces', provinceRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/owners', ownerRouter);
router.use('/renters', renterRouter);
router.use('/rentals', rentalRouter);

router.use('/webhooks', webhookRouter);
router.use('/chat', chatRouter);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRouter);
router.use('/complaints', complaintRoutes);
router.use('/settings', settingsRouter);
router.use('/reviews', reviewRouter);
// router.use('/products', productRouter); etc.

// A simple health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'RentEase API is running!' });
});

export default router;