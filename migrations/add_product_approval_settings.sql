-- Migration: Add product approval system settings
-- Description: เพิ่ม system settings ที่เกี่ยวข้องกับการอนุมัติสินค้า

-- Product Approval Settings
INSERT INTO system_settings (setting_key, setting_value, description, data_type, is_publicly_readable, validation_rules, created_at, updated_at)
VALUES 
    (
        'auto_approve_products',
        'true',
        'อนุมัติสินค้าใหม่อัตโนมัติ (true/false)',
        'boolean',
        false,
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'max_images_per_product',
        '10',
        'จำนวนรูปภาพสูงสุดต่อสินค้า',
        'integer',
        false,
        'min:1,max:20',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'max_file_size_mb',
        '10',
        'ขนาดไฟล์สูงสุดสำหรับอัปโหลด (MB)',
        'integer',
        false,
        'min:1,max:50',
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

COMMENT ON TABLE system_settings IS 'ตารางการตั้งค่าต่างๆ ของระบบ (เพิ่มการตั้งค่าการอนุมัติสินค้า)'; 