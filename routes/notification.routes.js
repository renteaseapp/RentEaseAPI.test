<<<<<<< HEAD
import express from 'express';
import NotificationController from '../controllers/notification.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();
router.use(authenticateJWT);

// GET /api/notifications
router.get('/', NotificationController.getMyNotifications);

// POST /api/notifications/mark-read
router.post('/mark-read', NotificationController.markAsRead);

=======
import express from 'express';
import NotificationController from '../controllers/notification.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();
router.use(authenticateJWT);

// GET /api/notifications
router.get('/', NotificationController.getMyNotifications);

// POST /api/notifications/mark-read
router.post('/mark-read', NotificationController.markAsRead);

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default router; 