# คู่มือการใช้งาน Complaints API (ร้องเรียนปัญหา)

## ภาพรวม
API ชุดนี้ใช้สำหรับการแจ้งเรื่องร้องเรียน (Complaint) ทั้งฝั่งผู้ใช้ทั่วไป (User) และผู้ดูแลระบบ (Admin) โดยมีการแยกสิทธิ์และเส้นทาง (route) อย่างชัดเจน

---

## 1. การยืนยันตัวตน (Authentication)
- ทุก endpoint (ยกเว้นสมัคร/เข้าสู่ระบบ) ต้องแนบ JWT token ใน header:
  ```
  Authorization: Bearer <accessToken>
  ```
- User ใช้ token ที่ได้จาก `/api/auth/login`
- Admin ใช้ token ที่ได้จาก `/api/admin/login`

---

## 2. Complaints API สำหรับผู้ใช้ทั่วไป (User)

### 2.1 แจ้งเรื่องร้องเรียนใหม่
- **POST** `/api/complaints`
- **Body (JSON หรือ multipart/form-data ถ้ามีไฟล์แนบ):**
  ```json
  {
    "title": "สินค้าไม่ตรงปก",
    "details": "ได้รับสินค้าไม่ตรงกับที่ลงประกาศ",
    "complaint_type": "product_issue",
    "related_rental_id": 123, // optional
    "related_product_id": 456, // optional
    "subject_user_id": 789 // optional
  }
  ```
- **แนบไฟล์:** ใช้ multipart/form-data, field ชื่อ `attachments`
- **Response:**
  ```json
  {
    "id": 1,
    "title": "สินค้าไม่ตรงปก",
    "status": "submitted",
    ...
  }
  ```

### 2.2 ดูรายการร้องเรียนของตัวเอง
- **GET** `/api/complaints`
- **Query params:** `?page=1&limit=10&status=submitted`
- **Response:**
  ```json
  {
    "items": [ { "id": 1, "title": "...", ... } ],
    "total": 2,
    "page": 1,
    "limit": 10
  }
  ```

### 2.3 ดูรายละเอียดเรื่องร้องเรียน
- **GET** `/api/complaints/:complaintId`
- **Response:**
  ```json
  {
    "id": 1,
    "title": "สินค้าไม่ตรงปก",
    "details": "...",
    "status": "submitted",
    "complainant": { "id": 5, "first_name": "..." },
    "subject_user": { "id": 7, "first_name": "..." },
    "complaint_attachments": [ { "file_url": "..." } ],
    ...
  }
  ```

### 2.4 ตอบกลับ/อัปเดตเรื่องร้องเรียน (ถ้ามี)
- **PUT** `/api/complaints/:complaintId/reply`
- **Body:** `{ "message": "ขอข้อมูลเพิ่มเติม..." }`
- **Response:** อัปเดตสำเร็จ

---

## 3. Complaints API สำหรับผู้ดูแลระบบ (Admin)

**Base URL:** `/api/admin/complaints`

### 3.1 ดูรายการร้องเรียนทั้งหมด
- **GET** `/api/admin/complaints`
- **Query params:** `?page=1&limit=20&status=submitted`
- **Response:**
  ```json
  {
    "items": [ { "id": 1, "title": "...", ... } ],
    "total": 5,
    "page": 1,
    "limit": 20
  }
  ```

### 3.2 ดูรายละเอียดเรื่องร้องเรียน
- **GET** `/api/admin/complaints/:id`
- **Response:**
  ```json
  {
    "id": 1,
    "title": "สินค้าไม่ตรงปก",
    "details": "...",
    "status": "submitted",
    "complainant": { "id": 5, "first_name": "..." },
    "subject_user": { "id": 7, "first_name": "..." },
    "complaint_attachments": [ { "file_url": "..." } ],
    ...
  }
  ```

### 3.3 ตอบกลับ/อัปเดตสถานะเรื่องร้องเรียน
- **PUT** `/api/admin/complaints/:id/reply`
- **Body:**
  ```json
  {
    "status": "resolved", // หรือ "closed", "in_progress"
    "resolution_notes": "คืนเงินให้ผู้เช่าเรียบร้อย"
  }
  ```
- **Response:** อัปเดตสำเร็จ

---

## 4. หมายเหตุสำคัญ
- **สิทธิ์:**
  - User เห็นเฉพาะเรื่องร้องเรียนของตัวเอง
  - Admin เห็นได้ทุกเรื่อง
- **ไฟล์แนบ:**
  - แนบไฟล์ได้หลายไฟล์ (field: `attachments`)
  - ไฟล์จะถูกเก็บใน bucket `complaint-attachments` ของ Supabase
- **สถานะ (status):**
  - `submitted`, `in_progress`, `resolved`, `closed`
- **การตอบกลับ:**
  - User ตอบกลับได้เฉพาะของตัวเอง (ถ้าระบบเปิดให้โต้ตอบ)
  - Admin ตอบกลับ/เปลี่ยนสถานะได้ทุกเรื่อง

---

## 5. ตัวอย่างการใช้งานด้วย curl

### แจ้งเรื่องร้องเรียนใหม่
```bash
curl -X POST http://localhost:3000/api/complaints \
  -H "Authorization: Bearer <user_token>" \
  -F "title=สินค้าไม่ตรงปก" \
  -F "details=ได้รับสินค้าไม่ตรงกับที่ลงประกาศ" \
  -F "complaint_type=product_issue" \
  -F "related_rental_id=123" \
  -F "attachments=@/path/to/file.jpg"
```

### Admin ตอบกลับและปิดเรื่องร้องเรียน
```bash
curl -X PUT http://localhost:3000/api/admin/complaints/1/reply \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "resolved", "resolution_notes": "คืนเงินให้ผู้เช่าเรียบร้อย" }'
``` 