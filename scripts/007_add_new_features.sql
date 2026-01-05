-- Migration script for new features: subcategories, multiple categories, attributes, colors, stock option

-- 1. Add parent_id to categories for subcategories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- 2. Create many-to-many relationship between products and categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);

-- 3. Add is_in_stock boolean to products (alternative to stock quantity)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT true;
ALTER TABLE products ALTER COLUMN stock DROP NOT NULL;

-- 4. Create attribute types table
CREATE TABLE IF NOT EXISTS attribute_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uk TEXT NOT NULL,
  name_en TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'color', 'reference')),
  reference_attribute_type_id UUID REFERENCES attribute_types(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create product attributes table (custom fields)
CREATE TABLE IF NOT EXISTS product_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_type_id UUID NOT NULL REFERENCES attribute_types(id) ON DELETE CASCADE,
  value_text TEXT,
  value_color TEXT,
  value_reference_id UUID REFERENCES product_attributes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_attributes_product ON product_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attributes_type ON product_attributes(attribute_type_id);

-- 6. Create product colors table
CREATE TABLE IF NOT EXISTS product_colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_code TEXT NOT NULL,
  color_name_uk TEXT,
  color_name_en TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_colors_product ON product_colors(product_id);

-- 7. Add color selection settings to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_selection_enabled BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_selection_type TEXT CHECK (color_selection_type IN ('palette', 'custom')) DEFAULT 'custom';

-- Enable RLS for new tables
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories
CREATE POLICY "Anyone can view product categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage product categories" ON product_categories FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for attribute_types
CREATE POLICY "Anyone can view attribute types" ON attribute_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage attribute types" ON attribute_types FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for product_attributes
CREATE POLICY "Anyone can view product attributes" ON product_attributes FOR SELECT USING (true);
CREATE POLICY "Admins can manage product attributes" ON product_attributes FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for product_colors
CREATE POLICY "Anyone can view product colors" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Admins can manage product colors" ON product_colors FOR ALL USING (is_admin(auth.uid()));

-- Update trigger for attribute_types
CREATE TRIGGER update_attribute_types_updated_at BEFORE UPDATE ON attribute_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for product_attributes
CREATE TRIGGER update_product_attributes_updated_at BEFORE UPDATE ON product_attributes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

