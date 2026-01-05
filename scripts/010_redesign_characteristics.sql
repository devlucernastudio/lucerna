-- Migration script: Redesign product characteristics system
-- This migration redesigns the characteristics system to be fully dynamic and reusable
-- It preserves existing data where possible

-- ============================================
-- STEP 1: Create new characteristic_types table (replaces attribute_types)
-- ============================================

-- Create new characteristic_types table with enhanced structure
CREATE TABLE IF NOT EXISTS characteristic_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uk TEXT NOT NULL,
  name_en TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('color_palette', 'manual_colors', 'select', 'checkbox', 'text', 'textarea')),
  required BOOLEAN DEFAULT false,
  reusable BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_characteristic_types_position ON characteristic_types(position);
CREATE INDEX IF NOT EXISTS idx_characteristic_types_reusable ON characteristic_types(reusable);

-- ============================================
-- STEP 2: Create characteristic_options table
-- ============================================

CREATE TABLE IF NOT EXISTS characteristic_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  characteristic_type_id UUID NOT NULL REFERENCES characteristic_types(id) ON DELETE CASCADE,
  name_uk TEXT,
  name_en TEXT,
  value TEXT NOT NULL, -- For colors: hex code, for select: option value
  color_code TEXT, -- For color options
  position INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(characteristic_type_id, value) -- Prevent duplicate options for same type
);

CREATE INDEX IF NOT EXISTS idx_characteristic_options_type ON characteristic_options(characteristic_type_id);
CREATE INDEX IF NOT EXISTS idx_characteristic_options_position ON characteristic_options(characteristic_type_id, position);

-- ============================================
-- STEP 3: Create product_characteristics table (replaces product_attributes)
-- ============================================

CREATE TABLE IF NOT EXISTS product_characteristics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  characteristic_type_id UUID NOT NULL REFERENCES characteristic_types(id) ON DELETE CASCADE,
  -- Override settings
  required BOOLEAN, -- NULL means use characteristic_type.required
  price_override DECIMAL(10, 2), -- NULL means no price override
  -- Selected values (JSONB for flexibility)
  selected_values JSONB, -- Structure depends on input_type:
                         -- select/checkbox: ["option_id1", "option_id2"]
                         -- color_palette/manual_colors: ["option_id1"]
                         -- text/textarea: "user input text"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, characteristic_type_id)
);

CREATE INDEX IF NOT EXISTS idx_product_characteristics_product ON product_characteristics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_characteristics_type ON product_characteristics(characteristic_type_id);

-- ============================================
-- STEP 4: Migrate existing data (if any)
-- ============================================

-- Migrate attribute_types to characteristic_types (if table exists)
-- Note: This migration uses a DO block to handle potential ID conflicts
DO $$
DECLARE
  attr_record RECORD;
  table_exists BOOLEAN;
BEGIN
  -- Check if attribute_types table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'attribute_types'
  ) INTO table_exists;
  
  IF table_exists THEN
    FOR attr_record IN SELECT * FROM attribute_types
    LOOP
      -- Check if characteristic_type with this ID already exists
      IF NOT EXISTS (SELECT 1 FROM characteristic_types WHERE id = attr_record.id) THEN
        INSERT INTO characteristic_types (id, name_uk, name_en, input_type, required, reusable, created_at, updated_at)
        VALUES (
          attr_record.id,
          attr_record.name_uk,
          attr_record.name_en,
          CASE 
            WHEN attr_record.type = 'color' THEN 'manual_colors'
            WHEN attr_record.type = 'reference' THEN 'select'
            ELSE 'text'
          END,
          false,
          true,
          attr_record.created_at,
          attr_record.updated_at
        );
      END IF;
    END LOOP;
  END IF;
END $$;

-- Note: Existing product_attributes will need manual migration based on business logic
-- We keep the old tables for now and will deprecate them after migration verification

-- ============================================
-- STEP 5: Enable RLS for new tables
-- ============================================

ALTER TABLE characteristic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE characteristic_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_characteristics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for characteristic_types
DROP POLICY IF EXISTS "Anyone can view characteristic types" ON characteristic_types;
CREATE POLICY "Anyone can view characteristic types" ON characteristic_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage characteristic types" ON characteristic_types;
CREATE POLICY "Admins can manage characteristic types" ON characteristic_types FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for characteristic_options
DROP POLICY IF EXISTS "Anyone can view characteristic options" ON characteristic_options;
CREATE POLICY "Anyone can view characteristic options" ON characteristic_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage characteristic options" ON characteristic_options;
CREATE POLICY "Admins can manage characteristic options" ON characteristic_options FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for product_characteristics
DROP POLICY IF EXISTS "Anyone can view product characteristics" ON product_characteristics;
CREATE POLICY "Anyone can view product characteristics" ON product_characteristics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage product characteristics" ON product_characteristics;
CREATE POLICY "Admins can manage product characteristics" ON product_characteristics FOR ALL USING (is_admin(auth.uid()));

-- ============================================
-- STEP 6: Create triggers for updated_at
-- ============================================

CREATE TRIGGER update_characteristic_types_updated_at 
  BEFORE UPDATE ON characteristic_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characteristic_options_updated_at 
  BEFORE UPDATE ON characteristic_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_characteristics_updated_at 
  BEFORE UPDATE ON product_characteristics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 7: Mark old columns as deprecated (DO NOT DROP YET)
-- ============================================

-- Add deprecation comments (only if tables/columns exist)
DO $$
BEGIN
  -- Comment on attribute_types if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attribute_types') THEN
    COMMENT ON TABLE attribute_types IS 'DEPRECATED: Use characteristic_types instead. Will be removed in future migration.';
  END IF;
  
  -- Comment on product_attributes if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_attributes') THEN
    COMMENT ON TABLE product_attributes IS 'DEPRECATED: Use product_characteristics instead. Will be removed in future migration.';
  END IF;
  
  -- Comment on product_colors if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_colors') THEN
    COMMENT ON TABLE product_colors IS 'DEPRECATED: Colors are now handled through characteristic_types with input_type=color_palette or manual_colors. Will be removed in future migration.';
  END IF;
  
  -- Comment on products columns if they exist
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'color_selection_enabled') THEN
    COMMENT ON COLUMN products.color_selection_enabled IS 'DEPRECATED: Use characteristic_types with input_type=color_palette or manual_colors instead. Will be removed in future migration.';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'color_selection_type') THEN
    COMMENT ON COLUMN products.color_selection_type IS 'DEPRECATED: Use characteristic_types with input_type=color_palette or manual_colors instead. Will be removed in future migration.';
  END IF;
END $$;

-- ============================================
-- STEP 8: Create helper view for product characteristics with full details
-- ============================================

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
  pc.price_override,
  pc.selected_values,
  pc.created_at,
  pc.updated_at
FROM product_characteristics pc
JOIN characteristic_types ct ON pc.characteristic_type_id = ct.id;

-- Grant access to view
GRANT SELECT ON product_characteristics_full TO authenticated;
GRANT SELECT ON product_characteristics_full TO anon;

