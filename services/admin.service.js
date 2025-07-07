<<<<<<< HEAD
import UserModel from '../models/user.model.js';
import supabase from '../db/supabaseClient.js';
import { generateToken } from '../utils/jwt.utils.js';
import { comparePassword } from '../utils/password.utils.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import { ApiError } from '../utils/apiError.js';

// Login
async function login(email_or_username, password) {
  try {
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
  } catch (err) {
    // ไม่ให้ server crash
    if (err instanceof ApiError) throw err;
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Login failed');
  }
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
    .select(`
      *,
      complaint_attachments ( * )
    `)
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
  // รายงานจำนวนการเช่าในแต่ละเดือน (group by YYYY-MM-01 00:00:00+00)
  const { month } = query;
  let rentalsQuery = supabase.from('rentals').select('id, start_date');
  if (month) {
    const start = `${month}-01`;
    const end = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1)).toISOString().slice(0, 10);
    rentalsQuery = rentalsQuery.gte('start_date', start).lt('start_date', end);
  }
  const { data, error } = await rentalsQuery;
  if (error) throw error;
  // group by month (format: 2025-06-01 00:00:00+00)
  const result = {};
  (data || []).forEach(r => {
    const d = new Date(r.start_date);
    const m = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01 00:00:00+00`;
    result[m] = (result[m] || 0) + 1;
  });
  return { rentals_by_month: result };
}

async function getIncomeReport() {
  // รายงานรายได้รวมของทุก user (รวมทุก status)
  const { data, error } = await supabase.from('payment_transactions').select('amount');
  if (error) throw error;
  let income = 0;
  (data || []).forEach(t => {
    income += Number(t.amount);
  });
  return { income };
}

async function getPlatformStats() {
  // สถิติการใช้งานแพลตฟอร์ม
  const [{ count: userCount }, { count: rentalCount }] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }),
    supabase.from('rentals').select('id', { count: 'exact' })
  ]);
  return { users: userCount || 0, rentals: rentalCount || 0 };
}

async function getComplaintReport() {
  // รายงานปัญหาที่ถูกร้องเรียน
  const { count } = await supabase.from('complaints').select('id', { count: 'exact' });
  return { complaints: count || 0 };
}

async function getUserReputationReport() {
  // รายงานคะแนนรีวิวของผู้ให้เช่า (owner)
  const { data, error } = await supabase.from('reviews').select('owner_id, rating_owner');
  if (error) throw error;
  // group by owner_id
  const map = {};
  (data || []).forEach(r => {
    if (!map[r.owner_id]) map[r.owner_id] = { total: 0, count: 0 };
    map[r.owner_id].total += Number(r.rating_owner);
    map[r.owner_id].count += 1;
  });
  const reputations = Object.entries(map).map(([owner_id, v]) => ({
    owner_id: Number(owner_id),
    avg_rating: v.count ? v.total / v.count : 0,
    review_count: v.count
  }));
  return { reputations };
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

async function getProductReport(query = {}) {
  // รับ filter
  const { start_date, end_date, month } = query;

  // สร้างช่วงวันที่
  let rentalFilter = {};
  if (month) {
    const start = `${month}-01`;
    const end = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1)).toISOString().slice(0, 10);
    rentalFilter = { gte: start, lt: end };
  } else if (start_date && end_date) {
    rentalFilter = { gte: start_date, lte: end_date };
  }

  // 1. จำนวนสินค้าทั้งหมด
  const { count: total } = await supabase.from('products').select('id', { count: 'exact' });

  // 2. จำนวนสินค้าตามสถานะ
  const statuses = ['approved', 'pending', 'rejected'];
  const statusCounts = {};
  for (const status of statuses) {
    const { count } = await supabase.from('products').select('id', { count: 'exact' }).eq('admin_approval_status', status);
    statusCounts[status] = count || 0;
  }

  // 3. สินค้าที่ถูกเช่ามากที่สุด 5 อันดับแรก (filter ตามช่วงวันที่)
  let rentalsQuery = supabase.from('rentals').select('id, product_id');
  if (rentalFilter.gte) rentalsQuery = rentalsQuery.gte('start_date', rentalFilter.gte);
  if (rentalFilter.lt) rentalsQuery = rentalsQuery.lt('start_date', rentalFilter.lt);
  if (rentalFilter.lte) rentalsQuery = rentalsQuery.lte('start_date', rentalFilter.lte);
  const { data: rentals, error } = await rentalsQuery;
  if (error) throw error;
  // group by product_id
  const rentalCountMap = {};
  const rentalIdsByProduct = {};
  (rentals || []).forEach(r => {
    if (!rentalCountMap[r.product_id]) rentalCountMap[r.product_id] = 0;
    rentalCountMap[r.product_id] += 1;
    if (!rentalIdsByProduct[r.product_id]) rentalIdsByProduct[r.product_id] = [];
    rentalIdsByProduct[r.product_id].push(r.id);
  });
  const topRented = Object.entries(rentalCountMap)
    .map(([product_id, count]) => ({ product_id: Number(product_id), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ดึงชื่อสินค้า
  let topProducts = [];
  if (topRented.length > 0) {
    const productIds = topRented.map(r => r.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, title')
      .in('id', productIds);

    // ดึง payment_transactions ของ rentals ที่เกี่ยวข้อง (filter ตามช่วงวันที่)
    const rentalIds = topRented.flatMap(r => rentalIdsByProduct[r.product_id]);
    let productIncomeMap = {};
    if (rentalIds.length > 0) {
      let paymentsQuery = supabase
        .from('payment_transactions')
        .select('amount, rental_id')
        .in('rental_id', rentalIds);
      // ไม่ต้อง filter เพิ่ม เพราะ rental_id ถูก filter จาก rentals แล้ว
      const { data: payments } = await paymentsQuery;
      // รวมรายได้แยกตาม product
      (payments || []).forEach(p => {
        // หา product_id จาก rental_id
        const productId = (rentals.find(r => r.id === p.rental_id) || {}).product_id;
        if (!productIncomeMap[productId]) productIncomeMap[productId] = 0;
        productIncomeMap[productId] += Number(p.amount);
      });
    }

    topProducts = topRented.map(r => ({
      product_id: r.product_id,
      title: (products.find(p => p.id === r.product_id) || {}).title || '',
      rental_count: r.count,
      income: productIncomeMap[r.product_id] || 0
    }));
  }

  // 4. รายได้รวม (filter ตามช่วงวันที่)
  let allPaymentsQuery = supabase.from('payment_transactions').select('amount, rental_id');
  if (rentals && rentals.length > 0) {
    const allRentalIds = rentals.map(r => r.id);
    allPaymentsQuery = allPaymentsQuery.in('rental_id', allRentalIds);
  } else {
    // ถ้าไม่มี rental ในช่วงนั้น รายได้เป็น 0
    return {
      total_products: total || 0,
      status_counts: statusCounts,
      top_rented_products: [],
      income: 0
    };
  }
  const { data: payments, error: paymentError } = await allPaymentsQuery;
  if (paymentError) throw paymentError;
  let income = 0;
  (payments || []).forEach(t => {
    income += Number(t.amount);
  });

  return {
    total_products: total || 0,
    status_counts: statusCounts,
    top_rented_products: topProducts,
    income
  };
}

export default {
  login,
  getAllUsers, getUserById, updateUser, banUser, unbanUser, deleteUser, updateUserIdVerification,
  getAllComplaints, getComplaintById, replyComplaint,
  getRentalReport, getIncomeReport, getPlatformStats, getComplaintReport, getUserReputationReport,
  getAllProducts, approveProduct, getAllCategories, createCategory, updateCategory, deleteCategory,
  getSettings, updateSettings, getStaticPages, updateStaticPage,
  getProductReport
=======
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
>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
}; 