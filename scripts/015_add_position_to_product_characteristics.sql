-- Add position column to product_characteristics table for ordering
ALTER TABLE product_characteristics ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Create index for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_product_characteristics_position ON product_characteristics(product_id, position);

-- Update existing records to have sequential positions based on creation order
UPDATE product_characteristics
SET position = sub.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at) as row_num
  FROM product_characteristics
) sub
WHERE product_characteristics.id = sub.id;

