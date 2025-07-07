# แก้ไขปัญหา "Failed to update product record"

## 🔍 สาเหตุของปัญหา

ข้อผิดพลาดนี้เกิดจากปัญหาการอัปเดตข้อมูลในฐานข้อมูล โดยอาจมีสาเหตุจาก:

1. **ข้อมูลไม่ถูกต้อง** - ข้อมูลที่ส่งมาไม่ตรงกับ schema
2. **Product ไม่พบ** - รหัสสินค้าไม่ถูกต้อง
3. **Ownership ไม่ตรง** - ไม่ใช่เจ้าของสินค้า
4. **Database Error** - ปัญหาจากฐานข้อมูล

## 🛠️ วิธีแก้ไข

### 1. ตรวจสอบ Logs

Server จะแสดง logs ใหม่:
```
Update Product Request:
Product ID/Slug: 1
Owner ID: 123
Request Body: { title: "ชื่อใหม่" }
Final product data to update: { title: "ชื่อใหม่" }
Product data to update: { title: "ชื่อใหม่" }
Existing product ID: 1
Owner ID: 123
```

### 2. ตรวจสอบข้อมูลที่ส่ง

#### ข้อมูลที่ถูกต้อง:
```javascript
{
  title: "ชื่อสินค้าใหม่",
  description: "รายละเอียดใหม่",
  rental_price_per_day: "1800.00"
}
```

#### ข้อมูลที่ผิด:
```javascript
{
  title: "", // ว่างเปล่า
  rental_price_per_day: "invalid", // ไม่ใช่ตัวเลข
  category_id: "not_a_number" // ไม่ใช่ตัวเลข
}
```

### 3. ตรวจสอบ Product ID

- ตรวจสอบว่า product ID ถูกต้อง
- ตรวจสอบว่าเป็นเจ้าของสินค้า
- ตรวจสอบว่า product ยังมีอยู่ในฐานข้อมูล

### 4. ทดสอบแบบง่าย

```bash
node test-minimal-put.js
```

## 🧪 การทดสอบ

### Test 1: Minimal Update
```javascript
const form = new FormData();
form.append('title', 'ชื่อใหม่');
```

### Test 2: With Numbers
```javascript
const form = new FormData();
form.append('title', 'ชื่อใหม่');
form.append('rental_price_per_day', '1800.00');
form.append('quantity', '3');
```

### Test 3: With JSON
```javascript
const form = new FormData();
form.append('title', 'ชื่อใหม่');
form.append('specifications', JSON.stringify({
  brand: "Canon",
  model: "EOS R5"
}));
```

## 🔧 การ Debug

### 1. ตรวจสอบ Database Schema

ตรวจสอบว่าข้อมูลตรงกับ schema:
```sql
-- ตรวจสอบ products table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products';
```

### 2. ตรวจสอบ Product Exists

```sql
-- ตรวจสอบว่าสินค้ามีอยู่จริง
SELECT id, title, owner_id 
FROM products 
WHERE id = 1;
```

### 3. ตรวจสอบ Ownership

```sql
-- ตรวจสอบว่าเป็นเจ้าของสินค้า
SELECT id, title, owner_id 
FROM products 
WHERE id = 1 AND owner_id = 123;
```

## ⚠️ สิ่งที่ต้องระวัง

### 1. Data Types
- `rental_price_per_day` - ต้องเป็นตัวเลข
- `quantity` - ต้องเป็นจำนวนเต็ม
- `category_id` - ต้องเป็นจำนวนเต็ม
- `province_id` - ต้องเป็นจำนวนเต็ม

### 2. Required Fields
- ตรวจสอบว่า field ที่จำเป็นมีค่าหรือไม่
- ตรวจสอบว่า field ไม่เป็น null หรือ undefined

### 3. JSON Fields
- `specifications` - ต้องเป็น JSON ที่ถูกต้อง
- ใช้ `JSON.stringify()` ก่อนส่ง

## 📝 ตัวอย่าง Postman ที่ถูกต้อง

### Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

### Body (form-data):
```
Key: title
Value: กล้อง DSLR Canon EOS R5 (อัปเดต)
Type: Text

Key: rental_price_per_day
Value: 1800.00
Type: Text

Key: quantity
Value: 3
Type: Text
```

## 🚨 Error Messages และวิธีแก้ไข

### "Failed to update product record: [error message]"
- **สาเหตุ:** ข้อมูลไม่ถูกต้องหรือ database error
- **วิธีแก้:** ตรวจสอบ logs และข้อมูลที่ส่ง

### "Product not found or does not belong to the owner"
- **สาเหตุ:** Product ID ผิดหรือไม่ใช่เจ้าของ
- **วิธีแก้:** ตรวจสอบ Product ID และ JWT token

### "No product data to update"
- **สาเหตุ:** ไม่มีข้อมูลที่ต้องการอัปเดต
- **วิธีแก้:** ตรวจสอบข้อมูลที่ส่งมา

## 🔍 การตรวจสอบเพิ่มเติม

### 1. ตรวจสอบ JWT Token
- ตรวจสอบว่า token ถูกต้อง
- ตรวจสอบว่า token ไม่หมดอายุ
- ตรวจสอบว่า user ID ตรงกับ owner_id

### 2. ตรวจสอบ Database Connection
- ตรวจสอบการเชื่อมต่อ Supabase
- ตรวจสอบ permissions

### 3. ตรวจสอบ RLS Policies
- ตรวจสอบ Row Level Security policies
- ตรวจสอบว่า user มีสิทธิ์อัปเดต 