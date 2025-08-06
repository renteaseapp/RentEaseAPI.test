-- Migration: Remove owner_payout_amount column from rentals table
-- Date: 2024-01-XX
-- Description: Remove unused owner_payout_amount column and use calculated values instead

-- Remove the owner_payout_amount column from rentals table
ALTER TABLE rentals DROP COLUMN IF EXISTS owner_payout_amount;

-- Add comment to document the change
COMMENT ON TABLE rentals IS 'ตารางข้อมูลการเช่าสินค้า (removed owner_payout_amount - now calculated as final_amount_paid - platform_fee_owner)'; 