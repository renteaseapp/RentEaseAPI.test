# 📦 Quantity Management System

ระบบจัดการจำนวนสินค้าและสถานะความพร้อมใน RentEase

## 🏗️ Architecture Overview

### Database Schema
```sql
-- ตาราง products
quantity INT DEFAULT 1,                    -- จำนวนสินค้าทั้งหมด
quantity_available INT DEFAULT 1,          -- จำนวนที่พร้อมให้เช่า
availability_status ENUM DEFAULT 'draft'   -- สถานะสินค้า
```

### Status Flow
```
available → rented_out (เมื่อ quantity_available = 0)
rented_out → available (เมื่อ quantity_available > 0)
```

## 🔄 Core Functions

### 1. updateQuantityAvailable(productId, quantityChange)
อัปเดตจำนวนสินค้าและจัดการ availability_status อัตโนมัติ

```javascript
// ลดจำนวนเมื่อมีการเช่า
await ProductModel.updateQuantityAvailable(productId, -1);

// เพิ่มจำนวนเมื่อคืนสินค้า
await ProductModel.updateQuantityAvailable(productId, +1);
```

### 2. checkAndReserveQuantity(productId, requestedQuantity)
ตรวจสอบและจอง quantity พร้อม Race Condition Protection

```javascript
const result = await ProductModel.checkAndReserveQuantity(productId, 1);
if (result.success) {
    // ดำเนินการเช่าต่อ
}
```

### 3. releaseReservedQuantity(productId, quantity, reason)
คืน quantity เมื่อยกเลิกหรือเสร็จสิ้นการเช่า

```javascript
await ProductModel.releaseReservedQuantity(productId, 1, 'rental_cancelled');
```

### 4. syncProductQuantities(productId?)
ซิงค์ quantity กับข้อมูลการเช่าจริง

```javascript
// ซิงค์สินค้าทั้งหมด
await ProductModel.syncProductQuantities();

// ซิงค์สินค้าเฉพาะ
await ProductModel.syncProductQuantities(123);
```

## 🛡️ Race Condition Protection

### Problem
หลายคนจองสินค้าชิ้นเดียวกันพร้อมกัน

### Solution
```javascript
// ✅ ใช้ checkAndReserveQuantity แทน
const reservation = await ProductModel.checkAndReserveQuantity(productId, 1);

// ❌ อย่าใช้แบบนี้
if (product.quantity_available > 0) {
    // Race condition เกิดขึ้นได้ตรงนี้
    await createRental();
}
```

## 🔄 Rollback Mechanism

### Automatic Rollback
```javascript
// ใน rental.service.js
try {
    const rental = await createRental(data);
    // ถ้าสำเร็จ quantity จะถูกจองไว้
} catch (error) {
    // ถ้าล้มเหลว quantity จะถูกคืนอัตโนมัติ
    await ProductModel.releaseReservedQuantity(productId, 1, 'error_rollback');
    throw error;
}
```

### Manual Rollback
```javascript
// เมื่อยกเลิกการเช่า
await ProductModel.releaseReservedQuantity(productId, 1, 'rental_cancelled');

// เมื่อคืนสินค้า
await ProductModel.releaseReservedQuantity(productId, 1, 'rental_completed');
```

## 🎯 Business Logic

### การจองสินค้า (Rental Creation)
1. ตรวจสอบ `availability_status = 'available'`
2. ตรวจสอบ `quantity_available > 0`
3. จอง quantity ไว้ (`quantity_available -= 1`)
4. ถ้า `quantity_available = 0` → เปลี่ยนเป็น `rented_out`

### การยกเลิกการเช่า (Rental Cancellation)
1. คืน quantity (`quantity_available += 1`)
2. ถ้า `quantity_available > 0` และ status เป็น `rented_out` → เปลี่ยนเป็น `available`

### การคืนสินค้า (Rental Completion)
1. คืน quantity (`quantity_available += 1`)
2. อัปเดต availability_status ตาม logic

## 🔧 Maintenance Tools

### Command Line Scripts
```bash
# ซิงค์ quantity ทั้งหมด
npm run sync-quantities

# ซิงค์เฉพาะสินค้า ID 123
npm run sync-quantities -- --product-id=123

# Dry run (ไม่เปลี่ยนแปลงข้อมูล)
npm run sync-quantities:dry-run
```

### API Endpoints
```http
# ซิงค์ quantity ทั้งหมด (Admin only)
POST /api/products/sync-quantities

# ซิงค์สินค้าเฉพาะ
POST /api/products/:productId/sync-quantity
```

## 🚨 Error Handling

### Common Errors
1. **Product not found** - สินค้าไม่มีในระบบ
2. **Out of stock** - `quantity_available = 0`
3. **Product unavailable** - `availability_status != 'available'`
4. **Race condition** - หลายคนจองพร้อมกัน

### Error Recovery
```javascript
try {
    await ProductModel.checkAndReserveQuantity(productId, 1);
} catch (error) {
    if (error.message.includes('out of stock')) {
        // แจ้งผู้ใช้ว่าสินค้าหมด
    } else if (error.message.includes('not available')) {
        // แจ้งผู้ใช้ว่าสินค้าไม่พร้อม
    }
    throw error;
}
```

## 📊 Monitoring & Logging

### Quantity Change Logs
```javascript
// ทุกการเปลี่ยนแปลง quantity จะถูก log
console.log(`Product ${productId} quantity updated: ${oldQty} → ${newQty}, status: ${oldStatus} → ${newStatus}`);
```

### Health Checks
```javascript
// ตรวจสอบความถูกต้องของ quantity
const healthCheck = await ProductModel.syncProductQuantities();
if (healthCheck.synced_products > 0) {
    console.warn('Found quantity discrepancies:', healthCheck.details);
}
```

## 🔮 Future Enhancements

1. **Redis Integration** - ใช้ Redis สำหรับ distributed locking
2. **Quantity History** - บันทึกประวัติการเปลี่ยนแปลง quantity
3. **Real-time Notifications** - แจ้งเตือนเมื่อสินค้าหมด/กลับมามี
4. **Batch Operations** - จัดการ quantity หลายสินค้าพร้อมกัน
5. **Analytics** - วิเคราะห์ pattern การเช่าและ availability

## 📝 Best Practices

1. **Always use checkAndReserveQuantity** แทนการตรวจสอบ quantity แยก
2. **Handle rollback** ในทุก error case
3. **Log quantity changes** เพื่อ debugging
4. **Run sync regularly** เพื่อรักษาความถูกต้องของข้อมูล
5. **Monitor availability status** เพื่อ business insights