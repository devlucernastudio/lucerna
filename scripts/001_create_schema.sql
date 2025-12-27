-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uk TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_uk TEXT,
  description_en TEXT,
  image_url TEXT,
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
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
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
  type TEXT NOT NULL CHECK (type IN ('hero', 'features', 'gallery', 'testimonials', 'cta')),
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

-- Create helper function to check if user is admin - this prevents infinite recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admins WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins table policies - must come FIRST to avoid recursion
-- Allow authenticated users to check if someone is an admin (needed for other policies)
CREATE POLICY "Authenticated users can view admins" ON admins FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only super admins can modify admins
CREATE POLICY "Super admins can insert admins" ON admins FOR INSERT 
  WITH CHECK (is_admin(auth.uid()) AND (SELECT is_super_admin FROM admins WHERE id = auth.uid()));
  
CREATE POLICY "Super admins can update admins" ON admins FOR UPDATE 
  USING (is_admin(auth.uid()) AND (SELECT is_super_admin FROM admins WHERE id = auth.uid()));
  
CREATE POLICY "Super admins can delete admins" ON admins FOR DELETE 
  USING (is_admin(auth.uid()) AND (SELECT is_super_admin FROM admins WHERE id = auth.uid()));

-- Categories policies using the helper function
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE USING (is_admin(auth.uid()));

-- Products policies - public can see active products, admins can see all
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true OR is_admin(auth.uid()));
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (is_admin(auth.uid()));

-- Blog posts policies using the helper function
CREATE POLICY "Anyone can view published blog posts" ON blog_posts FOR SELECT USING (is_published = true OR is_admin(auth.uid()));
CREATE POLICY "Admins can insert blog posts" ON blog_posts FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update blog posts" ON blog_posts FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete blog posts" ON blog_posts FOR DELETE USING (is_admin(auth.uid()));

-- Content blocks policies using the helper function
CREATE POLICY "Anyone can view active content blocks" ON content_blocks FOR SELECT USING (is_active = true OR is_admin(auth.uid()));
CREATE POLICY "Admins can insert content blocks" ON content_blocks FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update content blocks" ON content_blocks FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete content blocks" ON content_blocks FOR DELETE USING (is_admin(auth.uid()));

-- Orders policies - anyone can create, admins can view/update
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin(auth.uid()));

-- Order items policies using the helper function
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_content_blocks_position ON content_blocks(position) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admins_id ON admins(id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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
