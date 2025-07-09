import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { verifyJWT, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Login (ไม่ต้องใช้ verifyJWT)
router.post('/login', adminController.login);

// Middleware ตรวจสอบ admin สำหรับทุก endpoint ถัดไป
router.use(verifyJWT, isAdmin);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/id-verification', adminController.updateUserIdVerification);

// Complaints Management
router.get('/complaints', adminController.getAllComplaints);
router.get('/complaints/:id', adminController.getComplaintById);
router.put('/complaints/:id/reply', adminController.replyComplaint);

// Reports & Analytics
router.get('/reports/rentals', adminController.getRentalReport);
router.get('/reports/income', adminController.getIncomeReport);
router.get('/reports/platform-stats', adminController.getPlatformStats);
router.get('/reports/complaints', adminController.getComplaintReport);
router.get('/reports/user-reputation', adminController.getUserReputationReport);
router.get('/reports/products', adminController.getProductReport);

// Product/Category Management
router.get('/products', adminController.getAllProducts);
router.put('/products/:id/approve', adminController.approveProduct);
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// System Settings & Static Content
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.get('/static-pages', adminController.getStaticPages);
router.put('/static-pages/:slug', adminController.updateStaticPage);

export default router; 