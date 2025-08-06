import UserModel from '../models/user.model.js';
import supabase from '../db/supabaseClient.js';
import { generateToken } from '../utils/jwt.utils.js';
import { comparePassword } from '../utils/password.utils.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import { ApiError } from '../utils/apiError.js';
import AdminLogger from '../utils/adminLogger.js';

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
async function updateUser(id, body, adminUserId = null, req = null) {
  const result = await UserModel.update(Number(id), body);
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logUserAction(adminUserId, 'USER_UPDATE', Number(id), {
      updated_fields: Object.keys(body),
      new_values: body
    }, req);
  }
  
  return result;
}
async function banUser(id, adminUserId = null, req = null) {
  const result = await UserModel.update(Number(id), { is_active: false });
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logUserAction(adminUserId, 'USER_BAN', Number(id), {
      action: 'User banned',
      reason: 'Admin action'
    }, req);
  }
  
  return result;
}
async function unbanUser(id, adminUserId = null, req = null) {
  const result = await UserModel.update(Number(id), { is_active: true });
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logUserAction(adminUserId, 'USER_UNBAN', Number(id), {
      action: 'User unbanned',
      reason: 'Admin action'
    }, req);
  }
  
  return result;
}
async function deleteUser(id, adminUserId = null, req = null) {
  // soft delete
  const result = await UserModel.update(Number(id), { deleted_at: new Date().toISOString() });
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logUserAction(adminUserId, 'USER_DELETE', Number(id), {
      action: 'User soft deleted',
      reason: 'Admin action'
    }, req);
  }
  
  return result;
}
async function updateUserIdVerification(id, body, adminUserId = null, req = null) {
  // อัปเดตฟิลด์ยืนยันตัวตน
  const result = await UserModel.update(Number(id), body);
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logUserAction(adminUserId, 'USER_VERIFICATION_UPDATE', Number(id), {
      updated_fields: Object.keys(body),
      new_values: body
    }, req);
  }
  
  return result;
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
async function replyComplaint(id, body, adminUserId = null, req = null) {
  // อัปเดตสถานะ/ตอบกลับร้องเรียน
  const { data, error } = await supabase
    .from('complaints')
    .update(body)
    .eq('id', Number(id))
    .select('*')
    .single();
  if (error) throw error;
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logComplaintAction(adminUserId, 'COMPLAINT_REPLY', Number(id), {
      updated_fields: Object.keys(body),
      new_values: body
    }, req);
  }
  
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
  try {
    // รายงานคะแนนรีวิวของผู้ให้เช่า (owner) - แสดงทุก owner ที่มีสินค้า
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('owner_id, rating_owner');
    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      throw reviewsError;
    }

    // ดึงข้อมูล owner ทั้งหมดที่มีสินค้า
    const { data: owners, error: ownersError } = await supabase
      .from('products')
      .select('owner_id')
      .not('owner_id', 'is', null);
    if (ownersError) {
      console.error('Error fetching owners:', ownersError);
      throw ownersError;
    }

    // ดึงข้อมูล user details สำหรับ owner ทั้งหมด
    const uniqueOwnerIds = [...new Set((owners || []).map(p => p.owner_id))];
    let userDetails = {};
    if (uniqueOwnerIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, first_name, last_name, email')
        .in('id', uniqueOwnerIds);
      if (usersError) {
        console.error('Error fetching user details:', usersError);
        throw usersError;
      }
      // สร้าง map ของ user details
      (users || []).forEach(user => {
        userDetails[user.id] = user;
      });
    }

    // นับจำนวนสินค้าของแต่ละ owner
    const { data: productCounts, error: productCountsError } = await supabase
      .from('products')
      .select('owner_id')
      .not('owner_id', 'is', null);
    if (productCountsError) {
      console.error('Error fetching product counts:', productCountsError);
      throw productCountsError;
    }

  const productCountMap = {};
  (productCounts || []).forEach(p => {
    if (!productCountMap[p.owner_id]) productCountMap[p.owner_id] = 0;
    productCountMap[p.owner_id] += 1;
  });

  // สร้าง map ของ reviews
  const reviewMap = {};
  (reviews || []).forEach(r => {
    if (!reviewMap[r.owner_id]) reviewMap[r.owner_id] = { total: 0, count: 0 };
    reviewMap[r.owner_id].total += Number(r.rating_owner);
    reviewMap[r.owner_id].count += 1;
  });

      // สร้าง map ของ unique owners
    const ownerMap = {};
    (owners || []).forEach(p => {
      if (p.owner_id && !ownerMap[p.owner_id]) {
        ownerMap[p.owner_id] = {
          owner_id: p.owner_id,
          owner_info: userDetails[p.owner_id]
        };
      }
    });

  // รวมข้อมูล owner และ reviews
  const reputations = Object.keys(ownerMap).map(ownerId => {
    const ownerIdNum = Number(ownerId);
    const reviewData = reviewMap[ownerIdNum] || { total: 0, count: 0 };
    const ownerInfo = ownerMap[ownerIdNum].owner_info;
    const productCount = productCountMap[ownerIdNum] || 0;
    
    return {
      owner_id: ownerIdNum,
      owner_name: ownerInfo ? `${ownerInfo.first_name || ''} ${ownerInfo.last_name || ''}`.trim() || ownerInfo.username || ownerInfo.email : `Owner ${ownerIdNum}`,
      owner_email: ownerInfo?.email || '',
      avg_rating: reviewData.count ? reviewData.total / reviewData.count : 0,
      review_count: reviewData.count,
      product_count: productCount
    };
  });

    // เรียงตาม avg_rating จากมากไปน้อย
    reputations.sort((a, b) => b.avg_rating - a.avg_rating);

    return { reputations };
  } catch (error) {
    console.error('Error in getUserReputationReport:', error);
    throw error;
  }
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
async function approveProduct(id, body, adminUserId = null, req = null) {
  // อัปเดตสถานะอนุมัติสินค้า
  const updateData = {
    ...body,
    // Set published_at when product is approved
    ...(body.admin_approval_status === 'approved' && { published_at: new Date().toISOString() })
  };
  
  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', Number(id))
    .select('*')
    .single();
  if (error) throw error;
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logProductAction(adminUserId, 'PRODUCT_APPROVE', Number(id), {
      action: `Product ${body.admin_approval_status}`,
      updated_fields: Object.keys(updateData),
      new_values: updateData
    }, req);
  }
  
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
async function createCategory(body, adminUserId = null, req = null) {
  const { data, error } = await supabase
    .from('categories')
    .insert([body])
    .select('*')
    .single();
  if (error) throw error;
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logCategoryAction(adminUserId, 'CATEGORY_CREATE', data.id, {
      category_name: data.name,
      category_data: body
    }, req);
  }
  
  return data;
}
async function updateCategory(id, body, adminUserId = null, req = null) {
  const { data, error } = await supabase
    .from('categories')
    .update(body)
    .eq('id', Number(id))
    .select('*')
    .single();
  if (error) throw error;
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logCategoryAction(adminUserId, 'CATEGORY_UPDATE', Number(id), {
      updated_fields: Object.keys(body),
      new_values: body
    }, req);
  }
  
  return data;
}
async function deleteCategory(id, adminUserId = null, req = null) {
  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', Number(id))
    .select('*')
    .single();
  if (error) throw error;
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logCategoryAction(adminUserId, 'CATEGORY_DELETE', Number(id), {
      category_name: data.name,
      action: 'Category deleted'
    }, req);
  }
  
  return data;
}

// System Settings & Static Content
async function getSettings() {
  const { data, error } = await supabase.from('system_settings').select('*');
  if (error) throw error;
  return { settings: data || [] };
}
async function updateSettings(body, adminUserId = null, req = null) {
  // body: { setting_key, setting_value, updated_by_admin_id, ... }
  const { data, error } = await supabase
    .from('system_settings')
    .upsert([{
      ...body,
      updated_at: new Date().toISOString()
    }])
    .select('*');
  if (error) throw error;
  
  // Log admin action
  if (adminUserId) {
    await AdminLogger.logSettingAction(adminUserId, 'SETTING_UPDATE', body.setting_key, {
      setting_key: body.setting_key,
      setting_value: body.setting_value,
      updated_fields: Object.keys(body)
    }, req);
  }
  
  return { updated: true, data };
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

// Admin Logs Management
async function getAdminLogs(query = {}) {
  const { page = 1, limit = 20, admin_user_id, action_type, target_entity_type, start_date, end_date } = query;
  const offset = (page - 1) * limit;
  
  let queryBuilder = supabase
    .from('admin_logs')
    .select(`
      *,
      admin_user:admin_user_id(id, username, email, first_name, last_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });
  
  // Apply filters
  if (admin_user_id) {
    queryBuilder = queryBuilder.eq('admin_user_id', Number(admin_user_id));
  }
  if (action_type) {
    queryBuilder = queryBuilder.eq('action_type', action_type);
  }
  if (target_entity_type) {
    queryBuilder = queryBuilder.eq('target_entity_type', target_entity_type);
  }
  if (start_date) {
    queryBuilder = queryBuilder.gte('created_at', start_date);
  }
  if (end_date) {
    queryBuilder = queryBuilder.lte('created_at', end_date);
  }
  
  const { data, error, count } = await queryBuilder.range(offset, offset + limit - 1);
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

export default {
  login,
  getAllUsers, getUserById, updateUser, banUser, unbanUser, deleteUser, updateUserIdVerification,
  getAllComplaints, getComplaintById, replyComplaint,
  getRentalReport, getIncomeReport, getPlatformStats, getComplaintReport, getUserReputationReport,
  getAllProducts, approveProduct, getAllCategories, createCategory, updateCategory, deleteCategory,
  getSettings, updateSettings,
  getProductReport, getAdminLogs
}; 