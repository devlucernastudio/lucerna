-- Add 'custom' type to content_blocks enum
-- First, drop the existing check constraint
ALTER TABLE content_blocks
DROP CONSTRAINT IF EXISTS content_blocks_type_check;

-- Re-add the check constraint with the new 'custom' value
ALTER TABLE content_blocks
ADD CONSTRAINT content_blocks_type_check
CHECK (type IN ('hero', 'features', 'about', 'gallery', 'testimonials', 'cta', 'about_page', 'custom'));

-- Insert default content for the 'custom' block
INSERT INTO content_blocks (type, title_uk, title_en, content_uk, content_en, position, is_active, images, settings) VALUES
(
    'custom',
    'Кастом',
    'Custom',
    '', -- content_uk and content_en are no longer used, content is in settings
    '',
    5, -- Position after about section
    true,
    '{}'::text[], -- Empty images array initially
    '{
        "column1_uk": "Окрім наявних моделей в колекціях, ми створюємо світильники на замовлення - коли форма, розмір і текстура поверхні народжуються спеціально для вашого простору.\nКожен кастомний виріб - це діалог між архітектурою інтер''єру, натуральними матеріалами та кропіткою ручною роботою.",
        "column1_en": "In addition to existing models in collections, we create custom lamps - when form, size and surface texture are born specifically for your space.\nEach custom piece is a dialogue between interior architecture, natural materials and meticulous handwork.",
        "column2_uk": "Ви можете обрати:\n- індивідуальні форми та розміри світильників;\n- колір і текстуру поверхні;\n- тип підвісу та індивідуальну довжину підвісу.\nМи працюємо з житловими інтер''єрами, HoReCa-проєктами та архітектурними просторами, де важлива не просто функція, а атмосфера.",
        "column2_en": "You can choose:\n- individual forms and sizes of lamps;\n- color and surface texture;\n- suspension type and individual suspension length.\nWe work with residential interiors, HoReCa projects and architectural spaces where atmosphere matters, not just function.",
        "signature_uk": "Lucerna Studio - світло, створене спеціально для вас 🤍",
        "signature_en": "Lucerna Studio - light created specifically for you 🤍"
    }'::jsonb
)
ON CONFLICT DO NOTHING;

