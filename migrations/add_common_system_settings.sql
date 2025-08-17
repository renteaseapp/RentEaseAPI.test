-- Migration: Add fee-related system settings
-- Description: เพิ่ม system settings ที่เกี่ยวข้องกับค่าธรรมเนียมต่างๆ ในตาราง rentals

-- Fee Settings (เฉพาะที่เกี่ยวข้องกับ fields ในตาราง rentals)
INSERT INTO system_settings (setting_key, setting_value, description, data_type, is_publicly_readable, validation_rules, created_at, updated_at)
VALUES 
    (
        'platform_fee_percentage',
        '0',
        'เปอร์เซ็นต์ค่าธรรมเนียมแพลตฟอร์ม (สำหรับผู้เช่า - platform_fee_renter)',
        'integer',
        false,
        'min:0,max:50',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'platform_fee_owner_percentage',
        '0',
        'เปอร์เซ็นต์ค่าธรรมเนียมแพลตฟอร์ม (สำหรับเจ้าของสินค้า - platform_fee_owner)',
        'integer',
        false,
        'min:0,max:50',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'late_fee_per_day',
        '100',
        'ค่าปรับล่าช้าต่อวัน (บาท - late_fee_calculated)',
        'integer',
        false,
        'min:0',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'delivery_fee_base',
        '50',
        'ค่าส่งพื้นฐาน (บาท - delivery_fee)',
        'integer',
        false,
        'min:0',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    data_type = EXCLUDED.data_type,
    is_publicly_readable = EXCLUDED.is_publicly_readable,
    validation_rules = EXCLUDED.validation_rules,
    updated_at = CURRENT_TIMESTAMP;

COMMENT ON TABLE system_settings IS 'ตารางการตั้งค่าต่างๆ ของระบบ (เพิ่มการตั้งค่าค่าธรรมเนียมที่เกี่ยวข้องกับตาราง rentals)'; 