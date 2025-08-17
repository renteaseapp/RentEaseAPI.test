-- ========================================
-- INSERT หมวดหมู่สินค้า
-- ========================================

-- หมวดหมู่หลัก
INSERT INTO categories (name, name_en, slug, description, sort_order, is_featured, is_active) VALUES
('อิเล็กทรอนิกส์', 'Electronics', 'electronics', 'อุปกรณ์อิเล็กทรอนิกส์ต่างๆ เช่น โทรศัพท์ คอมพิวเตอร์ กล้อง', 1, true, true),
('กีฬา & กิจกรรมกลางแจ้ง', 'Sports & Outdoor', 'sports-outdoor', 'อุปกรณ์กีฬา อุปกรณ์เดินป่า อุปกรณ์ตั้งแคมป์', 2, true, true),
('งานแต่งงาน & งานเลี้ยง', 'Wedding & Events', 'wedding-events', 'ชุดแต่งงาน อุปกรณ์จัดงานเลี้ยง เครื่องเสียง', 3, true, true),
('เครื่องมือ & อุปกรณ์', 'Tools & Equipment', 'tools-equipment', 'เครื่องมือช่าง อุปกรณ์ก่อสร้าง เครื่องมือเกษตร', 4, true, true),
('แฟชั่น & เครื่องประดับ', 'Fashion & Accessories', 'fashion-accessories', 'เสื้อผ้า รองเท้า กระเป๋า เครื่องประดับ', 5, true, true),
('บ้าน & สวน', 'Home & Garden', 'home-garden', 'เฟอร์นิเจอร์ อุปกรณ์ตกแต่งบ้าน อุปกรณ์ทำสวน', 6, true, true),
('รถยนต์ & ยานพาหนะ', 'Automotive & Vehicles', 'automotive-vehicles', 'อุปกรณ์รถยนต์ จักรยาน มอเตอร์ไซค์', 7, true, true),
('ดนตรี & ศิลปะ', 'Music & Arts', 'music-arts', 'เครื่องดนตรี อุปกรณ์ศิลปะ อุปกรณ์ถ่ายภาพ', 8, true, true),
('เด็ก & ของเล่น', 'Kids & Toys', 'kids-toys', 'ของเล่นเด็ก อุปกรณ์เด็ก อุปกรณ์การศึกษา', 9, true, true),
('สุขภาพ & ความงาม', 'Health & Beauty', 'health-beauty', 'อุปกรณ์ออกกำลังกาย เครื่องสำอาง อุปกรณ์สปา', 10, true, true);

-- หมวดหมู่ย่อย - อิเล็กทรอนิกส์
INSERT INTO categories (name, name_en, slug, description, parent_id, sort_order, is_active) VALUES
('โทรศัพท์ & แท็บเล็ต', 'Phones & Tablets', 'phones-tablets', 'โทรศัพท์มือถือ แท็บเล็ต อุปกรณ์เสริม', 1, 1, true),
('คอมพิวเตอร์ & แล็ปท็อป', 'Computers & Laptops', 'computers-laptops', 'คอมพิวเตอร์ แล็ปท็อป อุปกรณ์ต่อพ่วง', 1, 2, true),
('กล้อง & อุปกรณ์ถ่ายภาพ', 'Cameras & Photography', 'cameras-photography', 'กล้องถ่ายรูป กล้องวิดีโอ อุปกรณ์ถ่ายภาพ', 1, 3, true),
('เครื่องเสียง & หูฟัง', 'Audio & Headphones', 'audio-headphones', 'ลำโพง หูฟัง เครื่องเสียง', 1, 4, true);

-- หมวดหมู่ย่อย - กีฬา & กิจกรรมกลางแจ้ง
INSERT INTO categories (name, name_en, slug, description, parent_id, sort_order, is_active) VALUES
('อุปกรณ์ฟิตเนส', 'Fitness Equipment', 'fitness-equipment', 'เครื่องออกกำลังกาย อุปกรณ์ฟิตเนส', 2, 1, true),
('อุปกรณ์เดินป่า & ตั้งแคมป์', 'Hiking & Camping', 'hiking-camping', 'เต็นท์ กระเป๋าเป้ อุปกรณ์เดินป่า', 2, 2, true),
('อุปกรณ์กีฬาทางน้ำ', 'Water Sports', 'water-sports', 'อุปกรณ์ดำน้ำ เรือ SUP อุปกรณ์กีฬาทางน้ำ', 2, 3, true),
('อุปกรณ์กีฬาประเภททีม', 'Team Sports', 'team-sports', 'ลูกฟุตบอล ลูกบาสเก็ตบอล อุปกรณ์กีฬาประเภททีม', 2, 4, true);

-- หมวดหมู่ย่อย - งานแต่งงาน & งานเลี้ยง
INSERT INTO categories (name, name_en, slug, description, parent_id, sort_order, is_active) VALUES
('ชุดแต่งงาน', 'Wedding Dresses', 'wedding-dresses', 'ชุดแต่งงาน ชุดเจ้าสาว ชุดเจ้าบ่าว', 3, 1, true),
('เครื่องเสียง & ระบบแสง', 'Audio & Lighting', 'audio-lighting', 'เครื่องเสียง ระบบแสง อุปกรณ์จัดงาน', 3, 2, true),
('อุปกรณ์ตกแต่งงาน', 'Event Decorations', 'event-decorations', 'ดอกไม้ประดิษฐ์ ผ้าม่าน อุปกรณ์ตกแต่ง', 3, 3, true),
('โต๊ะเก้าอี้ & เฟอร์นิเจอร์', 'Tables & Furniture', 'tables-furniture', 'โต๊ะเก้าอี้ เฟอร์นิเจอร์สำหรับงานเลี้ยง', 3, 4, true);

-- หมวดหมู่ย่อย - เครื่องมือ & อุปกรณ์
INSERT INTO categories (name, name_en, slug, description, parent_id, sort_order, is_active) VALUES
('เครื่องมือช่าง', 'Hand Tools', 'hand-tools', 'ไขควง ค้อน เลื่อย เครื่องมือช่างทั่วไป', 4, 1, true),
('เครื่องมือไฟฟ้า', 'Power Tools', 'power-tools', 'สว่านไฟฟ้า เลื่อยไฟฟ้า เครื่องมือไฟฟ้า', 4, 2, true),
('อุปกรณ์ก่อสร้าง', 'Construction Equipment', 'construction-equipment', 'เครื่องจักรก่อสร้าง อุปกรณ์ความปลอดภัย', 4, 3, true),
('เครื่องมือเกษตร', 'Agricultural Tools', 'agricultural-tools', 'เครื่องมือทำสวน เครื่องมือเกษตร', 4, 4, true);

-- ========================================
-- INSERT จังหวัด 77 จังหวัดของไทย
-- ========================================

INSERT INTO provinces (name_th, name_en) VALUES
-- ภาคเหนือ (17 จังหวัด)
('เชียงใหม่', 'Chiang Mai'),
('เชียงราย', 'Chiang Rai'),
('น่าน', 'Nan'),
('พะเยา', 'Phayao'),
('แพร่', 'Phrae'),
('แม่ฮ่องสอน', 'Mae Hong Son'),
('ลำปาง', 'Lampang'),
('ลำพูน', 'Lamphun'),
('อุตรดิตถ์', 'Uttaradit'),
('ตาก', 'Tak'),
('สุโขทัย', 'Sukhothai'),
('พิษณุโลก', 'Phitsanulok'),
('เพชรบูรณ์', 'Phetchabun'),
('พิจิตร', 'Phichit'),
('นครสวรรค์', 'Nakhon Sawan'),
('อุทัยธานี', 'Uthai Thani'),
('กำแพงเพชร', 'Kamphaeng Phet'),

-- ภาคกลาง (22 จังหวัด)
('กรุงเทพมหานคร', 'Bangkok'),
('สมุทรปราการ', 'Samut Prakan'),
('นนทบุรี', 'Nonthaburi'),
('ปทุมธานี', 'Pathum Thani'),
('พระนครศรีอยุธยา', 'Phra Nakhon Si Ayutthaya'),
('อ่างทอง', 'Ang Thong'),
('ลพบุรี', 'Lop Buri'),
('สิงห์บุรี', 'Sing Buri'),
('ชัยนาท', 'Chai Nat'),
('สระบุรี', 'Saraburi'),
('นครนายก', 'Nakhon Nayok'),
('สมุทรสาคร', 'Samut Sakhon'),
('นครปฐม', 'Nakhon Pathom'),
('สุพรรณบุรี', 'Suphan Buri'),
('กาญจนบุรี', 'Kanchanaburi'),
('ราชบุรี', 'Ratchaburi'),
('เพชรบุรี', 'Phetchaburi'),
('ประจวบคีรีขันธ์', 'Prachuap Khiri Khan'),
('สมุทรสงคราม', 'Samut Songkhram'),
('นครนายก', 'Nakhon Nayok'),
('สมุทรสาคร', 'Samut Sakhon'),
('นครปฐม', 'Nakhon Pathom'),

-- ภาคตะวันออกเฉียงเหนือ (20 จังหวัด)
('นครราชสีมา', 'Nakhon Ratchasima'),
('บุรีรัมย์', 'Buri Ram'),
('สุรินทร์', 'Surin'),
('ศรีสะเกษ', 'Si Sa Ket'),
('อุบลราชธานี', 'Ubon Ratchathani'),
('ยโสธร', 'Yasothon'),
('ชัยภูมิ', 'Chaiyaphum'),
('อำนาจเจริญ', 'Amnat Charoen'),
('หนองบัวลำภู', 'Nong Bua Lam Phu'),
('ขอนแก่น', 'Khon Kaen'),
('อุดรธานี', 'Udon Thani'),
('เลย', 'Loei'),
('หนองคาย', 'Nong Khai'),
('มหาสารคาม', 'Maha Sarakham'),
('ร้อยเอ็ด', 'Roi Et'),
('กาฬสินธุ์', 'Kalasin'),
('สกลนคร', 'Sakon Nakhon'),
('นครพนม', 'Nakhon Phanom'),
('มุกดาหาร', 'Mukdahan'),
('บึงกาฬ', 'Bueng Kan'),

-- ภาคตะวันออก (7 จังหวัด)
('ชลบุรี', 'Chon Buri'),
('ระยอง', 'Rayong'),
('จันทบุรี', 'Chanthaburi'),
('ตราด', 'Trat'),
('ฉะเชิงเทรา', 'Chachoengsao'),
('ปราจีนบุรี', 'Prachin Buri'),
('สระแก้ว', 'Sa Kaeo'),

-- ภาคใต้ (14 จังหวัด)
('นครศรีธรรมราช', 'Nakhon Si Thammarat'),
('กระบี่', 'Krabi'),
('พังงา', 'Phang Nga'),
('ภูเก็ต', 'Phuket'),
('สุราษฎร์ธานี', 'Surat Thani'),
('ระนอง', 'Ranong'),
('ชุมพร', 'Chumphon'),
('สงขลา', 'Songkhla'),
('สตูล', 'Satun'),
('ตรัง', 'Trang'),
('พัทลุง', 'Phatthalung'),
('ปัตตานี', 'Pattani'),
('ยะลา', 'Yala'),
('นราธิวาส', 'Narathiwat');

-- ========================================
-- INSERT Admin User ตัวอย่าง
-- ========================================

-- สร้าง User สำหรับ Admin
INSERT INTO users (
    username, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    phone_number,
    is_active,
    created_at
) VALUES (
    'admin',
    'admin@rentease.com',
    '$2a$12$wvOw0nAUfEaLrLadDv2pk.03BptB2FxKFQrGrFWfZ3yuANQSeg6Z2',
    'Admin',
    'User',
    '0812345678',
    true,
    CURRENT_TIMESTAMP
);

-- สร้าง Admin User
INSERT INTO admin_users (
    user_id,
    permissions,
    created_at
) VALUES (
    (SELECT id FROM users WHERE email = 'admin@rentease.com'),
    '{"all": true}',
    CURRENT_TIMESTAMP
);

-- ========================================
-- INSERT System Settings ตัวอย่าง
-- ========================================

INSERT INTO system_settings (setting_key, setting_value, description, data_type, is_publicly_readable) VALUES
('platform_fee_percentage', '0.0', 'อัตราค่าธรรมเนียมแพลตฟอร์มสำหรับผู้เช่า (0% - ไม่มีค่าธรรมเนียม)', 'float', true),
('platform_fee_owner_percentage', '0.0', 'อัตราค่าธรรมเนียมแพลตฟอร์มสำหรับเจ้าของสินค้า (0% - ไม่มีค่าธรรมเนียม)', 'float', true),
('delivery_fee_base', '0.0', 'ค่าส่งพื้นฐาน (0 บาท - ไม่มีค่าส่ง)', 'float', true),
('platform_fee_rate', '0.0', 'อัตราค่าธรรมเนียมแพลตฟอร์ม (0% - ไม่มีค่าธรรมเนียม)', 'float', false),
('max_rental_days', '30', 'จำนวนวันเช่าสูงสุด', 'integer', true),
('min_rental_days', '1', 'จำนวนวันเช่าขั้นต่ำ', 'integer', true),
('auto_approve_products', 'false', 'อนุมัติสินค้าอัตโนมัติ', 'boolean', false);