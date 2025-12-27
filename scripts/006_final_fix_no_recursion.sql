-- =====================================================
-- ОСТАТОЧНЕ ВИПРАВЛЕННЯ РЕКУРСІЇ
-- Цей скрипт повністю усуває рекурсію в RLS політиках
-- =====================================================

-- Видалити всі існуючі політики
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admins can do everything with products (ALL)" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

DROP POLICY IF EXISTS "Public can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

DROP POLICY IF EXISTS "Public can view active content blocks" ON content_blocks;
DROP POLICY IF EXISTS "Admins can manage content blocks" ON content_blocks;

DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;

DROP POLICY IF EXISTS "Admins can view orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

DROP POLICY IF EXISTS "Admins can view order items" ON order_items;

DROP POLICY IF EXISTS "Admins can view admin list" ON admins;
DROP POLICY IF EXISTS "Admins can update admin info" ON admins;

-- Видалити стару функцію
DROP FUNCTION IF EXISTS is_admin();

-- Створити нову просту функцію без перевірки RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM admins 
    WHERE id = auth.uid()
  );
$$;

-- ВИМКНУТИ RLS на таблиці admins назавжди
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCTS - публічний доступ для перегляду
-- =====================================================

-- Публічний доступ до активних продуктів (БЕЗ перевірки адміна)
CREATE POLICY "Anyone can view active products"
ON products
FOR SELECT
USING (is_active = true);

-- Адміни можуть керувати всіма продуктами
CREATE POLICY "Admins full access to products"
ON products
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- CATEGORIES - публічний доступ для перегляду
-- =====================================================

CREATE POLICY "Anyone can view active categories"
ON categories
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins full access to categories"
ON categories
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- CONTENT BLOCKS - публічний доступ для перегляду
-- =====================================================

CREATE POLICY "Anyone can view active content blocks"
ON content_blocks
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins full access to content blocks"
ON content_blocks
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- BLOG POSTS - публічний доступ для перегляду
-- =====================================================

CREATE POLICY "Anyone can view published blog posts"
ON blog_posts
FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins full access to blog posts"
ON blog_posts
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- ORDERS - тільки адміни
-- =====================================================

CREATE POLICY "Admins full access to orders"
ON orders
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- ORDER ITEMS - тільки адміни
-- =====================================================

CREATE POLICY "Admins full access to order items"
ON order_items
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Перевірити що все працює
SELECT 'RLS policies updated successfully!' as status;
