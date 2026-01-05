-- Fix blog_posts RLS policy - use is_published instead of status
-- Drop all existing blog_posts policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_select_public" ON blog_posts;
DROP POLICY IF EXISTS "Admins full access to blog posts" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_all_admin" ON blog_posts;
DROP POLICY IF EXISTS "Admins can do everything with blog posts (ALL)" ON blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;

-- Create public read policy for published blog posts
CREATE POLICY "Anyone can view published blog posts"
ON blog_posts
FOR SELECT
USING (is_published = true);

-- Create admin full access policy
CREATE POLICY "Admins full access to blog posts"
ON blog_posts
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());
