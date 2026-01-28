-- Create downloadable_files table
CREATE TABLE IF NOT EXISTS downloadable_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_uk TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_uk TEXT,
  description_en TEXT,
  link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_downloadable_files table for many-to-many relationship
CREATE TABLE IF NOT EXISTS product_downloadable_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  downloadable_file_id UUID NOT NULL REFERENCES downloadable_files(id) ON DELETE CASCADE,
  show_file BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, downloadable_file_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_downloadable_files_product ON product_downloadable_files(product_id);
CREATE INDEX IF NOT EXISTS idx_product_downloadable_files_file ON product_downloadable_files(downloadable_file_id);

-- Enable Row Level Security
ALTER TABLE downloadable_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_downloadable_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for downloadable_files
-- Allow public read access
CREATE POLICY "Allow public read access to downloadable_files"
  ON downloadable_files FOR SELECT
  USING (true);

-- Allow admins to manage downloadable_files
CREATE POLICY "Allow admins to insert downloadable_files"
  ON downloadable_files FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Allow admins to update downloadable_files"
  ON downloadable_files FOR UPDATE
  USING (is_admin());

CREATE POLICY "Allow admins to delete downloadable_files"
  ON downloadable_files FOR DELETE
  USING (is_admin());

-- RLS Policies for product_downloadable_files
-- Allow public read access
CREATE POLICY "Allow public read access to product_downloadable_files"
  ON product_downloadable_files FOR SELECT
  USING (true);

-- Allow admins to manage product_downloadable_files
CREATE POLICY "Allow admins to insert product_downloadable_files"
  ON product_downloadable_files FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Allow admins to update product_downloadable_files"
  ON product_downloadable_files FOR UPDATE
  USING (is_admin());

CREATE POLICY "Allow admins to delete product_downloadable_files"
  ON product_downloadable_files FOR DELETE
  USING (is_admin());
