-- Add 'additional_info' type to content_blocks enum
ALTER TABLE content_blocks
DROP CONSTRAINT IF EXISTS content_blocks_type_check;
ALTER TABLE content_blocks
ADD CONSTRAINT content_blocks_type_check
CHECK (type IN ('hero', 'features', 'about', 'gallery', 'testimonials', 'cta', 'about_page', 'custom', 'additional_info'));

-- Insert default content for the 'additional_info' block
INSERT INTO content_blocks (type, title_uk, title_en, content_uk, content_en, position, is_active, settings) VALUES
(
    'additional_info',
    'Додаткова інформація',
    'Additional Information',
    '<p>Додаткова інформація про товар</p>',
    '<p>Additional product information</p>',
    10,
    false, -- Disabled by default
    '{"enabled": false}'::jsonb
)
ON CONFLICT DO NOTHING;

