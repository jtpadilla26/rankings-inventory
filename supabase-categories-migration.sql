-- ============================================================================
-- Rankins Inventory - Categories Table Migration
-- ============================================================================
-- Run this SQL script in your Supabase SQL Editor to create the categories
-- table and populate it with predefined product categories.
-- ============================================================================

-- ============================================================================
-- 1. Create categories table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- ============================================================================
-- 2. Insert predefined categories
-- ============================================================================
-- Using INSERT ... ON CONFLICT DO NOTHING to safely add categories
-- without duplicating if they already exist

INSERT INTO categories (name) VALUES
  ('Chemicals'),
  ('Fertilizers & Nutrients'),
  ('Seeds & Plant Material'),
  ('Growing Media & Substrates'),
  ('Irrigation & Water Management'),
  ('Tools & Equipment'),
  ('PPE & Safety Equipment'),
  ('Lab & R&D Supplies'),
  ('Consumables'),
  ('Packaging & Storage'),
  ('Machinery & Large Assets'),
  ('Maintenance & Repairs'),
  ('Office / Admin Supplies'),
  ('Miscellaneous')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 3. Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. Create RLS Policies
-- ============================================================================
-- Allow authenticated users to read categories
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON categories;
CREATE POLICY "Allow authenticated users to read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert new categories
DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON categories;
CREATE POLICY "Allow authenticated users to insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 5. Grant permissions to service_role for server-side queries
-- ============================================================================
GRANT ALL ON categories TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- 6. Verification Query
-- ============================================================================
-- Run this to verify the categories were inserted successfully:
-- SELECT * FROM categories ORDER BY name;
