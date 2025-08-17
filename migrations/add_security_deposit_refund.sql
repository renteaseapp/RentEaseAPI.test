-- Migration: Add security deposit refund amount column
-- Description: เพิ่มคอลัมน์สำหรับเก็บจำนวนเงินประกันที่จะคืนให้ผู้เช่า (หลังจากหักค่าปรับล่าช้า)

ALTER TABLE rentals 
ADD COLUMN security_deposit_refund_amount DECIMAL(12, 2) NULL;

COMMENT ON COLUMN rentals.security_deposit_refund_amount IS 'จำนวนเงินประกันที่จะคืนให้ผู้เช่า (หลังจากหักค่าปรับล่าช้าแล้ว)';

-- อัปเดต comment ของตาราง rentals
COMMENT ON TABLE rentals IS 'ตารางข้อมูลการเช่าสินค้า (เพิ่ม security_deposit_refund_amount สำหรับการคืนเงินประกัน)'; 