export const translations = {
  uk: {
    nav: {
      title: "Меню",
      home: "Головна",
      catalog: "Каталог",
      about: "Про нас",
      blog: "Блог",
      contacts: "Контакти",
      cart: "Кошик",
    },
    home: {
      hero: {
        title: "LUCERNA - живі форми світла",
        subtitle: "Створюємо атмосферу тепла і затишку у вашому домі",
        cta: "Переглянути каталог",
      },
      newProducts: "Нові надходження",
      featured: "Популярні товари",
      viewAll: "Дивитись всі",
    },
    product: {
      addToCart: "Додати в кошик",
      inStock: "В наявності",
      outOfStock: "Немає в наявності",
      similar: "Схожі товари",
      description: "Опис",
      sku: "Артикул",
      quantity: "Кількість",
      comment: "Коментар до товару (необов'язково)",
      commentPlaceholder: "Додайте коментар до замовлення...",
      selectOption: "Виберіть...",
      viewPalette: "Переглянути палітру",
      requiredField: "Це поле обов'язкове",
      fillRequiredFields: "Будь ласка, заповніть обов'язкові поля",
      productAddedToCart: "Товар додано до кошика",
      cancel: "Скасувати",
      from: "від",
    },
    cart: {
      title: "Кошик",
      empty: "Ваш кошик порожній",
      continueShopping: "Продовжити покупки",
      subtotal: "Підсумок",
      shipping: "Доставка",
      total: "Разом",
      checkout: "Оформити замовлення",
      remove: "Видалити",
      backToCatalog: "Назад до каталогу",
      price: "Ціна",
      comment: "Коментар до товару",
      commentPlaceholder: "Коментар до замовлення (необов'язково)",
      save: "Зберегти",
      noComment: "Немає коментаря",
      itemsInCart: "Товарів у кошику",
    },
    catalog: {
      title: "Каталог",
      allProducts: "Всі товари",
      sortBy: "Сортувати",
      priceAsc: "Ціна: за зростанням",
      priceDesc: "Ціна: за спаданням",
      newest: "Нові надходження",
    },
    about: {
      title: "Про Lucerna Studio",
      subtitle: "Майстерня світла",
    },
    blog: {
      title: "Блог",
      readMore: "Читати далі",
      recent: "Останні публікації",
    },
    contacts: {
      title: "Контакти",
      getInTouch: "Зв'яжіться з нами",
      name: "Ім'я",
      email: "Email",
      phone: "Телефон",
      message: "Повідомлення",
      send: "Надіслати",
      info: "Інформація",
    },
    footer: {
      rights: "© 2025 Lucerna Studio | Люцерна Студіо. Всі права захищені.",
      handmade: "Ручна робота з любов'ю",
      collaboration: "Співпраця",
    },
    common: {
      uah: "грн",
      loading: "Завантаження...",
      error: "Сталася помилка",
    },
  },
  en: {
    nav: {
      title: "Menu",
      home: "Home",
      catalog: "Catalog",
      about: "About",
      blog: "Blog",
      contacts: "Contacts",
      cart: "Cart",
    },
    home: {
      hero: {
        title: "Unique Handmade Lamps",
        subtitle: "Creating an atmosphere of warmth and coziness in your home",
        cta: "View Catalog",
      },
      newProducts: "New Arrivals",
      featured: "Featured Products",
      viewAll: "View All",
    },
    product: {
      addToCart: "Add to Cart",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      similar: "Similar Products",
      description: "Description",
      sku: "SKU",
      quantity: "Quantity",
      comment: "Product Comment (optional)",
      commentPlaceholder: "Add a comment to your order...",
      selectOption: "Select...",
      viewPalette: "View Palette",
      requiredField: "This field is required",
      fillRequiredFields: "Please fill in the required fields",
      productAddedToCart: "Product added to cart",
      cancel: "Cancel",
      from: "from",
    },
    cart: {
      title: "Shopping Cart",
      empty: "Your cart is empty",
      continueShopping: "Continue Shopping",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
      checkout: "Checkout",
      remove: "Remove",
      backToCatalog: "Back to Catalog",
      price: "Price",
      comment: "Product Comment",
      commentPlaceholder: "Order comment (optional)",
      save: "Save",
      noComment: "No comment",
      itemsInCart: "Items in cart",
    },
    catalog: {
      title: "Catalog",
      allProducts: "All Products",
      sortBy: "Sort By",
      priceAsc: "Price: Low to High",
      priceDesc: "Price: High to Low",
      newest: "Newest First",
    },
    about: {
      title: "About Lucerna Studio",
      subtitle: "Workshop of Light",
    },
    blog: {
      title: "Blog",
      readMore: "Read More",
      recent: "Recent Posts",
    },
    contacts: {
      title: "Contacts",
      getInTouch: "Get in Touch",
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      send: "Send",
      info: "Information",
    },
    footer: {
      rights: "© 2025 Lucerna Studio. All rights reserved.",
      handmade: "Handmade with love",
      collaboration: "Collaboration",
    },
    common: {
      uah: "UAH",
      loading: "Loading...",
      error: "An error occurred",
    },
  },
} as const

export type TranslationKey = keyof typeof translations.uk

export function getTranslation(locale: "uk" | "en", key: string): string {
  const keys = key.split(".")
  let value: any = translations[locale]

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      return key
    }
  }

  return typeof value === "string" ? value : key
}
