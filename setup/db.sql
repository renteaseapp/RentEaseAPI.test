-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_logs (
  id bigint NOT NULL DEFAULT nextval('admin_logs_id_seq'::regclass),
  admin_user_id bigint NOT NULL,
  action_type character varying NOT NULL,
  target_entity_type character varying,
  target_entity_id bigint,
  target_entity_uid uuid,
  details jsonb,
  ip_address character varying,
  user_agent text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT admin_logs_pkey PRIMARY KEY (id),
  CONSTRAINT fk_admin_logs_admin FOREIGN KEY (admin_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.admin_users (
  id bigint NOT NULL DEFAULT nextval('admin_users_id_seq'::regclass),
  user_id bigint NOT NULL UNIQUE,
  granted_by_admin_id bigint,
  permissions jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT fk_admin_users_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_admin_users_granted_by FOREIGN KEY (granted_by_admin_id) REFERENCES public.users(id)
);
CREATE TABLE public.categories (
  id bigint NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  name character varying NOT NULL,
  name_en character varying,
  slug character varying NOT NULL UNIQUE,
  description text,
  parent_id bigint,
  icon_url character varying,
  image_url character varying,
  sort_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);
CREATE TABLE public.chat_conversations (
  id bigint NOT NULL DEFAULT nextval('chat_conversations_id_seq'::regclass),
  conversation_uid uuid NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  participant1_id bigint NOT NULL,
  participant2_id bigint NOT NULL,
  related_product_id bigint,
  related_rental_id bigint,
  last_message_id bigint,
  last_message_at timestamp with time zone,
  p1_unread_count integer DEFAULT 0,
  p2_unread_count integer DEFAULT 0,
  p1_archived_at timestamp with time zone,
  p2_archived_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chat_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT fk_chat_conversations_p1 FOREIGN KEY (participant1_id) REFERENCES public.users(id),
  CONSTRAINT fk_chat_conversations_last_message FOREIGN KEY (last_message_id) REFERENCES public.chat_messages(id),
  CONSTRAINT fk_chat_conversations_product FOREIGN KEY (related_product_id) REFERENCES public.products(id),
  CONSTRAINT fk_chat_conversations_p2 FOREIGN KEY (participant2_id) REFERENCES public.users(id),
  CONSTRAINT fk_chat_conversations_rental FOREIGN KEY (related_rental_id) REFERENCES public.rentals(id)
);
CREATE TABLE public.chat_messages (
  id bigint NOT NULL DEFAULT nextval('chat_messages_id_seq'::regclass),
  message_uid uuid NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  conversation_id bigint NOT NULL,
  sender_id bigint NOT NULL,
  message_type USER-DEFINED DEFAULT 'text'::chat_message_type_enum,
  message_content text,
  attachment_url character varying,
  attachment_metadata jsonb,
  sent_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  read_at timestamp with time zone,
  is_deleted_by_sender boolean DEFAULT false,
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT fk_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT fk_chat_messages_conversation FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id)
);
CREATE TABLE public.complaint_attachments (
  id bigint NOT NULL DEFAULT nextval('complaint_attachments_id_seq'::regclass),
  complaint_id bigint NOT NULL,
  uploaded_by_id bigint NOT NULL,
  file_url character varying NOT NULL,
  file_type character varying,
  description character varying,
  uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT complaint_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_complaint_attachments_complaint FOREIGN KEY (complaint_id) REFERENCES public.complaints(id),
  CONSTRAINT fk_complaint_attachments_uploaded_by FOREIGN KEY (uploaded_by_id) REFERENCES public.users(id)
);
CREATE TABLE public.complaints (
  id bigint NOT NULL DEFAULT nextval('complaints_id_seq'::regclass),
  complaint_uid uuid NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  complainant_id bigint NOT NULL,
  subject_user_id bigint,
  related_rental_id bigint,
  related_product_id bigint,
  complaint_type character varying NOT NULL,
  title character varying NOT NULL,
  details text NOT NULL,
  status USER-DEFINED DEFAULT 'submitted'::complaint_status_enum,
  admin_notes text,
  resolution_notes text,
  admin_handler_id bigint,
  priority USER-DEFINED DEFAULT 'medium'::complaint_priority_enum,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  resolved_at timestamp with time zone,
  closed_at timestamp with time zone,
  CONSTRAINT complaints_pkey PRIMARY KEY (id),
  CONSTRAINT fk_complaints_product FOREIGN KEY (related_product_id) REFERENCES public.products(id),
  CONSTRAINT fk_complaints_admin_handler FOREIGN KEY (admin_handler_id) REFERENCES public.users(id),
  CONSTRAINT fk_complaints_complainant FOREIGN KEY (complainant_id) REFERENCES public.users(id),
  CONSTRAINT fk_complaints_rental FOREIGN KEY (related_rental_id) REFERENCES public.rentals(id),
  CONSTRAINT fk_complaints_subject_user FOREIGN KEY (subject_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id bigint NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  user_id bigint NOT NULL,
  type character varying NOT NULL,
  title character varying,
  message text NOT NULL,
  link_url character varying,
  related_entity_type character varying,
  related_entity_id bigint,
  related_entity_uid uuid,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.payment_transactions (
  id bigint NOT NULL DEFAULT nextval('payment_transactions_id_seq'::regclass),
  transaction_uid uuid NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  rental_id bigint,
  user_id bigint NOT NULL,
  transaction_type USER-DEFINED NOT NULL,
  payment_method_name character varying,
  payment_gateway_name character varying,
  gateway_transaction_id character varying,
  gateway_charge_id character varying,
  amount numeric NOT NULL,
  currency character varying NOT NULL DEFAULT 'THB'::character varying,
  status USER-DEFINED NOT NULL,
  payment_method_details jsonb,
  error_code_gateway character varying,
  error_message_gateway text,
  transaction_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  notes text,
  CONSTRAINT payment_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT fk_payment_transactions_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_payment_transactions_rental FOREIGN KEY (rental_id) REFERENCES public.rentals(id)
);
CREATE TABLE public.payout_methods (
  id bigint NOT NULL DEFAULT nextval('payout_methods_id_seq'::regclass),
  owner_id bigint NOT NULL,
  method_type USER-DEFINED NOT NULL,
  account_name character varying NOT NULL,
  account_number character varying NOT NULL,
  bank_name character varying,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payout_methods_pkey PRIMARY KEY (id),
  CONSTRAINT fk_payout_methods_owner FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.product_images (
  id bigint NOT NULL DEFAULT nextval('product_images_id_seq'::regclass),
  product_id bigint NOT NULL,
  image_url character varying NOT NULL,
  alt_text character varying,
  is_primary boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
  id bigint NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  owner_id bigint NOT NULL,
  category_id bigint NOT NULL,
  province_id bigint NOT NULL,
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text NOT NULL,
  specifications jsonb,
  rental_price_per_day numeric NOT NULL,
  rental_price_per_week numeric,
  rental_price_per_month numeric,
  security_deposit numeric DEFAULT 0.00,
  quantity integer DEFAULT 1,
  quantity_available integer DEFAULT 1,
  availability_status USER-DEFINED DEFAULT 'draft'::product_availability_status_enum,
  min_rental_duration_days integer DEFAULT 1,
  max_rental_duration_days integer,
  address_details character varying,
  latitude numeric,
  longitude numeric,
  condition_notes text,
  view_count integer DEFAULT 0,
  average_rating numeric DEFAULT 0.00,
  total_reviews integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  admin_approval_status USER-DEFINED DEFAULT 'approved'::product_admin_approval_status_enum,
  admin_approval_notes text,
  approved_by_admin_id bigint,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  published_at timestamp with time zone,
  deleted_at timestamp with time zone,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT fk_products_province FOREIGN KEY (province_id) REFERENCES public.provinces(id),
  CONSTRAINT fk_products_owner FOREIGN KEY (owner_id) REFERENCES public.users(id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT fk_products_approved_by_admin FOREIGN KEY (approved_by_admin_id) REFERENCES public.users(id)
);
CREATE TABLE public.provinces (
  id bigint NOT NULL DEFAULT nextval('provinces_id_seq'::regclass),
  name_th character varying NOT NULL UNIQUE,
  name_en character varying UNIQUE,
  region_id bigint,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT provinces_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rental_status_history (
  id bigint NOT NULL DEFAULT nextval('rental_status_history_id_seq'::regclass),
  rental_id bigint NOT NULL,
  previous_status character varying,
  new_status character varying NOT NULL,
  changed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  changed_by_user_id bigint,
  changed_by_system boolean DEFAULT false,
  notes text,
  CONSTRAINT rental_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rental_status_history_user FOREIGN KEY (changed_by_user_id) REFERENCES public.users(id),
  CONSTRAINT fk_rental_status_history_rental FOREIGN KEY (rental_id) REFERENCES public.rentals(id)
);
CREATE TABLE public.rentals (
  id bigint NOT NULL DEFAULT nextval('rentals_id_seq'::regclass),
  rental_uid uuid NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  renter_id bigint NOT NULL,
  product_id bigint NOT NULL,
  owner_id bigint NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  actual_pickup_time timestamp with time zone,
  actual_return_time timestamp with time zone,
  rental_price_per_day_at_booking numeric NOT NULL,
  security_deposit_at_booking numeric NOT NULL,
  calculated_subtotal_rental_fee numeric NOT NULL,
  delivery_fee numeric DEFAULT 0.00,
  late_fee_calculated numeric,
  platform_fee_renter numeric DEFAULT 0.00,
  platform_fee_owner numeric DEFAULT 0.00,
  total_amount_due numeric NOT NULL,
  final_amount_paid numeric,
  pickup_method USER-DEFINED NOT NULL,
  return_method USER-DEFINED NOT NULL,
  delivery_address_id bigint,
  rental_status USER-DEFINED NOT NULL,
  payment_status USER-DEFINED DEFAULT 'unpaid'::rental_payment_status_enum,
  payment_proof_url character varying,
  payment_verified_at timestamp with time zone,
  payment_verified_by_user_id bigint,
  return_condition_status USER-DEFINED DEFAULT 'not_yet_returned'::rental_return_condition_status_enum,
  notes_from_renter text,
  notes_from_owner_on_return text,
  cancelled_at timestamp with time zone,
  cancelled_by_user_id bigint,
  cancellation_reason text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  return_details jsonb,
  return_initiated_at timestamp with time zone,
  return_shipping_receipt_url text,
  return_condition_image_urls ARRAY,
  payment_verification_notes text,
  delivery_status character varying DEFAULT 'pending'::character varying,
  tracking_number character varying,
  carrier_code character varying,
  security_deposit_refund_amount numeric,
  rental_pricing_type_used USER-DEFINED NOT NULL DEFAULT 'daily'::rental_pricing_type_enum,
  rental_price_per_week_at_booking numeric,
  rental_price_per_month_at_booking numeric,
  CONSTRAINT rentals_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rentals_owner FOREIGN KEY (owner_id) REFERENCES public.users(id),
  CONSTRAINT fk_rentals_delivery_address FOREIGN KEY (delivery_address_id) REFERENCES public.user_addresses(id),
  CONSTRAINT fk_rentals_cancelled_by FOREIGN KEY (cancelled_by_user_id) REFERENCES public.users(id),
  CONSTRAINT fk_rentals_product FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT fk_rentals_renter FOREIGN KEY (renter_id) REFERENCES public.users(id),
  CONSTRAINT fk_rentals_payment_verified_by FOREIGN KEY (payment_verified_by_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.reviews (
  id bigint NOT NULL DEFAULT nextval('reviews_id_seq'::regclass),
  rental_id bigint NOT NULL UNIQUE,
  renter_id bigint NOT NULL,
  product_id bigint NOT NULL,
  owner_id bigint NOT NULL,
  rating_product smallint NOT NULL CHECK (rating_product >= 1 AND rating_product <= 5),
  rating_owner smallint NOT NULL CHECK (rating_owner >= 1 AND rating_owner <= 5),
  comment text,
  is_hidden_by_admin boolean DEFAULT false,
  hidden_reason text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT fk_reviews_renter FOREIGN KEY (renter_id) REFERENCES public.users(id),
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT fk_reviews_owner FOREIGN KEY (owner_id) REFERENCES public.users(id),
  CONSTRAINT fk_reviews_rental FOREIGN KEY (rental_id) REFERENCES public.rentals(id)
);
CREATE TABLE public.system_settings (
  setting_key character varying NOT NULL,
  setting_value text NOT NULL,
  description character varying,
  data_type USER-DEFINED DEFAULT 'string'::system_settings_data_type_enum,
  is_publicly_readable boolean DEFAULT false,
  is_encrypted boolean DEFAULT false,
  validation_rules character varying,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_by_admin_id bigint,
  CONSTRAINT system_settings_pkey PRIMARY KEY (setting_key),
  CONSTRAINT fk_system_settings_admin FOREIGN KEY (updated_by_admin_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_addresses (
  id bigint NOT NULL DEFAULT nextval('user_addresses_id_seq'::regclass),
  user_id bigint NOT NULL,
  address_type USER-DEFINED DEFAULT 'shipping'::user_address_type_enum,
  recipient_name character varying NOT NULL,
  phone_number character varying NOT NULL,
  address_line1 character varying NOT NULL,
  address_line2 character varying,
  sub_district character varying,
  district character varying NOT NULL,
  province_id bigint NOT NULL,
  postal_code character varying NOT NULL,
  is_default boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_user_addresses_province FOREIGN KEY (province_id) REFERENCES public.provinces(id)
);
CREATE TABLE public.users (
  id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  username character varying UNIQUE,
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  phone_number character varying UNIQUE,
  phone_verified_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  address_line1 character varying,
  address_line2 character varying,
  city character varying,
  province_id bigint,
  postal_code character varying,
  profile_picture_url character varying,
  id_document_type USER-DEFINED,
  id_document_number character varying,
  id_document_url character varying,
  id_document_back_url character varying,
  id_selfie_url character varying,
  id_verification_status USER-DEFINED DEFAULT 'not_submitted'::user_id_verification_status_enum,
  id_verification_notes text,
  id_verified_at timestamp with time zone,
  id_verified_by_admin_id bigint,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  registration_ip character varying,
  email_verification_token character varying UNIQUE,
  email_verification_token_expires_at timestamp with time zone,
  preferences jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  google_id character varying UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT fk_users_province FOREIGN KEY (province_id) REFERENCES public.provinces(id),
  CONSTRAINT fk_users_verified_by_admin FOREIGN KEY (id_verified_by_admin_id) REFERENCES public.users(id)
);
CREATE TABLE public.wishlist (
  user_id bigint NOT NULL,
  product_id bigint NOT NULL,
  added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT wishlist_pkey PRIMARY KEY (user_id, product_id),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES public.products(id)
);



Database Enumerated Types
Custom data types that you can use in your database tables or functions.

schema

public

Search for a type
Docs

Create type
Schema	Name	Values	
public

chat_message_type_enum	text, image, file, system_event, rental_offer	

public

complaint_priority_enum	low, medium, high, critical	

public

complaint_status_enum	submitted, under_review, awaiting_user_response, investigating, resolved, closed_no_action, closed_escalated_to_claim	

public

payment_transaction_status_enum	pending, successful, failed, cancelled, disputed, requires_action, refunded_full, refunded_partial	

public

payment_transaction_type_enum	rental_payment, deposit_refund, rental_fee_payout, platform_fee, late_fee_payment, claim_settlement_to_owner, claim_settlement_from_renter, other_credit, other_debit	

public

payout_method_type_enum	bank_account, promptpay	

public

product_admin_approval_status_enum	pending, approved, rejected	

public

product_availability_status_enum	available, rented_out, unavailable, pending_approval, rejected, hidden, draft	

public

rental_payment_status_enum	unpaid, pending_verification, paid, failed, refund_pending, refunded, partially_refunded	

public

rental_pickup_method_enum	self_pickup, delivery	

public

rental_return_condition_status_enum	as_rented, minor_wear, damaged, lost, not_yet_returned	

public

rental_return_method_enum	self_return, owner_pickup	

public

rental_status_enum	pending_owner_approval, pending_payment, confirmed, active, return_pending, completed, cancelled_by_renter, cancelled_by_owner, rejected_by_owner, dispute, expired, late_return	

public

system_settings_data_type_enum	string, integer, float, boolean, json, text	

public

user_address_type_enum	shipping, billing, other	

public

user_id_document_type_enum	national_id, passport, other	

public

user_id_verification_status_enum	not_submitted, pending, verified, rejected, resubmit_required	

public

rental_pricing_type_enum	daily, weekly, monthly	

