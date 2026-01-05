-- Update characteristics schema to match new requirements
-- Adds affectsPrice field and updates input types

-- ============================================
-- STEP 1: Add affectsPrice to characteristic_types
-- ============================================

ALTER TABLE characteristic_types ADD COLUMN IF NOT EXISTS affects_price BOOLEAN DEFAULT false;

-- ============================================
-- STEP 2: Update input_type values
-- ============================================

-- Rename manual_colors to color_custom
UPDATE characteristic_types 
SET input_type = 'color_custom' 
WHERE input_type = 'manual_colors';

-- Remove textarea type (convert to text if exists)
UPDATE characteristic_types 
SET input_type = 'text' 
WHERE input_type = 'textarea';

-- ============================================
-- STEP 3: Update CHECK constraint for input_type
-- ============================================

-- Drop old constraint
ALTER TABLE characteristic_types DROP CONSTRAINT IF EXISTS characteristic_types_input_type_check;

-- Add new constraint with updated values
ALTER TABLE characteristic_types 
ADD CONSTRAINT characteristic_types_input_type_check 
CHECK (input_type IN ('color_palette', 'color_custom', 'select', 'checkbox', 'text'));

-- ============================================
-- STEP 4: Update product_characteristics to support price combinations
-- ============================================

-- Add affects_price override (if product wants to override the type's affects_price)
ALTER TABLE product_characteristics ADD COLUMN IF NOT EXISTS affects_price BOOLEAN;

-- ============================================
-- STEP 5: Create table for price combinations
-- ============================================

CREATE TABLE IF NOT EXISTS product_characteristic_price_combinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  -- Store combination as JSONB: { "char_type_id_1": "option_id_1", "char_type_id_2": "option_id_2" }
  combination JSONB NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, combination)
);

CREATE INDEX IF NOT EXISTS idx_price_combinations_product ON product_characteristic_price_combinations(product_id);

-- Enable RLS
ALTER TABLE product_characteristic_price_combinations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view price combinations" ON product_characteristic_price_combinations;
CREATE POLICY "Anyone can view price combinations" ON product_characteristic_price_combinations 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage price combinations" ON product_characteristic_price_combinations;
CREATE POLICY "Admins can manage price combinations" ON product_characteristic_price_combinations 
  FOR ALL USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_price_combinations_updated_at 
  BEFORE UPDATE ON product_characteristic_price_combinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: Add comment
-- ============================================

COMMENT ON COLUMN characteristic_types.affects_price IS 'If true, this characteristic can affect product price. Multiple characteristics with affects_price=true will show price combination table.';
COMMENT ON COLUMN product_characteristics.affects_price IS 'Override affects_price from characteristic_type for this specific product. NULL means use characteristic_type.affects_price.';
COMMENT ON TABLE product_characteristic_price_combinations IS 'Stores price combinations for products with multiple price-affecting characteristics.';

