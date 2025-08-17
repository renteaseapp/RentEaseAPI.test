-- Migration: Add late fee system setting
-- Description: เพิ่ม system setting สำหรับค่าปรับล่าช้าต่อวัน

INSERT INTO system_settings (setting_key, setting_value, description, data_type, is_publicly_readable, validation_rules, created_at, updated_at)
VALUES (
    'late_fee_per_day',
    '100',
    'ค่าปรับล่าช้าต่อวัน (บาท)',
    'integer',
    false,
    'min:0',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- เพิ่ม comment สำหรับ setting นี้
COMMENT ON TABLE system_settings IS 'ตารางการตั้งค่าต่างๆ ของระบบ (เพิ่ม late_fee_per_day สำหรับค่าปรับล่าช้า)'; 