-- This script creates the first admin user
-- Run this after signing up the first admin through Supabase Auth UI or the signup form

-- Replace 'YOUR_USER_ID' with the actual user ID from auth.users table
-- You can get it by running: SELECT id, email FROM auth.users;

-- INSERT INTO admins (id, email, full_name, is_super_admin)
-- VALUES ('YOUR_USER_ID', 'admin@lucerna-studio.com', 'Admin User', true);

-- For now, create a trigger to auto-add admins based on email domain
CREATE OR REPLACE FUNCTION auto_create_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-create admin for specific email
  IF NEW.email = 'admin@lucerna-studio.com' OR NEW.email LIKE '%@lucerna-studio.com' THEN
    INSERT INTO admins (id, email, is_super_admin)
    VALUES (NEW.id, NEW.email, true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;

CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_admin();
