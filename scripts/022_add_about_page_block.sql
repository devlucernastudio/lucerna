-- Add about_page type to content_blocks CHECK constraint
-- First, drop the existing constraint
ALTER TABLE content_blocks DROP CONSTRAINT IF EXISTS content_blocks_type_check;

-- Add new constraint with about_page type
ALTER TABLE content_blocks ADD CONSTRAINT content_blocks_type_check 
  CHECK (type IN ('hero', 'features', 'about', 'about_page', 'gallery', 'testimonials', 'cta'));

-- Insert default about_page content block if it doesn't exist
INSERT INTO content_blocks (type, title_uk, title_en, content_uk, content_en, position, is_active)
VALUES (
  'about_page',
  'Про Lucerna Studio',
  'About Lucerna Studio',
  '<h2>Майстерня природної естетики</h2><p>Наші колекції народжуються на стику ремесла й сучасного дизайну. У кожному виробі відчувається тепло ручної роботи, увага до деталей та прагнення до гармонії. Ми віримо, що наші вироби здатні змінювати атмосферу простору, робити його більш живим, затишним, і по-справжньому наближеним до природи.</p><h2>Природна естетика як філософія</h2><p>Філософія Lucerna Studio базується на природній естетиці. Це про речі, які створюють емоцію, стають не просто частиною вашого простору, а справжнім арт-об''єктом.</p>',
  '<h2>Natural Aesthetics Workshop</h2><p>Our collections are born at the intersection of craftsmanship and modern design. Each piece feels the warmth of handwork, attention to detail, and a desire for harmony. We believe that our products can change the atmosphere of space, make it more alive, cozy, and truly close to nature.</p><h2>Natural Aesthetics as Philosophy</h2><p>The philosophy of Lucerna Studio is based on natural aesthetics. It''s about things that create emotion, become not just part of your space, but a true art object.</p>',
  0,
  true
)
ON CONFLICT DO NOTHING;

