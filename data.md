# 📊 ข้อมูลฐานข้อมูล - 3 ตุลาคม 2568 เวลา 00:16:12

## 📈 สรุปการดำเนินการ
- **วันเวลาที่ดึงข้อมูล:** 3 ตุลาคม 2568 เวลา 00:16:12
- **ตารางที่ดึงข้อมูลสำเร็จ:** 20 ตาราง
- **ตารางที่เกิดข้อผิดพลาด:** 0 ตาราง
- **เวลาที่ใช้:** 9.96 วินาที
- **จำนวนตารางทั้งหมด:** 20 ตาราง

## 1. ตาราง: provinces

- **จำนวนแถวทั้งหมด:** 77 แถว
- **คอลัมน์:** id, name_th, name_en, region_id, created_at, updated_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | name_th | name_en | region_id | created_at | updated_at |
| --- | --- | --- | --- | --- | --- |
| 1 | กรุงเทพมหานคร | Bangkok | NULL | 2025-05-29T09:21:58.354856+00:00 | 2025-05-29T09:21:58.354856+00:00 |
| 2 | เชียงใหม่ | Chiang Mai | NULL | 2025-05-29T09:21:58.354856+00:00 | 2025-05-29T09:21:58.354856+00:00 |
| 3 | ภูเก็ต | Phuket | NULL | 2025-05-29T09:21:58.354856+00:00 | 2025-05-29T09:21:58.354856+00:00 |
| 108 | สมุทรปราการ | Samut Prakan | 1 | 2025-05-29T14:05:05.985654+00:00 | 2025-05-29T14:05:05.985654+00:00 |
| 109 | นนทบุรี | Nonthaburi | 1 | 2025-05-29T14:05:05.985654+00:00 | 2025-05-29T14:05:05.985654+00:00 |

---

## 2. ตาราง: users

- **จำนวนแถวทั้งหมด:** 14 แถว
- **คอลัมน์:** id, username, email, password_hash, first_name, last_name, phone_number, phone_verified_at, email_verified_at, address_line1, address_line2, city, province_id, postal_code, profile_picture_url, id_document_type, id_document_number, id_document_url, id_document_back_url, id_selfie_url, id_verification_status, id_verification_notes, id_verified_at, id_verified_by_admin_id, is_active, last_login_at, registration_ip, email_verification_token, email_verification_token_expires_at, preferences, created_at, updated_at, deleted_at, google_id

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | username | email | password_hash | first_name | last_name | phone_number | phone_verified_at | email_verified_at | address_line1 | address_line2 | city | province_id | postal_code | profile_picture_url | id_document_type | id_document_number | id_document_url | id_document_back_url | id_selfie_url | id_verification_status | id_verification_notes | id_verified_at | id_verified_by_admin_id | is_active | last_login_at | registration_ip | email_verification_token | email_verification_token_expires_at | preferences | created_at | updated_at | deleted_at | google_id |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 34 | Test | test@gmail.com | $2b$10$9POvpagk6MIf1nsO5gLC1OKAUZcECqLg78sbw7w2ERchQ/pSuEFwu |   |   | 0 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | not_submitted | NULL | NULL | NULL | true | 2025-08-19T17:54:13.914+00:00 | 49.237.12.91 | NULL | NULL | NULL | 2025-08-19T17:41:58.555941+00:00 | 2025-08-19T17:54:14.019752+00:00 | NULL | NULL |
| 36 | ITmsu | it@gmail.com | $2b$10$k.MpbL/gMiNUHNIZJxibZ.gYdHv07IsZ/w8494qEzvLEf2QkXNsmW | ไม่ผ่านนะครับ | ไปเช็คข้อมูลดีๆ | 1472583690 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | other | 123456าาาาาาา | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/id-verification/public/36/id_document.jpg | NULL | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/id-verification/public/36/id_selfie.jpg | pending | NULL | NULL | NULL | true | NULL | 49.237.45.205 | NULL | NULL | NULL | 2025-08-19T17:53:45.46627+00:00 | 2025-08-19T17:57:06.200701+00:00 | NULL | NULL |
| 46 | 65011212130_jlrfc | 65011212130@msu.ac.th | $2b$10$VyaBKXG7MtiCzfZIDD8z0ewD/cGIVVMWSWAZ2rJ1TlKqBg6uh8/4S | วัชระ | ผลชัย | NULL | NULL | 2025-10-02T13:40:13.023+00:00 | NULL | NULL | NULL | NULL | NULL | https://lh3.googleusercontent.com/a/ACg8ocK-e4BaXNnytkpeNbRsvv2VCsJWzhWtHEKSzk6xlcf3BBXmlMbF=s96-c | NULL | NULL | NULL | NULL | NULL | not_submitted | NULL | NULL | NULL | true | 2025-10-02T13:40:13.87+00:00 | NULL | NULL | NULL | NULL | 2025-10-02T13:40:13.763287+00:00 | 2025-10-02T13:40:13.849678+00:00 | NULL | 117944600436425642341 |
| 8 | rentease | rentease.com@gmail.com | $2a$12$rdx0xuMLi4jAjl2v7TrH.ubhVcYyV.Ty8Ymqt.g1Ez0KOBxA29hO2 | Admin | User | NULL | NULL | 2025-06-27T08:09:09.077812+00:00 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | not_submitted | NULL | NULL | NULL | true | 2025-10-02T16:12:07.909+00:00 | NULL | NULL | NULL | NULL | 2025-06-27T08:09:09.077812+00:00 | 2025-10-02T16:12:07.947588+00:00 | NULL | NULL |
| 48 | BedRoom | 65011211031@msu.ac.th | $2b$10$he4PWr1ws.SqnJvhUfZRtejLm91Sv1Zh4u0lrfGIukZS337AEfsCe | Tehg | BedRoom | 081-096-1266 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | national_id | 154515154545415 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/id-verification/public/48/id_document.jpg | NULL | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/id-verification/public/48/id_selfie.jpg | verified | NULL | 2025-10-02T16:23:38.774+00:00 | NULL | true | NULL | 223.206.247.236 | NULL | NULL | NULL | 2025-10-02T16:07:55.109841+00:00 | 2025-10-02T16:23:38.239685+00:00 | NULL | NULL |

---

## 3. ตาราง: admin_users

- **จำนวนแถวทั้งหมด:** 1 แถว
- **คอลัมน์:** id, user_id, granted_by_admin_id, permissions, created_at, updated_at

### ข้อมูลตัวอย่าง (1 แถวแรก):

| id | user_id | granted_by_admin_id | permissions | created_at | updated_at |
| --- | --- | --- | --- | --- | --- |
| 1 | 8 | 8 | {} | 2025-06-27T08:10:23.751583+00:00 | 2025-06-27T08:11:45.177211+00:00 |

---

## 4. ตาราง: categories

- **จำนวนแถวทั้งหมด:** 25 แถว
- **คอลัมน์:** id, name, name_en, slug, description, parent_id, icon_url, image_url, sort_order, is_featured, is_active, created_at, updated_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | name | name_en | slug | description | parent_id | icon_url | image_url | sort_order | is_featured | is_active | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | กล้องและอุปกรณ์ | Cameras & Gear | cameras-gear | อุปกรณ์ถ่ายภาพและวิดีโอทุกชนิด | NULL | https://example.com/icons/camera.png | https://example.com/images/category-camera.jpg | 1 | true | true | 2025-05-29T14:31:05.434461+00:00 | 2025-05-29T14:31:05.434461+00:00 |
| 2 | อุปกรณ์กีฬาและกิจกรรมกลางแจ้ง | Sports & Outdoors | sports-outdoors | อุปกรณ์สำหรับกีฬาและการผจญภัย | NULL | https://example.com/icons/sports.png | https://example.com/images/category-sports.jpg | 2 | true | true | 2025-05-29T14:31:05.434461+00:00 | 2025-05-29T14:31:05.434461+00:00 |
| 3 | เครื่องดนตรี | Musical Instruments | musical-instruments | เครื่องดนตรีหลากหลายประเภท | NULL | https://example.com/icons/music.png | https://example.com/images/category-music.jpg | 3 | true | true | 2025-05-29T14:31:05.434461+00:00 | 2025-05-29T14:31:05.434461+00:00 |
| 4 | เสื้อผ้าและเครื่องแต่งกาย | Fashion & Apparel | fashion-apparel | เสื้อผ้าสำหรับโอกาสพิเศษ ชุดแฟนซี | NULL | https://example.com/icons/fashion.png | https://example.com/images/category-fashion.jpg | 4 | false | true | 2025-05-29T14:31:05.434461+00:00 | 2025-05-29T14:31:05.434461+00:00 |
| 5 | อุปกรณ์จัดงานและอีเว้นท์ | Event Supplies | event-supplies | อุปกรณ์สำหรับจัดงานเลี้ยง งานแต่งงาน อีเว้นท์ต่างๆ | NULL | https://example.com/icons/event.png | https://example.com/images/category-event.jpg | 5 | true | true | 2025-05-29T14:31:05.434461+00:00 | 2025-05-29T14:31:05.434461+00:00 |

---

## 5. ตาราง: products

- **จำนวนแถวทั้งหมด:** 7 แถว
- **คอลัมน์:** id, owner_id, category_id, province_id, title, slug, description, specifications, rental_price_per_day, rental_price_per_week, rental_price_per_month, security_deposit, quantity, quantity_available, availability_status, min_rental_duration_days, max_rental_duration_days, address_details, latitude, longitude, condition_notes, view_count, average_rating, total_reviews, is_featured, admin_approval_status, admin_approval_notes, approved_by_admin_id, created_at, updated_at, published_at, deleted_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | owner_id | category_id | province_id | title | slug | description | specifications | rental_price_per_day | rental_price_per_week | rental_price_per_month | security_deposit | quantity | quantity_available | availability_status | min_rental_duration_days | max_rental_duration_days | address_details | latitude | longitude | condition_notes | view_count | average_rating | total_reviews | is_featured | admin_approval_status | admin_approval_notes | approved_by_admin_id | created_at | updated_at | published_at | deleted_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 56 | 33 | 2 | 1 | จักรยานเสือภูเขา KREATOR รุ่น KAPPA ล้อ26นิ้ว 21สปีด | kreator-kappa-26-21 | 
หมวดหมู่	จักรยานเสือภูเขา MTB
ราคาปกติ	3,900.00 บาท
ลดเหลือ	3,500.00 บาท
ยี่ห้อ	KREATOR
รุ่น	KAPPA
ขนาด	26นิ้ว | {"สี":"เขียว"} | 100 | 999 | 4500 | 100 | 5 | 5 | available | 3 | 30 | Maha Sarakham University, 3069, ท่าขอนยาง, Ban Don Na, Tha Khon Yang, Kantharawichai, Maha Sarakham Province, 44150, Thailand | 16.2465547 | 103.25193616 | สภาพใหม่ 100 % | 1984 | 4.6 | 5 | false | approved | approv auto | NULL | 2025-08-19T16:35:33.229704+00:00 | 2025-10-02T17:05:50.220401+00:00 | 2025-08-19T16:35:32.726+00:00 | NULL |
| 52 | 33 | 21 | 139 | PlayStation 5 | playstation-5 | พร้อมเกมมากมายให้เลือก PS5 ตัวใหม่ล่าสุด สภาพพร้อมใช้งานพร้อมเล่น | {} | 350 | 2350 | 10000 | 1000 | 3 | 3 | available | 3 | 30 | กันทรวิชัย | NULL | NULL | สภาพใหม่ ไม่มีรอย | 67 | 5 | 1 | false | approved | approv auto | NULL | 2025-08-19T16:10:18.515747+00:00 | 2025-10-02T17:07:29.694471+00:00 | 2025-08-19T16:10:18.423+00:00 | NULL |
| 53 | 33 | 21 | 139 | ์ืNintendo Switch | nintendo-switch | สภาพสวยใสไร้ร้อย เกมพร้อมเล่น เครื่องใช้งานปกติไม่มีปัญหา | {} | 275 | 1875 | 8000 | 850 | 2 | 2 | available | 3 | 30 | กันทรวิชัย | NULL | NULL | สภาพใหม่ ไม่มีรอย | 36 | 0 | 0 | false | approved | approv auto | NULL | 2025-08-19T16:13:27.845828+00:00 | 2025-10-02T16:29:36.531553+00:00 | 2025-08-19T16:13:27.763+00:00 | NULL |
| 54 | 33 | 4 | 139 | นาฬิกาข้อมือ | product-a7d9d984-0880-435c-a162-a2623c3c9a10 | หน้าปัด, หัวใจของซีรีส์ใหม่นี้คือหน้าปัดโค้งที่มีพื้นผิวหรูหรา ซึ่งสื่อถึงความรู้สึกนุ่มนวลของสิ่งทอจากธรรมชาติ | {"สี":"เงิน"} | 500 | 5000 | 15000 | 500 | 5 | 5 | available | 7 | 30 | 156/22  อ.เมือง จ.สารคาม  | 6.222 | 10.555 | สภาพใหม่ 100 % | 76 | 0 | 0 | false | approved | approv auto | NULL | 2025-08-19T16:24:49.61747+00:00 | 2025-10-02T16:51:44.604909+00:00 | 2025-08-19T16:24:49.067+00:00 | NULL |
| 55 | 33 | 1 | 141 | Canon EOS R50 Mirrorless Camera | canon-eos-r50-mirrorless-camera | เซ็นเซอร์ CMOS APS-C ความละเอียด 24.2 ล้านพิกเซล พร้อมโปรเซสเซอร์ DIGIC X ช่วยให้คุณถ่ายภาพและวิดีโอได้อย่างคมชัดและมีคุณภาพสูงในทุกสภาพแสง
ระบบออโต้โฟกัส Dual Pixel CMOS AF II ที่มี 651 จุด มอบความแม่นยำในการจับโฟกัสทั้งภาพนิ่งและวิดีโอ ทำให้การถ่ายทำคอนเทนต์ VLOG เป็นเรื่องง่ายดาย
บันทึกวิดีโอความละเอียดระดับ UHD 4K 30p และ FHD 120p พร้อมระบบป้องกันภาพสั่นไหวแบบ 5 แกน ทำให้ฟุตเทจของคุณดูราบรื่นและมีคุณภาพเหมือนมืออาชีพ
หน้าจอสัมผัสขนาด 3.0 นิ้วแบบปรับมุมได้ ช่วยให้คุณสามารถถ่ายภาพในมุมที่ต้องการได้อย่างสะดวกสบายและง่ายดาย
โหมด Close-up และการบันทึกวิดีโอสโลว์โมชัน ทำให้การรีวิวสินค้าและการเล่าเรื่องของคุณน่าสนใจและมีลูกเล่นที่แตกต่าง
การเชื่อมต่อ Wi-Fi และ Bluetooth ช่วยให้คุณถ่ายโอนไฟล์ไปยังอุปกรณ์อื่นได้อย่างรวดเร็ว เพิ่มความสะดวกสบายในการแชร์คอนเทนต์ของคุณ | {"สี":"ดำ"} | 500 | 4999 | 20000 | 599 | 8 | 7 | rented_out | 1 | 30 | 199/8 บ.โจน ต.ปล้น อ.เมือง จ.กาฬสินธุ์ 46000 | 5.235 | 50.325 | สภาพใหม่ 100 % | 27 | 0 | 0 | false | approved | approv auto | NULL | 2025-08-19T16:30:25.534054+00:00 | 2025-10-02T16:04:41.436307+00:00 | 2025-08-19T16:30:25.447+00:00 | NULL |

---

## 6. ตาราง: product_images

- **จำนวนแถวทั้งหมด:** 22 แถว
- **คอลัมน์:** id, product_id, image_url, alt_text, is_primary, sort_order, uploaded_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | product_id | image_url | alt_text | is_primary | sort_order | uploaded_at |
| --- | --- | --- | --- | --- | --- | --- |
| 88 | 52 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/product-images/public/33/ps5-b1417617-5bba-41dc-9d01-b47db1fca11d.webp |  | true | 0 | 2025-08-19T16:10:18.760482+00:00 |
| 89 | 52 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/product-images/public/33/ps2-6f49e230-0d1f-40d0-a3a0-9b671ac1361d.webp |  | false | 1 | 2025-08-19T16:10:18.760482+00:00 |
| 90 | 52 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/product-images/public/33/ps3-374c311f-c2e8-4d1f-a36c-7d39de1ad3c1.webp |  | false | 2 | 2025-08-19T16:10:18.760482+00:00 |
| 91 | 53 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/product-images/public/33/nin3-390bf3de-c52e-4158-a31f-2707f5a88e1b.avif |  | true | 0 | 2025-08-19T16:13:28.118459+00:00 |
| 92 | 53 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/product-images/public/33/nin-7bbff5ac-b65e-4d0b-b946-25d01eab4a51.webp |  | false | 1 | 2025-08-19T16:13:28.118459+00:00 |

---

## 7. ตาราง: user_addresses

- **จำนวนแถวทั้งหมด:** 0 แถว
- **คอลัมน์:** 

### ข้อมูลตัวอย่าง: ไม่มีข้อมูล


---

## 8. ตาราง: rentals

- **จำนวนแถวทั้งหมด:** 16 แถว
- **คอลัมน์:** id, rental_uid, renter_id, product_id, owner_id, start_date, end_date, actual_pickup_time, actual_return_time, rental_price_per_day_at_booking, security_deposit_at_booking, calculated_subtotal_rental_fee, delivery_fee, late_fee_calculated, platform_fee_renter, platform_fee_owner, total_amount_due, final_amount_paid, pickup_method, return_method, delivery_address_id, rental_status, payment_status, payment_proof_url, payment_verified_at, payment_verified_by_user_id, return_condition_status, notes_from_renter, notes_from_owner_on_return, cancelled_at, cancelled_by_user_id, cancellation_reason, created_at, updated_at, return_details, return_initiated_at, return_shipping_receipt_url, return_condition_image_urls, payment_verification_notes, delivery_status, tracking_number, carrier_code, security_deposit_refund_amount, rental_pricing_type_used, rental_price_per_week_at_booking, rental_price_per_month_at_booking

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | rental_uid | renter_id | product_id | owner_id | start_date | end_date | actual_pickup_time | actual_return_time | rental_price_per_day_at_booking | security_deposit_at_booking | calculated_subtotal_rental_fee | delivery_fee | late_fee_calculated | platform_fee_renter | platform_fee_owner | total_amount_due | final_amount_paid | pickup_method | return_method | delivery_address_id | rental_status | payment_status | payment_proof_url | payment_verified_at | payment_verified_by_user_id | return_condition_status | notes_from_renter | notes_from_owner_on_return | cancelled_at | cancelled_by_user_id | cancellation_reason | created_at | updated_at | return_details | return_initiated_at | return_shipping_receipt_url | return_condition_image_urls | payment_verification_notes | delivery_status | tracking_number | carrier_code | security_deposit_refund_amount | rental_pricing_type_used | rental_price_per_week_at_booking | rental_price_per_month_at_booking |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 63 | a2588a27-fb67-4abc-a2e8-0d0f9b41f612 | 39 | 56 | 33 | 2025-08-22 | 2025-08-28 | NULL | NULL | 100 | 100 | 600 | 0 | NULL | 0 | 0 | 700 | 700 | self_pickup | self_return | NULL | confirmed | pending_verification | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-63-proof-1755778194655.jpg | NULL | NULL | not_yet_returned | NULL | NULL | NULL | NULL | NULL | 2025-08-21T12:09:15.857491+00:00 | 2025-08-21T12:09:55.246989+00:00 | NULL | NULL | NULL | NULL | NULL | pending | NULL | NULL | NULL | daily | NULL | NULL |
| 64 | 2154e564-44f5-4b36-a4d7-72e17e47349d | 40 | 56 | 33 | 2025-08-22 | 2025-08-28 | NULL | NULL | 100 | 100 | 600 | 0 | NULL | 0 | 0 | 700 | NULL | self_pickup | self_return | NULL | pending_owner_approval | unpaid | NULL | NULL | NULL | not_yet_returned | NULL | NULL | NULL | NULL | NULL | 2025-08-21T12:17:26.009192+00:00 | 2025-08-21T12:17:26.009192+00:00 | NULL | NULL | NULL | NULL | NULL | pending | NULL | NULL | NULL | daily | NULL | NULL |
| 61 | 9a6be832-182c-4bf8-8231-1a9fa7dd6152 | 39 | 56 | 33 | 2025-08-23 | 2025-08-26 | 2025-08-20T14:47:00+00:00 | 2025-08-21T03:47:00+00:00 | 100 | 100 | 300 | 0 | 0 | 0 | 0 | 400 | 400 | self_pickup | self_return | NULL | completed | paid | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-61-proof-1755701182117.jpg | 2025-08-20T14:47:22.633+00:00 | 33 | as_rented | NULL | NULL | NULL | NULL | NULL | 2025-08-20T14:45:14.756008+00:00 | 2025-08-21T10:47:27.465453+00:00 | {"location":"Maha Sarakham University, 2202, Ban Kham Riang, Kham Riang, Kantharawichai, Maha Sarakham Province, 44150, Thailand","return_datetime":"2025-08-21T10:35:00.000Z"} | 2025-08-21T10:36:06.713+00:00 | NULL | ["https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/return-condition-images/public/rental-61-return-1755773246608-g614pm-rv068w_4_.jpg"] | NULL | delivered | NULL | NULL | NULL | daily | NULL | NULL |
| 62 | 01095462-6329-4499-829e-0f0b0779dedd | 43 | 57 | 33 | 2025-08-22 | 2025-08-28 | NULL | NULL | 1500 | 3500 | 9000 | 0 | NULL | 0 | 0 | 12500 | NULL | self_pickup | self_return | NULL | pending_payment | unpaid | NULL | NULL | NULL | not_yet_returned | NULL | NULL | NULL | NULL | NULL | 2025-08-21T09:57:35.378314+00:00 | 2025-08-21T10:48:01.369559+00:00 | NULL | NULL | NULL | NULL | NULL | pending | NULL | NULL | NULL | daily | NULL | NULL |
| 65 | a1b6703d-de08-4440-a534-ab39bfe8d464 | 40 | 56 | 33 | 2025-08-27 | 2025-08-30 | NULL | NULL | 100 | 100 | 300 | 0 | NULL | 0 | 0 | 400 | NULL | self_pickup | self_return | NULL | pending_owner_approval | unpaid | NULL | NULL | NULL | not_yet_returned | NULL | NULL | NULL | NULL | NULL | 2025-08-24T07:53:40.83603+00:00 | 2025-08-24T07:53:40.83603+00:00 | NULL | NULL | NULL | NULL | NULL | pending | NULL | NULL | NULL | daily | NULL | NULL |

---

## 9. ตาราง: rental_status_history

- **จำนวนแถวทั้งหมด:** 31 แถว
- **คอลัมน์:** id, rental_id, previous_status, new_status, changed_at, changed_by_user_id, changed_by_system, notes

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | rental_id | previous_status | new_status | changed_at | changed_by_user_id | changed_by_system | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 197 | 61 | NULL | pending_owner_approval | 2025-08-20T14:45:14.944212+00:00 | 39 | false | Rental request created. |
| 198 | 61 | pending_owner_approval | pending_payment | 2025-08-20T14:46:01.832341+00:00 | 33 | false | Rental approved by owner. |
| 199 | 61 | pending_payment | confirmed | 2025-08-20T14:46:23.711031+00:00 | 39 | false | Payment proof submitted. |
| 200 | 61 | confirmed | confirmed | 2025-08-20T14:47:23.439271+00:00 | 33 | false | Owner verified payment. |
| 201 | 61 | confirmed | confirmed | 2025-08-20T14:48:29.022458+00:00 | 39 | false | Renter set actual pickup time: Wed Aug 20 2025 21:47:00 GMT+0700 (Indochina Time) and marked as delivered |

---

## 10. ตาราง: reviews

- **จำนวนแถวทั้งหมด:** 6 แถว
- **คอลัมน์:** id, rental_id, renter_id, product_id, owner_id, rating_product, rating_owner, comment, is_hidden_by_admin, hidden_reason, created_at, updated_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | rental_id | renter_id | product_id | owner_id | rating_product | rating_owner | comment | is_hidden_by_admin | hidden_reason | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | 61 | 39 | 56 | 33 | 5 | 4 | Test review from API test | false | NULL | 2025-10-02T15:26:50.448231+00:00 | 2025-10-02T15:26:50.448231+00:00 |
| 12 | 75 | 39 | 56 | 33 | 5 | 4 | Test review from API test - New rental | false | NULL | 2025-10-02T15:30:06.393113+00:00 | 2025-10-02T15:30:06.393113+00:00 |
| 14 | 75 | 39 | 56 | 33 | 5 | 4 | Test review from API test - New rental | false | NULL | 2025-10-02T15:33:14.110452+00:00 | 2025-10-02T15:33:14.110452+00:00 |
| 15 | 75 | 39 | 56 | 33 | 5 | 4 | Test review from API test - New rental | false | NULL | 2025-10-02T15:34:45.064051+00:00 | 2025-10-02T15:34:45.064051+00:00 |
| 16 | 75 | 39 | 56 | 33 | 3 | 4 | Initial review: Good product and service. | false | NULL | 2025-10-02T15:44:40.380563+00:00 | 2025-10-02T15:44:40.380563+00:00 |

---

## 11. ตาราง: payout_methods

- **จำนวนแถวทั้งหมด:** 2 แถว
- **คอลัมน์:** id, owner_id, method_type, account_name, account_number, bank_name, is_primary, created_at, updated_at

### ข้อมูลตัวอย่าง (2 แถวแรก):

| id | owner_id | method_type | account_name | account_number | bank_name | is_primary | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6 | 33 | promptpay | สุทธิภัทร ชื่นบาน | 0972093740 |  | true | 2025-08-20T10:18:53.65031+00:00 | 2025-08-20T10:18:53.65031+00:00 |
| 7 | 33 | bank_account | สุทธิภัทร ชื่นบาน | 123456789 | GSB | false | 2025-08-20T10:19:17.252497+00:00 | 2025-08-20T10:19:17.252497+00:00 |

---

## 12. ตาราง: chat_conversations

- **จำนวนแถวทั้งหมด:** 6 แถว
- **คอลัมน์:** id, conversation_uid, participant1_id, participant2_id, related_product_id, related_rental_id, last_message_id, last_message_at, p1_unread_count, p2_unread_count, p1_archived_at, p2_archived_at, created_at, updated_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | conversation_uid | participant1_id | participant2_id | related_product_id | related_rental_id | last_message_id | last_message_at | p1_unread_count | p2_unread_count | p1_archived_at | p2_archived_at | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 28 | 06675071-0114-4df2-8c18-0adcf259a2ee | 33 | 36 | 57 | NULL | 172 | 2025-08-19T17:56:26.797709+00:00 | 1 | 0 | NULL | NULL | 2025-08-19T17:56:26.532821+00:00 | 2025-08-19T17:56:27.325088+00:00 |
| 33 | dbe62078-cd9c-48aa-900d-cec522144967 | 33 | 48 | 52 | 76 | 184 | 2025-10-02T16:33:05.561627+00:00 | 1 | 0 | NULL | NULL | 2025-10-02T16:33:05.508102+00:00 | 2025-10-02T16:33:17.944605+00:00 |
| 30 | 2e2cf3e1-b2a6-4503-a853-ba79d986166f | 33 | 43 | 56 | NULL | 181 | 2025-08-20T10:33:23.533516+00:00 | 0 | 0 | NULL | NULL | 2025-08-20T10:09:36.565489+00:00 | 2025-08-21T08:47:41.72373+00:00 |
| 29 | c1edf91a-8a2c-4610-9354-e12dd3e1cb3a | 39 | 40 | 58 | NULL | 177 | 2025-08-20T06:10:51.763497+00:00 | 2 | 0 | NULL | NULL | 2025-08-20T06:09:19.809288+00:00 | 2025-09-30T10:53:46.223752+00:00 |
| 31 | f2281e08-76f9-4494-ad92-425565da20d5 | 33 | 47 | 56 | NULL | 182 | 2025-10-02T13:57:28.435765+00:00 | 1 | 0 | NULL | NULL | 2025-10-02T13:57:28.370158+00:00 | 2025-10-02T13:57:28.511629+00:00 |

---

## 13. ตาราง: chat_messages

- **จำนวนแถวทั้งหมด:** 13 แถว
- **คอลัมน์:** id, message_uid, conversation_id, sender_id, message_type, message_content, attachment_url, attachment_metadata, sent_at, read_at, is_deleted_by_sender

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | message_uid | conversation_id | sender_id | message_type | message_content | attachment_url | attachment_metadata | sent_at | read_at | is_deleted_by_sender |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 172 | 505592f5-4232-4b68-8ac1-71175c72a98f | 28 | 36 | text | สวัสดีครับ/ค่ะ ผม/ดิฉันสนใจสินค้า ROG Strix G16 (2025) G614 ของคุณ
https://rent-ease-x.vercel.app/products/rog-strix-g16-2025-g614 | NULL | NULL | 2025-08-19T17:56:26.797709+00:00 | NULL | false |
| 173 | ab52e66a-f16f-4a73-a2fd-38e787b9b037 | 29 | 39 | text | สวัสดี เกี่ยวกับการเช่า ce8ecdd2-701c-48c7-829a-703b33b6d0a1 สำหรับสินค้า: กระดาษ a4 | NULL | NULL | 2025-08-20T06:09:20.087235+00:00 | 2025-08-20T06:09:34.758+00:00 | false |
| 175 | 82b6ceb5-263b-4837-bff8-3bd763ba1057 | 29 | 40 | text | พังยังไง | NULL | NULL | 2025-08-20T06:10:22.823992+00:00 | NULL | false |
| 174 | a16d3774-660c-4794-8c02-5af1beaf57db | 29 | 39 | text | พัง | NULL | NULL | 2025-08-20T06:10:02.518026+00:00 | 2025-08-20T06:10:25.298+00:00 | false |
| 177 | c669a1d9-2edd-4b27-9705-ef17a547cd0d | 29 | 40 | text | 😭😭 | NULL | NULL | 2025-08-20T06:10:51.763497+00:00 | NULL | false |

---

## 14. ตาราง: complaints

- **จำนวนแถวทั้งหมด:** 0 แถว
- **คอลัมน์:** 

### ข้อมูลตัวอย่าง: ไม่มีข้อมูล


---

## 15. ตาราง: complaint_attachments

- **จำนวนแถวทั้งหมด:** 0 แถว
- **คอลัมน์:** 

### ข้อมูลตัวอย่าง: ไม่มีข้อมูล


---

## 16. ตาราง: notifications

- **จำนวนแถวทั้งหมด:** 91 แถว
- **คอลัมน์:** id, user_id, type, title, message, link_url, related_entity_type, related_entity_id, related_entity_uid, is_read, read_at, created_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | user_id | type | title | message | link_url | related_entity_type | related_entity_id | related_entity_uid | is_read | read_at | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 308 | 39 | rental_requested | คุณได้รับคำขอเช่าใหม่ | มีคำขอเช่าสินค้า 'กระดาษ a4' จากผู้เช่าใหม่ กรุณาตรวจสอบและอนุมัติ | /owner/rentals/57 | rental | 57 | ce8ecdd2-701c-48c7-829a-703b33b6d0a1 | true | 2025-08-20T05:57:31.373+00:00 | 2025-08-20T05:57:01.344339+00:00 |
| 386 | 40 | rental_approved | คำขอเช่าของคุณได้รับการอนุมัติ | คำขอเช่าสินค้า กระดาษ a4 ได้รับการอนุมัติ | /rentals/71 | rental | 71 | e9f337f3-30ad-4832-ad00-d5e51f0e75a1 | true | 2025-10-02T16:24:49.458+00:00 | 2025-10-02T16:24:24.32401+00:00 |
| 379 | 33 | new_message | คุณมีข้อความใหม่ | สวัสดีครับ/ค่ะ ฉันสนใจเช่าสินค้า จักรยานเสือภูเขา KREATOR รุ่น KAPPA ล้อ26นิ้ว 21สปีด ของคุณ
https://rent-ease-x.vercel.app/products/kreator-kappa-26-21 | /chat/31 | chat_conversation | 31 | f2281e08-76f9-4494-ad92-425565da20d5 | true | 2025-10-02T16:29:55.625+00:00 | 2025-10-02T13:57:28.552239+00:00 |
| 310 | 39 | payment_proof_uploaded | ผู้เช่าอัปโหลดสลิปการชำระเงิน | ผู้เช่าสำหรับสินค้า 'กระดาษ a4' ได้อัปโหลดสลิปการชำระเงิน กรุณาตรวจสอบและยืนยันการชำระเงิน | /owner/rentals/57 | rental | 57 | ce8ecdd2-701c-48c7-829a-703b33b6d0a1 | true | 2025-08-20T06:00:06.839+00:00 | 2025-08-20T05:59:44.234648+00:00 |
| 309 | 40 | rental_approved | คำขอเช่าของคุณได้รับการอนุมัติ | คำขอเช่าสินค้า กระดาษ a4 ได้รับการอนุมัติ | /rentals/57 | rental | 57 | ce8ecdd2-701c-48c7-829a-703b33b6d0a1 | true | 2025-08-20T06:00:38.098+00:00 | 2025-08-20T05:59:00.444796+00:00 |

---

## 17. ตาราง: wishlist

- **จำนวนแถวทั้งหมด:** 3 แถว
- **คอลัมน์:** user_id, product_id, added_at

### ข้อมูลตัวอย่าง (3 แถวแรก):

| user_id | product_id | added_at |
| --- | --- | --- |
| 45 | 58 | 2025-10-01T15:23:25.984791+00:00 |
| 47 | 56 | 2025-10-02T13:57:26.5329+00:00 |
| 40 | 56 | 2025-10-02T15:08:41.363794+00:00 |

---

## 18. ตาราง: payment_transactions

- **จำนวนแถวทั้งหมด:** 14 แถว
- **คอลัมน์:** id, transaction_uid, rental_id, user_id, transaction_type, payment_method_name, payment_gateway_name, gateway_transaction_id, gateway_charge_id, amount, currency, status, payment_method_details, error_code_gateway, error_message_gateway, transaction_time, notes

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | transaction_uid | rental_id | user_id | transaction_type | payment_method_name | payment_gateway_name | gateway_transaction_id | gateway_charge_id | amount | currency | status | payment_method_details | error_code_gateway | error_message_gateway | transaction_time | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | af37a31c-270b-426a-ad97-1f88bb587ead | NULL | 40 | rental_payment | manual_bank_transfer | NULL | NULL | NULL | 91 | THB | pending | {"proof_url":"https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-57-proof-1755669582069.jpg","transaction_time":"2025-08-20T05:59:43.904Z"} | NULL | NULL | 2025-08-20T05:59:43.904+00:00 | NULL |
| 32 | 4efb58c1-e498-49cc-a723-9826dd0a3e5e | NULL | 40 | rental_payment | manual_bank_transfer | NULL | NULL | NULL | 91 | THB | pending | {"proof_url":"https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-57-proof-1755669661868.jpg","transaction_time":"2025-08-20T06:01:03.560Z"} | NULL | NULL | 2025-08-20T06:01:03.56+00:00 | NULL |
| 33 | 65de1db2-6cab-4d21-8881-9f983e22d815 | NULL | 40 | rental_payment | manual_bank_transfer | NULL | NULL | NULL | 91 | THB | pending | {"proof_url":"https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-57-proof-1755669789785.jpg","transaction_time":"2025-08-20T06:03:11.631Z"} | NULL | NULL | 2025-08-20T06:03:11.631+00:00 | NULL |
| 36 | 4c74466a-9ee4-4d1a-9217-ca18ced19195 | NULL | 43 | rental_payment | manual_bank_transfer | NULL | NULL | NULL | 1599 | THB | pending | {"proof_url":"https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-59-proof-1755685708726.png","transaction_time":"2025-08-20T10:28:30.720Z"} | NULL | NULL | 2025-08-20T10:28:30.72+00:00 | NULL |
| 34 | c8727990-9cf5-4931-a1a3-9740617442e8 | NULL | 43 | rental_payment | manual_bank_transfer | NULL | NULL | NULL | 400 | THB | pending | {"proof_url":"https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-58-proof-1755685211834.jpg","transaction_time":"2025-08-20T10:20:13.689Z"} | NULL | NULL | 2025-08-20T10:20:13.689+00:00 | NULL |

---

## 19. ตาราง: admin_logs

- **จำนวนแถวทั้งหมด:** 39 แถว
- **คอลัมน์:** id, admin_user_id, action_type, target_entity_type, target_entity_id, target_entity_uid, details, ip_address, user_agent, created_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | admin_user_id | action_type | target_entity_type | target_entity_id | target_entity_uid | details | ip_address | user_agent | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | 8 | USER_VERIFICATION_UPDATE | User | 33 | NULL | {"updated_fields":["id_verification_status","id_verified_at","id_verified_by_admin_id"],"new_values":{"id_verification_status":"verified","id_verified_at":"2025-08-19T15:59:13.522Z","id_verified_by_admin_id":1}} | 202.28.35.188 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0 | 2025-08-19T15:59:14.476+00:00 |
| 26 | 8 | USER_VERIFICATION_UPDATE | User | 39 | NULL | {"updated_fields":["id_verification_status","id_verified_at","id_verified_by_admin_id"],"new_values":{"id_verification_status":"rejected","id_verified_at":"2025-08-20T05:38:14.518Z","id_verified_by_admin_id":1}} | 202.28.35.187 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 | 2025-08-20T05:38:16.037+00:00 |
| 27 | 8 | USER_VERIFICATION_UPDATE | User | 39 | NULL | {"updated_fields":["id_verification_status","id_verified_at","id_verified_by_admin_id"],"new_values":{"id_verification_status":"verified","id_verified_at":"2025-08-20T05:40:22.686Z","id_verified_by_admin_id":1}} | 202.28.35.187 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 | 2025-08-20T05:40:23.659+00:00 |
| 28 | 8 | USER_BAN | User | 39 | NULL | {"action":"User banned","reason":"Admin action"} | 202.28.35.187 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 | 2025-08-20T05:40:45.986+00:00 |
| 29 | 8 | USER_UNBAN | User | 39 | NULL | {"action":"User unbanned","reason":"Admin action"} | 202.28.35.187 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 | 2025-08-20T05:41:33.817+00:00 |

---

## 20. ตาราง: system_settings

- **จำนวนแถวทั้งหมด:** 11 แถว
- **คอลัมน์:** setting_key, setting_value, description, data_type, is_publicly_readable, is_encrypted, validation_rules, created_at, updated_at, updated_by_admin_id

### ข้อมูลตัวอย่าง (5 แถวแรก):

| setting_key | setting_value | description | data_type | is_publicly_readable | is_encrypted | validation_rules | created_at | updated_at | updated_by_admin_id |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| delivery_buffer_days | 1 | จำนวนวัน buffer สำหรับการส่งสินค้า | integer | true | false | min:0,max:7 | 2025-08-20T15:26:19.767744+00:00 | 2025-08-21T10:57:09.49517+00:00 | NULL |
| return_buffer_days | 1 | จำนวนวัน buffer สำหรับการคืนสินค้า | integer | true | false | min:0,max:7 | 2025-08-20T15:26:19.767744+00:00 | 2025-08-21T10:57:09.620878+00:00 | NULL |
| platform_fee_rate | 0 | อัตราค่าธรรมเนียมแพลตฟอร์ม (0% - ไม่มีค่าธรรมเนียม) | float | false | false | NULL | 2025-08-17T09:38:29.796941+00:00 | 2025-10-01T15:56:57.403837+00:00 | 8 |
| platform_fee_percentage | 0.0 | อัตราค่าธรรมเนียมแพลตฟอร์มสำหรับผู้เช่า (0% - ไม่มีค่าธรรมเนียม) | float | true | false | NULL | 2025-08-17T09:38:29.796941+00:00 | 2025-08-17T09:38:29.796941+00:00 | NULL |
| platform_fee_owner_percentage | 0.0 | อัตราค่าธรรมเนียมแพลตฟอร์มสำหรับเจ้าของสินค้า (0% - ไม่มีค่าธรรมเนียม) | float | true | false | NULL | 2025-08-17T09:38:29.796941+00:00 | 2025-08-17T09:38:29.796941+00:00 | NULL |

---

# 📊 ข้อมูลฐานข้อมูล - 3 ตุลาคม 2568 เวลา 00:15:35

## 📈 สรุปการดำเนินการ
- **วันเวลาที่ดึงข้อมูล:** 3 ตุลาคม 2568 เวลา 00:15:35
- **ตารางที่ดึงข้อมูลสำเร็จ:** 20 ตาราง
- **ตารางที่เกิดข้อผิดพลาด:** 0 ตาราง
- **เวลาที่ใช้:** 14.91 วินาที
- **จำนวนตารางทั้งหมด:** 20 ตาราง

## 1. ตาราง: provinces

- **จำนวนแถวทั้งหมด:** 77 แถว
- **คอลัมน์:** id, name_th, name_en, region_id, created_at, updated_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | name_th | name_en | region_id | created_at | updated_at |
| --- | --- | --- | --- | --- | --- |
| 1 | กรุงเทพมหานคร | Bangkok | NULL | 2025-05-29T09:21:58.354856+00:00 | 2025-05-29T09:21:58.354856+00:00 |
| 2 | เชียงใหม่ | Chiang Mai | NULL | 2025-05-29T09:21:58.354856+00:00 | 2025-05-29T09:21:58.354856+00:00 |
| 3 | ภูเก็ต | Phuket | NULL | 2025-05-29T09:21:58.354856+00:00 | 2025-05-29T09:21:58.354856+00:00 |
| 108 | สมุทรปราการ | Samut Prakan | 1 | 2025-05-29T14:05:05.985654+00:00 | 2025-05-29T14:05:05.985654+00:00 |
| 109 | นนทบุรี | Nonthaburi | 1 | 2025-05-29T14:05:05.985654+00:00 | 2025-05-29T14:05:05.985654+00:00 |

---

## 2. ตาราง: users

- **จำนวนแถวทั้งหมด:** 14 แถว
- **คอลัมน์:** id, username, email, password_hash, first_name, last_name, phone_number, phone_verified_at, email_verified_at, address_line1, address_line2, city, province_id, postal_code, profile_picture_url, id_document_type, id_document_number, id_document_url, id_document_back_url, id_selfie_url, id_verification_status, id_verification_notes, id_verified_at, id_verified_by_admin_id, is_active, last_login_at, registration_ip, email_verification_token, email_verification_token_expires_at, preferences, created_at, updated_at, deleted_at, google_id

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | username | email | password_hash | first_name | last_name | phone_number | phone_verified_at | email_verified_at | address_line1 | address_line2 | city | province_id | postal_code | profile_picture_url | id_document_type | id_document_number | id_document_url | id_document_back_url | id_selfie_url | id_verification_status | id_verification_notes | id_verified_at | id_verified_by_admin_id | is_active | last_login_at | registration_ip | email_verification_token | email_verification_token_expires_at | preferences | created_at | updated_at | deleted_at | google_id |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 34 | Test | test@gmail.com | $2b$10$9POvpagk6MIf1nsO5gLC1OKAUZcECqLg78sbw7w2ERchQ/pSuEFwu |   |   | 0 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | not_submitted | NULL | NULL | NULL | true | 2025-08-19T17:54:13.914+00:00 | 49.237.12.91 | NULL | NULL | NULL | 2025-08-19T17:41:58.555941+00:00 | 2025-08-19T17:54:14.019752+00:00 | NULL | NULL |
| 36 | ITmsu | it@gmail.com | $2b$10$k.MpbL/gMiNUHNIZJxibZ.gYdHv07IsZ/w8494qEzvLEf2QkXNsmW | ไม่ผ่านนะครับ | ไปเช็คข้อมูลดีๆ | 1472583690 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | other | 123456าาาาาาา | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/id-verification/public/36/id_document.jpg | NULL | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/id-verification/public/36/id_selfie.jpg | pending | NULL | NULL | NULL | true | NULL | 49.237.45.205 | NULL | NULL | NULL | 2025-08-19T17:53:45.46627+00:00 | 2025-08-19T17:57:06.200701+00:00 | NULL | NULL |
| 46 | 65011212130_jlrfc | 65011212130@msu.ac.th | $2b$10$VyaBKXG7MtiCzfZIDD8z0ewD/cGIVVMWSWAZ2rJ1TlKqBg6uh8/4S | วัชระ | ผลชัย | NULL | NULL | 2025-10-02T13:40:13.023+00:00 | NULL | NULL | NULL | NULL | NULL | https://lh3.googleusercontent.com/a/ACg8ocK-e4BaXNnytkpeNbRsvv2VCsJWzhWtHEKSzk6xlcf3BBXmlMbF=s96-c | NULL | NULL | NULL | NULL | NULL | not_submitted | NULL | NULL | NULL | true | 2025-10-02T13:40:13.87+00:00 | NULL | NULL | NULL | NULL | 2025-10-02T13:40:13.763287+00:00 | 2025-10-02T13:40:13.849678+00:00 | NULL | 117944600436425642341 |
| 8 | rentease | rentease.com@gmail.com | $2a$12$rdx0xuMLi4jAjl2v7TrH.ubhVcYyV.Ty8Ymqt.g1Ez0KOBxA29hO2 | Admin | User | NULL | NULL | 2025-06-27T08:09:09.077812+00:00 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | not_submitted | NULL | NULL | NULL | true | 2025-10-02T16:12:07.909+00:00 | NULL | NULL | NULL | NULL | 2025-06-27T08:09:09.077812+00:00 | 2025-10-02T16:12:07.947588+00:00 | NULL | NULL |
| 48 | BedRoom | 65011211031@msu.ac.th | $2b$10$he4PWr1ws.SqnJvhUfZRtejLm91Sv1Zh4u0lrfGIukZS337AEfsCe | Tehg | BedRoom | 081-096-1266 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | national_id | 154515154545415 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/id-verification/public/48/id_document.jpg | NULL | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/id-verification/public/48/id_selfie.jpg | verified | NULL | 2025-10-02T16:23:38.774+00:00 | NULL | true | NULL | 223.206.247.236 | NULL | NULL | NULL | 2025-10-02T16:07:55.109841+00:00 | 2025-10-02T16:23:38.239685+00:00 | NULL | NULL |

---

## 3. ตาราง: admin_users

- **จำนวนแถวทั้งหมด:** 1 แถว
- **คอลัมน์:** id, user_id, granted_by_admin_id, permissions, created_at, updated_at

### ข้อมูลตัวอย่าง (1 แถวแรก):

| id | user_id | granted_by_admin_id | permissions | created_at | updated_at |
| --- | --- | --- | --- | --- | --- |
| 1 | 8 | 8 | {} | 2025-06-27T08:10:23.751583+00:00 | 2025-06-27T08:11:45.177211+00:00 |

---

## 4. ตาราง: categories

- **จำนวนแถวทั้งหมด:** 25 แถว
- **คอลัมน์:** id, name, name_en, slug, description, parent_id, icon_url, image_url, sort_order, is_featured, is_active, created_at, updated_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | name | name_en | slug | description | parent_id | icon_url | image_url | sort_order | is_featured | is_active | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | กล้องและอุปกรณ์ | Cameras & Gear | cameras-gear | อุปกรณ์ถ่ายภาพและวิดีโอทุกชนิด | NULL | https://example.com/icons/camera.png | https://example.com/images/category-camera.jpg | 1 | true | true | 2025-05-29T14:31:05.434461+00:00 | 2025-05-29T14:31:05.434461+00:00 |
| 2 | อุปกรณ์กีฬาและกิจกรรมกลางแจ้ง | Sports & Outdoors | sports-outdoors | อุปกรณ์สำหรับกีฬาและการผจญภัย | NULL | https://example.com/icons/sports.png | https://example.com/images/category-sports.jpg | 2 | true | true | 2025-05-29T14:31:05.434461+00:00 | 2025-05-29T14:31:05.434461+00:00 |
| 3 | เครื่องดนตรี | Musical Instruments | musical-instruments | เครื่องดนตรีหลากหลายประเภท | NULL | https://example.com/icons/music.png | https://example.com/images/category-music.jpg | 3 | true | true | 2025-05-29T14:31:05.434461+00:00 | 2025-05-29T14:31:05.434461+00:00 |
| 4 | เสื้อผ้าและเครื่องแต่งกาย | Fashion & Apparel | fashion-apparel | เสื้อผ้าสำหรับโอกาสพิเศษ ชุดแฟนซี | NULL | https://example.com/icons/fashion.png | https://example.com/images/category-fashion.jpg | 4 | false | true | 2025-05-29T14:31:05.434461+00:00 | 2025-05-29T14:31:05.434461+00:00 |
| 5 | อุปกรณ์จัดงานและอีเว้นท์ | Event Supplies | event-supplies | อุปกรณ์สำหรับจัดงานเลี้ยง งานแต่งงาน อีเว้นท์ต่างๆ | NULL | https://example.com/icons/event.png | https://example.com/images/category-event.jpg | 5 | true | true | 2025-05-29T14:31:05.434461+00:00 | 2025-05-29T14:31:05.434461+00:00 |

---

## 5. ตาราง: products

- **จำนวนแถวทั้งหมด:** 7 แถว
- **คอลัมน์:** id, owner_id, category_id, province_id, title, slug, description, specifications, rental_price_per_day, rental_price_per_week, rental_price_per_month, security_deposit, quantity, quantity_available, availability_status, min_rental_duration_days, max_rental_duration_days, address_details, latitude, longitude, condition_notes, view_count, average_rating, total_reviews, is_featured, admin_approval_status, admin_approval_notes, approved_by_admin_id, created_at, updated_at, published_at, deleted_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | owner_id | category_id | province_id | title | slug | description | specifications | rental_price_per_day | rental_price_per_week | rental_price_per_month | security_deposit | quantity | quantity_available | availability_status | min_rental_duration_days | max_rental_duration_days | address_details | latitude | longitude | condition_notes | view_count | average_rating | total_reviews | is_featured | admin_approval_status | admin_approval_notes | approved_by_admin_id | created_at | updated_at | published_at | deleted_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 56 | 33 | 2 | 1 | จักรยานเสือภูเขา KREATOR รุ่น KAPPA ล้อ26นิ้ว 21สปีด | kreator-kappa-26-21 | 
หมวดหมู่	จักรยานเสือภูเขา MTB
ราคาปกติ	3,900.00 บาท
ลดเหลือ	3,500.00 บาท
ยี่ห้อ	KREATOR
รุ่น	KAPPA
ขนาด	26นิ้ว | {"สี":"เขียว"} | 100 | 999 | 4500 | 100 | 5 | 5 | available | 3 | 30 | Maha Sarakham University, 3069, ท่าขอนยาง, Ban Don Na, Tha Khon Yang, Kantharawichai, Maha Sarakham Province, 44150, Thailand | 16.2465547 | 103.25193616 | สภาพใหม่ 100 % | 1984 | 4.6 | 5 | false | approved | approv auto | NULL | 2025-08-19T16:35:33.229704+00:00 | 2025-10-02T17:05:50.220401+00:00 | 2025-08-19T16:35:32.726+00:00 | NULL |
| 52 | 33 | 21 | 139 | PlayStation 5 | playstation-5 | พร้อมเกมมากมายให้เลือก PS5 ตัวใหม่ล่าสุด สภาพพร้อมใช้งานพร้อมเล่น | {} | 350 | 2350 | 10000 | 1000 | 3 | 3 | available | 3 | 30 | กันทรวิชัย | NULL | NULL | สภาพใหม่ ไม่มีรอย | 67 | 5 | 1 | false | approved | approv auto | NULL | 2025-08-19T16:10:18.515747+00:00 | 2025-10-02T17:07:29.694471+00:00 | 2025-08-19T16:10:18.423+00:00 | NULL |
| 53 | 33 | 21 | 139 | ์ืNintendo Switch | nintendo-switch | สภาพสวยใสไร้ร้อย เกมพร้อมเล่น เครื่องใช้งานปกติไม่มีปัญหา | {} | 275 | 1875 | 8000 | 850 | 2 | 2 | available | 3 | 30 | กันทรวิชัย | NULL | NULL | สภาพใหม่ ไม่มีรอย | 36 | 0 | 0 | false | approved | approv auto | NULL | 2025-08-19T16:13:27.845828+00:00 | 2025-10-02T16:29:36.531553+00:00 | 2025-08-19T16:13:27.763+00:00 | NULL |
| 54 | 33 | 4 | 139 | นาฬิกาข้อมือ | product-a7d9d984-0880-435c-a162-a2623c3c9a10 | หน้าปัด, หัวใจของซีรีส์ใหม่นี้คือหน้าปัดโค้งที่มีพื้นผิวหรูหรา ซึ่งสื่อถึงความรู้สึกนุ่มนวลของสิ่งทอจากธรรมชาติ | {"สี":"เงิน"} | 500 | 5000 | 15000 | 500 | 5 | 5 | available | 7 | 30 | 156/22  อ.เมือง จ.สารคาม  | 6.222 | 10.555 | สภาพใหม่ 100 % | 76 | 0 | 0 | false | approved | approv auto | NULL | 2025-08-19T16:24:49.61747+00:00 | 2025-10-02T16:51:44.604909+00:00 | 2025-08-19T16:24:49.067+00:00 | NULL |
| 55 | 33 | 1 | 141 | Canon EOS R50 Mirrorless Camera | canon-eos-r50-mirrorless-camera | เซ็นเซอร์ CMOS APS-C ความละเอียด 24.2 ล้านพิกเซล พร้อมโปรเซสเซอร์ DIGIC X ช่วยให้คุณถ่ายภาพและวิดีโอได้อย่างคมชัดและมีคุณภาพสูงในทุกสภาพแสง
ระบบออโต้โฟกัส Dual Pixel CMOS AF II ที่มี 651 จุด มอบความแม่นยำในการจับโฟกัสทั้งภาพนิ่งและวิดีโอ ทำให้การถ่ายทำคอนเทนต์ VLOG เป็นเรื่องง่ายดาย
บันทึกวิดีโอความละเอียดระดับ UHD 4K 30p และ FHD 120p พร้อมระบบป้องกันภาพสั่นไหวแบบ 5 แกน ทำให้ฟุตเทจของคุณดูราบรื่นและมีคุณภาพเหมือนมืออาชีพ
หน้าจอสัมผัสขนาด 3.0 นิ้วแบบปรับมุมได้ ช่วยให้คุณสามารถถ่ายภาพในมุมที่ต้องการได้อย่างสะดวกสบายและง่ายดาย
โหมด Close-up และการบันทึกวิดีโอสโลว์โมชัน ทำให้การรีวิวสินค้าและการเล่าเรื่องของคุณน่าสนใจและมีลูกเล่นที่แตกต่าง
การเชื่อมต่อ Wi-Fi และ Bluetooth ช่วยให้คุณถ่ายโอนไฟล์ไปยังอุปกรณ์อื่นได้อย่างรวดเร็ว เพิ่มความสะดวกสบายในการแชร์คอนเทนต์ของคุณ | {"สี":"ดำ"} | 500 | 4999 | 20000 | 599 | 8 | 7 | rented_out | 1 | 30 | 199/8 บ.โจน ต.ปล้น อ.เมือง จ.กาฬสินธุ์ 46000 | 5.235 | 50.325 | สภาพใหม่ 100 % | 27 | 0 | 0 | false | approved | approv auto | NULL | 2025-08-19T16:30:25.534054+00:00 | 2025-10-02T16:04:41.436307+00:00 | 2025-08-19T16:30:25.447+00:00 | NULL |

---

## 6. ตาราง: product_images

- **จำนวนแถวทั้งหมด:** 22 แถว
- **คอลัมน์:** id, product_id, image_url, alt_text, is_primary, sort_order, uploaded_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | product_id | image_url | alt_text | is_primary | sort_order | uploaded_at |
| --- | --- | --- | --- | --- | --- | --- |
| 88 | 52 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/product-images/public/33/ps5-b1417617-5bba-41dc-9d01-b47db1fca11d.webp |  | true | 0 | 2025-08-19T16:10:18.760482+00:00 |
| 89 | 52 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/product-images/public/33/ps2-6f49e230-0d1f-40d0-a3a0-9b671ac1361d.webp |  | false | 1 | 2025-08-19T16:10:18.760482+00:00 |
| 90 | 52 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/product-images/public/33/ps3-374c311f-c2e8-4d1f-a36c-7d39de1ad3c1.webp |  | false | 2 | 2025-08-19T16:10:18.760482+00:00 |
| 91 | 53 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/product-images/public/33/nin3-390bf3de-c52e-4158-a31f-2707f5a88e1b.avif |  | true | 0 | 2025-08-19T16:13:28.118459+00:00 |
| 92 | 53 | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/product-images/public/33/nin-7bbff5ac-b65e-4d0b-b946-25d01eab4a51.webp |  | false | 1 | 2025-08-19T16:13:28.118459+00:00 |

---

## 7. ตาราง: user_addresses

- **จำนวนแถวทั้งหมด:** 0 แถว
- **คอลัมน์:** 

### ข้อมูลตัวอย่าง: ไม่มีข้อมูล


---

## 8. ตาราง: rentals

- **จำนวนแถวทั้งหมด:** 16 แถว
- **คอลัมน์:** id, rental_uid, renter_id, product_id, owner_id, start_date, end_date, actual_pickup_time, actual_return_time, rental_price_per_day_at_booking, security_deposit_at_booking, calculated_subtotal_rental_fee, delivery_fee, late_fee_calculated, platform_fee_renter, platform_fee_owner, total_amount_due, final_amount_paid, pickup_method, return_method, delivery_address_id, rental_status, payment_status, payment_proof_url, payment_verified_at, payment_verified_by_user_id, return_condition_status, notes_from_renter, notes_from_owner_on_return, cancelled_at, cancelled_by_user_id, cancellation_reason, created_at, updated_at, return_details, return_initiated_at, return_shipping_receipt_url, return_condition_image_urls, payment_verification_notes, delivery_status, tracking_number, carrier_code, security_deposit_refund_amount, rental_pricing_type_used, rental_price_per_week_at_booking, rental_price_per_month_at_booking

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | rental_uid | renter_id | product_id | owner_id | start_date | end_date | actual_pickup_time | actual_return_time | rental_price_per_day_at_booking | security_deposit_at_booking | calculated_subtotal_rental_fee | delivery_fee | late_fee_calculated | platform_fee_renter | platform_fee_owner | total_amount_due | final_amount_paid | pickup_method | return_method | delivery_address_id | rental_status | payment_status | payment_proof_url | payment_verified_at | payment_verified_by_user_id | return_condition_status | notes_from_renter | notes_from_owner_on_return | cancelled_at | cancelled_by_user_id | cancellation_reason | created_at | updated_at | return_details | return_initiated_at | return_shipping_receipt_url | return_condition_image_urls | payment_verification_notes | delivery_status | tracking_number | carrier_code | security_deposit_refund_amount | rental_pricing_type_used | rental_price_per_week_at_booking | rental_price_per_month_at_booking |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 63 | a2588a27-fb67-4abc-a2e8-0d0f9b41f612 | 39 | 56 | 33 | 2025-08-22 | 2025-08-28 | NULL | NULL | 100 | 100 | 600 | 0 | NULL | 0 | 0 | 700 | 700 | self_pickup | self_return | NULL | confirmed | pending_verification | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-63-proof-1755778194655.jpg | NULL | NULL | not_yet_returned | NULL | NULL | NULL | NULL | NULL | 2025-08-21T12:09:15.857491+00:00 | 2025-08-21T12:09:55.246989+00:00 | NULL | NULL | NULL | NULL | NULL | pending | NULL | NULL | NULL | daily | NULL | NULL |
| 64 | 2154e564-44f5-4b36-a4d7-72e17e47349d | 40 | 56 | 33 | 2025-08-22 | 2025-08-28 | NULL | NULL | 100 | 100 | 600 | 0 | NULL | 0 | 0 | 700 | NULL | self_pickup | self_return | NULL | pending_owner_approval | unpaid | NULL | NULL | NULL | not_yet_returned | NULL | NULL | NULL | NULL | NULL | 2025-08-21T12:17:26.009192+00:00 | 2025-08-21T12:17:26.009192+00:00 | NULL | NULL | NULL | NULL | NULL | pending | NULL | NULL | NULL | daily | NULL | NULL |
| 61 | 9a6be832-182c-4bf8-8231-1a9fa7dd6152 | 39 | 56 | 33 | 2025-08-23 | 2025-08-26 | 2025-08-20T14:47:00+00:00 | 2025-08-21T03:47:00+00:00 | 100 | 100 | 300 | 0 | 0 | 0 | 0 | 400 | 400 | self_pickup | self_return | NULL | completed | paid | https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-61-proof-1755701182117.jpg | 2025-08-20T14:47:22.633+00:00 | 33 | as_rented | NULL | NULL | NULL | NULL | NULL | 2025-08-20T14:45:14.756008+00:00 | 2025-08-21T10:47:27.465453+00:00 | {"location":"Maha Sarakham University, 2202, Ban Kham Riang, Kham Riang, Kantharawichai, Maha Sarakham Province, 44150, Thailand","return_datetime":"2025-08-21T10:35:00.000Z"} | 2025-08-21T10:36:06.713+00:00 | NULL | ["https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/return-condition-images/public/rental-61-return-1755773246608-g614pm-rv068w_4_.jpg"] | NULL | delivered | NULL | NULL | NULL | daily | NULL | NULL |
| 62 | 01095462-6329-4499-829e-0f0b0779dedd | 43 | 57 | 33 | 2025-08-22 | 2025-08-28 | NULL | NULL | 1500 | 3500 | 9000 | 0 | NULL | 0 | 0 | 12500 | NULL | self_pickup | self_return | NULL | pending_payment | unpaid | NULL | NULL | NULL | not_yet_returned | NULL | NULL | NULL | NULL | NULL | 2025-08-21T09:57:35.378314+00:00 | 2025-08-21T10:48:01.369559+00:00 | NULL | NULL | NULL | NULL | NULL | pending | NULL | NULL | NULL | daily | NULL | NULL |
| 65 | a1b6703d-de08-4440-a534-ab39bfe8d464 | 40 | 56 | 33 | 2025-08-27 | 2025-08-30 | NULL | NULL | 100 | 100 | 300 | 0 | NULL | 0 | 0 | 400 | NULL | self_pickup | self_return | NULL | pending_owner_approval | unpaid | NULL | NULL | NULL | not_yet_returned | NULL | NULL | NULL | NULL | NULL | 2025-08-24T07:53:40.83603+00:00 | 2025-08-24T07:53:40.83603+00:00 | NULL | NULL | NULL | NULL | NULL | pending | NULL | NULL | NULL | daily | NULL | NULL |

---

## 9. ตาราง: rental_status_history

- **จำนวนแถวทั้งหมด:** 31 แถว
- **คอลัมน์:** id, rental_id, previous_status, new_status, changed_at, changed_by_user_id, changed_by_system, notes

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | rental_id | previous_status | new_status | changed_at | changed_by_user_id | changed_by_system | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 197 | 61 | NULL | pending_owner_approval | 2025-08-20T14:45:14.944212+00:00 | 39 | false | Rental request created. |
| 198 | 61 | pending_owner_approval | pending_payment | 2025-08-20T14:46:01.832341+00:00 | 33 | false | Rental approved by owner. |
| 199 | 61 | pending_payment | confirmed | 2025-08-20T14:46:23.711031+00:00 | 39 | false | Payment proof submitted. |
| 200 | 61 | confirmed | confirmed | 2025-08-20T14:47:23.439271+00:00 | 33 | false | Owner verified payment. |
| 201 | 61 | confirmed | confirmed | 2025-08-20T14:48:29.022458+00:00 | 39 | false | Renter set actual pickup time: Wed Aug 20 2025 21:47:00 GMT+0700 (Indochina Time) and marked as delivered |

---

## 10. ตาราง: reviews

- **จำนวนแถวทั้งหมด:** 6 แถว
- **คอลัมน์:** id, rental_id, renter_id, product_id, owner_id, rating_product, rating_owner, comment, is_hidden_by_admin, hidden_reason, created_at, updated_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | rental_id | renter_id | product_id | owner_id | rating_product | rating_owner | comment | is_hidden_by_admin | hidden_reason | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | 61 | 39 | 56 | 33 | 5 | 4 | Test review from API test | false | NULL | 2025-10-02T15:26:50.448231+00:00 | 2025-10-02T15:26:50.448231+00:00 |
| 12 | 75 | 39 | 56 | 33 | 5 | 4 | Test review from API test - New rental | false | NULL | 2025-10-02T15:30:06.393113+00:00 | 2025-10-02T15:30:06.393113+00:00 |
| 14 | 75 | 39 | 56 | 33 | 5 | 4 | Test review from API test - New rental | false | NULL | 2025-10-02T15:33:14.110452+00:00 | 2025-10-02T15:33:14.110452+00:00 |
| 15 | 75 | 39 | 56 | 33 | 5 | 4 | Test review from API test - New rental | false | NULL | 2025-10-02T15:34:45.064051+00:00 | 2025-10-02T15:34:45.064051+00:00 |
| 16 | 75 | 39 | 56 | 33 | 3 | 4 | Initial review: Good product and service. | false | NULL | 2025-10-02T15:44:40.380563+00:00 | 2025-10-02T15:44:40.380563+00:00 |

---

## 11. ตาราง: payout_methods

- **จำนวนแถวทั้งหมด:** 2 แถว
- **คอลัมน์:** id, owner_id, method_type, account_name, account_number, bank_name, is_primary, created_at, updated_at

### ข้อมูลตัวอย่าง (2 แถวแรก):

| id | owner_id | method_type | account_name | account_number | bank_name | is_primary | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6 | 33 | promptpay | สุทธิภัทร ชื่นบาน | 0972093740 |  | true | 2025-08-20T10:18:53.65031+00:00 | 2025-08-20T10:18:53.65031+00:00 |
| 7 | 33 | bank_account | สุทธิภัทร ชื่นบาน | 123456789 | GSB | false | 2025-08-20T10:19:17.252497+00:00 | 2025-08-20T10:19:17.252497+00:00 |

---

## 12. ตาราง: chat_conversations

- **จำนวนแถวทั้งหมด:** 6 แถว
- **คอลัมน์:** id, conversation_uid, participant1_id, participant2_id, related_product_id, related_rental_id, last_message_id, last_message_at, p1_unread_count, p2_unread_count, p1_archived_at, p2_archived_at, created_at, updated_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | conversation_uid | participant1_id | participant2_id | related_product_id | related_rental_id | last_message_id | last_message_at | p1_unread_count | p2_unread_count | p1_archived_at | p2_archived_at | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 28 | 06675071-0114-4df2-8c18-0adcf259a2ee | 33 | 36 | 57 | NULL | 172 | 2025-08-19T17:56:26.797709+00:00 | 1 | 0 | NULL | NULL | 2025-08-19T17:56:26.532821+00:00 | 2025-08-19T17:56:27.325088+00:00 |
| 33 | dbe62078-cd9c-48aa-900d-cec522144967 | 33 | 48 | 52 | 76 | 184 | 2025-10-02T16:33:05.561627+00:00 | 1 | 0 | NULL | NULL | 2025-10-02T16:33:05.508102+00:00 | 2025-10-02T16:33:17.944605+00:00 |
| 30 | 2e2cf3e1-b2a6-4503-a853-ba79d986166f | 33 | 43 | 56 | NULL | 181 | 2025-08-20T10:33:23.533516+00:00 | 0 | 0 | NULL | NULL | 2025-08-20T10:09:36.565489+00:00 | 2025-08-21T08:47:41.72373+00:00 |
| 29 | c1edf91a-8a2c-4610-9354-e12dd3e1cb3a | 39 | 40 | 58 | NULL | 177 | 2025-08-20T06:10:51.763497+00:00 | 2 | 0 | NULL | NULL | 2025-08-20T06:09:19.809288+00:00 | 2025-09-30T10:53:46.223752+00:00 |
| 31 | f2281e08-76f9-4494-ad92-425565da20d5 | 33 | 47 | 56 | NULL | 182 | 2025-10-02T13:57:28.435765+00:00 | 1 | 0 | NULL | NULL | 2025-10-02T13:57:28.370158+00:00 | 2025-10-02T13:57:28.511629+00:00 |

---

## 13. ตาราง: chat_messages

- **จำนวนแถวทั้งหมด:** 13 แถว
- **คอลัมน์:** id, message_uid, conversation_id, sender_id, message_type, message_content, attachment_url, attachment_metadata, sent_at, read_at, is_deleted_by_sender

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | message_uid | conversation_id | sender_id | message_type | message_content | attachment_url | attachment_metadata | sent_at | read_at | is_deleted_by_sender |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 172 | 505592f5-4232-4b68-8ac1-71175c72a98f | 28 | 36 | text | สวัสดีครับ/ค่ะ ผม/ดิฉันสนใจสินค้า ROG Strix G16 (2025) G614 ของคุณ
https://rent-ease-x.vercel.app/products/rog-strix-g16-2025-g614 | NULL | NULL | 2025-08-19T17:56:26.797709+00:00 | NULL | false |
| 173 | ab52e66a-f16f-4a73-a2fd-38e787b9b037 | 29 | 39 | text | สวัสดี เกี่ยวกับการเช่า ce8ecdd2-701c-48c7-829a-703b33b6d0a1 สำหรับสินค้า: กระดาษ a4 | NULL | NULL | 2025-08-20T06:09:20.087235+00:00 | 2025-08-20T06:09:34.758+00:00 | false |
| 175 | 82b6ceb5-263b-4837-bff8-3bd763ba1057 | 29 | 40 | text | พังยังไง | NULL | NULL | 2025-08-20T06:10:22.823992+00:00 | NULL | false |
| 174 | a16d3774-660c-4794-8c02-5af1beaf57db | 29 | 39 | text | พัง | NULL | NULL | 2025-08-20T06:10:02.518026+00:00 | 2025-08-20T06:10:25.298+00:00 | false |
| 177 | c669a1d9-2edd-4b27-9705-ef17a547cd0d | 29 | 40 | text | 😭😭 | NULL | NULL | 2025-08-20T06:10:51.763497+00:00 | NULL | false |

---

## 14. ตาราง: complaints

- **จำนวนแถวทั้งหมด:** 0 แถว
- **คอลัมน์:** 

### ข้อมูลตัวอย่าง: ไม่มีข้อมูล


---

## 15. ตาราง: complaint_attachments

- **จำนวนแถวทั้งหมด:** 0 แถว
- **คอลัมน์:** 

### ข้อมูลตัวอย่าง: ไม่มีข้อมูล


---

## 16. ตาราง: notifications

- **จำนวนแถวทั้งหมด:** 91 แถว
- **คอลัมน์:** id, user_id, type, title, message, link_url, related_entity_type, related_entity_id, related_entity_uid, is_read, read_at, created_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | user_id | type | title | message | link_url | related_entity_type | related_entity_id | related_entity_uid | is_read | read_at | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 308 | 39 | rental_requested | คุณได้รับคำขอเช่าใหม่ | มีคำขอเช่าสินค้า 'กระดาษ a4' จากผู้เช่าใหม่ กรุณาตรวจสอบและอนุมัติ | /owner/rentals/57 | rental | 57 | ce8ecdd2-701c-48c7-829a-703b33b6d0a1 | true | 2025-08-20T05:57:31.373+00:00 | 2025-08-20T05:57:01.344339+00:00 |
| 386 | 40 | rental_approved | คำขอเช่าของคุณได้รับการอนุมัติ | คำขอเช่าสินค้า กระดาษ a4 ได้รับการอนุมัติ | /rentals/71 | rental | 71 | e9f337f3-30ad-4832-ad00-d5e51f0e75a1 | true | 2025-10-02T16:24:49.458+00:00 | 2025-10-02T16:24:24.32401+00:00 |
| 379 | 33 | new_message | คุณมีข้อความใหม่ | สวัสดีครับ/ค่ะ ฉันสนใจเช่าสินค้า จักรยานเสือภูเขา KREATOR รุ่น KAPPA ล้อ26นิ้ว 21สปีด ของคุณ
https://rent-ease-x.vercel.app/products/kreator-kappa-26-21 | /chat/31 | chat_conversation | 31 | f2281e08-76f9-4494-ad92-425565da20d5 | true | 2025-10-02T16:29:55.625+00:00 | 2025-10-02T13:57:28.552239+00:00 |
| 310 | 39 | payment_proof_uploaded | ผู้เช่าอัปโหลดสลิปการชำระเงิน | ผู้เช่าสำหรับสินค้า 'กระดาษ a4' ได้อัปโหลดสลิปการชำระเงิน กรุณาตรวจสอบและยืนยันการชำระเงิน | /owner/rentals/57 | rental | 57 | ce8ecdd2-701c-48c7-829a-703b33b6d0a1 | true | 2025-08-20T06:00:06.839+00:00 | 2025-08-20T05:59:44.234648+00:00 |
| 309 | 40 | rental_approved | คำขอเช่าของคุณได้รับการอนุมัติ | คำขอเช่าสินค้า กระดาษ a4 ได้รับการอนุมัติ | /rentals/57 | rental | 57 | ce8ecdd2-701c-48c7-829a-703b33b6d0a1 | true | 2025-08-20T06:00:38.098+00:00 | 2025-08-20T05:59:00.444796+00:00 |

---

## 17. ตาราง: wishlist

- **จำนวนแถวทั้งหมด:** 3 แถว
- **คอลัมน์:** user_id, product_id, added_at

### ข้อมูลตัวอย่าง (3 แถวแรก):

| user_id | product_id | added_at |
| --- | --- | --- |
| 45 | 58 | 2025-10-01T15:23:25.984791+00:00 |
| 47 | 56 | 2025-10-02T13:57:26.5329+00:00 |
| 40 | 56 | 2025-10-02T15:08:41.363794+00:00 |

---

## 18. ตาราง: payment_transactions

- **จำนวนแถวทั้งหมด:** 14 แถว
- **คอลัมน์:** id, transaction_uid, rental_id, user_id, transaction_type, payment_method_name, payment_gateway_name, gateway_transaction_id, gateway_charge_id, amount, currency, status, payment_method_details, error_code_gateway, error_message_gateway, transaction_time, notes

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | transaction_uid | rental_id | user_id | transaction_type | payment_method_name | payment_gateway_name | gateway_transaction_id | gateway_charge_id | amount | currency | status | payment_method_details | error_code_gateway | error_message_gateway | transaction_time | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | af37a31c-270b-426a-ad97-1f88bb587ead | NULL | 40 | rental_payment | manual_bank_transfer | NULL | NULL | NULL | 91 | THB | pending | {"proof_url":"https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-57-proof-1755669582069.jpg","transaction_time":"2025-08-20T05:59:43.904Z"} | NULL | NULL | 2025-08-20T05:59:43.904+00:00 | NULL |
| 32 | 4efb58c1-e498-49cc-a723-9826dd0a3e5e | NULL | 40 | rental_payment | manual_bank_transfer | NULL | NULL | NULL | 91 | THB | pending | {"proof_url":"https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-57-proof-1755669661868.jpg","transaction_time":"2025-08-20T06:01:03.560Z"} | NULL | NULL | 2025-08-20T06:01:03.56+00:00 | NULL |
| 33 | 65de1db2-6cab-4d21-8881-9f983e22d815 | NULL | 40 | rental_payment | manual_bank_transfer | NULL | NULL | NULL | 91 | THB | pending | {"proof_url":"https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-57-proof-1755669789785.jpg","transaction_time":"2025-08-20T06:03:11.631Z"} | NULL | NULL | 2025-08-20T06:03:11.631+00:00 | NULL |
| 36 | 4c74466a-9ee4-4d1a-9217-ca18ced19195 | NULL | 43 | rental_payment | manual_bank_transfer | NULL | NULL | NULL | 1599 | THB | pending | {"proof_url":"https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-59-proof-1755685708726.png","transaction_time":"2025-08-20T10:28:30.720Z"} | NULL | NULL | 2025-08-20T10:28:30.72+00:00 | NULL |
| 34 | c8727990-9cf5-4931-a1a3-9740617442e8 | NULL | 43 | rental_payment | manual_bank_transfer | NULL | NULL | NULL | 400 | THB | pending | {"proof_url":"https://xjoumitfgcpjanwagvgk.supabase.co/storage/v1/object/public/payment-proofs/public/rental-58-proof-1755685211834.jpg","transaction_time":"2025-08-20T10:20:13.689Z"} | NULL | NULL | 2025-08-20T10:20:13.689+00:00 | NULL |

---

## 19. ตาราง: admin_logs

- **จำนวนแถวทั้งหมด:** 39 แถว
- **คอลัมน์:** id, admin_user_id, action_type, target_entity_type, target_entity_id, target_entity_uid, details, ip_address, user_agent, created_at

### ข้อมูลตัวอย่าง (5 แถวแรก):

| id | admin_user_id | action_type | target_entity_type | target_entity_id | target_entity_uid | details | ip_address | user_agent | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | 8 | USER_VERIFICATION_UPDATE | User | 33 | NULL | {"updated_fields":["id_verification_status","id_verified_at","id_verified_by_admin_id"],"new_values":{"id_verification_status":"verified","id_verified_at":"2025-08-19T15:59:13.522Z","id_verified_by_admin_id":1}} | 202.28.35.188 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0 | 2025-08-19T15:59:14.476+00:00 |
| 26 | 8 | USER_VERIFICATION_UPDATE | User | 39 | NULL | {"updated_fields":["id_verification_status","id_verified_at","id_verified_by_admin_id"],"new_values":{"id_verification_status":"rejected","id_verified_at":"2025-08-20T05:38:14.518Z","id_verified_by_admin_id":1}} | 202.28.35.187 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 | 2025-08-20T05:38:16.037+00:00 |
| 27 | 8 | USER_VERIFICATION_UPDATE | User | 39 | NULL | {"updated_fields":["id_verification_status","id_verified_at","id_verified_by_admin_id"],"new_values":{"id_verification_status":"verified","id_verified_at":"2025-08-20T05:40:22.686Z","id_verified_by_admin_id":1}} | 202.28.35.187 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 | 2025-08-20T05:40:23.659+00:00 |
| 28 | 8 | USER_BAN | User | 39 | NULL | {"action":"User banned","reason":"Admin action"} | 202.28.35.187 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 | 2025-08-20T05:40:45.986+00:00 |
| 29 | 8 | USER_UNBAN | User | 39 | NULL | {"action":"User unbanned","reason":"Admin action"} | 202.28.35.187 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 | 2025-08-20T05:41:33.817+00:00 |

---

## 20. ตาราง: system_settings

- **จำนวนแถวทั้งหมด:** 11 แถว
- **คอลัมน์:** setting_key, setting_value, description, data_type, is_publicly_readable, is_encrypted, validation_rules, created_at, updated_at, updated_by_admin_id

### ข้อมูลตัวอย่าง (5 แถวแรก):

| setting_key | setting_value | description | data_type | is_publicly_readable | is_encrypted | validation_rules | created_at | updated_at | updated_by_admin_id |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| delivery_buffer_days | 1 | จำนวนวัน buffer สำหรับการส่งสินค้า | integer | true | false | min:0,max:7 | 2025-08-20T15:26:19.767744+00:00 | 2025-08-21T10:57:09.49517+00:00 | NULL |
| return_buffer_days | 1 | จำนวนวัน buffer สำหรับการคืนสินค้า | integer | true | false | min:0,max:7 | 2025-08-20T15:26:19.767744+00:00 | 2025-08-21T10:57:09.620878+00:00 | NULL |
| platform_fee_rate | 0 | อัตราค่าธรรมเนียมแพลตฟอร์ม (0% - ไม่มีค่าธรรมเนียม) | float | false | false | NULL | 2025-08-17T09:38:29.796941+00:00 | 2025-10-01T15:56:57.403837+00:00 | 8 |
| platform_fee_percentage | 0.0 | อัตราค่าธรรมเนียมแพลตฟอร์มสำหรับผู้เช่า (0% - ไม่มีค่าธรรมเนียม) | float | true | false | NULL | 2025-08-17T09:38:29.796941+00:00 | 2025-08-17T09:38:29.796941+00:00 | NULL |
| platform_fee_owner_percentage | 0.0 | อัตราค่าธรรมเนียมแพลตฟอร์มสำหรับเจ้าของสินค้า (0% - ไม่มีค่าธรรมเนียม) | float | true | false | NULL | 2025-08-17T09:38:29.796941+00:00 | 2025-08-17T09:38:29.796941+00:00 | NULL |

---

