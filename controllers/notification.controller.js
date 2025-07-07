<<<<<<< HEAD
import NotificationService from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

const NotificationController = {
    getMyNotifications: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const notifications = await NotificationService.getUserNotifications(userId, req.query);
        res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, notifications));
    }),
    markAsRead: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { notification_ids } = req.body;
        const result = await NotificationService.markAsRead(userId, notification_ids);
        res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, result));
    })
};

=======
import NotificationService from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

const NotificationController = {
    getMyNotifications: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const notifications = await NotificationService.getUserNotifications(userId, req.query);
        res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, notifications));
    }),
    markAsRead: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { notification_ids } = req.body;
        const result = await NotificationService.markAsRead(userId, notification_ids);
        res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, result));
    })
};

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default NotificationController; 