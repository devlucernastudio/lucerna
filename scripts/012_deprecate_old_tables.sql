-- Migration script: Deprecate old tables after verification
-- ONLY RUN THIS AFTER thorough testing and verification
-- This script removes old tables that are no longer needed

-- ============================================
-- WARNING: This script will permanently delete old data
-- Make sure you have backups and have verified the migration
-- ============================================

-- Step 1: Drop old policies
DROP POLICY IF EXISTS "Anyone can view product colors" ON product_colors;
DROP POLICY IF EXISTS "Admins can manage product colors" ON product_colors;
DROP POLICY IF EXISTS "Anyone can view product attributes" ON product_attributes;
DROP POLICY IF EXISTS "Admins can manage product attributes" ON product_attributes;
DROP POLICY IF EXISTS "Anyone can view attribute types" ON attribute_types;
DROP POLICY IF EXISTS "Admins can manage attribute types" ON attribute_types;

-- Step 2: Drop old triggers
DROP TRIGGER IF EXISTS update_product_attributes_updated_at ON product_attributes;
DROP TRIGGER IF EXISTS update_attribute_types_updated_at ON attribute_types;

-- Step 3: Drop old indexes
DROP INDEX IF EXISTS idx_product_colors_product;
DROP INDEX IF EXISTS idx_product_attributes_product;
DROP INDEX IF EXISTS idx_product_attributes_type;

-- Step 4: Drop old tables
DROP TABLE IF EXISTS product_colors CASCADE;
DROP TABLE IF EXISTS product_attributes CASCADE;
DROP TABLE IF EXISTS attribute_types CASCADE;

-- Step 5: Remove deprecated columns from products table
ALTER TABLE products DROP COLUMN IF EXISTS color_selection_enabled;
ALTER TABLE products DROP COLUMN IF EXISTS color_selection_type;

-- Step 6: Final verification message
DO $$
BEGIN
  RAISE NOTICE 'Old tables and columns have been removed. Migration complete.';
  RAISE NOTICE 'Please verify that your application is using the new characteristic system.';
END $$;

