-- ============================================================================
-- Fix Category Column - Change from ENUM to TEXT
-- ============================================================================
-- This migration changes the inventory_items.category column from an ENUM
-- type to TEXT to allow flexible category values including custom categories.
-- ============================================================================

-- Step 1: Drop the ENUM constraint if it exists
-- Note: PostgreSQL stores ENUMs as custom types, we need to alter the column

-- First, change the column type to TEXT
ALTER TABLE inventory_items
ALTER COLUMN category TYPE TEXT;

-- Step 2: Drop the old ENUM type if it exists
-- (This may fail if the ENUM doesn't exist, which is fine)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_category') THEN
        DROP TYPE inventory_category;
    END IF;
END $$;

-- Step 3: Verify the change
-- You can run this to confirm:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'inventory_items' AND column_name = 'category';
