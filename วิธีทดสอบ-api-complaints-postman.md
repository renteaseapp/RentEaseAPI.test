# วิธีทดสอบ Complaints API ด้วย Postman (Request/Response จริง)

> **แยกส่วน User และ Admin ทุกอย่างอิงจากระบบจริง ไม่มี mock**

---

## 1. เตรียมความพร้อม

- **Base URL:**
  - Local: `http://localhost:3001`
- **Authentication:**
  - ทุก request ต้องแนบ JWT token ใน Header
    - User: Token จาก `/api/auth/login`
    - Admin: Token จาก `/api/admin/login`
  - ตัวอย่าง Header:
    ```
    Authorization: Bearer <access_token>
    ```

---

## 2. Complaints API สำหรับ User

### 2.1 แจ้งเรื่องร้องเรียนใหม่
- **Method:** `POST`
- **URL:** `/api/complaints`
- **Headers:**
  - `Authorization: Bearer <user_token>`
  - `Content-Type: multipart/form-data`
- **Body:**
  - `title` (string)
  - `details` (string)
  - `complaint_type` (string)
  - `related_rental_id` (number, optional)
  - `related_product_id` (number, optional)
  - `subject_user_id` (number, optional)
  - `attachments` (file, optional, แนบได้หลายไฟล์)
- **Request ตัวอย่าง (Postman):**
  - เลือก `form-data` ใส่ field ตามด้านบน
- **Response จริง:**
```json
{
  "status": 201,
  "data": {
    "id": 1,
    "title": "สินค้าไม่ตรงปก",
    "status": "submitted",
    "complainant_id": 5,
    "details": "ได้รับสินค้าไม่ตรงกับที่ลงประกาศ",
    "created_at": "2024-06-01T12:00:00.000Z",
    "complaint_type": "product_issue",
    "priority": "medium"
  },
  "message": "Complaint created successfully"
}
```

---

### 2.2 ดูรายการร้องเรียนของตัวเอง
- **Method:** `GET`
- **URL:** `/api/complaints/my?page=1&limit=10`
- **Headers:**
  - `Authorization: Bearer <user_token>`
- **Response จริง:**
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "สินค้าไม่ตรงปก",
        "status": "submitted",
        "created_at": "2024-06-01T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### 2.3 ดูรายละเอียดเรื่องร้องเรียน
- **Method:** `GET`
- **URL:** `/api/complaints/:complaintId`
- **Headers:**
  - `Authorization: Bearer <user_token>`
- **Response จริง:**
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "title": "สินค้าไม่ตรงปก",
    "details": "ได้รับสินค้าไม่ตรงกับที่ลงประกาศ",
    "status": "submitted",
    "complainant": { "id": 5, "first_name": "สมชาย" },
    "subject_user": { "id": 7, "first_name": "สมหญิง" },
    "complaint_attachments": [
      { "file_url": "https://..." }
    ],
    "created_at": "2024-06-01T12:00:00.000Z"
  }
}
```

---

### 2.4 อัปเดต/เพิ่มข้อความในเรื่องร้องเรียน
- **Method:** `POST`
- **URL:** `/api/complaints/:complaintId/updates`
- **Headers:**
  - `Authorization: Bearer <user_token>`
  - `Content-Type: multipart/form-data`
- **Body:**
  - `message` (string)
  - `attachments` (file, optional)
- **Request ตัวอย่าง (Postman):**
  - เลือก `form-data` ใส่ field ตามด้านบน
- **Response จริง:**
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "admin_notes": "[User Update - 2024-06-01T13:00:00.000Z] ขอข้อมูลเพิ่มเติม"
  },
  "message": "Complaint updated successfully"
}
```

---

## 3. Complaints API สำหรับ Admin

### 3.1 ดูรายการร้องเรียนทั้งหมด
- **Method:** `GET`
- **URL:** `/api/admin/complaints?page=1&limit=10`
- **Headers:**
  - `Authorization: Bearer <admin_token>`
- **Response จริง:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "สินค้าไม่ตรงปก",
      "status": "submitted",
      "created_at": "2024-06-01T12:00:00.000Z"
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

---

### 3.2 ดูรายละเอียดเรื่องร้องเรียน
- **Method:** `GET`
- **URL:** `/api/admin/complaints/:id`
- **Headers:**
  - `Authorization: Bearer <admin_token>`
- **Response จริง:**
```json
{
  "id": 1,
  "title": "สินค้าไม่ตรงปก",
  "details": "ได้รับสินค้าไม่ตรงกับที่ลงประกาศ",
  "status": "submitted",
  "complainant_id": 5,
  "subject_user_id": 7,
  "created_at": "2024-06-01T12:00:00.000Z"
}
```

---

### 3.3 ตอบกลับ/อัปเดตสถานะเรื่องร้องเรียน
- **Method:** `PUT`
- **URL:** `/api/admin/complaints/:id/reply`
- **Headers:**
  - `Authorization: Bearer <admin_token>`
  - `Content-Type: application/json`
- **Body:**
  - `status` (string: เช่น resolved, closed, in_progress)
  - `resolution_notes` (string)
- **Request ตัวอย่าง (Postman):**
  - เลือก `raw` JSON ใส่ field ตามด้านบน
- **Response จริง:**
```json
{
  "id": 1,
  "status": "resolved",
  "resolution_notes": "คืนเงินให้ผู้เช่าเรียบร้อย"
}
```

---

## 4. หมายเหตุสำคัญ

- ทุก request ต้องแนบ JWT token ที่ถูกต้อง
- ถ้าไม่มีสิทธิ์หรือข้อมูลไม่ถูกต้อง จะได้ response status 401/403/404 พร้อมข้อความ error จริงจากระบบ
- การแนบไฟล์ใน Postman ให้เลือก `form-data` และเพิ่ม field `attachments` (เลือกไฟล์)
- ทุก response จะได้ข้อมูลจริงจากฐานข้อมูล ไม่ใช่ mock

---

**สรุป:**
- ใช้ Postman ตั้งค่า URL, Method, Header, Body ตามรายละเอียดข้างบน
- ทุก response จะได้ข้อมูลจริงจากระบบ (id, status, details, ฯลฯ)
- ทดสอบได้ทั้งฝั่ง User และ Admin ตามสิทธิ์ของ token 