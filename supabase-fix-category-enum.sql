-- ============================================================================
-- Fix Category Column - Change from ENUM to TEXT
-- ============================================================================
-- This migration changes the inventory_items.category column from an ENUM
-- type to TEXT to allow flexible category values including custom categories.
--
-- Since the column is used by views, we need to:
-- 1. Drop dependent views
-- 2. Change the column type
-- 3. Recreate the views
-- ============================================================================

-- Step 1: Drop dependent views (in reverse dependency order)
DROP VIEW IF EXISTS inventory_summary;
DROP VIEW IF EXISTS inventory_items_enriched;

-- Step 2: Alter the column type to TEXT
ALTER TABLE inventory_items
ALTER COLUMN category TYPE TEXT;

-- Step 3: Drop the old ENUM type if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_category') THEN
        DROP TYPE inventory_category;
    END IF;
END $$;

-- Step 4: Recreate inventory_items_enriched view
CREATE OR REPLACE VIEW inventory_items_enriched AS
SELECT
  i.id,
  i.name,
  i.category,
  i.units,
  i.unit_type,
  i.price_per_unit,
  -- Computed: total value
  (i.price_per_unit * i.units) AS total_value,
  i.location,
  i.low_stock_threshold,
  -- Computed: effective threshold (item threshold takes precedence over category default)
  COALESCE(i.low_stock_threshold, ct.default_threshold) AS effective_threshold,
  -- Computed: is_low_stock (true if units below effective threshold)
  CASE
    WHEN COALESCE(i.low_stock_threshold, ct.default_threshold) IS NOT NULL
      AND i.units < COALESCE(i.low_stock_threshold, ct.default_threshold)
    THEN true
    ELSE false
  END AS is_low_stock,
  i.date_added,
  i.notes,
  i.expiration_date,
  i.batch_lot,
  i.opened_at,
  i.msds_url,
  i.inserted_at,
  i.updated_at
FROM
  inventory_items i
LEFT JOIN
  category_thresholds ct ON i.category = ct.category;

-- Step 5: Recreate inventory_summary view
CREATE OR REPLACE VIEW inventory_summary AS
SELECT
  COALESCE(SUM(total_value), 0) AS total_inventory_value,
  COUNT(*) AS total_items,
  COALESCE(SUM(units), 0) AS total_units,
  COUNT(*) FILTER (WHERE is_low_stock = true) AS low_stock_count
FROM
  inventory_items_enriched;

-- Step 6: Verify the change
-- Run this to confirm category is now TEXT:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'inventory_items' AND column_name = 'category';
