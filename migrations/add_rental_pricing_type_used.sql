-- Create enum type if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rental_pricing_type_enum') THEN
        CREATE TYPE rental_pricing_type_enum AS ENUM ('daily', 'weekly', 'monthly');
    END IF;
END
$$;

-- Add new column to rentals table to record which pricing type was used
ALTER TABLE rentals
ADD COLUMN IF NOT EXISTS rental_pricing_type_used rental_pricing_type_enum NOT NULL DEFAULT 'daily';

COMMENT ON COLUMN rentals.rental_pricing_type_used IS 'Pricing type actually used by backend for subtotal calculation (daily/weekly/monthly)';