import UserModel from '../models/user.model.js';
import supabase from '../db/supabaseClient.js';
import { generateToken } from '../utils/jwt.utils.js';
import { comparePassword } from '../utils/password.utils.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import { ApiError } from '../utils/apiError.js';

// Login
async function login(email_or_username, password) {
  // ตรวจสอบ user
  const user = await UserModel.findByEmailOrUsername(email_or_username);
  if (!user) throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Invalid credentials');
  // ตรวจสอบ admin
  const isAdmin = await UserModel.checkAdmin(user.id);
  if (!isAdmin) throw new ApiError(httpStatusCodes.FORBIDDEN, 'Not an admin');
  // ตรวจสอบรหัสผ่าน
  const isPasswordMatch = await comparePassword(password, user.password_hash);
  if (!isPasswordMatch) throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Invalid credentials');
  // ออก JWT
  const tokenPayload = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    is_admin: true
  };
  const access_token = generateToken(tokenPayload);
  return {
    access_token,
    user: { id: user.id, username: user.username, email: user.email, is_admin: true },
    is_admin: true
  };
}

// User Management
async function getAllUsers({ page = 1, limit = 10, filters = {} }) {
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from('users')
    .select(`id, username, email, first_name, last_name, phone_number, profile_picture_url, email_verified_at, last_login_at, is_active, address_line1, address_line2, city, province_id, postal_code, id_verification_status, id_verification_notes, id_document_type, id_document_number, id_document_url, id_document_back_url, id_selfie_url, created_at, updated_at, deleted_at` , { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return {
    data: data || [],
    meta: {
      current_page: page,
      per_page: limit,
      total: count || 0,
      last_page: Math.ceil((count || 0) / limit),
      from: count > 0 ? offset + 1 : 0,
      to: count > 0 ? Math.min(count, offset + limit) : 0
    }
  };
}
async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select(`id, username, email, first_name, last_name, phone_number, profile_picture_url, email_verified_at, last_login_at, is_active, address_line1, address_line2, city, province_id, postal_code, id_verification_status, id_verification_notes, id_document_type, id_document_number, id_document_url, id_document_back_url, id_selfie_url, created_at, updated_at, deleted_at`)
    .eq('id', Number(id))
    .single();
  if (error) throw error;
  return data;
}
async function updateUser(id, body) {
  return await UserModel.update(Number(id), body);
}
async function banUser(id) {
  return await UserModel.update(Number(id), { is_active: false });
}
async function unbanUser(id) {
  return await UserModel.update(Number(id), { is_active: true });
}
async function deleteUser(id) {
  // soft delete
  return await UserModel.update(Number(id), { deleted_at: new Date().toISOString() });
}
async function updateUserIdVerification(id, body) {
  // อัปเดตฟิลด์ยืนยันตัวตน
  return await UserModel.update(Number(id), body);
}

// Complaints Management
async function getAllComplaints(query = {}) {
  const { page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from('complaints')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return {
    data: data || [],
    meta: {
      current_page: page,
      per_page: limit,
      total: count || 0,
      last_page: Math.ceil((count || 0) / limit),
      from: count > 0 ? offset + 1 : 0,
      to: count > 0 ? Math.min(count, offset + limit) : 0
    }
  };
}
async function getComplaintById(id) {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', Number(id))
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const err = new Error('Complaint not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
}
async function replyComplaint(id, body) {
  // อัปเดตสถานะ/ตอบกลับร้องเรียน
  const { data, error } = await supabase
    .from('complaints')
    .update(body)
    .eq('id', Number(id))
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

// Reports & Analytics
async function getRentalReport(query = {}) {
  // รายงานจำนวนการเช่าในแต่ละเดือน
  const { month } = query;
  let filter = '';
  if (month) {
    filter = `date_trunc('month', start_date) = date_trunc('month', '${month}-01'::date)`;
  }
  const { data, error, count } = await supabase
    .from('rentals')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { rentals: count || 0, month };
}
async function getIncomeReport(query = {}) {
  // รายงานรายได้ของผู้ให้เช่า
  const { owner_id } = query;
  let q = supabase.from('payment_transactions').select('amount', { count: 'exact' }).eq('status', 'successful');
  if (owner_id) q = q.eq('user_id', Number(owner_id));
  const { data, error } = await q;
  if (error) throw error;
  const income = data ? data.reduce((sum, t) => sum + Number(t.amount), 0) : 0;
  return { income, owner_id };
}
async function getPlatformStats() {
  // สถิติการใช้งานแพลตฟอร์ม
  const [{ count: userCount }, { count: rentalCount }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact' }),
    supabase.from('rentals').select('*', { count: 'exact' })
  ]);
  return { users: userCount || 0, rentals: rentalCount || 0 };
}
async function getComplaintReport() {
  // รายงานปัญหาที่ถูกร้องเรียน
  const { count } = await supabase.from('complaints').select('*', { count: 'exact' });
  return { complaints: count || 0 };
}
async function getUserReputationReport() {
  // รายงานความน่าเชื่อถือผู้ใช้ (คะแนนรีวิว)
  const { data, error } = await supabase.from('reviews').select('user_id:owner_id, score:rating_owner');
  if (error) throw error;
  return { reputations: data || [] };
}

// Product/Category Management
async function getAllProducts(query = {}) {
  const { page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return {
    data: data || [],
    meta: {
      current_page: page,
      per_page: limit,
      total: count || 0,
      last_page: Math.ceil((count || 0) / limit),
      from: count > 0 ? offset + 1 : 0,
      to: count > 0 ? Math.min(count, offset + limit) : 0
    }
  };
}
async function approveProduct(id, body) {
  // อัปเดตสถานะอนุมัติสินค้า
  const { data, error } = await supabase
    .from('products')
    .update(body)
    .eq('id', Number(id))
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
async function getAllCategories(query = {}) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return { data: data || [] };
}
async function createCategory(body) {
  const { data, error } = await supabase
    .from('categories')
    .insert([body])
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
async function updateCategory(id, body) {
  const { data, error } = await supabase
    .from('categories')
    .update(body)
    .eq('id', Number(id))
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
async function deleteCategory(id) {
  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', Number(id))
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

// System Settings & Static Content
async function getSettings() {
  const { data, error } = await supabase.from('system_settings').select('*');
  if (error) throw error;
  return { settings: data || [] };
}
async function updateSettings(body) {
  // body: { setting_key, setting_value, ... }
  const { data, error } = await supabase
    .from('system_settings')
    .upsert([body])
    .select('*');
  if (error) throw error;
  return { updated: true, data };
}
async function getStaticPages() {
  const { data, error } = await supabase.from('static_pages').select('*');
  if (error) throw error;
  return { data: data || [] };
}
async function updateStaticPage(slug, body) {
  const { data, error } = await supabase
    .from('static_pages')
    .update(body)
    .eq('slug', slug)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export default {
  login,
  getAllUsers, getUserById, updateUser, banUser, unbanUser, deleteUser, updateUserIdVerification,
  getAllComplaints, getComplaintById, replyComplaint,
  getRentalReport, getIncomeReport, getPlatformStats, getComplaintReport, getUserReputationReport,
  getAllProducts, approveProduct, getAllCategories, createCategory, updateCategory, deleteCategory,
  getSettings, updateSettings, getStaticPages, updateStaticPage
}; 