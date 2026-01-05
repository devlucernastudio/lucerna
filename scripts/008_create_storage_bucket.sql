-- Create storage bucket for product images
-- Note: This needs to be run in Supabase SQL Editor or via Supabase CLI

-- First, create the bucket manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create new bucket named "product-images"
-- 3. Make it public (or set up proper RLS policies)

-- Create the is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admins WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow public read access to product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- RLS Policy: Allow admins to upload product images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND is_admin(auth.uid())
);

-- RLS Policy: Allow admins to update product images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND is_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'product-images' 
  AND is_admin(auth.uid())
);

-- RLS Policy: Allow admins to delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND is_admin(auth.uid())
);

-- RLS Policy: Allow public read access
CREATE POLICY "Public can read product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');