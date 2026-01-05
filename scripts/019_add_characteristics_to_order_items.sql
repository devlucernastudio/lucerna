-- Add characteristics and comment columns to order_items table

-- Add characteristics column (JSONB to store characteristics data)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS characteristics JSONB;

-- Add comment column (TEXT to store customer comment for the item)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS comment TEXT;

-- Add comment for the new columns
COMMENT ON COLUMN order_items.characteristics IS 'Stores product characteristics as JSONB object with characteristic names as keys and values as strings. For colors, may include hex code.';
COMMENT ON COLUMN order_items.comment IS 'Customer comment for this specific order item.';

-- Create index on characteristics column for better query performance
CREATE INDEX IF NOT EXISTS idx_order_items_characteristics ON order_items USING gin (characteristics);

