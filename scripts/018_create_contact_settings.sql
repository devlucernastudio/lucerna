-- Create site_contact_settings table
CREATE TABLE IF NOT EXISTS site_contact_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  phone TEXT,
  working_hours_uk TEXT,
  working_hours_en TEXT,
  address_uk TEXT,
  address_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Insert default row
INSERT INTO site_contact_settings (id, email, phone, working_hours_uk, working_hours_en, address_uk, address_en)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, '', '', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Create social_media_links table
CREATE TABLE IF NOT EXISTS social_media_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL UNIQUE,
  url TEXT,
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_platform CHECK (platform IN ('facebook', 'instagram', 'viber', 'telegram', 'whatsapp', 'threads', 'x'))
);

-- Insert default social media platforms
INSERT INTO social_media_links (platform, url, is_enabled)
VALUES 
  ('facebook', '', false),
  ('instagram', '', false),
  ('viber', '', false),
  ('telegram', '', false),
  ('whatsapp', '', false),
  ('threads', '', false),
  ('x', '', false)
ON CONFLICT (platform) DO NOTHING;

-- Enable RLS
ALTER TABLE site_contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_contact_settings
CREATE POLICY "Anyone can view contact settings"
ON site_contact_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage contact settings"
ON site_contact_settings
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- RLS Policies for social_media_links
CREATE POLICY "Anyone can view enabled social media links"
ON social_media_links
FOR SELECT
USING (is_enabled = true OR is_admin());

CREATE POLICY "Admins can manage social media links"
ON social_media_links
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_media_platform ON social_media_links(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_enabled ON social_media_links(is_enabled) WHERE is_enabled = true;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_contact_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_contact_settings_updated_at
BEFORE UPDATE ON site_contact_settings
FOR EACH ROW
EXECUTE FUNCTION update_contact_settings_updated_at();

CREATE TRIGGER update_social_media_links_updated_at
BEFORE UPDATE ON social_media_links
FOR EACH ROW
EXECUTE FUNCTION update_contact_settings_updated_at();

