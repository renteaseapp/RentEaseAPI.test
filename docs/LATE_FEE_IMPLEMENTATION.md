# Late Fee Implementation

## ภาพรวม
ระบบค่าปรับล่าช้า (Late Fee) ถูก implement เพื่อจัดการกรณีที่ผู้เช่าคืนสินค้าล่าช้ากว่ากำหนด

## ฟีเจอร์ที่เพิ่ม

### 1. การคำนวณค่าปรับล่าช้า
- **ฟังก์ชัน**: `calculateLateFee(rental, actualReturnTime)` ใน `rental.service.js`
- **การคำนวณ**: 
  - เปรียบเทียบ `end_date` กับ `actual_return_time`
  - คำนวณจำนวนวันที่ล่าช้า
  - คูณด้วยค่าปรับต่อวันจาก system setting

### 2. System Setting
- **Key**: `late_fee_per_day`
- **Default Value**: 100 บาท
- **Type**: integer
- **Validation**: min:0

### 3. การอัปเดตสถานะอัตโนมัติ
- ฟังก์ชัน `notifyDueAndOverdueRentals()` จะอัปเดตสถานะเป็น `late_return` เมื่อเลยกำหนดคืน
- ส่งการแจ้งเตือนไปยังผู้เช่า

### 4. การบันทึกค่าปรับ
- ค่าปรับจะถูกบันทึกในฟิลด์ `late_fee_calculated` เมื่อมีการ process return
- สร้าง payment transaction ประเภท `late_fee_payment` สำหรับ owner

### 5. การแสดงผลใน Frontend
- **RenterRentalDetailPage**: แสดงค่าปรับล่าช้าในส่วนรายละเอียดค่าใช้จ่าย
- **OwnerRentalDetailPage**: แสดงค่าปรับล่าช้าและรวมในการคำนวณ payout

## การใช้งาน

### สำหรับ Admin
1. ตั้งค่า `late_fee_per_day` ใน system settings
2. ระบบจะคำนวณค่าปรับอัตโนมัติเมื่อมีการคืนสินค้า

### สำหรับ Owner
1. ดูค่าปรับล่าช้าในหน้า rental detail
2. ได้รับ payment transaction สำหรับค่าปรับล่าช้า

### สำหรับ Renter
1. ดูค่าปรับล่าช้าในหน้า rental detail
2. รับการแจ้งเตือนเมื่อเลยกำหนดคืน

## Database Schema

### ตาราง rentals
```sql
late_fee_calculated DECIMAL(12, 2) NULL
```

### ตาราง payment_transactions
```sql
transaction_type ENUM('late_fee_payment', ...)
```

## API Endpoints

### การคำนวณค่าปรับ
- เรียกใช้ภายใน `processReturn` endpoint
- ไม่มี endpoint แยกต่างหาก

### การดูค่าปรับ
- ผ่าน `getRentalDetails` endpoint
- ค่าปรับจะรวมอยู่ใน response

## การตั้งค่า

### Migration
```sql
-- รัน migration เพื่อเพิ่ม system setting
-- backend/migrations/add_late_fee_setting.sql
```

### Environment Variables
ไม่จำเป็นต้องตั้งค่าเพิ่มเติม

## การทดสอบ

### Test Cases
1. คืนสินค้าก่อนกำหนด - ไม่มีค่าปรับ
2. คืนสินค้าหลังกำหนด 1 วัน - ค่าปรับ = 100 บาท
3. คืนสินค้าหลังกำหนด 5 วัน - ค่าปรับ = 500 บาท
4. เปลี่ยนค่า late_fee_per_day เป็น 200 - ค่าปรับ = 1000 บาท

### Manual Testing
1. สร้างการเช่าที่มี end_date เป็นวันนี้
2. รัน `notifyDueAndOverdueRentals()` เพื่ออัปเดตสถานะ
3. Process return ด้วย actual_return_time เป็นวันพรุ่งนี้
4. ตรวจสอบค่าปรับในฐานข้อมูลและ frontend

## หมายเหตุ
- ค่าปรับจะถูกคำนวณเมื่อมีการ process return เท่านั้น
- ไม่มีการคำนวณค่าปรับแบบ real-time
- ค่าปรับจะรวมในการคำนวณ payout ของ owner 