# คู่มือการใช้งาน Admin API (AdminAPI.md)

> **หมายเหตุ:** ENUM ทุกตัวอ้างอิงจาก schema.md เท่านั้น (ห้ามมั่ว)

---

## 1. Auth: Admin Login
### POST `/api/admin/login`
**Request Body:**
```json
{
  "email_or_username": "admin@example.com",
  "password": "yourpassword"
}
```
**Response:**
```json
{
  "access_token": "...",
  "user": {
    "id": 8,
    "username": "admin",
    "email": "admin@example.com",
    "is_admin": true
  },
  "is_admin": true
}
```

---

## 2. User Management
### 2.1 GET `/api/admin/users?page=1&limit=10`
**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "username": "user1",
      "email": "user1@example.com",
      "first_name": "ชื่อจริง",
      "last_name": "นามสกุล",
      "phone_number": "0812345678",
      "profile_picture_url": "...",
      "email_verified_at": null,
      "last_login_at": null,
      "is_active": true,
      "address_line1": null,
      "address_line2": null,
      "city": null,
      "province_id": null,
      "postal_code": null,
      "id_verification_status": "not_submitted", // ENUM: not_submitted, pending, verified, rejected, resubmit_required
      "id_verification_notes": null,
      "id_document_type": null, // ENUM: national_id, passport, other
      "id_document_number": null,
      "id_document_url": null,
      "id_document_back_url": null,
      "id_selfie_url": null,
      "created_at": "2024-06-01T12:00:00.000Z",
      "updated_at": "2024-06-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 1,
    "last_page": 1,
    "from": 1,
    "to": 1
  }
}
```

### 2.2 GET `/api/admin/users/:id`
**Response:** (เหมือน 2.1 แต่เป็น user เดียว)

### 2.3 PUT `/api/admin/users/:id`
**Request Body:** (ส่งเฉพาะฟิลด์ที่ต้องการอัปเดต)
```json
{
  "first_name": "ใหม่",
  "last_name": "นามสกุลใหม่",
  "is_active": false
}
```
**Response:** (user object ที่อัปเดตแล้ว)

### 2.4 POST `/api/admin/users/:id/ban`
**Response:** (user object ที่ is_active = false)

### 2.5 POST `/api/admin/users/:id/unban`
**Response:** (user object ที่ is_active = true)

### 2.6 DELETE `/api/admin/users/:id`
**Response:**
```json
{
  "id": 1,
  "deleted_at": "2024-06-01T12:00:00.000Z"
}
```

### 2.7 PUT `/api/admin/users/:id/id-verification`
**Request Body:**
```json
{
  "id_verification_status": "verified", // ENUM: not_submitted, pending, verified, rejected, resubmit_required
  "id_verified_by_admin_id": 8
}
```
**Response:** (user object ที่อัปเดตแล้ว)

---

## 3. Category Management
### 3.1 GET `/api/admin/categories`
**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "กล้องถ่ายรูป",
      "name_en": "Camera",
      "slug": "camera",
      "description": "หมวดหมู่กล้อง",
      "parent_id": null,
      "icon_url": null,
      "image_url": null,
      "sort_order": 0,
      "is_featured": false,
      "is_active": true,
      "created_at": "2024-06-01T12:00:00.000Z",
      "updated_at": "2024-06-01T12:00:00.000Z"
    }
  ]
}
```

### 3.2 POST `/api/admin/categories`
**Request Body:**
```json
{
  "name": "ใหม่",
  "slug": "mai",
  "description": "หมวดหมู่ใหม่",
  "parent_id": null,
  "icon_url": null,
  "image_url": null,
  "sort_order": 1,
  "is_featured": false,
  "is_active": true
}
```
**Response:** (category object ที่สร้างใหม่)

### 3.3 PUT `/api/admin/categories/:id`
**Request Body:** (ส่งเฉพาะฟิลด์ที่ต้องการอัปเดต)
```json
{
  "name": "แก้ไข",
  "slug": "edit"
}
```
**Response:** (category object ที่อัปเดตแล้ว)

### 3.4 DELETE `/api/admin/categories/:id`
**Response:**
```json
{
  "id": 1,
  "deleted": true
}
```

---

## 4. Product Management
### 4.1 GET `/api/admin/products?page=1&limit=10`
**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "owner_id": 2,
      "category_id": 1,
      "province_id": 1,
      "title": "กล้องฟิล์ม",
      "slug": "film-camera",
      "description": "กล้องฟิล์มใช้งานได้ดี",
      "specifications": {},
      "rental_price_per_day": "100.00",
      "rental_price_per_week": null,
      "rental_price_per_month": null,
      "security_deposit": "500.00",
      "quantity": 1,
      "quantity_available": 1,
      "availability_status": "available", // ENUM: available, rented_out, unavailable, pending_approval, rejected, hidden, draft
      "min_rental_duration_days": 1,
      "max_rental_duration_days": null,
      "address_details": null,
      "latitude": null,
      "longitude": null,
      "condition_notes": null,
      "view_count": 0,
      "average_rating": "0.00",
      "total_reviews": 0,
      "is_featured": false,
      "admin_approval_status": "approved", // ENUM: pending, approved, rejected
      "admin_approval_notes": null,
      "approved_by_admin_id": null,
      "created_at": "2024-06-01T12:00:00.000Z",
      "updated_at": "2024-06-01T12:00:00.000Z",
      "published_at": null,
      "deleted_at": null
    }
  ],
  "meta": { ... }
}
```

### 4.2 PUT `/api/admin/products/:id/approve`
**Request Body:**
```json
{
  "admin_approval_status": "approved" // ENUM: pending, approved, rejected
}
```
**Response:** (product object ที่อัปเดตแล้ว)

---

## 5. Complaints Management
### 5.1 GET `/api/admin/complaints?page=1&limit=10`
**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "complaint_uid": "...",
      "complainant_id": 2,
      "subject_user_id": 3,
      "related_rental_id": null,
      "related_product_id": null,
      "complaint_type": "สินค้าไม่ตรงปก",
      "title": "สินค้าไม่เหมือนรูป",
      "details": "รายละเอียด...",
      "status": "submitted", // ENUM: submitted, under_review, awaiting_user_response, investigating, resolved, closed_no_action, closed_escalated_to_claim
      "admin_notes": null,
      "resolution_notes": null,
      "admin_handler_id": null,
      "priority": "medium", // ENUM: low, medium, high, critical
      "created_at": "2024-06-01T12:00:00.000Z",
      "updated_at": "2024-06-01T12:00:00.000Z",
      "resolved_at": null,
      "closed_at": null
    }
  ],
  "meta": { ... }
}
```

### 5.2 GET `/api/admin/complaints/:id`
**Response:** (complaint object)

### 5.3 PUT `/api/admin/complaints/:id/reply`
**Request Body:**
```json
{
  "status": "resolved", // ENUM: submitted, under_review, awaiting_user_response, investigating, resolved, closed_no_action, closed_escalated_to_claim
  "admin_notes": "ตอบกลับแล้ว"
}
```
**Response:** (complaint object ที่อัปเดตแล้ว)

---

## 6. Claims Management
### 6.1 GET `/api/admin/claims?page=1&limit=10`
**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "claim_uid": "...",
      "rental_id": 1,
      "reported_by_id": 2,
      "accused_id": 3,
      "claim_type": "damage", // ENUM: damage, loss, other
      "claim_details": "รายละเอียด...",
      "requested_amount": "1000.00",
      "status": "open", // ENUM: open, awaiting_renter_response, awaiting_owner_counter_response, negotiating, pending_admin_review, resolved_by_agreement, resolved_by_admin, closed_withdrawn, closed_paid
      "renter_response_details": null,
      "owner_counter_response_details": null,
      "resolution_details": null,
      "resolved_amount": null,
      "admin_moderator_id": null,
      "created_at": "2024-06-01T12:00:00.000Z",
      "updated_at": "2024-06-01T12:00:00.000Z",
      "closed_at": null
    }
  ],
  "meta": { ... }
}
```

### 6.2 GET `/api/admin/claims/:id`
**Response:** (claim object)

### 6.3 PUT `/api/admin/claims/:id/reply`
**Request Body:**
```json
{
  "status": "resolved_by_admin", // ENUM: open, awaiting_renter_response, awaiting_owner_counter_response, negotiating, pending_admin_review, resolved_by_agreement, resolved_by_admin, closed_withdrawn, closed_paid
  "resolution_details": "Admin ตัดสินแล้ว"
}
```
**Response:** (claim object ที่อัปเดตแล้ว)

---

## 7. System Settings
### 7.1 GET `/api/admin/settings`
**Response:**
```json
{
  "settings": [
    {
      "setting_key": "site_name",
      "setting_value": "RentEase",
      "description": "ชื่อเว็บไซต์",
      "data_type": "string", // ENUM: string, integer, float, boolean, json, text
      "is_publicly_readable": false,
      "is_encrypted": false,
      "validation_rules": null,
      "created_at": "2024-06-01T12:00:00.000Z",
      "updated_at": "2024-06-01T12:00:00.000Z",
      "updated_by_admin_id": null
    }
  ]
}
```

### 7.2 PUT `/api/admin/settings`
**Request Body:**
```json
{
  "setting_key": "site_name",
  "setting_value": "RentEase"
}
```
**Response:**
```json
{
  "updated": true,
  "data": [ { ...setting object... } ]
}
```

---

## 8. Static Pages
### 8.1 GET `/api/admin/static-pages`
**Response:**
```json
{
  "data": [
    {
      "slug": "about",
      "title": "เกี่ยวกับเรา",
      "title_en": "About Us",
      "content_html": "<h1>เกี่ยวกับเรา</h1>",
      "content_html_en": null,
      "meta_title": null,
      "meta_description": null,
      "is_published": true,
      "created_at": "2024-06-01T12:00:00.000Z",
      "updated_at": "2024-06-01T12:00:00.000Z",
      "updated_by_admin_id": null
    }
  ]
}
```

### 8.2 PUT `/api/admin/static-pages/:slug`
**Request Body:**
```json
{
  "content_html": "<h1>About Us</h1>"
}
```
**Response:** (static page object ที่อัปเดตแล้ว)

---

## 9. หมายเหตุ ENUM (ตาม schema.md)
- user_id_verification_status_enum: `not_submitted`, `pending`, `verified`, `rejected`, `resubmit_required`
- user_id_document_type_enum: `national_id`, `passport`, `other`
- product_availability_status_enum: `available`, `rented_out`, `unavailable`, `pending_approval`, `rejected`, `hidden`, `draft`
- product_admin_approval_status_enum: `pending`, `approved`, `rejected`
- complaint_status_enum: `submitted`, `under_review`, `awaiting_user_response`, `investigating`, `resolved`, `closed_no_action`, `closed_escalated_to_claim`
- complaint_priority_enum: `low`, `medium`, `high`, `critical`
- claim_type_enum: `damage`, `loss`, `other`
- claim_status_enum: `open`, `awaiting_renter_response`, `awaiting_owner_counter_response`, `negotiating`, `pending_admin_review`, `resolved_by_agreement`, `resolved_by_admin`, `closed_withdrawn`, `closed_paid`
- system_settings_data_type_enum: `string`, `integer`, `float`, `boolean`, `json`, `text`

---

**ทุก endpoint ต้องแนบ JWT admin ใน header:**
```
Authorization: Bearer <access_token>
``` 