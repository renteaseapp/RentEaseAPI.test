-- Seed: 2 users, 10 products (5 per user), rentals, reviews, and related tables
-- Notes: ไม่แตะข้อมูลเดิม ใช้ค่าอ้างอิงจาก categories/provinces ที่มีอยู่แล้วด้วย slug/name_th
BEGIN;

-- Users
WITH u1 AS (
  INSERT INTO public.users (username,email,password_hash,first_name,last_name,phone_number,province_id,is_active,created_at)
  VALUES ('owner1','owner1@example.com','$2a$12$wvOw0nAUfEaLrLadDv2pk.03BptB2FxKFQrGrFWfZ3yuANQSeg6Z2','สมชาย','เจ้าของที่หนึ่ง','0800000001',(SELECT id FROM public.provinces WHERE name_th='กรุงเทพมหานคร'),true,CURRENT_TIMESTAMP)
  RETURNING id
), u2 AS (
  INSERT INTO public.users (username,email,password_hash,first_name,last_name,phone_number,province_id,is_active,created_at)
  VALUES ('owner2','owner2@example.com','$2a$12$wvOw0nAUfEaLrLadDv2pk.03BptB2FxKFQrGrFWfZ3yuANQSeg6Z2','สุดา','เจ้าของที่สอง','0800000002',(SELECT id FROM public.provinces WHERE name_th='เชียงใหม่'),true,CURRENT_TIMESTAMP)
  RETURNING id
)
INSERT INTO public.user_addresses (user_id,address_type,recipient_name,phone_number,address_line1,district,province_id,postal_code,is_default)
SELECT id,'shipping'::user_address_type_enum,'สมชาย','0800000001','123 ถนนสุขุมวิท','คลองเตย',(SELECT id FROM public.provinces WHERE name_th='กรุงเทพมหานคร'),'10110',true FROM u1
UNION ALL
SELECT id,'shipping'::user_address_type_enum,'สุดา','0800000002','456 ถนนนิมมานเหมินท์','สุเทพ',(SELECT id FROM public.provinces WHERE name_th='เชียงใหม่'),'50200',true FROM u2;

-- Payout methods (owners)
INSERT INTO public.payout_methods (owner_id,method_type,account_name,account_number,bank_name,is_primary)
VALUES
((SELECT id FROM public.users WHERE email='owner1@example.com'),'bank_account'::payout_method_type_enum,'สมชาย เจ้าของที่หนึ่ง','123-4-56789-0','SCB',true),
((SELECT id FROM public.users WHERE email='owner2@example.com'),'bank_account'::payout_method_type_enum,'สุดา เจ้าของที่สอง','987-6-54321-0','KBANK',true);

-- Products for owner1 (5 items)
INSERT INTO public.products (owner_id,category_id,province_id,title,slug,description,rental_price_per_day,rental_price_per_week,rental_price_per_month,security_deposit,quantity,quantity_available,availability_status,admin_approval_status,published_at)
VALUES
((SELECT id FROM public.users WHERE email='owner1@example.com'),COALESCE((SELECT id FROM public.categories WHERE slug='phones-tablets' AND is_active=true),(SELECT id FROM public.categories WHERE slug='cameras-gear' AND is_active=true),(SELECT id FROM public.categories WHERE is_active=true ORDER BY id LIMIT 1)),(SELECT id FROM public.provinces WHERE name_th='กรุงเทพมหานคร'),'iPhone 13 Pro','owner1-iphone-13-pro','โทรศัพท์เรือธง สภาพดี',1200,7000,25000,3000,2,2,'available'::product_availability_status_enum,'approved'::product_admin_approval_status_enum,CURRENT_TIMESTAMP),
((SELECT id FROM public.users WHERE email='owner1@example.com'),COALESCE((SELECT id FROM public.categories WHERE slug='computers-laptops' AND is_active=true),(SELECT id FROM public.categories WHERE slug='cameras-gear' AND is_active=true),(SELECT id FROM public.categories WHERE is_active=true ORDER BY id LIMIT 1)),(SELECT id FROM public.provinces WHERE name_th='กรุงเทพมหานคร'),'MacBook Air M1','owner1-macbook-air-m1','แล็ปท็อปเบา ทำงานคล่อง',900,5500,18000,4000,3,3,'available'::product_availability_status_enum,'approved'::product_admin_approval_status_enum,CURRENT_TIMESTAMP),
((SELECT id FROM public.users WHERE email='owner1@example.com'),COALESCE((SELECT id FROM public.categories WHERE slug='cameras-gear' AND is_active=true),(SELECT id FROM public.categories WHERE is_active=true ORDER BY id LIMIT 1)),(SELECT id FROM public.provinces WHERE name_th='กรุงเทพมหานคร'),'Canon EOS R','owner1-canon-eos-r','กล้องมิเรอร์เลส พร้อมเลนส์ 50mm',800,4800,15000,3000,1,1,'available'::product_availability_status_enum,'approved'::product_admin_approval_status_enum,CURRENT_TIMESTAMP),
((SELECT id FROM public.users WHERE email='owner1@example.com'),COALESCE((SELECT id FROM public.categories WHERE slug='audio-headphones' AND is_active=true),(SELECT id FROM public.categories WHERE slug='musical-instruments' AND is_active=true),(SELECT id FROM public.categories WHERE is_active=true ORDER BY id LIMIT 1)),(SELECT id FROM public.provinces WHERE name_th='กรุงเทพมหานคร'),'Sony WH-1000XM5','owner1-sony-xm5','หูฟังครอบหู ตัดเสียงดีเยี่ยม',300,1800,6000,1000,5,5,'available'::product_availability_status_enum,'approved'::product_admin_approval_status_enum,CURRENT_TIMESTAMP),
((SELECT id FROM public.users WHERE email='owner1@example.com'),COALESCE((SELECT id FROM public.categories WHERE slug='sports-outdoors' AND is_active=true),(SELECT id FROM public.categories WHERE is_active=true ORDER BY id LIMIT 1)),(SELECT id FROM public.provinces WHERE name_th='กรุงเทพมหานคร'),'ดัมเบลชุด 20kg','owner1-dumbbell-20kg','อุปกรณ์ฟิตเนสสำหรับออกกำลังกาย',200,1200,4000,500,4,4,'available'::product_availability_status_enum,'approved'::product_admin_approval_status_enum,CURRENT_TIMESTAMP);

-- Products for owner2 (5 items)
INSERT INTO public.products (owner_id,category_id,province_id,title,slug,description,rental_price_per_day,rental_price_per_week,rental_price_per_month,security_deposit,quantity,quantity_available,availability_status,admin_approval_status,published_at)
VALUES
((SELECT id FROM public.users WHERE email='owner2@example.com'),COALESCE((SELECT id FROM public.categories WHERE slug='phones-tablets' AND is_active=true),(SELECT id FROM public.categories WHERE slug='cameras-gear' AND is_active=true),(SELECT id FROM public.categories WHERE is_active=true ORDER BY id LIMIT 1)),(SELECT id FROM public.provinces WHERE name_th='เชียงใหม่'),'Samsung Galaxy S22','owner2-galaxy-s22','โทรศัพท์ Android สเปคแรง',900,5200,16000,2500,2,2,'available'::product_availability_status_enum,'approved'::product_admin_approval_status_enum,CURRENT_TIMESTAMP),
((SELECT id FROM public.users WHERE email='owner2@example.com'),COALESCE((SELECT id FROM public.categories WHERE slug='computers-laptops' AND is_active=true),(SELECT id FROM public.categories WHERE slug='cameras-gear' AND is_active=true),(SELECT id FROM public.categories WHERE is_active=true ORDER BY id LIMIT 1)),(SELECT id FROM public.provinces WHERE name_th='เชียงใหม่'),'Lenovo ThinkPad X1','owner2-thinkpad-x1','แล็ปท็อปทำงาน ทนทาน',800,4800,15000,3000,3,3,'available'::product_availability_status_enum,'approved'::product_admin_approval_status_enum,CURRENT_TIMESTAMP),
((SELECT id FROM public.users WHERE email='owner2@example.com'),COALESCE((SELECT id FROM public.categories WHERE slug='cameras-gear' AND is_active=true),(SELECT id FROM public.categories WHERE is_active=true ORDER BY id LIMIT 1)),(SELECT id FROM public.provinces WHERE name_th='เชียงใหม่'),'Sony A7 III','owner2-sony-a7iii','กล้องฟูลเฟรม คุณภาพเยี่ยม',850,5000,17000,3500,2,2,'available'::product_availability_status_enum,'approved'::product_admin_approval_status_enum,CURRENT_TIMESTAMP),
((SELECT id FROM public.users WHERE email='owner2@example.com'),COALESCE((SELECT id FROM public.categories WHERE slug='audio-headphones' AND is_active=true),(SELECT id FROM public.categories WHERE slug='musical-instruments' AND is_active=true),(SELECT id FROM public.categories WHERE is_active=true ORDER BY id LIMIT 1)),(SELECT id FROM public.provinces WHERE name_th='เชียงใหม่'),'Bose QuietComfort 45','owner2-bose-qc45','หูฟังตัดเสียงดี สวมใส่สบาย',280,1600,5500,800,5,5,'available'::product_availability_status_enum,'approved'::product_admin_approval_status_enum,CURRENT_TIMESTAMP),
((SELECT id FROM public.users WHERE email='owner2@example.com'),COALESCE((SELECT id FROM public.categories WHERE slug='sports-outdoors' AND is_active=true),(SELECT id FROM public.categories WHERE is_active=true ORDER BY id LIMIT 1)),(SELECT id FROM public.provinces WHERE name_th='เชียงใหม่'),'เสื่อโยคะพรีเมียม','owner2-yoga-mat-premium','เสื่อโยคะแบบหนา กันลื่น',120,700,2400,300,6,6,'available'::product_availability_status_enum,'approved'::product_admin_approval_status_enum,CURRENT_TIMESTAMP);

-- Product images (primary)
INSERT INTO public.product_images (product_id,image_url,alt_text,is_primary,sort_order)
VALUES
((SELECT id FROM public.products WHERE slug='owner1-iphone-13-pro'),'https://example.com/images/iphone13pro.jpg','iPhone 13 Pro',true,1),
((SELECT id FROM public.products WHERE slug='owner1-macbook-air-m1'),'https://example.com/images/macbookairm1.jpg','MacBook Air M1',true,1),
((SELECT id FROM public.products WHERE slug='owner1-canon-eos-r'),'https://example.com/images/canon-eos-r.jpg','Canon EOS R',true,1),
((SELECT id FROM public.products WHERE slug='owner1-sony-xm5'),'https://example.com/images/sony-xm5.jpg','Sony WH-1000XM5',true,1),
((SELECT id FROM public.products WHERE slug='owner1-dumbbell-20kg'),'https://example.com/images/dumbbell-20kg.jpg','Dumbbell 20kg',true,1),
((SELECT id FROM public.products WHERE slug='owner2-galaxy-s22'),'https://example.com/images/galaxy-s22.jpg','Galaxy S22',true,1),
((SELECT id FROM public.products WHERE slug='owner2-thinkpad-x1'),'https://example.com/images/thinkpad-x1.jpg','ThinkPad X1',true,1),
((SELECT id FROM public.products WHERE slug='owner2-sony-a7iii'),'https://example.com/images/sony-a7iii.jpg','Sony A7 III',true,1),
((SELECT id FROM public.products WHERE slug='owner2-bose-qc45'),'https://example.com/images/bose-qc45.jpg','Bose QC45',true,1),
((SELECT id FROM public.products WHERE slug='owner2-yoga-mat-premium'),'https://example.com/images/yoga-mat-premium.jpg','Yoga Mat Premium',true,1);

-- Rentals
-- r1: owner2 rents owner1's iPhone for 3 days
INSERT INTO public.rentals (renter_id,product_id,owner_id,start_date,end_date,rental_price_per_day_at_booking,security_deposit_at_booking,calculated_subtotal_rental_fee,delivery_fee,platform_fee_renter,platform_fee_owner,total_amount_due,final_amount_paid,pickup_method,return_method,delivery_address_id,rental_status,payment_status,return_condition_status,rental_pricing_type_used)
VALUES (
  (SELECT id FROM public.users WHERE email='owner2@example.com'),
  (SELECT id FROM public.products WHERE slug='owner1-iphone-13-pro'),
  (SELECT owner_id FROM public.products WHERE slug='owner1-iphone-13-pro'),
  (CURRENT_DATE - INTERVAL '10 days')::date, (CURRENT_DATE - INTERVAL '7 days')::date,
  1200, 3000, 3600, 0, 0, 3600, 3600, 3600,
  'self_pickup'::rental_pickup_method_enum,'self_return'::rental_return_method_enum,
  (SELECT id FROM public.user_addresses WHERE user_id=(SELECT id FROM public.users WHERE email='owner2@example.com') AND is_default=true),
  'completed'::rental_status_enum,
  'paid'::rental_payment_status_enum,
  'as_rented'::rental_return_condition_status_enum,
  'daily'::rental_pricing_type_enum
);

-- r2: owner1 rents owner2's ThinkPad for 5 days
INSERT INTO public.rentals (renter_id,product_id,owner_id,start_date,end_date,rental_price_per_day_at_booking,security_deposit_at_booking,calculated_subtotal_rental_fee,delivery_fee,platform_fee_renter,platform_fee_owner,total_amount_due,final_amount_paid,pickup_method,return_method,delivery_address_id,rental_status,payment_status,return_condition_status,rental_pricing_type_used)
VALUES (
  (SELECT id FROM public.users WHERE email='owner1@example.com'),
  (SELECT id FROM public.products WHERE slug='owner2-thinkpad-x1'),
  (SELECT owner_id FROM public.products WHERE slug='owner2-thinkpad-x1'),
  (CURRENT_DATE - INTERVAL '8 days')::date, (CURRENT_DATE - INTERVAL '3 days')::date,
  800, 3000, 4000, 0, 0, 4000, 4000, 4000,
  'self_pickup'::rental_pickup_method_enum,'self_return'::rental_return_method_enum,
  (SELECT id FROM public.user_addresses WHERE user_id=(SELECT id FROM public.users WHERE email='owner1@example.com') AND is_default=true),
  'completed'::rental_status_enum,
  'paid'::rental_payment_status_enum,
  'as_rented'::rental_return_condition_status_enum,
  'daily'::rental_pricing_type_enum
);

-- r3: owner2 rents owner1's Canon EOS R for 2 days (confirmed)
INSERT INTO public.rentals (renter_id,product_id,owner_id,start_date,end_date,rental_price_per_day_at_booking,security_deposit_at_booking,calculated_subtotal_rental_fee,delivery_fee,platform_fee_renter,platform_fee_owner,total_amount_due,final_amount_paid,pickup_method,return_method,delivery_address_id,rental_status,payment_status,return_condition_status,rental_pricing_type_used)
VALUES (
  (SELECT id FROM public.users WHERE email='owner2@example.com'),
  (SELECT id FROM public.products WHERE slug='owner1-canon-eos-r'),
  (SELECT owner_id FROM public.products WHERE slug='owner1-canon-eos-r'),
  (CURRENT_DATE - INTERVAL '2 days')::date, CURRENT_DATE::date,
  800, 3000, 1600, 0, 0, 1600, 1600, 1600,
  'self_pickup'::rental_pickup_method_enum,'self_return'::rental_return_method_enum,
  (SELECT id FROM public.user_addresses WHERE user_id=(SELECT id FROM public.users WHERE email='owner2@example.com') AND is_default=true),
  'confirmed'::rental_status_enum,
  'paid'::rental_payment_status_enum,
  'as_rented'::rental_return_condition_status_enum,
  'daily'::rental_pricing_type_enum
);

-- r4: owner1 rents owner2's Bose QC45 for 4 days (active)
INSERT INTO public.rentals (renter_id,product_id,owner_id,start_date,end_date,rental_price_per_day_at_booking,security_deposit_at_booking,calculated_subtotal_rental_fee,delivery_fee,platform_fee_renter,platform_fee_owner,total_amount_due,final_amount_paid,pickup_method,return_method,delivery_address_id,rental_status,payment_status,return_condition_status,rental_pricing_type_used)
VALUES (
  (SELECT id FROM public.users WHERE email='owner1@example.com'),
  (SELECT id FROM public.products WHERE slug='owner2-bose-qc45'),
  (SELECT owner_id FROM public.products WHERE slug='owner2-bose-qc45'),
  (CURRENT_DATE - INTERVAL '1 days')::date, (CURRENT_DATE + INTERVAL '3 days')::date,
  280, 800, 1120, 0, 0, 1120, 1120, 1120,
  'self_pickup'::rental_pickup_method_enum,'self_return'::rental_return_method_enum,
  (SELECT id FROM public.user_addresses WHERE user_id=(SELECT id FROM public.users WHERE email='owner1@example.com') AND is_default=true),
  'active'::rental_status_enum,
  'paid'::rental_payment_status_enum,
  'as_rented'::rental_return_condition_status_enum,
  'daily'::rental_pricing_type_enum
);

-- Rental status history (basic flows)
INSERT INTO public.rental_status_history (rental_id,previous_status,new_status,changed_at,changed_by_user_id,notes)
VALUES
((SELECT id FROM public.rentals WHERE product_id=(SELECT id FROM public.products WHERE slug='owner1-iphone-13-pro') AND renter_id=(SELECT id FROM public.users WHERE email='owner2@example.com')),'confirmed','active',CURRENT_TIMESTAMP - INTERVAL '9 days',(SELECT id FROM public.users WHERE email='owner2@example.com'),'เริ่มเช่า'),
((SELECT id FROM public.rentals WHERE product_id=(SELECT id FROM public.products WHERE slug='owner1-iphone-13-pro') AND renter_id=(SELECT id FROM public.users WHERE email='owner2@example.com')),'active','completed',CURRENT_TIMESTAMP - INTERVAL '7 days',(SELECT id FROM public.users WHERE email='owner1@example.com'),'ส่งคืนแล้ว'),
((SELECT id FROM public.rentals WHERE product_id=(SELECT id FROM public.products WHERE slug='owner2-thinkpad-x1') AND renter_id=(SELECT id FROM public.users WHERE email='owner1@example.com')),'confirmed','active',CURRENT_TIMESTAMP - INTERVAL '7 days',(SELECT id FROM public.users WHERE email='owner1@example.com'),'เริ่มเช่า'),
((SELECT id FROM public.rentals WHERE product_id=(SELECT id FROM public.products WHERE slug='owner2-thinkpad-x1') AND renter_id=(SELECT id FROM public.users WHERE email='owner1@example.com')),'active','completed',CURRENT_TIMESTAMP - INTERVAL '3 days',(SELECT id FROM public.users WHERE email='owner2@example.com'),'ส่งคืนแล้ว');

-- Payments
INSERT INTO public.payment_transactions (rental_id,user_id,transaction_type,payment_method_name,payment_gateway_name,amount,currency,status,transaction_time)
VALUES
((SELECT id FROM public.rentals WHERE product_id=(SELECT id FROM public.products WHERE slug='owner1-iphone-13-pro') AND renter_id=(SELECT id FROM public.users WHERE email='owner2@example.com')),(SELECT id FROM public.users WHERE email='owner2@example.com'),'rental_payment'::payment_transaction_type_enum,'credit_card','MockPay',3600,'THB','successful'::payment_transaction_status_enum,CURRENT_TIMESTAMP - INTERVAL '9 days'),
((SELECT id FROM public.rentals WHERE product_id=(SELECT id FROM public.products WHERE slug='owner2-thinkpad-x1') AND renter_id=(SELECT id FROM public.users WHERE email='owner1@example.com')),(SELECT id FROM public.users WHERE email='owner1@example.com'),'rental_payment'::payment_transaction_type_enum,'credit_card','MockPay',4000,'THB','successful'::payment_transaction_status_enum,CURRENT_TIMESTAMP - INTERVAL '6 days');

-- Reviews (for completed rentals)
INSERT INTO public.reviews (rental_id,renter_id,product_id,owner_id,rating_product,rating_owner,comment)
VALUES
((SELECT id FROM public.rentals WHERE product_id=(SELECT id FROM public.products WHERE slug='owner1-iphone-13-pro') AND renter_id=(SELECT id FROM public.users WHERE email='owner2@example.com')),(SELECT id FROM public.users WHERE email='owner2@example.com'),(SELECT id FROM public.products WHERE slug='owner1-iphone-13-pro'),(SELECT owner_id FROM public.products WHERE slug='owner1-iphone-13-pro'),5,5,'สินค้าดีมาก เจ้าของบริการเยี่ยม'),
((SELECT id FROM public.rentals WHERE product_id=(SELECT id FROM public.products WHERE slug='owner2-thinkpad-x1') AND renter_id=(SELECT id FROM public.users WHERE email='owner1@example.com')),(SELECT id FROM public.users WHERE email='owner1@example.com'),(SELECT id FROM public.products WHERE slug='owner2-thinkpad-x1'),(SELECT owner_id FROM public.products WHERE slug='owner2-thinkpad-x1'),4,5,'เครื่องสภาพดี ทำงานลื่นไหล');

-- Conversations & Messages for r1
WITH conv AS (
  INSERT INTO public.chat_conversations (participant1_id,participant2_id,related_product_id,related_rental_id,created_at)
  VALUES ((SELECT id FROM public.users WHERE email='owner2@example.com'),(SELECT id FROM public.users WHERE email='owner1@example.com'),(SELECT id FROM public.products WHERE slug='owner1-iphone-13-pro'),(SELECT id FROM public.rentals WHERE product_id=(SELECT id FROM public.products WHERE slug='owner1-iphone-13-pro') AND renter_id=(SELECT id FROM public.users WHERE email='owner2@example.com')),CURRENT_TIMESTAMP - INTERVAL '10 days')
  RETURNING id
), m1 AS (
  INSERT INTO public.chat_messages (conversation_id,sender_id,message_type,message_content,sent_at)
  SELECT id,(SELECT id FROM public.users WHERE email='owner2@example.com'),'text'::chat_message_type_enum,'สนใจเช่าค่ะ',CURRENT_TIMESTAMP - INTERVAL '10 days' FROM conv RETURNING id
), m2 AS (
  INSERT INTO public.chat_messages (conversation_id,sender_id,message_type,message_content,sent_at)
  SELECT (SELECT id FROM conv),(SELECT id FROM public.users WHERE email='owner1@example.com'),'text'::chat_message_type_enum,'ได้เลยครับ',CURRENT_TIMESTAMP - INTERVAL '10 days' RETURNING id
)
UPDATE public.chat_conversations SET last_message_id=(SELECT id FROM m2), last_message_at=CURRENT_TIMESTAMP - INTERVAL '10 days' WHERE id=(SELECT id FROM conv);

-- Wishlist
INSERT INTO public.wishlist (user_id,product_id)
VALUES
((SELECT id FROM public.users WHERE email='owner1@example.com'),(SELECT id FROM public.products WHERE slug='owner2-sony-a7iii')),
((SELECT id FROM public.users WHERE email='owner2@example.com'),(SELECT id FROM public.products WHERE slug='owner1-macbook-air-m1'));

COMMIT;