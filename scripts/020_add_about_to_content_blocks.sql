-- Add 'about' type to content_blocks and create default about block

-- First, drop the constraint and recreate it with 'about' type
ALTER TABLE content_blocks DROP CONSTRAINT IF EXISTS content_blocks_type_check;

ALTER TABLE content_blocks 
ADD CONSTRAINT content_blocks_type_check 
CHECK (type IN ('hero', 'features', 'about', 'gallery', 'testimonials', 'cta'));

-- Insert default about block if it doesn't exist
INSERT INTO content_blocks (type, title_uk, title_en, content_uk, content_en, position, is_active)
VALUES (
  'about',
  'Про Lucerna Studio',
  'About Lucerna Studio',
  'Кожен світильник Lucerna - це унікальний витвір мистецтва, створений вручну з натуральних матеріалів. Наші роботи втілюють гармонію природних форм та сучасного дизайну, додаючи теплоти та затишку вашому простору.',
  'Each Lucerna lamp is a unique work of art, handcrafted from natural materials. Our works embody the harmony of natural forms and modern design, adding warmth and coziness to your space.',
  3,
  true
)
ON CONFLICT DO NOTHING;

