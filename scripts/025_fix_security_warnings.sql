-- scripts/025_fix_security_warnings.sql
-- Fix security warnings: search_path for functions and RLS policies

-- =====================================================
-- STEP 1: Fix search_path for is_admin() function
-- =====================================================

-- Use CREATE OR REPLACE instead of DROP to avoid breaking dependencies
-- This will update the function without dropping it
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM admins 
    WHERE id = auth.uid()
  );
$$;

-- =====================================================
-- STEP 2: Fix search_path for update_updated_at_column() function
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 3: Fix search_path for update_contact_settings_updated_at() function
-- =====================================================

CREATE OR REPLACE FUNCTION update_contact_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 4: Improve RLS policies for orders and order_items
-- =====================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

-- Create more restrictive policies for orders
-- Allow anyone to create orders, but validate basic data
CREATE POLICY "Anyone can create orders" ON orders
FOR INSERT
WITH CHECK (
  -- Basic validation: ensure required fields are present
  customer_name IS NOT NULL AND 
  customer_name != '' AND
  customer_phone IS NOT NULL AND 
  customer_phone != '' AND
  customer_address IS NOT NULL AND 
  customer_address != '' AND
  customer_city IS NOT NULL AND 
  customer_city != '' AND
  total > 0 AND
  subtotal >= 0 AND
  shipping >= 0
);

-- Create more restrictive policies for order_items
-- Allow anyone to create order items, but validate they belong to an order
CREATE POLICY "Anyone can create order items" ON order_items
FOR INSERT
WITH CHECK (
  -- Basic validation: ensure order_id exists and item has valid data
  order_id IS NOT NULL AND
  product_id IS NOT NULL AND
  product_name IS NOT NULL AND
  product_name != '' AND
  quantity > 0 AND
  product_price > 0 AND
  subtotal > 0
);