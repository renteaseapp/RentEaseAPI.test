# แก้ไขปัญหา "Malformed part header"

## 🔍 สาเหตุของปัญหา

ข้อผิดพลาด "Malformed part header" เกิดจาก:

1. **Content-Type ไม่ถูกต้อง** - ไม่ได้ตั้งเป็น `multipart/form-data`
2. **โครงสร้าง Form Data ไม่ถูกต้อง** - การส่งข้อมูล multipart ไม่ถูกต้อง
3. **Field Names ไม่ถูกต้อง** - ชื่อ field ไม่ตรงกับที่ API ต้องการ
4. **การส่งไฟล์ไม่ถูกต้อง** - ไฟล์ไม่ได้ถูกส่งในรูปแบบที่ถูกต้อง

## 🛠️ การแก้ไข

### 1. ตรวจสอบ Content-Type
```
Content-Type: multipart/form-data
```

### 2. ตรวจสอบ Field Names ที่ถูกต้อง

#### สำหรับ PUT /api/products/{id}:
- `new_images[]` - รูปภาพใหม่ (ไฟล์)
- `remove_image_ids[]` - รหัสรูปภาพที่ต้องการลบ (ข้อความ)
- ฟิลด์อื่นๆ - ข้อมูลสินค้า (ข้อความ)

### 3. ตัวอย่าง Postman ที่ถูกต้อง

#### Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

#### Body (Form-data):
```
Key: title
Value: "กล้อง DSLR Canon EOS R5 (อัปเดต)"
Type: Text

Key: description  
Value: "กล้อง DSLR ระดับมืออาชีพ"
Type: Text

Key: rental_price_per_day
Value: 1800.00
Type: Text

Key: new_images[]
Value: [เลือกไฟล์รูปภาพ]
Type: File

Key: remove_image_ids[]
Value: "1,3"
Type: Text
```

## 🧪 การทดสอบ

### 1. ทดสอบด้วย Script
```bash
# แก้ไข token และ product ID ในไฟล์
node test-put-upload.js
```

### 2. ทดสอบด้วย Postman
1. ตั้งค่า Method เป็น `PUT`
2. ตั้งค่า URL เป็น `http://localhost:3001/api/products/{id}`
3. ตั้งค่า Headers ตามด้านบน
4. ตั้งค่า Body เป็น `form-data`
5. เพิ่ม fields ตามตัวอย่าง

## ⚠️ สิ่งที่ต้องระวัง

### 1. Field Names
- ใช้ `new_images[]` ไม่ใช่ `images[]` (สำหรับ PUT)
- ใช้ `remove_image_ids[]` ไม่ใช่ `remove_image_ids`

### 2. File Upload
- ไฟล์ต้องเป็นรูปภาพ (JPEG, PNG, etc.)
- ขนาดไฟล์ไม่เกิน 5MB
- ใช้ field name ที่ถูกต้อง

### 3. Text Fields
- ข้อมูลข้อความต้องเป็น string
- ตัวเลขต้องเป็น string หรือ number
- JSON ต้องเป็น string

## 🔧 การ Debug

### 1. ตรวจสอบ Logs
Server จะแสดง logs:
```
Upload middleware processing fields: [...]
Files received: {...}
Body received: {...}
```

### 2. ตรวจสอบ Request
- ตรวจสอบ Content-Type header
- ตรวจสอบ field names
- ตรวจสอบ file types

### 3. ตรวจสอบ Response
- ดู error message ที่ชัดเจนขึ้น
- ตรวจสอบ status code

## 📝 ตัวอย่างที่ถูกต้อง

### Minimal Update (ไม่มีไฟล์):
```
PUT /api/products/1
Content-Type: multipart/form-data
Authorization: Bearer token

Body:
title: "ชื่อใหม่"
description: "รายละเอียดใหม่"
```

### Update with Images:
```
PUT /api/products/1
Content-Type: multipart/form-data
Authorization: Bearer token

Body:
title: "ชื่อใหม่"
new_images[]: [ไฟล์รูปภาพ]
remove_image_ids[]: "1,2"
```

## 🚨 Error Messages ใหม่

หลังจากแก้ไขแล้ว คุณจะได้ error messages ที่ชัดเจนขึ้น:

- `Content-Type must be multipart/form-data`
- `Invalid form data format. Please check your request structure.`
- `File is too large. Max 5MB allowed.`
- `Only image files are allowed!` 