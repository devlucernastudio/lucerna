# Інструкція з налаштування нової БД Supabase

Ця інструкція допоможе вам налаштувати новий проект Supabase з нуля для сайту Lucerna Studio.

## Крок 1: Створення нового проекту Supabase

1. Перейдіть на [supabase.com](https://supabase.com) та увійдіть в свій акаунт
2. Натисніть "New Project"
3. Заповніть форму:
   - **Name**: Назва проекту (наприклад, "Lucerna Studio")
   - **Database Password**: Створіть надійний пароль (збережіть його!)
   - **Region**: Оберіть найближчий регіон
4. Натисніть "Create new project" та дочекайтесь завершення створення (зазвичай 1-2 хвилини)

## Крок 2: Налаштування змінних оточення

1. В проекті Supabase перейдіть в **Settings** → **API**
2. Скопіюйте наступні значення:
   - **Project URL** (це буде `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (це буде `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

3. Створіть файл `.env.local` в корені проекту (якщо його ще немає):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Крок 3: Виконання міграцій

1. В Supabase Dashboard перейдіть в **SQL Editor**
2. Відкрийте файл `scripts/000_initialize_database.sql` з проекту
3. Скопіюйте весь вміст файлу та вставте в SQL Editor
4. Натисніть "Run" або `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (Mac)
5. Перевірте, що виконання завершилось успішно (має з'явитись повідомлення "Database initialization completed successfully!")

## Крок 4: Налаштування Storage Bucket

1. В Supabase Dashboard перейдіть в **Storage**
2. Натисніть "Create bucket"
3. Налаштування:
   - **Name**: `product-images`
   - **Public bucket**: Увімкніть (зробити публічним)
4. Натисніть "Create bucket"

**Альтернативно**: Можна виконати скрипт `scripts/008_create_storage_bucket.sql` в SQL Editor, але краще створити bucket вручну через Dashboard.

## Крок 5: Створення першого адміністратора

### Варіант 1: Через форму реєстрації (рекомендовано)

1. Запустіть проект локально: `npm run dev`
2. Перейдіть на `http://localhost:3000/admin/signup`
3. Заповніть форму:
   - **Повне ім'я**: Ваше ім'я
   - **Email**: Ваш email
   - **Пароль**: Мінімум 6 символів
4. Натисніть "Створити адмін аккаунт"
5. Після успішної реєстрації ви будете перенаправлені на сторінку входу

**Важливо**: Після створення першого адміна, роут `/admin/signup` автоматично закриється для безпеки.

### Варіант 2: Через SQL (якщо потрібно створити адміна вручну)

1. Спочатку створіть користувача через Supabase Auth:
   - Перейдіть в **Authentication** → **Users**
   - Натисніть "Add user" → "Create new user"
   - Введіть email та пароль
   - Скопіюйте **User UID** (потрібен для наступного кроку)

2. В SQL Editor виконайте:
   ```sql
   INSERT INTO admins (id, email, full_name, is_super_admin)
   VALUES ('YOUR_USER_ID_HERE', 'admin@example.com', 'Admin Name', true);
   ```
   Замініть `YOUR_USER_ID_HERE` на скопійований User UID.

## Крок 6: Перевірка налаштування

1. Перевірте, що всі таблиці створені:
   - Перейдіть в **Table Editor**
   - Мають бути присутні: `categories`, `products`, `orders`, `order_items`, `blog_posts`, `content_blocks`, `admins`, `characteristic_types`, `characteristic_options`, `product_characteristics`, `site_contact_settings`, `social_media_links`

2. Перевірте Storage:
   - Перейдіть в **Storage** → **Buckets**
   - Має бути bucket `product-images`

3. Перевірте авторизацію:
   - Спробуйте увійти через `/admin/login`
   - Перевірте, що `/admin/signup` закритий (якщо адмін вже створений)

## Важливі примітки

- **Storage Bucket**: Якщо ви не зробили bucket публічним, потрібно налаштувати RLS політики для доступу до зображень
- **Email підтвердження**: За замовчуванням Supabase вимагає підтвердження email. Можна вимкнути це в **Authentication** → **Settings** → **Email Auth** → вимкнути "Confirm email"
- **RLS Policies**: Всі RLS політики налаштовані в скрипті `000_initialize_database.sql`
- **Перший адмін**: Після створення першого адміна, роут реєстрації автоматично закривається для безпеки

## Додаткові налаштування (опціонально)

### Налаштування email сповіщень

1. Перейдіть в `/admin/settings`
2. Знайдіть блок "Сповіщення про замовлення"
3. Введіть:
   - **Email для сповіщень**: Email, на який будуть приходити сповіщення
   - **Resend API Key**: API ключ з [resend.com](https://resend.com/api-keys)
4. Натисніть "Зберегти налаштування сповіщень"

### Налаштування контактної інформації

1. Перейдіть в `/admin/settings`
2. Знайдіть блок "Контактна інформація"
3. Заповніть всі поля та натисніть "Зберегти контакти"

## Усунення проблем

### Помилка "relation does not exist"
- Перевірте, що ви виконали скрипт `000_initialize_database.sql` повністю
- Перевірте, що всі таблиці створені в Table Editor

### Помилка при створенні адміна
- Перевірте, що користувач створений в Authentication → Users
- Перевірте, що User UID правильний (якщо створюєте через SQL)

### Storage bucket не працює
- Перевірте, що bucket створений та публічний
- Перевірте RLS політики в Storage → Policies

## Підтримка

Якщо виникли проблеми, перевірте:
1. Логи в Supabase Dashboard → Logs
2. Консоль браузера (F12)
3. Термінал з `npm run dev`

