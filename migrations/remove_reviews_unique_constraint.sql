-- Migration: Remove UNIQUE constraint from reviews.rental_id to allow multiple reviews per rental
-- Date: 2025-10-02
-- Purpose: Allow users to submit multiple reviews for the same rental

-- Remove the UNIQUE constraint on rental_id
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rental_id_key;

-- Add comment to document the change
COMMENT ON COLUMN reviews.rental_id IS 'รหัสการเช่าที่รีวิว (FK, อนุญาตให้รีวิวซ้ำได้)';

-- Optional: Add index for performance (since we removed unique constraint)
CREATE INDEX IF NOT EXISTS idx_reviews_rental_id ON reviews(rental_id);

-- Verify the change
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'reviews'::regclass 
    AND conname LIKE '%rental_id%';