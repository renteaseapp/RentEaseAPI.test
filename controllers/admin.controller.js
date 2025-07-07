import { asyncHandler } from '../utils/asyncHandler.js';
import adminService from '../services/admin.service.js';

// Login
async function login(req, res) {
  try {
    const { email_or_username, password } = req.body;
    const result = await adminService.login(email_or_username, password);
    res.json(result);
  } catch (err) {
    // ส่ง error response กลับไป ไม่ให้ server crash
    res.status(err.statusCode || 500).json({
      success: false,
      data: null,
      errors: [err.message || 'Login failed']
    });
  }
}

// User Management
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  const result = await adminService.getAllUsers({ page, limit, filters });
  res.json(result);
});
const getUserById = asyncHandler(async (req, res) => { res.json(await adminService.getUserById(req.params.id)); });
const updateUser = asyncHandler(async (req, res) => { res.json(await adminService.updateUser(req.params.id, req.body)); });
const banUser = asyncHandler(async (req, res) => { res.json(await adminService.banUser(req.params.id)); });
const unbanUser = asyncHandler(async (req, res) => { res.json(await adminService.unbanUser(req.params.id)); });
const deleteUser = asyncHandler(async (req, res) => { res.json(await adminService.deleteUser(req.params.id)); });
const updateUserIdVerification = asyncHandler(async (req, res) => { res.json(await adminService.updateUserIdVerification(req.params.id, req.body)); });

// Complaints Management
const getAllComplaints = asyncHandler(async (req, res) => { res.json(await adminService.getAllComplaints(req.query)); });
const getComplaintById = asyncHandler(async (req, res) => { res.json(await adminService.getComplaintById(req.params.id)); });
const replyComplaint = asyncHandler(async (req, res) => { res.json(await adminService.replyComplaint(req.params.id, req.body)); });

// Reports & Analytics
const getRentalReport = asyncHandler(async (req, res) => { res.json(await adminService.getRentalReport(req.query)); });
const getIncomeReport = asyncHandler(async (req, res) => { res.json(await adminService.getIncomeReport(req.query)); });
const getPlatformStats = asyncHandler(async (req, res) => { res.json(await adminService.getPlatformStats()); });
const getComplaintReport = asyncHandler(async (req, res) => { res.json(await adminService.getComplaintReport()); });
const getUserReputationReport = asyncHandler(async (req, res) => { res.json(await adminService.getUserReputationReport()); });

// Product/Category Management
const getAllProducts = asyncHandler(async (req, res) => { res.json(await adminService.getAllProducts(req.query)); });
const approveProduct = asyncHandler(async (req, res) => { res.json(await adminService.approveProduct(req.params.id, req.body)); });
const getAllCategories = asyncHandler(async (req, res) => { res.json(await adminService.getAllCategories(req.query)); });
const createCategory = asyncHandler(async (req, res) => { res.json(await adminService.createCategory(req.body)); });
const updateCategory = asyncHandler(async (req, res) => { res.json(await adminService.updateCategory(req.params.id, req.body)); });
const deleteCategory = asyncHandler(async (req, res) => { res.json(await adminService.deleteCategory(req.params.id)); });

// System Settings & Static Content
const getSettings = asyncHandler(async (req, res) => { res.json(await adminService.getSettings()); });
const updateSettings = asyncHandler(async (req, res) => { res.json(await adminService.updateSettings(req.body)); });
const getStaticPages = asyncHandler(async (req, res) => { res.json(await adminService.getStaticPages()); });
const updateStaticPage = asyncHandler(async (req, res) => { res.json(await adminService.updateStaticPage(req.params.slug, req.body)); });

const getProductReport = asyncHandler(async (req, res) => {
  res.json(await adminService.getProductReport(req.query));
});

const adminController = {
  login,
  getAllUsers, getUserById, updateUser, banUser, unbanUser, deleteUser, updateUserIdVerification,
  getAllComplaints, getComplaintById, replyComplaint,
  getRentalReport, getIncomeReport, getPlatformStats, getComplaintReport, getUserReputationReport,
  getAllProducts, approveProduct, getAllCategories, createCategory, updateCategory, deleteCategory,
  getSettings, updateSettings, getStaticPages, updateStaticPage,
  getProductReport
};

export default adminController; 