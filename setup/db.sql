-- เปิดใช้งานส่วนขยาย UUID หากยังไม่ได้เปิด (Supabase มักจะมีสิ่งนี้)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ฟังก์ชัน Trigger ทั่วไปสำหรับ updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------
-- Table: provinces
-- ---------------------------------
CREATE TABLE provinces (
    id BIGSERIAL PRIMARY KEY,
    name_th VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(100) UNIQUE,
    region_id BIGINT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE provinces IS 'ตารางเก็บข้อมูลจังหวัด';

CREATE TRIGGER set_timestamp_provinces
BEFORE UPDATE ON provinces
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- ENUM Types for users table (ประเภทข้อมูล Enum สำหรับตาราง users)
-- ---------------------------------
CREATE TYPE user_id_document_type_enum AS ENUM('national_id', 'passport', 'other');
CREATE TYPE user_id_verification_status_enum AS ENUM('not_submitted', 'pending', 'verified', 'rejected', 'resubmit_required');

-- ---------------------------------
-- Table: users
-- ---------------------------------
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    phone_verified_at TIMESTAMPTZ NULL,
    email_verified_at TIMESTAMPTZ NULL,
    address_line1 VARCHAR(255) NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    province_id BIGINT NULL,
    postal_code VARCHAR(10) NULL,
    profile_picture_url VARCHAR(255) NULL,
    id_document_type user_id_document_type_enum NULL,
    id_document_number VARCHAR(50) NULL,
    id_document_url VARCHAR(255) NULL,
    id_document_back_url VARCHAR(255) NULL,
    id_selfie_url VARCHAR(255) NULL,
    id_verification_status user_id_verification_status_enum DEFAULT 'not_submitted',
    id_verification_notes TEXT NULL,
    id_verified_at TIMESTAMPTZ NULL,
    id_verified_by_admin_id BIGINT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ NULL,
    registration_ip VARCHAR(45) NULL,
    google_id VARCHAR(255) UNIQUE,
    email_verification_token VARCHAR(100) UNIQUE,
    email_verification_token_expires_at TIMESTAMPTZ NULL,
    preferences JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT fk_users_province FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE SET NULL,
    CONSTRAINT fk_users_verified_by_admin FOREIGN KEY (id_verified_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE users IS 'ตารางเก็บข้อมูลผู้ใช้งานระบบ';

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_google_id ON users(google_id);

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- Table: admin_users
-- ---------------------------------
CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    granted_by_admin_id BIGINT NULL,
    permissions JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_users_granted_by FOREIGN KEY (granted_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
);
COMMENT ON TABLE admin_users IS 'ตารางเก็บข้อมูลผู้ดูแลระบบ';

CREATE TRIGGER set_timestamp_admin_users
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- Table: categories
-- ---------------------------------
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NULL,
    parent_id BIGINT NULL,
    icon_url VARCHAR(255) NULL,
    image_url VARCHAR(255) NULL,
    sort_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);
COMMENT ON TABLE categories IS 'ตารางหมวดหมู่สินค้า';

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- ENUM Types for products table (ประเภทข้อมูล Enum สำหรับตาราง products)
-- ---------------------------------
CREATE TYPE product_availability_status_enum AS ENUM('available', 'rented_out', 'unavailable', 'pending_approval', 'rejected', 'hidden', 'draft');
CREATE TYPE product_admin_approval_status_enum AS ENUM('pending', 'approved', 'rejected');

-- ---------------------------------
-- Table: products
-- ---------------------------------
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    province_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(270) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    specifications JSONB NULL,
    rental_price_per_day DECIMAL(12, 2) NOT NULL,
    rental_price_per_week DECIMAL(12, 2) NULL,
    rental_price_per_month DECIMAL(12, 2) NULL,
    security_deposit DECIMAL(12, 2) DEFAULT 0.00,
    quantity INT DEFAULT 1,
    quantity_available INT DEFAULT 1,
    availability_status product_availability_status_enum DEFAULT 'draft',
    min_rental_duration_days INT DEFAULT 1,
    max_rental_duration_days INT NULL,
    address_details VARCHAR(255) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    condition_notes TEXT NULL,
    view_count INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    admin_approval_status product_admin_approval_status_enum DEFAULT 'approved',
    admin_approval_notes TEXT NULL,
    approved_by_admin_id BIGINT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMPTZ NULL,
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT fk_products_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_products_province FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE RESTRICT,
    CONSTRAINT fk_products_approved_by_admin FOREIGN KEY (approved_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
);
COMMENT ON TABLE products IS 'ตารางสินค้าให้เช่า';

CREATE INDEX idx_products_owner_id ON products(owner_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_province_id ON products(province_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_availability_status ON products(availability_status);
CREATE INDEX idx_products_admin_approval_status ON products(admin_approval_status);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);

CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- Table: product_images
-- ---------------------------------
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
COMMENT ON TABLE product_images IS 'ตารางรูปภาพสินค้า (หลายรูปต่อสินค้า)';
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- ---------------------------------
-- ENUM Types for user_addresses table (ประเภทข้อมูล Enum สำหรับตาราง user_addresses)
-- ---------------------------------
CREATE TYPE user_address_type_enum AS ENUM('shipping', 'billing', 'other');

-- ---------------------------------
-- Table: user_addresses
-- ---------------------------------
CREATE TABLE user_addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    address_type user_address_type_enum DEFAULT 'shipping',
    recipient_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) NULL,
    sub_district VARCHAR(100) NULL,
    district VARCHAR(100) NOT NULL,
    province_id BIGINT NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_addresses_province FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE RESTRICT
);
COMMENT ON TABLE user_addresses IS 'ตารางที่อยู่สำหรับจัดส่งของผู้ใช้';

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);

CREATE TRIGGER set_timestamp_user_addresses
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- ENUM Types for rentals table (ประเภทข้อมูล Enum สำหรับตาราง rentals)
-- ---------------------------------
CREATE TYPE rental_pickup_method_enum AS ENUM('self_pickup', 'delivery');
CREATE TYPE rental_return_method_enum AS ENUM('self_return', 'owner_pickup');
CREATE TYPE rental_status_enum AS ENUM(
    'pending_owner_approval',
    'pending_payment',
    'confirmed',
    'active',
    'return_pending',
    'completed',
    'cancelled_by_renter',
    'cancelled_by_owner',
    'rejected_by_owner',
    'dispute',
    'expired',
    'late_return'
);
CREATE TYPE rental_payment_status_enum AS ENUM('unpaid', 'pending_verification', 'paid', 'failed', 'refund_pending', 'refunded', 'partially_refunded');
CREATE TYPE rental_return_condition_status_enum AS ENUM('as_rented', 'minor_wear', 'damaged', 'lost', 'not_yet_returned');

-- ---------------------------------
-- Table: rentals
-- ---------------------------------
CREATE TABLE rentals (
    id BIGSERIAL PRIMARY KEY,
    rental_uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    renter_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_pickup_time TIMESTAMPTZ NULL,
    actual_return_time TIMESTAMPTZ NULL,
    rental_price_per_day_at_booking DECIMAL(12, 2) NOT NULL,
    security_deposit_at_booking DECIMAL(12, 2) NOT NULL,
    calculated_subtotal_rental_fee DECIMAL(12, 2) NOT NULL,
    delivery_fee DECIMAL(12, 2) DEFAULT 0.00,
    late_fee_calculated DECIMAL(12, 2) NULL,
    platform_fee_renter DECIMAL(12, 2) DEFAULT 0.00,
    platform_fee_owner DECIMAL(12, 2) DEFAULT 0.00,
    total_amount_due DECIMAL(12, 2) NOT NULL,
    final_amount_paid DECIMAL(12, 2) NULL,
    pickup_method rental_pickup_method_enum NOT NULL,
    return_method rental_return_method_enum NOT NULL,
    delivery_address_id BIGINT NULL,
    rental_status rental_status_enum NOT NULL,
    payment_status rental_payment_status_enum DEFAULT 'unpaid',
    payment_proof_url VARCHAR(255) NULL,
    payment_verified_at TIMESTAMPTZ NULL,
    payment_verified_by_user_id BIGINT NULL,
    return_condition_status rental_return_condition_status_enum DEFAULT 'not_yet_returned',
    notes_from_renter TEXT NULL,
    notes_from_owner_on_return TEXT NULL,
    cancelled_at TIMESTAMPTZ NULL,
    cancelled_by_user_id BIGINT NULL,
    cancellation_reason TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    return_details JSONB NULL,
    return_initiated_at TIMESTAMPTZ NULL,
    return_shipping_receipt_url TEXT NULL,
    return_condition_image_urls TEXT[] NULL,
    payment_verification_notes TEXT NULL,
    delivery_status VARCHAR(50) DEFAULT 'pending',
    tracking_number VARCHAR(100),
    carrier_code VARCHAR(50),
    security_deposit_refund_amount DECIMAL(12, 2) NULL,
    CONSTRAINT fk_rentals_renter FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_rentals_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_rentals_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_rentals_delivery_address FOREIGN KEY (delivery_address_id) REFERENCES user_addresses(id) ON DELETE SET NULL,
    CONSTRAINT fk_rentals_payment_verified_by FOREIGN KEY (payment_verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_rentals_cancelled_by FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
COMMENT ON TABLE rentals IS 'ตารางข้อมูลการเช่าสินค้า';

CREATE INDEX idx_rentals_renter_id ON rentals(renter_id);
CREATE INDEX idx_rentals_product_id ON rentals(product_id);
CREATE INDEX idx_rentals_owner_id ON rentals(owner_id);
CREATE INDEX idx_rentals_start_date ON rentals(start_date);
CREATE INDEX idx_rentals_end_date ON rentals(end_date);
CREATE INDEX idx_rentals_status ON rentals(rental_status);
CREATE INDEX idx_rentals_payment_status ON rentals(payment_status);

CREATE TRIGGER set_timestamp_rentals
BEFORE UPDATE ON rentals
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- Table: rental_status_history
-- ---------------------------------
CREATE TABLE rental_status_history (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL,
    previous_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id BIGINT NULL,
    changed_by_system BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    CONSTRAINT fk_rental_status_history_rental FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
    CONSTRAINT fk_rental_status_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
COMMENT ON TABLE rental_status_history IS 'ตารางประวัติการเปลี่ยนแปลงสถานะการเช่า';

CREATE INDEX idx_rental_status_history_rental_id ON rental_status_history(rental_id);

-- ---------------------------------
-- Table: reviews
-- ---------------------------------
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL UNIQUE,
    renter_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    rating_product SMALLINT NOT NULL CHECK (rating_product BETWEEN 1 AND 5),
    rating_owner SMALLINT NOT NULL CHECK (rating_owner BETWEEN 1 AND 5),
    comment TEXT NULL,
    is_hidden_by_admin BOOLEAN DEFAULT FALSE,
    hidden_reason TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_rental FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_renter FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
COMMENT ON TABLE reviews IS 'ตารางรีวิวสินค้าและผู้ให้เช่า';

CREATE INDEX idx_reviews_renter_id ON reviews(renter_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_owner_id ON reviews(owner_id);

CREATE TRIGGER set_timestamp_reviews
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- ENUM Types for payout_methods table (ประเภทข้อมูล Enum สำหรับตาราง payout_methods)
-- ---------------------------------
CREATE TYPE payout_method_type_enum AS ENUM('bank_account', 'promptpay');

-- ---------------------------------
-- Table: payout_methods
-- ---------------------------------
CREATE TABLE payout_methods (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    method_type payout_method_type_enum NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payout_methods_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
COMMENT ON TABLE payout_methods IS 'ตารางช่องทางการรับเงินของผู้ให้เช่า';

CREATE INDEX idx_payout_methods_owner_id ON payout_methods(owner_id);

CREATE TRIGGER set_timestamp_payout_methods
BEFORE UPDATE ON payout_methods
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- Table: chat_conversations
-- ---------------------------------
CREATE TABLE chat_conversations (
    id BIGSERIAL PRIMARY KEY,
    conversation_uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    participant1_id BIGINT NOT NULL,
    participant2_id BIGINT NOT NULL,
    related_product_id BIGINT NULL,
    related_rental_id BIGINT NULL,
    last_message_id BIGINT NULL,
    last_message_at TIMESTAMPTZ NULL,
    p1_unread_count INT DEFAULT 0,
    p2_unread_count INT DEFAULT 0,
    p1_archived_at TIMESTAMPTZ NULL,
    p2_archived_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_conversations_p1 FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_conversations_p2 FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_conversations_product FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE SET NULL,
    CONSTRAINT fk_chat_conversations_rental FOREIGN KEY (related_rental_id) REFERENCES rentals(id) ON DELETE SET NULL,
    CONSTRAINT fk_chat_conversations_last_message FOREIGN KEY (last_message_id) REFERENCES chat_messages(id) ON DELETE SET NULL
);
COMMENT ON TABLE chat_conversations IS 'ตารางห้องสนทนา (ระหว่างผู้ใช้ 2 คน)';

CREATE INDEX idx_chat_conversations_p1_p2 ON chat_conversations(participant1_id, participant2_id);
CREATE INDEX idx_chat_conversations_last_msg_at ON chat_conversations(last_message_at DESC);

CREATE TRIGGER set_timestamp_chat_conversations
BEFORE UPDATE ON chat_conversations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- ENUM Types for chat_messages table (ประเภทข้อมูล Enum สำหรับตาราง chat_messages)
-- ---------------------------------
CREATE TYPE chat_message_type_enum AS ENUM('text', 'image', 'file', 'system_event', 'rental_offer');

-- ---------------------------------
-- Table: chat_messages
-- ---------------------------------
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    message_uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message_type chat_message_type_enum DEFAULT 'text',
    message_content TEXT NULL,
    attachment_url VARCHAR(255) NULL,
    attachment_metadata JSONB NULL,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ NULL,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_chat_messages_conversation FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
COMMENT ON TABLE chat_messages IS 'ตารางข้อความในห้องสนทนา';

CREATE INDEX idx_chat_messages_conversation_id_sent_at ON chat_messages(conversation_id, sent_at DESC);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);

-- ---------------------------------
-- ENUM Types for complaints table (ประเภทข้อมูล Enum สำหรับตาราง complaints)
-- ---------------------------------
CREATE TYPE complaint_status_enum AS ENUM('submitted', 'under_review', 'awaiting_user_response', 'investigating', 'resolved', 'closed_no_action', 'closed_escalated_to_claim');
CREATE TYPE complaint_priority_enum AS ENUM('low', 'medium', 'high', 'critical');

-- ---------------------------------
-- Table: complaints
-- ---------------------------------
CREATE TABLE complaints (
    id BIGSERIAL PRIMARY KEY,
    complaint_uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    complainant_id BIGINT NOT NULL,
    subject_user_id BIGINT NULL,
    related_rental_id BIGINT NULL,
    related_product_id BIGINT NULL,
    complaint_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    status complaint_status_enum DEFAULT 'submitted',
    admin_notes TEXT NULL,
    resolution_notes TEXT NULL,
    admin_handler_id BIGINT NULL,
    priority complaint_priority_enum DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ NULL,
    closed_at TIMESTAMPTZ NULL,
    CONSTRAINT fk_complaints_complainant FOREIGN KEY (complainant_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaints_subject_user FOREIGN KEY (subject_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_rental FOREIGN KEY (related_rental_id) REFERENCES rentals(id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_product FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_admin_handler FOREIGN KEY (admin_handler_id) REFERENCES users(id) ON DELETE SET NULL
);
COMMENT ON TABLE complaints IS 'ตารางการร้องเรียนปัญหาทั่วไปในระบบ';

CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_complainant_id ON complaints(complainant_id);
CREATE INDEX idx_complaints_admin_handler_id ON complaints(admin_handler_id);

CREATE TRIGGER set_timestamp_complaints
BEFORE UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ---------------------------------
-- Table: complaint_attachments
-- ---------------------------------
CREATE TABLE complaint_attachments (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    uploaded_by_id BIGINT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NULL,
    description VARCHAR(255) NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaint_attachments_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_attachments_uploaded_by FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE RESTRICT
);
COMMENT ON TABLE complaint_attachments IS 'ตารางไฟล์แนบสำหรับการร้องเรียน';

CREATE INDEX idx_complaint_attachments_complaint_id ON complaint_attachments(complaint_id);

-- ---------------------------------
-- Table: notifications
-- ---------------------------------
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(255) NULL,
    related_entity_type VARCHAR(50) NULL,
    related_entity_id BIGINT NULL,
    related_entity_uid UUID NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
COMMENT ON TABLE notifications IS 'ตารางการแจ้งเตือนต่างๆ ในระบบสำหรับผู้ใช้';

CREATE INDEX idx_notifications_user_id_read_created ON notifications(user_id, is_read, created_at DESC);

-- ---------------------------------
-- Table: wishlist
-- ---------------------------------
CREATE TABLE wishlist (
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
COMMENT ON TABLE wishlist IS 'ตารางรายการสินค้าโปรดของผู้ใช้';

-- ---------------------------------
-- ENUM Types for payment_transactions table (ประเภทข้อมูล Enum สำหรับตาราง payment_transactions)
-- ---------------------------------
CREATE TYPE payment_transaction_type_enum AS ENUM(
    'rental_payment',
    'deposit_refund',
    'rental_fee_payout',
    'platform_fee',
    'late_fee_payment',
    'claim_settlement_to_owner',
    'claim_settlement_from_renter',
    'other_credit',
    'other_debit'
);
CREATE TYPE payment_transaction_status_enum AS ENUM('pending', 'successful', 'failed', 'cancelled', 'disputed', 'requires_action', 'refunded_full', 'refunded_partial');

-- ---------------------------------
-- Table: payment_transactions
-- ---------------------------------
CREATE TABLE payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    rental_id BIGINT NULL,
    user_id BIGINT NOT NULL,
    transaction_type payment_transaction_type_enum NOT NULL,
    payment_method_name VARCHAR(100) NULL,
    payment_gateway_name VARCHAR(50) NULL,
    gateway_transaction_id VARCHAR(255) NULL,
    gateway_charge_id VARCHAR(255) NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'THB',
    status payment_transaction_status_enum NOT NULL,
    payment_method_details JSONB NULL,
    error_code_gateway VARCHAR(100) NULL,
    error_message_gateway TEXT NULL,
    transaction_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    CONSTRAINT fk_payment_transactions_rental FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);
COMMENT ON TABLE payment_transactions IS 'ตารางบันทึกธุรกรรมการชำระเงินและ Payout';

CREATE INDEX idx_payment_transactions_rental_id ON payment_transactions(rental_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_gateway_txn_id ON payment_transactions(gateway_transaction_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- ---------------------------------
-- Table: admin_logs
-- ---------------------------------
CREATE TABLE admin_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_entity_type VARCHAR(50) NULL,
    target_entity_id BIGINT NULL,
    target_entity_uid UUID NULL,
    details JSONB NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_logs_admin FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE RESTRICT
);
COMMENT ON TABLE admin_logs IS 'ตารางบันทึกการกระทำของผู้ดูแลระบบ';

-- ---------------------------------
-- ENUM Types for system_settings table (ประเภทข้อมูล Enum สำหรับตาราง system_settings)
-- ---------------------------------
CREATE TYPE system_settings_data_type_enum AS ENUM('string', 'integer', 'float', 'boolean', 'json', 'text');

-- ---------------------------------
-- Table: system_settings
-- ---------------------------------
CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description VARCHAR(255) NULL,
    data_type system_settings_data_type_enum DEFAULT 'string',
    is_publicly_readable BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    validation_rules VARCHAR(255) NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by_admin_id BIGINT NULL,
    CONSTRAINT fk_system_settings_admin FOREIGN KEY (updated_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
);
COMMENT ON TABLE system_settings IS 'ตารางการตั้งค่าต่างๆ ของระบบ';

CREATE TRIGGER set_timestamp_system_settings
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ========================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
-- ========================================

-- Disable RLS for all tables
ALTER TABLE provinces DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE rentals DISABLE ROW LEVEL SECURITY;
ALTER TABLE rental_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE payout_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
