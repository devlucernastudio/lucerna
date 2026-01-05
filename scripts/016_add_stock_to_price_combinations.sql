-- Add stock column to product_characteristic_price_combinations table
-- This allows specifying individual stock quantities for each price combination

ALTER TABLE product_characteristic_price_combinations 
ADD COLUMN IF NOT EXISTS stock INTEGER;

-- Create index for better performance when querying by stock
CREATE INDEX IF NOT EXISTS idx_product_characteristic_price_combinations_stock 
ON product_characteristic_price_combinations(product_id, stock) 
WHERE stock IS NOT NULL;

