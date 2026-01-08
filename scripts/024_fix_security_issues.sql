-- scripts/024_fix_security_issues.sql
-- Fix security issues: SECURITY DEFINER view and missing RLS on admins table

-- =====================================================
-- STEP 1: Recreate view without SECURITY DEFINER
-- =====================================================

DROP VIEW IF EXISTS product_characteristics_full CASCADE;

-- Recreate the view with security_invoker (runs with querying user's permissions)
CREATE VIEW product_characteristics_full
WITH (security_invoker = true) AS
SELECT 
  pc.id,
  pc.product_id,
  pc.characteristic_type_id,
  ct.name_uk as characteristic_name_uk,
  ct.name_en as characteristic_name_en,
  ct.input_type,
  COALESCE(pc.required, ct.required) as required,
  COALESCE(pc.affects_price, ct.affects_price) as affects_price,
  ct.reusable,
  pc.price_override,
  pc.position,
  pc.selected_values,
  pc.created_at,
  pc.updated_at
FROM product_characteristics pc
JOIN characteristic_types ct ON pc.characteristic_type_id = ct.id;

GRANT SELECT ON product_characteristics_full TO authenticated;
GRANT SELECT ON product_characteristics_full TO anon;

-- =====================================================
-- STEP 2: Enable RLS on admins table
-- =====================================================

-- Enable RLS (currently disabled to prevent recursion)
ALTER TABLE IF EXISTS admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view admins" ON admins;
DROP POLICY IF EXISTS "Super admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Super admins can update admins" ON admins;
DROP POLICY IF EXISTS "Super admins can delete admins" ON admins;

-- Create policy for SELECT: authenticated users can view admins
-- This is needed for is_admin() function and admin checks in code
CREATE POLICY "Authenticated users can view admins" ON admins 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Note: is_admin() function uses SECURITY DEFINER, so it can read admins table
-- even with RLS enabled, which prevents recursion in other policies

-- Policies for INSERT/UPDATE/DELETE (only super admins)
-- These use is_admin() which has SECURITY DEFINER, so no recursion
CREATE POLICY "Super admins can insert admins" ON admins 
  FOR INSERT 
  WITH CHECK (
    is_admin() AND 
    (SELECT is_super_admin FROM admins WHERE id = auth.uid())
  );
  
CREATE POLICY "Super admins can update admins" ON admins 
  FOR UPDATE 
  USING (
    is_admin() AND 
    (SELECT is_super_admin FROM admins WHERE id = auth.uid())
  );
  
CREATE POLICY "Super admins can delete admins" ON admins 
  FOR DELETE 
  USING (
    is_admin() AND 
    (SELECT is_super_admin FROM admins WHERE id = auth.uid())
  );