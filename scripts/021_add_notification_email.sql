-- Add notification_email and resend_api_key columns to site_contact_settings table

-- Add notification_email column
ALTER TABLE site_contact_settings ADD COLUMN IF NOT EXISTS notification_email TEXT;

-- Add resend_api_key column for Resend email service integration
ALTER TABLE site_contact_settings ADD COLUMN IF NOT EXISTS resend_api_key TEXT;

-- Add comments for the new columns
COMMENT ON COLUMN site_contact_settings.notification_email IS 'Email address for receiving order notifications';
COMMENT ON COLUMN site_contact_settings.resend_api_key IS 'Resend API key for sending order notification emails';

