-- Migration: Add buffer time system settings
-- Description: เพิ่ม system settings สำหรับ buffer time ในการส่งและรับคืนสินค้า

INSERT INTO system_settings (setting_key, setting_value, description, data_type, is_publicly_readable, validation_rules, created_at, updated_at)
VALUES 
    (
        'delivery_buffer_days',
        '1',
        'จำนวนวันที่ต้องเผื่อสำหรับการจัดส่งสินค้า (วัน)',
        'integer',
        false,
        'min:0,max:7',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'return_buffer_days',
        '1',
        'จำนวนวันที่ต้องเผื่อสำหรับการรับคืนสินค้า (วัน)',
        'integer',
        false,
        'min:0,max:7',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'enable_buffer_time',
        'true',
        'เปิดใช้งาน buffer time สำหรับการจองสินค้า (true/false)',
        'boolean',
        false,
        NULL,
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

COMMENT ON TABLE system_settings IS 'ตารางการตั้งค่าต่างๆ ของระบบ (เพิ่ม buffer time settings สำหรับการจองสินค้า)';