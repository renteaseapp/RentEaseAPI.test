import adminService from '../services/admin.service.js';

// Login
async function login(req, res) {
  const { email_or_username, password } = req.body;
  const result = await adminService.login(email_or_username, password);
  res.json(result);
}

// User Management
async function getAllUsers(req, res) {
  const { page = 1, limit = 10, ...filters } = req.query;
  const result = await adminService.getAllUsers({ page, limit, filters });
  res.json(result);
}
async function getUserById(req, res) { res.json(await adminService.getUserById(req.params.id)); }
async function updateUser(req, res) { res.json(await adminService.updateUser(req.params.id, req.body)); }
async function banUser(req, res) { res.json(await adminService.banUser(req.params.id)); }
async function unbanUser(req, res) { res.json(await adminService.unbanUser(req.params.id)); }
async function deleteUser(req, res) { res.json(await adminService.deleteUser(req.params.id)); }
async function updateUserIdVerification(req, res) { res.json(await adminService.updateUserIdVerification(req.params.id, req.body)); }

// Complaints Management
async function getAllComplaints(req, res) { res.json(await adminService.getAllComplaints(req.query)); }
async function getComplaintById(req, res) { res.json(await adminService.getComplaintById(req.params.id)); }
async function replyComplaint(req, res) { res.json(await adminService.replyComplaint(req.params.id, req.body)); }

// Reports & Analytics
async function getRentalReport(req, res) { res.json(await adminService.getRentalReport(req.query)); }
async function getIncomeReport(req, res) { res.json(await adminService.getIncomeReport(req.query)); }
async function getPlatformStats(req, res) { res.json(await adminService.getPlatformStats()); }
async function getComplaintReport(req, res) { res.json(await adminService.getComplaintReport()); }
async function getUserReputationReport(req, res) { res.json(await adminService.getUserReputationReport()); }

// Product/Category Management
async function getAllProducts(req, res) { res.json(await adminService.getAllProducts(req.query)); }
async function approveProduct(req, res) { res.json(await adminService.approveProduct(req.params.id, req.body)); }
async function getAllCategories(req, res) { res.json(await adminService.getAllCategories(req.query)); }
async function createCategory(req, res) { res.json(await adminService.createCategory(req.body)); }
async function updateCategory(req, res) { res.json(await adminService.updateCategory(req.params.id, req.body)); }
async function deleteCategory(req, res) { res.json(await adminService.deleteCategory(req.params.id)); }

// System Settings & Static Content
async function getSettings(req, res) { res.json(await adminService.getSettings()); }
async function updateSettings(req, res) { res.json(await adminService.updateSettings(req.body)); }
async function getStaticPages(req, res) { res.json(await adminService.getStaticPages()); }
async function updateStaticPage(req, res) { res.json(await adminService.updateStaticPage(req.params.slug, req.body)); }

const adminController = {
  login,
  getAllUsers, getUserById, updateUser, banUser, unbanUser, deleteUser, updateUserIdVerification,
  getAllComplaints, getComplaintById, replyComplaint,
  getRentalReport, getIncomeReport, getPlatformStats, getComplaintReport, getUserReputationReport,
  getAllProducts, approveProduct, getAllCategories, createCategory, updateCategory, deleteCategory,
  getSettings, updateSettings, getStaticPages, updateStaticPage
};

export default adminController; 