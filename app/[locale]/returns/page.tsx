import { Footer } from "@/components/footer"
import Link from "next/link"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/returns`
  
  const title = locale === "uk" 
    ? "Повернення товару - Lucerna Studio"
    : "Returns - Lucerna Studio"
  
  const description = locale === "uk"
    ? "Умови обміну та повернення товарів Lucerna Studio. Право на повернення, терміни та умови."
    : "Terms of exchange and return of Lucerna Studio products. Right to return, terms and conditions."

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/returns`,
        'en-US': `${baseUrl}/en/returns`,
        'x-default': `${baseUrl}/uk/returns`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

function getContent(locale: string) {
  const content = {
    uk: {
      title: "Обмін та повернення товару",
      right: {
        title: "Право на повернення",
        p1: "Відповідно до законодавства України та Європейського Союзу, ви маєте право повернути товар протягом 20 днів з моменту отримання замовлення.",
        p2: "Це право поширюється на стандартні товари, представлені в каталозі інтернет-магазину.",
      },
      conditions: {
        title: "Умови повернення",
        p: "Повернення товару можливе за наступних умов:",
        items: [
          { text: "Товар не був використаний та зберігає товарний вигляд", bold: "не був використаний" },
          { text: "Товар не має пошкоджень, слідів експлуатації", bold: "не має пошкоджень" },
          { text: "Збережена оригінальна упаковка (якщо можливо)", bold: "Збережена" },
          { text: "Наявність документів, що підтверджують покупку (чек, підтвердження замовлення)", bold: "Наявність" },
          { text: "Повернення здійснено в встановлені терміни (20 днів з моменту отримання)", bold: "Повернення" },
        ],
      },
      excluded: {
        title: "Товари, які не підлягають поверненню",
        p1: "Зверніть увагу: вироби, виготовлені за індивідуальним замовленням (кастомні світильники), не підлягають поверненню відповідно до законодавства про захист прав споживачів.",
        p2: "Це стосується:",
        items: [
          "Світильників, виготовлених за індивідуальними параметрами (розмір, форма, колір)",
          "Товарів, виготовлених згідно з індивідуальними вимогами замовника",
          "Виробів, які не можуть бути повернуті через їх індивідуальні характеристики",
        ],
      },
      process: {
        title: "Порядок повернення",
        p: "Для повернення товару виконайте наступні кроки:",
        items: [
          { label: "Зв'яжіться з нами:", text: 'надішліть заявку на повернення через форму "Напишіть нам" або на email, вказаний в контактах. Вкажіть номер замовлення та причину повернення.' },
          { label: "Очікуйте підтвердження:", text: "ми розглянемо вашу заявку та підтвердимо можливість повернення." },
          { label: "Упакуйте товар:", text: "упакуйте товар у оригінальну упаковку (якщо можливо) або надійну упаковку для безпечної пересилки." },
          { label: "Відправте товар:", text: "відправте товар за адресою, яку ми вкажемо. Вартість зворотної доставки оплачує покупець." },
          { label: "Очікуйте перевірки:", text: "після отримання товару ми перевіримо його стан." },
        ],
      },
      review: {
        title: "Терміни розгляду заявки",
        p: "Ми розглядаємо заявку на повернення протягом 3 робочих днів з моменту її отримання. Після розгляду ми повідомимо вас про рішення.",
      },
      refund: {
        title: "Повернення коштів",
        p1: "Після отримання та перевірки товару ми здійснюємо повернення коштів.",
        p2: "Терміни повернення коштів: 5-10 робочих днів з моменту підтвердження прийняття товару на повернення.",
        p3: "Спосіб повернення: кошти повертаються на ті самі реквізити, з яких була здійснена оплата, або іншим способом за узгодженням.",
      },
      shipping: {
        title: "Вартість зворотної доставки",
        p1: "Вартість зворотної доставки оплачує покупець.",
        p2: "Якщо повернення відбувається через нашу помилку (невідповідність товару, дефект, пошкодження при доставці), вартість доставки компенсується нами.",
      },
      exchange: {
        title: "Обмін товару",
        p1: "Обмін товару можливий у випадках:",
        items: [
          "Товар має виробничий дефект",
          "Товар не відповідає опису на сайті",
          "Товар пошкоджений при доставці (якщо це не вина покупця)",
        ],
        p2: "У випадку обміну ми забезпечимо доставку нового товару за наш рахунок.",
      },
      warranty: {
        title: "Гарантійні випадки",
        p1: "Якщо товар має виробничий дефект або не відповідає заявленим характеристикам, ви маєте право на:",
        items: [
          "Безкоштовний ремонт або заміну товару",
          "Повернення коштів",
          "Зменшення ціни",
        ],
        p2: "Гарантійний термін встановлюється відповідно до законодавства та залежить від типу товару.",
      },
      contacts: {
        title: "Контакти для повернень",
        p1: "Для оформлення повернення або обміну товару зв'яжіться з нами:",
        company: "Lucerna Studio",
        contactLink: "в розділі \"Контакти\"",
        formLink: "Форма \"Напишіть нам\" на сторінці \"Контакти\"",
        p2: "При зверненні вкажіть:",
        items: [
          "Номер замовлення",
          "Дату отримання товару",
          "Причину повернення/обміну",
          "Фото товару (якщо є пошкодження)",
        ],
      },
    },
    en: {
      title: "Returns & Exchanges",
      right: {
        title: "Right to Return",
        p1: "In accordance with the legislation of Ukraine and the European Union, you have the right to return the product within 20 days from the moment of receiving the order.",
        p2: "This right applies to standard products presented in the online store catalog.",
      },
      conditions: {
        title: "Return Conditions",
        p: "Product return is possible under the following conditions:",
        items: [
          { text: "The product has not been used and maintains its appearance", bold: "has not been used" },
          { text: "The product has no damage or signs of use", bold: "has no damage" },
          { text: "Original packaging is preserved (if possible)", bold: "Original packaging" },
          { text: "Documents confirming the purchase are available (receipt, order confirmation)", bold: "Documents" },
          { text: "Return is made within the established terms (20 days from receipt)", bold: "Return" },
        ],
      },
      excluded: {
        title: "Products Not Subject to Return",
        p1: "Please note: products made to individual order (custom lamps) are not subject to return in accordance with consumer protection legislation.",
        p2: "This applies to:",
        items: [
          "Lamps made to individual parameters (size, shape, color)",
          "Products made according to individual customer requirements",
          "Products that cannot be returned due to their individual characteristics",
        ],
      },
      process: {
        title: "Return Process",
        p: "To return a product, follow these steps:",
        items: [
          { label: "Contact us:", text: 'send a return request through the "Send us a message" form or to the email specified in the contacts. Indicate the order number and reason for return.' },
          { label: "Wait for confirmation:", text: "we will review your request and confirm the possibility of return." },
          { label: "Pack the product:", text: "pack the product in the original packaging (if possible) or secure packaging for safe shipping." },
          { label: "Ship the product:", text: "ship the product to the address we will provide. Return shipping cost is paid by the buyer." },
          { label: "Wait for inspection:", text: "after receiving the product, we will check its condition." },
        ],
      },
      review: {
        title: "Request Review Terms",
        p: "We review return requests within 3 business days from the moment of receipt. After review, we will notify you of the decision.",
      },
      refund: {
        title: "Refund",
        p1: "After receiving and checking the product, we process the refund.",
        p2: "Refund terms: 5-10 business days from the moment of confirming acceptance of the product for return.",
        p3: "Refund method: funds are returned to the same details from which payment was made, or by another method by agreement.",
      },
      shipping: {
        title: "Return Shipping Cost",
        p1: "Return shipping cost is paid by the buyer.",
        p2: "If the return occurs due to our error (product mismatch, defect, damage during delivery), the shipping cost is compensated by us.",
      },
      exchange: {
        title: "Product Exchange",
        p1: "Product exchange is possible in cases:",
        items: [
          "The product has a manufacturing defect",
          "The product does not match the description on the website",
          "The product is damaged during delivery (if it is not the buyer's fault)",
        ],
        p2: "In case of exchange, we will provide delivery of the new product at our expense.",
      },
      warranty: {
        title: "Warranty Cases",
        p1: "If the product has a manufacturing defect or does not match the declared characteristics, you have the right to:",
        items: [
          "Free repair or replacement of the product",
          "Refund",
          "Price reduction",
        ],
        p2: "The warranty period is established in accordance with the legislation and depends on the type of product.",
      },
      contacts: {
        title: "Contacts for Returns",
        p1: "To process a return or exchange, contact us:",
        company: "Lucerna Studio",
        contactLink: "in the \"Contacts\" section",
        formLink: "\"Send us a message\" form on the \"Contacts\" page",
        p2: "When contacting, please indicate:",
        items: [
          "Order number",
          "Product receipt date",
          "Reason for return/exchange",
          "Product photos (if there is damage)",
        ],
      },
    },
  }

  return content[locale as keyof typeof content] || content.uk
}

export default async function ReturnsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = getContent(locale)
  const lastUpdate = new Date().toLocaleDateString(locale === "uk" ? "uk-UA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <>
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="mb-8 text-4xl font-light text-foreground">{t.title}</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.right.title}</h2>
              <p>
                {locale === "uk" ? (
                  <>
                    Відповідно до законодавства України та Європейського Союзу, ви маєте право повернути товар протягом <strong>20 днів</strong> з моменту отримання замовлення.
                  </>
                ) : (
                  <>
                    In accordance with the legislation of Ukraine and the European Union, you have the right to return the product within <strong>20 days</strong> from the moment of receiving the order.
                  </>
                )}
              </p>
              <p className="mt-4">{t.right.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.conditions.title}</h2>
              <p>{t.conditions.p}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.conditions.items.map((item, idx) => (
                  <li key={idx}>
                    {item.bold ? (
                      <>
                        {item.text.split(item.bold)[0]}
                        <strong>{item.bold}</strong>
                        {item.text.split(item.bold)[1]}
                      </>
                    ) : (
                      item.text
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.excluded.title}</h2>
              <p>
                <strong>{t.excluded.p1.split(":")[0]}:</strong>
                {t.excluded.p1.split(":")[1]}
              </p>
              <p className="mt-4">{t.excluded.p2}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.excluded.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.process.title}</h2>
              <p>{t.process.p}</p>
              <ol className="list-decimal ml-6 space-y-2">
                {t.process.items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.review.title}</h2>
              <p>
                {locale === "uk" ? (
                  <>
                    Ми розглядаємо заявку на повернення протягом <strong>3 робочих днів</strong> з моменту її отримання. Після розгляду ми повідомимо вас про рішення.
                  </>
                ) : (
                  <>
                    We review return requests within <strong>3 business days</strong> from the moment of receipt. After review, we will notify you of the decision.
                  </>
                )}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.refund.title}</h2>
              <p>{t.refund.p1}</p>
              <p className="mt-4">
                <strong>{t.refund.p2.split(":")[0]}:</strong>
                {t.refund.p2.split(":")[1]}
              </p>
              <p className="mt-4">
                <strong>{t.refund.p3.split(":")[0]}:</strong>
                {t.refund.p3.split(":")[1]}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.shipping.title}</h2>
              <p>
                <strong>{t.shipping.p1}</strong>
              </p>
              <p className="mt-4">{t.shipping.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.exchange.title}</h2>
              <p>{t.exchange.p1}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.exchange.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">{t.exchange.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.warranty.title}</h2>
              <p>{t.warranty.p1}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.warranty.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">{t.warranty.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.contacts.title}</h2>
              <p>{t.contacts.p1}</p>
              <p className="mt-4">
                <strong>{t.contacts.company}</strong>
                <br />
                {locale === "uk" ? "Email:" : "Email:"}{" "}
                <Link href={`/${locale}/contacts`} className="text-[#D4834F] hover:underline">
                  {t.contacts.contactLink}
                </Link>
                <br />
                {locale === "uk" ? "Телефон:" : "Phone:"}{" "}
                <Link href={`/${locale}/contacts`} className="text-[#D4834F] hover:underline">
                  {t.contacts.contactLink}
                </Link>
                <br />
                <Link href={`/${locale}/contacts`} className="text-[#D4834F] hover:underline">
                  {t.contacts.formLink}
                </Link>
              </p>
              <p className="mt-4">{t.contacts.p2}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.contacts.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <p className="text-sm text-muted-foreground mt-8">
                {locale === "uk" ? "Останнє оновлення:" : "Last updated:"} {lastUpdate}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
