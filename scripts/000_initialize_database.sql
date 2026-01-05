-- =====================================================
-- ОБ'ЄДНАНИЙ СКРИПТ ДЛЯ ІНІЦІАЛІЗАЦІЇ ЧИСТОЇ БД
-- Виконайте цей скрипт в Supabase SQL Editor для створення повної структури БД
-- =====================================================

-- =====================================================
-- STEP 1: Enable UUID extension
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 2: Create base schema (from 001_create_schema.sql)
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uk TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_uk TEXT,
  description_en TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_uk TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_uk TEXT,
  description_en TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  stock INTEGER,
  sku TEXT UNIQUE,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_postal_code TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  characteristics JSONB,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_uk TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt_uk TEXT,
  excerpt_en TEXT,
  content_uk TEXT NOT NULL,
  content_en TEXT NOT NULL,
  cover_image TEXT,
  author TEXT DEFAULT 'Lucerna Studio',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic content blocks table for homepage
    CREATE TABLE IF NOT EXISTS content_blocks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      type TEXT NOT NULL CHECK (type IN ('hero', 'features', 'about', 'about_page', 'gallery', 'testimonials', 'cta')),
  title_uk TEXT,
  title_en TEXT,
  content_uk TEXT,
  content_en TEXT,
  images TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table (for admin panel access)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 3: Create many-to-many relationship (from 007_add_new_features.sql)
-- =====================================================

-- Add parent_id to categories for subcategories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Create many-to-many relationship between products and categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);

-- =====================================================
-- STEP 4: Create characteristics system (from 010_redesign_characteristics.sql)
-- =====================================================

-- Create characteristic_types table
CREATE TABLE IF NOT EXISTS characteristic_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uk TEXT NOT NULL,
  name_en TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('color_palette', 'color_custom', 'select', 'checkbox', 'text')),
  required BOOLEAN DEFAULT false,
  reusable BOOLEAN DEFAULT true,
  affects_price BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_characteristic_types_position ON characteristic_types(position);
CREATE INDEX IF NOT EXISTS idx_characteristic_types_reusable ON characteristic_types(reusable);

-- Create characteristic_options table
CREATE TABLE IF NOT EXISTS characteristic_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  characteristic_type_id UUID NOT NULL REFERENCES characteristic_types(id) ON DELETE CASCADE,
  name_uk TEXT,
  name_en TEXT,
  value TEXT NOT NULL,
  color_code TEXT,
  position INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(characteristic_type_id, value)
);

CREATE INDEX IF NOT EXISTS idx_characteristic_options_type ON characteristic_options(characteristic_type_id);
CREATE INDEX IF NOT EXISTS idx_characteristic_options_position ON characteristic_options(characteristic_type_id, position);

-- Create product_characteristics table
CREATE TABLE IF NOT EXISTS product_characteristics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  characteristic_type_id UUID NOT NULL REFERENCES characteristic_types(id) ON DELETE CASCADE,
  required BOOLEAN,
  price_override DECIMAL(10, 2),
  affects_price BOOLEAN,
  position INTEGER DEFAULT 0,
  selected_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, characteristic_type_id)
);

CREATE INDEX IF NOT EXISTS idx_product_characteristics_product ON product_characteristics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_characteristics_type ON product_characteristics(characteristic_type_id);
CREATE INDEX IF NOT EXISTS idx_product_characteristics_position ON product_characteristics(product_id, position);

-- Create product_characteristic_price_combinations table
CREATE TABLE IF NOT EXISTS product_characteristic_price_combinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  combination JSONB NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  stock INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, combination)
);

CREATE INDEX IF NOT EXISTS idx_price_combinations_product ON product_characteristic_price_combinations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_characteristic_price_combinations_stock 
  ON product_characteristic_price_combinations(product_id, stock) 
  WHERE stock IS NOT NULL;

-- =====================================================
-- STEP 5: Create contact settings (from 018_create_contact_settings.sql)
-- =====================================================

CREATE TABLE IF NOT EXISTS site_contact_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  phone TEXT,
  working_hours_uk TEXT,
  working_hours_en TEXT,
  address_uk TEXT,
  address_en TEXT,
  notification_email TEXT,
  resend_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Insert default row
INSERT INTO site_contact_settings (id, email, phone, working_hours_uk, working_hours_en, address_uk, address_en, notification_email, resend_api_key)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, '', '', '', '', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Create social_media_links table
CREATE TABLE IF NOT EXISTS social_media_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL UNIQUE,
  url TEXT,
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_platform CHECK (platform IN ('facebook', 'instagram', 'viber', 'telegram', 'whatsapp', 'threads', 'x'))
);

-- Insert default social media platforms
INSERT INTO social_media_links (platform, url, is_enabled)
VALUES 
  ('facebook', '', false),
  ('instagram', '', false),
  ('viber', '', false),
  ('telegram', '', false),
  ('whatsapp', '', false),
  ('threads', '', false),
  ('x', '', false)
ON CONFLICT (platform) DO NOTHING;

-- =====================================================
-- STEP 6: Create helper functions
-- =====================================================

-- Function to check if user is admin
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update contact settings updated_at
CREATE OR REPLACE FUNCTION update_contact_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 7: Enable Row Level Security
-- =====================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY; -- Disabled to prevent recursion
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE characteristic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE characteristic_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_characteristic_price_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 8: Create RLS Policies (from 006_final_fix_no_recursion.sql)
-- =====================================================

-- PRODUCTS
CREATE POLICY "Anyone can view active products"
ON products
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins full access to products"
ON products
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- CATEGORIES
CREATE POLICY "Anyone can view active categories"
ON categories
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins full access to categories"
ON categories
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- CONTENT BLOCKS
CREATE POLICY "Anyone can view active content blocks"
ON content_blocks
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins full access to content blocks"
ON content_blocks
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- BLOG POSTS
CREATE POLICY "Anyone can view published blog posts"
ON blog_posts
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins full access to blog posts"
ON blog_posts
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ORDERS
CREATE POLICY "Anyone can create orders"
ON orders
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins full access to orders"
ON orders
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ORDER ITEMS
CREATE POLICY "Anyone can create order items"
ON order_items
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins full access to order items"
ON order_items
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- PRODUCT CATEGORIES
CREATE POLICY "Anyone can view product categories"
ON product_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product categories"
ON product_categories
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- CHARACTERISTIC TYPES
CREATE POLICY "Anyone can view characteristic types"
ON characteristic_types
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage characteristic types"
ON characteristic_types
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- CHARACTERISTIC OPTIONS
CREATE POLICY "Anyone can view characteristic options"
ON characteristic_options
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage characteristic options"
ON characteristic_options
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- PRODUCT CHARACTERISTICS
CREATE POLICY "Anyone can view product characteristics"
ON product_characteristics
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product characteristics"
ON product_characteristics
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- PRICE COMBINATIONS
CREATE POLICY "Anyone can view price combinations"
ON product_characteristic_price_combinations
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage price combinations"
ON product_characteristic_price_combinations
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- CONTACT SETTINGS
CREATE POLICY "Anyone can view contact settings"
ON site_contact_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage contact settings"
ON site_contact_settings
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- SOCIAL MEDIA LINKS
CREATE POLICY "Anyone can view enabled social media links"
ON social_media_links
FOR SELECT
USING (is_enabled = true OR is_admin());

CREATE POLICY "Admins can manage social media links"
ON social_media_links
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- STEP 9: Create indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_characteristics ON order_items USING gin (characteristics);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_content_blocks_position ON content_blocks(position) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admins_id ON admins(id);
CREATE INDEX IF NOT EXISTS idx_social_media_platform ON social_media_links(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_enabled ON social_media_links(is_enabled) WHERE is_enabled = true;

-- =====================================================
-- STEP 10: Create triggers
-- =====================================================

-- Update triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characteristic_types_updated_at 
  BEFORE UPDATE ON characteristic_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characteristic_options_updated_at 
  BEFORE UPDATE ON characteristic_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_characteristics_updated_at 
  BEFORE UPDATE ON product_characteristics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_combinations_updated_at 
  BEFORE UPDATE ON product_characteristic_price_combinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_contact_settings_updated_at
  BEFORE UPDATE ON site_contact_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_settings_updated_at();

CREATE TRIGGER update_social_media_links_updated_at
  BEFORE UPDATE ON social_media_links
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_settings_updated_at();

-- =====================================================
-- STEP 11: Create default content blocks (from 020_add_about_to_content_blocks.sql)
-- =====================================================

-- Insert default content blocks
INSERT INTO content_blocks (type, title_uk, title_en, content_uk, content_en, position, is_active, settings) VALUES
  (
    'hero',
    'Унікальні світильники ручної роботи',
    'Unique Handmade Lamps',
    'Створюємо атмосферу тепла і затишку у вашому домі',
    'Creating an atmosphere of warmth and coziness in your home',
    1,
    true,
    '{"backgroundImage": "/hero-lamp.jpg", "buttonText": "Переглянути каталог", "buttonLink": "/catalog"}'::jsonb
  ),
  (
    'features',
    'Чому обирають нас',
    'Why Choose Us',
    'Ручна робота|Натуральні матеріали|Унікальний дизайн|Екологічність',
    'Handmade|Natural Materials|Unique Design|Eco-friendly',
    2,
    true,
    '{}'::jsonb
  ),
  (
    'about',
    'Про Lucerna Studio',
    'About Lucerna Studio',
    'Кожен світильник Lucerna - це унікальний витвір мистецтва, створений вручну з натуральних матеріалів. Наші роботи втілюють гармонію природних форм та сучасного дизайну, додаючи теплоти та затишку вашому простору.',
    'Each Lucerna lamp is a unique work of art, handcrafted from natural materials. Our works embody the harmony of natural forms and modern design, adding warmth and coziness to your space.',
    3,
    true,
    '{}'::jsonb
  ),
  (
    'gallery',
    'Наші роботи',
    'Our Works',
    '',
    '',
    4,
    true,
    '{}'::jsonb
  ),
  (
    'testimonials',
    'Відгуки клієнтів',
    'Client Testimonials',
    '',
    '',
    5,
    true,
    '{}'::jsonb
  ),
  (
    'cta',
    'Замовте свій унікальний світильник',
    'Order Your Unique Lamp',
    'Зв\'яжіться з нами для консультації та замовлення',
    'Contact us for consultation and ordering',
    6,
    true,
    '{}'::jsonb
  ),
  (
    'about_page',
    'Про Lucerna Studio',
    'About Lucerna Studio',
    '<h2>Майстерня природної естетики</h2><p>Наші колекції народжуються на стику ремесла й сучасного дизайну. У кожному виробі відчувається тепло ручної роботи, увага до деталей та прагнення до гармонії. Ми віримо, що наші вироби здатні змінювати атмосферу простору, робити його більш живим, затишним, і по-справжньому наближеним до природи.</p><h2>Природна естетика як філософія</h2><p>Філософія Lucerna Studio базується на природній естетиці. Це про речі, які створюють емоцію, стають не просто частиною вашого простору, а справжнім арт-об''єктом.</p>',
    '<h2>Natural Aesthetics Workshop</h2><p>Our collections are born at the intersection of craftsmanship and modern design. Each piece feels the warmth of handwork, attention to detail, and a desire for harmony. We believe that our products can change the atmosphere of space, make it more alive, cozy, and truly close to nature.</p><h2>Natural Aesthetics as Philosophy</h2><p>The philosophy of Lucerna Studio is based on natural aesthetics. It''s about things that create emotion, become not just part of your space, but a true art object.</p>',
    0,
    true,
    '{}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 12: Create helper view for product characteristics
-- =====================================================

CREATE OR REPLACE VIEW product_characteristics_full AS
SELECT 
  pc.id,
  pc.product_id,
  pc.characteristic_type_id,
  ct.name_uk as characteristic_name_uk,
  ct.name_en as characteristic_name_en,
  ct.input_type,
  COALESCE(pc.required, ct.required) as required,
  ct.reusable,
  COALESCE(pc.affects_price, ct.affects_price) as affects_price,
  pc.price_override,
  pc.position,
  pc.selected_values,
  pc.created_at,
  pc.updated_at
FROM product_characteristics pc
JOIN characteristic_types ct ON pc.characteristic_type_id = ct.id;

-- Grant access to view
GRANT SELECT ON product_characteristics_full TO authenticated;
GRANT SELECT ON product_characteristics_full TO anon;

-- =====================================================
-- STEP 13: Add comments
-- =====================================================

COMMENT ON COLUMN order_items.characteristics IS 'Stores product characteristics as JSONB object with characteristic names as keys and values as strings. For colors, may include hex code.';
COMMENT ON COLUMN order_items.comment IS 'Customer comment for this specific order item.';
COMMENT ON COLUMN site_contact_settings.notification_email IS 'Email address for receiving order notifications';
COMMENT ON COLUMN site_contact_settings.resend_api_key IS 'Resend API key for sending order notification emails';
COMMENT ON COLUMN characteristic_types.affects_price IS 'If true, this characteristic can affect product price. Multiple characteristics with affects_price=true will show price combination table.';
COMMENT ON COLUMN product_characteristics.affects_price IS 'Override affects_price from characteristic_type for this specific product. NULL means use characteristic_type.affects_price.';
COMMENT ON TABLE product_characteristic_price_combinations IS 'Stores price combinations for products with multiple price-affecting characteristics.';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Database initialization completed successfully!' as status;

