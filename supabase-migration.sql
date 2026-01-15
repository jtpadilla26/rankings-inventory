-- ============================================================================
-- Rankins Inventory - Supabase Database Migration
-- ============================================================================
-- Run this SQL script in your Supabase SQL Editor to create/update all
-- required tables and views for the inventory app.
-- ============================================================================

-- ============================================================================
-- 1. Create inventory_items table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  units NUMERIC NOT NULL DEFAULT 0,
  unit_type TEXT,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  location TEXT,
  low_stock_threshold NUMERIC,
  date_added DATE,
  notes TEXT,
  expiration_date DATE,
  batch_lot TEXT,
  opened_at DATE,
  msds_url TEXT,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(location);
CREATE INDEX IF NOT EXISTS idx_inventory_items_updated_at ON inventory_items(updated_at DESC);

-- ============================================================================
-- 2. Create category_thresholds table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS category_thresholds (
  category TEXT PRIMARY KEY,
  default_threshold NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. Create or replace inventory_items_enriched VIEW
-- ============================================================================
-- This view adds computed fields:
-- - total_value: price_per_unit * units
-- - effective_threshold: item's threshold OR category default threshold
-- - is_low_stock: whether units < effective_threshold
-- ============================================================================

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

-- ============================================================================
-- 4. Create or replace inventory_summary VIEW
-- ============================================================================
-- This view provides aggregated summary statistics:
-- - total_inventory_value: sum of all item values
-- - total_items: count of items
-- - total_units: sum of all units
-- - low_stock_count: count of items with is_low_stock = true
-- ============================================================================

CREATE OR REPLACE VIEW inventory_summary AS
SELECT
  COALESCE(SUM(total_value), 0) AS total_inventory_value,
  COUNT(*) AS total_items,
  COALESCE(SUM(units), 0) AS total_units,
  COUNT(*) FILTER (WHERE is_low_stock = true) AS low_stock_count
FROM
  inventory_items_enriched;

-- ============================================================================
-- 5. Enable Row Level Security (RLS) - IMPORTANT!
-- ============================================================================
-- Enable RLS on base tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_thresholds ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. Create RLS Policies for authenticated users
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Allow authenticated users to update inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Allow authenticated users to delete inventory_items" ON inventory_items;

DROP POLICY IF EXISTS "Allow authenticated users to read category_thresholds" ON category_thresholds;
DROP POLICY IF EXISTS "Allow authenticated users to insert category_thresholds" ON category_thresholds;
DROP POLICY IF EXISTS "Allow authenticated users to update category_thresholds" ON category_thresholds;

-- Create policies for inventory_items
CREATE POLICY "Allow authenticated users to read inventory_items"
  ON inventory_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert inventory_items"
  ON inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update inventory_items"
  ON inventory_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete inventory_items"
  ON inventory_items FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for category_thresholds
CREATE POLICY "Allow authenticated users to read category_thresholds"
  ON category_thresholds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert category_thresholds"
  ON category_thresholds FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update category_thresholds"
  ON category_thresholds FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 7. Grant permissions to service role (for server-side queries)
-- ============================================================================

-- Grant all permissions to service_role (bypasses RLS)
GRANT ALL ON inventory_items TO service_role;
GRANT ALL ON category_thresholds TO service_role;

-- Grant select on views to authenticated and service_role
GRANT SELECT ON inventory_items_enriched TO authenticated, service_role;
GRANT SELECT ON inventory_summary TO authenticated, service_role;

-- ============================================================================
-- 8. Create trigger to auto-update updated_at timestamp
-- ============================================================================

-- Create or replace the function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
DROP TRIGGER IF EXISTS update_category_thresholds_updated_at ON category_thresholds;

-- Create triggers
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_thresholds_updated_at
  BEFORE UPDATE ON category_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- Your database schema is now ready. The app should now be able to:
-- ✓ Display total inventory value and item counts
-- ✓ Show low stock items based on thresholds
-- ✓ Display enriched inventory data with computed fields
-- ✓ Properly enforce Row Level Security
-- ============================================================================

-- To verify the migration worked, run:
-- SELECT * FROM inventory_summary;
-- SELECT * FROM inventory_items_enriched LIMIT 5;
