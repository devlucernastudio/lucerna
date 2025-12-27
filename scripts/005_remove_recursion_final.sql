-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view admin list" ON admins;
DROP POLICY IF EXISTS "Admins can do everything with products (ALL)" ON products;
DROP POLICY IF EXISTS "Admins can do everything with categories (ALL)" ON categories;
DROP POLICY IF EXISTS "Admins can do everything with blog posts (ALL)" ON blog_posts;
DROP POLICY IF EXISTS "Admins can do everything with content blocks (ALL)" ON content_blocks;
DROP POLICY IF EXISTS "Admins can view all orders (SELECT)" ON orders;
DROP POLICY IF EXISTS "Admins can update orders (UPDATE)" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items (SELECT)" ON order_items;

-- Drop the old is_admin function
DROP FUNCTION IF EXISTS is_admin();

-- Disable RLS on admins table completely to prevent any recursion
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Create new is_admin function that works without RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Simply check if the current user exists in admins table
  -- No RLS on admins table means no recursion
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies for products
CREATE POLICY "Admins full access to products"
ON products FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Recreate policies for categories  
CREATE POLICY "Admins full access to categories"
ON categories FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Recreate policies for blog_posts
CREATE POLICY "Admins full access to blog posts"
ON blog_posts FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Recreate policies for content_blocks
CREATE POLICY "Admins full access to content blocks"
ON content_blocks FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Recreate policies for orders
CREATE POLICY "Admins can view orders"
ON orders FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Recreate policies for order_items
CREATE POLICY "Admins can view order items"
ON order_items FOR SELECT
USING (is_admin());
