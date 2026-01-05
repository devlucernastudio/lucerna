-- Add color selection columns to products table
-- This is a quick fix if 007_add_new_features.sql wasn't fully executed

-- Add color selection settings to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_selection_enabled BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_selection_type TEXT CHECK (color_selection_type IN ('palette', 'custom')) DEFAULT 'custom';

-- Also ensure is_in_stock exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT true;
ALTER TABLE products ALTER COLUMN stock DROP NOT NULL;

