-- Видаляємо всі існуючі політики для уникнення конфліктів
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can do everything with products" ON products;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can do everything with categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can do everything with blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can view active content blocks" ON content_blocks;
DROP POLICY IF EXISTS "Admins can do everything with content blocks" ON content_blocks;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view admin list" ON admins;

-- Вимикаємо RLS для admins таблиці, щоб уникнути рекурсії
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Створюємо безпечну функцію для перевірки адміністратора
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Політики для products
CREATE POLICY "products_select_public" ON products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "products_all_admin" ON products
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Політики для categories
CREATE POLICY "categories_select_public" ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "categories_all_admin" ON categories
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Політики для blog_posts
CREATE POLICY "blog_posts_select_public" ON blog_posts
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "blog_posts_all_admin" ON blog_posts
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Політики для content_blocks
CREATE POLICY "content_blocks_select_public" ON content_blocks
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "content_blocks_all_admin" ON content_blocks
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Політики для orders
CREATE POLICY "orders_insert_public" ON orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_select_admin" ON orders
  FOR SELECT
  USING (is_admin());

CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Політики для order_items
CREATE POLICY "order_items_insert_public" ON order_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "order_items_select_admin" ON order_items
  FOR SELECT
  USING (is_admin());
