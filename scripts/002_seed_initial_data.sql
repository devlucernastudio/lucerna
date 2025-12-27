-- Insert categories
INSERT INTO categories (name_uk, name_en, slug, description_uk, description_en) VALUES
  ('Підвісні світильники', 'Pendant Lamps', 'pendant-lamps', 'Елегантні підвісні світильники ручної роботи', 'Elegant handmade pendant lamps'),
  ('Настільні лампи', 'Table Lamps', 'table-lamps', 'Унікальні настільні лампи', 'Unique table lamps'),
  ('Настінні світильники', 'Wall Lamps', 'wall-lamps', 'Декоративні настінні світильники', 'Decorative wall lamps')
ON CONFLICT (slug) DO NOTHING;

-- Insert products
INSERT INTO products (
  category_id, 
  name_uk, 
  name_en, 
  slug, 
  description_uk, 
  description_en, 
  price, 
  compare_at_price, 
  stock, 
  sku, 
  images, 
  is_featured
) VALUES
  (
    (SELECT id FROM categories WHERE slug = 'pendant-lamps' LIMIT 1),
    'Білий текстурований світильник "Гінкго"',
    'White Textured Pendant Lamp "Ginkgo"',
    'white-textured-ginkgo',
    'Елегантний підвісний світильник з текстурою листя гінкго. Виготовлений вручну з високоякісної глини.',
    'Elegant pendant lamp with ginkgo leaf texture. Handmade from high-quality clay.',
    2800.00,
    3200.00,
    5,
    'LUC-P-001',
    ARRAY['/white-textured-pendant-lamp-ginkgo-leaf-design.jpg'],
    true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'pendant-lamps' LIMIT 1),
    'Кремовий світильник "Поле"',
    'Cream Elongated Pendant Lamp "Field"',
    'cream-elongated-field',
    'Витончений кремовий світильник з природним орнаментом.',
    'Refined cream pendant lamp with natural pattern.',
    2500.00,
    NULL,
    8,
    'LUC-P-002',
    ARRAY['/cream-elongated-pendant-lamp-nature-field.jpg'],
    true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'pendant-lamps' LIMIT 1),
    'Конічний світильник "Соти"',
    'Textured Cone Pendant Lamp "Honeycomb"',
    'textured-cone-honeycomb',
    'Унікальний конічний світильник з текстурою сот.',
    'Unique cone-shaped lamp with honeycomb texture.',
    3000.00,
    3500.00,
    3,
    'LUC-P-003',
    ARRAY['/textured-cone-pendant-lamp-honeycomb-pattern.jpg'],
    true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'pendant-lamps' LIMIT 1),
    'Мінімалістичний дзвін',
    'Smooth White Bell Pendant Lamp',
    'smooth-white-bell-minimalist',
    'Лаконічний білий світильник у формі дзвону.',
    'Minimalist white bell-shaped pendant lamp.',
    2200.00,
    NULL,
    6,
    'LUC-P-004',
    ARRAY['/smooth-white-bell-pendant-lamp-minimalist.jpg'],
    false
  ),
  (
    (SELECT id FROM categories WHERE slug = 'pendant-lamps' LIMIT 1),
    'Великий купол з теплим світлом',
    'Large Dome Pendant Lamp',
    'large-dome-warm-glow',
    'Масивний купольний світильник з м''яким теплим світлом.',
    'Massive dome lamp with soft warm glow.',
    3800.00,
    4200.00,
    2,
    'LUC-P-005',
    ARRAY['/large-dome-pendant-lamp-warm-interior-glow.jpg'],
    true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'pendant-lamps' LIMIT 1),
    'Хвилястий світильник "Гриб"',
    'Wavy Textured Pendant Lamp "Mushroom"',
    'wavy-textured-mushroom',
    'Оригінальний світильник у формі гриба з хвилястою текстурою.',
    'Original mushroom-shaped lamp with wavy texture.',
    2600.00,
    NULL,
    4,
    'LUC-P-006',
    ARRAY['/wavy-textured-pendant-lamp-mushroom-shape.jpg'],
    false
  ),
  (
    (SELECT id FROM categories WHERE slug = 'pendant-lamps' LIMIT 1),
    'Елегантний купол з коричневою основою',
    'Elegant White Dome with Brown Base',
    'elegant-dome-brown-base',
    'Стильний світильник з контрастною коричневою основою.',
    'Stylish lamp with contrasting brown base.',
    3200.00,
    NULL,
    5,
    'LUC-P-007',
    ARRAY['/elegant-white-dome-pendant-lamp-warm-glow-brown-ba.jpg'],
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert blog posts
INSERT INTO blog_posts (
  title_uk,
  title_en,
  slug,
  excerpt_uk,
  excerpt_en,
  content_uk,
  content_en,
  cover_image
) VALUES
  (
    'Як обрати ідеальне освітлення для вашого дому',
    'How to Choose Perfect Lighting for Your Home',
    'choose-perfect-lighting',
    'Правильне освітлення може повністю змінити атмосферу вашого простору.',
    'Proper lighting can completely transform the atmosphere of your space.',
    'Освітлення - це один з найважливіших елементів інтер''єру. Воно не лише забезпечує функціональність, але й створює настрій і атмосферу. У цій статті ми розповімо, як правильно підібрати освітлення для різних кімнат вашого дому.',
    'Lighting is one of the most important interior elements. It not only provides functionality but also creates mood and atmosphere. In this article, we will tell you how to properly select lighting for different rooms in your home.',
    '/modern-interior-lighting.jpg'
  ),
  (
    'Мистецтво ручної роботи: створення кераміки',
    'The Art of Handcraft: Creating Ceramics',
    'art-of-handcraft-ceramics',
    'Дізнайтесь про процес створення наших унікальних світильників.',
    'Learn about the process of creating our unique lamps.',
    'Кожен наш світильник - це результат багатогодинної ретельної роботи. Від підготовки глини до фінального випалу - кожен етап важливий і вимагає майстерності.',
    'Each of our lamps is the result of many hours of meticulous work. From preparing the clay to the final firing - every stage is important and requires skill.',
    '/handmade-craft-workshop.jpg'
  ),
  (
    'Тренди освітлення 2024',
    'Lighting Trends 2024',
    'lighting-trends-2024',
    'Найактуальніші тренди у світі світильників цього року.',
    'The most relevant trends in the world of lighting this year.',
    'У 2024 році в тренді природні матеріали, мінімалізм та органічні форми. Керамічні світильники ручної роботи залишаються на піку популярності.',
    'In 2024, natural materials, minimalism and organic forms are trending. Handmade ceramic lamps remain at the peak of popularity.',
    '/contemporary-lighting-design.jpg'
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert homepage content blocks
INSERT INTO content_blocks (type, title_uk, title_en, content_uk, content_en, position, settings) VALUES
  (
    'hero',
    'Унікальні світильники ручної роботи',
    'Unique Handmade Lamps',
    'Створюємо атмосферу тепла і затишку у вашому домі',
    'Creating an atmosphere of warmth and coziness in your home',
    1,
    '{"backgroundImage": "/hero-lamp.jpg", "buttonText": "Переглянути каталог", "buttonLink": "/catalog"}'::jsonb
  ),
  (
    'features',
    'Чому обирають нас',
    'Why Choose Us',
    'Ручна робота|Натуральні матеріали|Унікальний дизайн|Екологічність',
    'Handmade|Natural Materials|Unique Design|Eco-friendly',
    2,
    '{}'::jsonb
  )
ON CONFLICT DO NOTHING;
