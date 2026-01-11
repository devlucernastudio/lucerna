import { Footer } from "@/components/footer"
import Link from "next/link"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/payment-delivery`
  
  const title = locale === "uk" 
    ? "Оплата і доставка - Lucerna Studio"
    : "Payment & Delivery - Lucerna Studio"
  
  const description = locale === "uk"
    ? "Умови оплати та доставки товарів Lucerna Studio | Люцерна Студіо. Способи оплати, терміни доставки та виготовлення."
    : "Payment and delivery terms for Lucerna Studio products. Payment methods, delivery and production terms."

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/payment-delivery`,
        'en-US': `${baseUrl}/en/payment-delivery`,
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
      title: "Оплата і доставка",
      payment: {
        title: "Оплата",
        p1: "Оплата здійснюється 100% передоплатою за реквізитами у форматі IBAN. Після підтвердження платежу ми починаємо виготовлення вашого світильника.",
        methodsTitle: "Способи оплати:",
        methods: [
          { label: "Банківський переказ на IBAN:", text: "оплата здійснюється через банківський переказ на реквізити, вказані в підтвердженні замовлення" },
          { label: "Онлайн-платежі:", text: "для українських клієнтів доступні платежі через платіжні системи (за наявності)" },
        ],
        currencyTitle: "Валюта:",
        currency: [
          "Для замовлень з України - UAH (гривня)",
          "Для замовлень з країн Європи - EUR (євро)",
        ],
        processingTitle: "Терміни обробки платежів:",
        processing: "Після отримання оплати ми підтверджуємо замовлення та починаємо виготовлення товару. Підтвердження надсилається на email, вказаний при оформленні замовлення.",
        securityTitle: "Безпека платежів:",
        security: "Всі платежі обробляються через безпечні платіжні системи. Ми не зберігаємо дані ваших банківських карток.",
      },
      delivery: {
        title: "Доставка",
        p1: "Кожен наш виріб надійно пакується, щоб прибути до вас у бездоганному стані.",
        ukraineTitle: "Доставка по Україні:",
        ukraine: [
          "Доставка здійснюється компанією Нова Пошта",
          "Вартість доставки оплачується за рахунок замовника",
          "Терміни доставки: 1-3 робочих дні (після виготовлення товару)",
          "Відстеження замовлення доступне через номер ТТН на сайті Нової Пошти",
        ],
        internationalTitle: "Доставка за кордон:",
        international: [
          "Відправка узгоджується індивідуально з кожним замовником",
          "Доставка здійснюється місцевим перевізником (залежно від країни)",
          "Вартість доставки оплачується за рахунок одержувача",
          "Терміни доставки залежать від обраного перевізника та країни призначення",
        ],
        customsTitle: "Міжнародні замовлення:",
        customs: "Для замовлень з країн Європи можуть застосовуватися митні збори та ПДВ відповідно до законодавства країни одержувача. Всі додаткові витрати оплачуються одержувачем.",
        trackingTitle: "Відстеження замовлення:",
        tracking: "Після відправки замовлення ви отримаєте номер для відстеження на email, вказаний при оформленні. Ви зможете відстежувати статус доставки на сайті перевізника.",
      },
      production: {
        title: "Терміни виготовлення",
        p1: "Стандартні товари (товари, що є на сайті): термін виготовлення становить до 6 тижнів з моменту підтвердження оплати.",
        p2: "Індивідуальні замовлення: терміни виготовлення узгоджуються з замовником при підтвердженні замовлення та можуть відрізнятися залежно від складності виробу.",
        p3: "Про готовність замовлення ми повідомляємо на email, вказаний при оформленні замовлення.",
      },
      receiving: {
        title: "Отримання замовлення",
        p1: "При отриманні замовлення перевірте:",
        items: [
          "Цілісність упаковки",
          "Відповідність товару замовленню",
          "Відсутність пошкоджень",
        ],
        p2: "У разі виявлення пошкоджень або невідповідності, негайно повідомте нас та службу доставки. Зробіть фото пошкоджень для подальшого розгляду.",
      },
      contacts: {
        title: "Контакти",
        p1: 'Якщо у вас виникли питання щодо оплати або доставки, зв\'яжіться з нами через форму "Напишіть нам" або контактні дані, вказані в розділі "Контакти".',
        contactLink: "в розділі \"Контакти\"",
      },
    },
    en: {
      title: "Payment & Delivery",
      payment: {
        title: "Payment",
        p1: "Payment is made 100% prepayment by IBAN. After payment confirmation, we begin manufacturing your lamp.",
        methodsTitle: "Payment methods:",
        methods: [
          { label: "Bank transfer to IBAN:", text: "payment is made through bank transfer to the details specified in the order confirmation" },
          { label: "Online payments:", text: "for Ukrainian clients, payments through payment systems are available (if available)" },
        ],
        currencyTitle: "Currency:",
        currency: [
          "For orders from Ukraine - UAH (hryvnia)",
          "For orders from European countries - EUR (euro)",
        ],
        processingTitle: "Payment processing terms:",
        processing: "After receiving payment, we confirm the order and begin manufacturing the product. Confirmation is sent to the email specified during checkout.",
        securityTitle: "Payment security:",
        security: "All payments are processed through secure payment systems. We do not store your bank card data.",
      },
      delivery: {
        title: "Delivery",
        p1: "Each of our products is securely packaged to arrive to you in perfect condition.",
        ukraineTitle: "Delivery in Ukraine:",
        ukraine: [
          "Delivery is carried out by Nova Poshta",
          "Delivery cost is paid by the customer",
          "Delivery terms: 1-3 business days (after product manufacturing)",
          "Order tracking is available through the tracking number on the Nova Poshta website",
        ],
        internationalTitle: "International delivery:",
        international: [
          "Shipment is agreed individually with each customer",
          "Delivery is carried out by a local carrier (depending on the country)",
          "Delivery cost is paid by the recipient",
          "Delivery terms depend on the chosen carrier and destination country",
        ],
        customsTitle: "International orders:",
        customs: "For orders from European countries, customs duties and VAT may apply according to the recipient's country legislation. All additional costs are paid by the recipient.",
        trackingTitle: "Order tracking:",
        tracking: "After shipping the order, you will receive a tracking number to the email specified during checkout. You can track the delivery status on the carrier's website.",
      },
      production: {
        title: "Production Terms",
        p1: "Standard products (products available on the website): production time is up to 6 weeks from the moment of payment confirmation.",
        p2: "Individual orders: production terms are agreed with the customer upon order confirmation and may vary depending on the complexity of the product.",
        p3: "We notify you of order readiness to the email specified during checkout.",
      },
      receiving: {
        title: "Receiving the Order",
        p1: "When receiving the order, check:",
        items: [
          "Packaging integrity",
          "Product matches the order",
          "No damage",
        ],
        p2: "If damage or discrepancy is found, immediately notify us and the delivery service. Take photos of the damage for further consideration.",
      },
      contacts: {
        title: "Contacts",
        p1: 'If you have questions about payment or delivery, contact us through the "Send us a message" form or contact details specified in the "Contacts" section.',
        contactLink: "in the \"Contacts\" section",
      },
    },
  }

  return content[locale as keyof typeof content] || content.uk
}

export default async function PaymentDeliveryPage({ params }: { params: Promise<{ locale: string }> }) {
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
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.payment.title}</h2>
              <p>
                <strong>{t.payment.p1}</strong>
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.payment.methodsTitle}</h3>
              <ul className="list-disc ml-6 space-y-2">
                {t.payment.methods.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.payment.currencyTitle}</h3>
              <ul className="list-disc ml-6 space-y-2">
                {t.payment.currency.map((item, idx) => {
                  const parts = item.split(" - ")
                  return (
                    <li key={idx}>
                      <strong>{parts[0]}</strong> - {parts[1]}
                    </li>
                  )
                })}
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.payment.processingTitle}</h3>
              <p>{t.payment.processing}</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.payment.securityTitle}</h3>
              <p>{t.payment.security}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.delivery.title}</h2>
              <p>{t.delivery.p1}</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.delivery.ukraineTitle}</h3>
              <ul className="list-disc ml-6 space-y-2">
                {t.delivery.ukraine.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.delivery.internationalTitle}</h3>
              <ul className="list-disc ml-6 space-y-2">
                {t.delivery.international.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.delivery.customsTitle}</h3>
              <p>{t.delivery.customs}</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.delivery.trackingTitle}</h3>
              <p>{t.delivery.tracking}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.production.title}</h2>
              <p>
                <strong>{t.production.p1}</strong>
              </p>
              <p className="mt-4">{t.production.p2}</p>
              <p className="mt-4">{t.production.p3}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.receiving.title}</h2>
              <p>{t.receiving.p1}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.receiving.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">{t.receiving.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.contacts.title}</h2>
              <p>
                {locale === "uk" ? (
                  <>
                    Якщо у вас виникли питання щодо оплати або доставки, зв'яжіться з нами через форму "Напишіть нам" або контактні дані, вказані{" "}
                    <Link href={`/${locale}/contacts`} className="text-[#D4834F] hover:underline">
                      {t.contacts.contactLink}
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    If you have questions about payment or delivery, contact us through the "Send us a message" form or contact details specified{" "}
                    <Link href={`/${locale}/contacts`} className="text-[#D4834F] hover:underline">
                      {t.contacts.contactLink}
                    </Link>
                    .
                  </>
                )}
              </p>
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
