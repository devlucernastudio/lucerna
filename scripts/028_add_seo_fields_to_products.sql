-- Add SEO fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS seo_title_uk TEXT,
ADD COLUMN IF NOT EXISTS seo_title_en TEXT,
ADD COLUMN IF NOT EXISTS meta_description_uk TEXT,
ADD COLUMN IF NOT EXISTS meta_description_en TEXT;
