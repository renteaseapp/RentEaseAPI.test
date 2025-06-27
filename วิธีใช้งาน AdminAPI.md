# วิธีใช้งาน AdminAPI (รายละเอียดฟิลด์ตาม schema.md)

---

## 1. Auth: Login
### POST `/api/admin/login`
**Request Body:**
| ฟิลด์              | ประเภท   | จำเป็น | รายละเอียด                 |
|--------------------|----------|--------|----------------------------|
| email_or_username  | string   | ✔️     | อีเมลหรือชื่อผู้ใช้ admin |
| password           | string   | ✔️     | รหัสผ่าน                  |

**Response:**
| ฟิลด์         | ประเภท   | รายละเอียด |
|---------------|----------|------------|
| access_token  | string   | JWT Token  |
| user          | object   | ข้อมูล user admin (ดูตาราง users) |
| is_admin      | boolean  | true       |

---

## 2. Users Management
### GET `/api/admin/users`
**Query:**
- page (number, optional)
- limit (number, optional)

**Response:**
| ฟิลด์   | ประเภท   | รายละเอียด |
|---------|----------|------------|
| data    | array    | รายการ user (ดูตาราง users) |
| meta    | object   | ข้อมูล pagination |

### GET `/api/admin/users/:id`
**Response:**
- user object (ดูตาราง users)

### PUT `/api/admin/users/:id`
**Request Body:** (อัปเดตได้เฉพาะฟิลด์ที่ไม่ใช่ PK/unique/email/password)
| ฟิลด์                  | ประเภท   | ENUM/Constraint | รายละเอียด |
|------------------------|----------|-----------------|------------|
| first_name             | string   | not null        | ชื่อจริง   |
| last_name              | string   | not null        | นามสกุล    |
| phone_number           | string   | unique, nullable| เบอร์โทร   |
| profile_picture_url    | string   | nullable        | URL รูปโปรไฟล์ |
| address_line1          | string   | nullable        | ที่อยู่ 1   |
| address_line2          | string   | nullable        | ที่อยู่ 2   |
| city                   | string   | nullable        | อำเภอ/เขต  |
| province_id            | bigint   | FK provinces    | จังหวัด     |
| postal_code            | string   | nullable        | รหัสไปรษณีย์ |
| is_active              | boolean  | default true    | สถานะบัญชี |
| id_verification_status | enum     | not_submitted, pending, verified, rejected, resubmit_required | สถานะยืนยันตัวตน |
| id_verification_notes  | string   | nullable        | หมายเหตุยืนยันตัวตน |
| id_verified_at         | datetime | nullable        | เวลายืนยันตัวตน |
| id_verified_by_admin_id| bigint   | FK users        | admin ที่ยืนยัน |
| deleted_at             | datetime | nullable        | soft delete |

**Response:**
- user object (ดูตาราง users)

### POST `/api/admin/users/:id/ban`
**Response:**
- user object (is_active=false)

### POST `/api/admin/users/:id/unban`
**Response:**
- user object (is_active=true)

### DELETE `/api/admin/users/:id`
**Response:**
- user object (deleted_at=timestamp)

### PUT `/api/admin/users/:id/id-verification`
**Request Body:**
| ฟิลด์                  | ประเภท   | ENUM/Constraint | รายละเอียด |
|------------------------|----------|-----------------|------------|
| id_verification_status | enum     | not_submitted, pending, verified, rejected, resubmit_required | สถานะยืนยันตัวตน |
| id_verification_notes  | string   | nullable        | หมายเหตุ   |
| id_verified_at         | datetime | nullable        | เวลายืนยัน |
| id_verified_by_admin_id| bigint   | FK users        | admin ที่ยืนยัน |

**Response:**
- user object (ดูตาราง users)

**ตัวอย่าง user object:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "Admin",
  "last_name": "User",
  "phone_number": "0812345678",
  "profile_picture_url": "https://...",
  "email_verified_at": null,
  "last_login_at": "2024-06-01T12:00:00Z",
  "is_active": true,
  "address_line1": null,
  "address_line2": null,
  "city": null,
  "province_id": null,
  "postal_code": null,
  "id_verification_status": "verified",
  "id_verification_notes": null,
  "id_document_type": null,
  "id_document_number": null,
  "id_document_url": null,
  "id_document_back_url": null,
  "id_selfie_url": null,
  "created_at": "2024-06-01T10:00:00Z",
  "updated_at": "2024-06-01T12:00:00Z",
  "deleted_at": null
}
```

---

## 3. Complaints Management
### GET `/api/admin/complaints`
**Query:**
- page (number, optional)
- limit (number, optional)

**Response:**
| ฟิลด์   | ประเภท   | รายละเอียด |
|---------|----------|------------|
| data    | array    | รายการ complaint (ดูตาราง complaints) |
| meta    | object   | ข้อมูล pagination |

### GET `/api/admin/complaints/:id`
**Response:**
- complaint object (ดูตาราง complaints)

### PUT `/api/admin/complaints/:id/reply`
**Request Body:**
| ฟิลด์         | ประเภท   | ENUM/Constraint | รายละเอียด |
|---------------|----------|-----------------|------------|
| status        | enum     | submitted, under_review, awaiting_user_response, investigating, resolved, closed_no_action, closed_escalated_to_claim | สถานะร้องเรียน |
| admin_notes   | string   | nullable        | บันทึก admin |
| resolution_notes | string | nullable        | หมายเหตุการแก้ไข |
| admin_handler_id | bigint | FK users        | admin ที่รับผิดชอบ |

**Response:**
- complaint object (ดูตาราง complaints)

**ตัวอย่าง complaint object:**
```json
{
  "id": 1,
  "complaint_uid": "uuid-...",
  "complainant_id": 2,
  "subject_user_id": 3,
  "related_rental_id": 5,
  "related_product_id": 10,
  "complaint_type": "สินค้าไม่ตรงปก",
  "title": "สินค้าไม่เหมือนรูป",
  "details": "รายละเอียด...",
  "status": "resolved",
  "admin_notes": "admin ดำเนินการแล้ว",
  "resolution_notes": "แก้ไขสำเร็จ",
  "admin_handler_id": 1,
  "priority": "medium",
  "created_at": "2024-06-01T10:00:00Z",
  "updated_at": "2024-06-01T12:00:00Z",
  "resolved_at": "2024-06-01T12:00:00Z",
  "closed_at": null
}
```

---

## 4. Categories Management
### GET `/api/admin/categories`
**Response:**
| ฟิลด์   | ประเภท   | รายละเอียด |
|---------|----------|------------|
| data    | array    | รายการ category (ดูตาราง categories) |

### POST `/api/admin/categories`
**Request Body:**
| ฟิลด์         | ประเภท   | ENUM/Constraint | รายละเอียด |
|---------------|----------|-----------------|------------|
| name          | string   | not null        | ชื่อหมวดหมู่ |
| name_en       | string   | nullable        | ชื่อหมวดหมู่ (EN) |
| slug          | string   | not null, unique| slug URL |
| description   | string   | nullable        | คำอธิบาย |
| parent_id     | bigint   | FK categories   | หมวดหมู่แม่ |
| icon_url      | string   | nullable        | URL ไอคอน |
| image_url     | string   | nullable        | URL รูปภาพ |
| sort_order    | int      | default 0       | ลำดับแสดงผล |
| is_featured   | boolean  | default false   | เป็นหมวดหมู่แนะนำ |
| is_active     | boolean  | default true    | สถานะใช้งาน |

**Response:**
- category object (ดูตาราง categories)

**ตัวอย่าง category object:**
```json
{
  "id": 1,
  "name": "กล้อง",
  "name_en": "Camera",
  "slug": "camera",
  "description": "หมวดหมู่กล้อง",
  "parent_id": null,
  "icon_url": "https://...",
  "image_url": null,
  "sort_order": 0,
  "is_featured": false,
  "is_active": true,
  "created_at": "2024-06-01T10:00:00Z",
  "updated_at": "2024-06-01T10:00:00Z"
}
```

### PUT `/api/admin/categories/:id`
**Request Body:** (เหมือน POST)

### DELETE `/api/admin/categories/:id`
**Response:**
- category object (deleted)

---

## 5. Products Management
### GET `/api/admin/products`
**Query:**
- page (number, optional)
- limit (number, optional)

**Response:**
| ฟิลด์   | ประเภท   | รายละเอียด |
|---------|----------|------------|
| data    | array    | รายการ product (ดูตาราง products) |
| meta    | object   | ข้อมูล pagination |

### PUT `/api/admin/products/:id/approve`
**Request Body:**
| ฟิลด์                  | ประเภท   | ENUM/Constraint | รายละเอียด |
|------------------------|----------|-----------------|------------|
| admin_approval_status  | enum     | pending, approved, rejected | สถานะอนุมัติ |
| admin_approval_notes   | string   | nullable        | หมายเหตุ admin |
| approved_by_admin_id   | bigint   | FK users        | admin ที่อนุมัติ |

**Response:**
- product object (ดูตาราง products)

**ตัวอย่าง product object:**
```json
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
  "availability_status": "available",
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
  "admin_approval_status": "approved",
  "admin_approval_notes": null,
  "approved_by_admin_id": 1,
  "created_at": "2024-06-01T10:00:00Z",
  "updated_at": "2024-06-01T10:00:00Z",
  "published_at": null,
  "deleted_at": null
}
```

---

## 6. System Settings
### GET `/api/admin/settings`
**Response:**
| ฟิลด์     | ประเภท   | รายละเอียด |
|-----------|----------|------------|
| settings  | array    | รายการ setting (ดูตาราง system_settings) |

### PUT `/api/admin/settings`
**Request Body:**
| ฟิลด์             | ประเภท   | ENUM/Constraint | รายละเอียด |
|-------------------|----------|-----------------|------------|
| setting_key       | string   | PK              | ชื่อ key   |
| setting_value     | string   | not null        | ค่า        |
| description       | string   | nullable        | คำอธิบาย  |
| data_type         | enum     | string, integer, float, boolean, json, text | ประเภทข้อมูล |
| is_publicly_readable | boolean| default false   | อ่านได้สาธารณะ |
| is_encrypted      | boolean  | default false   | เข้ารหัส   |
| validation_rules  | string   | nullable        | กฎ validate |
| updated_by_admin_id | bigint | FK users        | admin ที่แก้ไข |

**Response:**
- setting object (ดูตาราง system_settings)

---

## 7. Static Pages
### GET `/api/admin/static-pages`
**Response:**
| ฟิลด์   | ประเภท   | รายละเอียด |
|---------|----------|------------|
| data    | array    | รายการ static page (ดูตาราง static_pages) |

### PUT `/api/admin/static-pages/:slug`
**Request Body:**
| ฟิลด์             | ประเภท   | รายละเอียด |
|-------------------|----------|------------|
| title             | string   | not null   | หัวข้อหน้า |
| title_en          | string   | nullable   | หัวข้อ (EN) |
| content_html      | string   | not null   | เนื้อหา HTML |
| content_html_en   | string   | nullable   | เนื้อหา HTML (EN) |
| meta_title        | string   | nullable   | meta title |
| meta_description  | string   | nullable   | meta desc  |
| is_published      | boolean  | default true | เผยแพร่   |
| updated_by_admin_id | bigint | FK users   | admin ที่แก้ไข |

**Response:**
- static page object (ดูตาราง static_pages)

---

## หมายเหตุ
- ENUM ทุกตัวต้องใช้ค่าตาม schema.md เท่านั้น
- FK ต้องอ้างอิง id ที่มีอยู่จริง
- ฟิลด์ที่ nullable ไม่จำเป็นต้องส่ง
- ฟิลด์ default ไม่ส่งจะใช้ค่าตาม default schema
- ทุก endpoint ต้องแนบ JWT admin ใน header 