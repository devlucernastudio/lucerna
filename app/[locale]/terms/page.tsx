import { Footer } from "@/components/footer"
import Link from "next/link"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/terms`
  
  const title = locale === "uk" 
    ? "Публічна оферта - Lucerna Studio"
    : "Terms of Service - Lucerna Studio"
  
  const description = locale === "uk"
    ? "Публічна оферта та умови використання інтернет-магазину Lucerna Studio"
    : "Public offer and terms of service of Lucerna Studio online store"

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/terms`,
        'en-US': `${baseUrl}/en/terms`,
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
      title: "Публічна оферта / Умови використання",
      sections: {
        general: {
          title: "1. Загальні положення",
          p1: 'Ця публічна оферта (далі - "Оферта") є офіційною пропозицією ФОП Симканич Михайло Михайлович, Lucerna Studio (далі - "Продавець") укласти договір купівлі-продажу товарів на викладених нижче умовах.',
          p2: "Визначення термінів:",
          items: [
            { label: "Продавець", text: "- ФОП Симканич Михайло Михайлович, Lucerna Studio - інтернет-магазин світильників ручної роботи" },
            { label: "Покупець", text: "- фізична або юридична особа, яка прийняла умови цієї Оферти" },
            { label: "Товар", text: "- світильники та аксесуари, представлені в каталозі інтернет-магазину" },
            { label: "Замовлення", text: "- прийняте Продавцем рішення Покупця придбати товар" },
            { label: "Інтернет-магазин", text: "- сайт, розташований за адресою lucerna-studio.com" },
          ],
        },
        subject: {
          title: "2. Предмет договору",
          p1: "Продавець зобов'язується передати у власність Покупцю товар, а Покупець зобов'язується прийняти товар та оплатити його на умовах, викладених у цій Оферті.",
          p2: "Ця Оферта регулює відносини між Продавцем та Покупцем при здійсненні покупок через інтернет-магазин.",
        },
        order: {
          title: "3. Порядок оформлення замовлення",
          p: "Замовлення оформляється наступним чином:",
          items: [
            "Покупець вибирає товар в каталозі інтернет-магазину",
            "Покупець додає товар до кошика та обирає характеристики (якщо є)",
            "Покупець переходить до оформлення замовлення та заповнює необхідні дані",
            "Покупець підтверджує замовлення та здійснює оплату",
            "Після отримання оплати Продавець підтверджує замовлення та починає виготовлення/підготовку товару",
          ],
          p2: "Моментом укладення договору вважається момент отримання Продавцем підтвердження оплати від Покупця.",
        },
        payment: {
          title: "4. Ціни та оплата",
          items: [
            { label: "4.1.", text: "Всі ціни на товари вказані в гривнях (UAH) для України та в євро (EUR) для країн Європи." },
            { label: "4.2.", text: "Оплата здійснюється 100% передоплатою за реквізитами у форматі IBAN. Після підтвердження платежу ми починаємо виготовлення вашого світильника." },
            { label: "4.3.", text: "Продавець залишає за собою право змінювати ціни на товари без попереднього повідомлення. Ціна товару фіксується на момент підтвердження замовлення." },
            { label: "4.4.", text: "Якщо товар має характеристики, які впливають на ціну, фінальна ціна розраховується на основі обраних характеристик." },
          ],
        },
        delivery: {
          title: "5. Доставка",
          items: [
            { label: "5.1.", text: "Кожен наш виріб надійно пакується, щоб прибути до вас у бездоганному стані." },
            { label: "5.2. Доставка по Україні:", text: "здійснюється компанією Нова Пошта за рахунок замовника." },
            { label: "5.3. Доставка за кордон:", text: "відправка узгоджується індивідуально та здійснюється місцевим перевізником за рахунок одержувача." },
            { label: "5.4.", text: "Терміни доставки залежать від обраного способу доставки та вказані при оформленні замовлення." },
            { label: "5.5.", text: "Ризик випадкової втрати або пошкодження товару переходить до Покупця з моменту передачі товару службі доставки." },
          ],
        },
        production: {
          title: "6. Терміни виготовлення",
          items: [
            { label: "6.1.", text: "Термін виготовлення стандартного товару (товару, що є на сайті) становить до 4 тижнів з моменту підтвердження оплати." },
            { label: "6.2.", text: "Терміни виготовлення індивідуальних замовлень узгоджуються з замовником при підтвердженні замовлення." },
            { label: "6.3.", text: "Про готовність замовлення Продавець повідомляє Покупця через вказані контактні дані." },
          ],
        },
        obligations: {
          title: "7. Права та обов'язки сторін",
          seller: {
            label: "7.1. Продавець зобов'язується:",
            items: [
              "Передати Покупцю товар у належній якості, відповідно до опису на сайті",
              "Дотримуватися термінів виготовлення та доставки",
              "Повернути кошти у випадках, передбачених договором",
              "Забезпечити конфіденційність персональних даних Покупця",
            ],
          },
          buyer: {
            label: "7.2. Покупець зобов'язується:",
            items: [
              "Надати достовірні дані при оформленні замовлення",
              "Своєчасно оплатити замовлення",
              "Прийняти товар у встановлені терміни",
              "Перевірити товар при отриманні",
            ],
          },
        },
        liability: {
          title: "8. Відповідальність сторін",
          items: [
            { label: "8.1.", text: "Продавець не несе відповідальності за зміну характеристик товару, якщо це не залежить від Продавця (наприклад, відтінки кольорів на екрані можуть відрізнятися від реальних)." },
            { label: "8.2.", text: "Продавець не несе відповідальності за затримки доставки, спричинені діями служб доставки або форс-мажорними обставинами." },
            { label: "8.3.", text: "У випадку форс-мажорних обставин (стихійні лиха, військові дії, заборона експорту/імпорту тощо) терміни виконання зобов'язань можуть бути продовжені." },
          ],
        },
        disputes: {
          title: "9. Розв'язання спорів",
          items: [
            { label: "9.1.", text: "Всі спори та розбіжності вирішуються шляхом переговорів між сторонами." },
            { label: "9.2.", text: "Якщо спір не вдалося вирішити шляхом переговорів, він вирішується відповідно до законодавства України." },
            { label: "9.3.", text: "Для споживачів з ЄС застосовуються права споживача відповідно до законодавства Європейського Союзу." },
          ],
        },
        changes: {
          title: "10. Зміни в оферті",
          p: "Продавець залишає за собою право вносити зміни до цієї Оферти. Зміни набувають чинності з моменту їх публікації на сайті. Продовжуючи користуватися сайтом після внесення змін, Покупець підтверджує свою згоду з новими умовами.",
        },
        details: {
          title: "11. Реквізити Продавця",
          company: "Lucerna Studio",
          contactLink: "в розділі \"Контакти\"",
        },
      },
    },
    en: {
      title: "Public Offer / Terms of Service",
      sections: {
        general: {
          title: "1. General Provisions",
          p1: 'This public offer (hereinafter - "Offer") is an official proposal by FOP Symkanych Mykhailo Mykhailovych, Lucerna Studio (hereinafter - "Seller") to enter into a purchase and sale agreement for goods under the conditions set forth below.',
          p2: "Definition of terms:",
          items: [
            { label: "Seller", text: "- FOP Symkanych Mykhailo Mykhailovych, Lucerna Studio - online store of handmade lamps" },
            { label: "Buyer", text: "- an individual or legal entity that has accepted the terms of this Offer" },
            { label: "Product", text: "- lamps and accessories presented in the online store catalog" },
            { label: "Order", text: "- the Seller's acceptance of the Buyer's decision to purchase a product" },
            { label: "Online store", text: "- the website located at lucerna-studio.com" },
          ],
        },
        subject: {
          title: "2. Subject of the Agreement",
          p1: "The Seller undertakes to transfer ownership of the product to the Buyer, and the Buyer undertakes to accept the product and pay for it under the conditions set forth in this Offer.",
          p2: "This Offer governs the relationship between the Seller and the Buyer when making purchases through the online store.",
        },
        order: {
          title: "3. Order Processing",
          p: "The order is processed as follows:",
          items: [
            "The Buyer selects a product in the online store catalog",
            "The Buyer adds the product to the cart and selects characteristics (if any)",
            "The Buyer proceeds to checkout and fills in the necessary data",
            "The Buyer confirms the order and makes payment",
            "After receiving payment, the Seller confirms the order and begins manufacturing/preparing the product",
          ],
          p2: "The moment of conclusion of the agreement is considered the moment the Seller receives payment confirmation from the Buyer.",
        },
        payment: {
          title: "4. Prices and Payment",
          items: [
            { label: "4.1.", text: "All product prices are indicated in hryvnias (UAH) for Ukraine and in euros (EUR) for European countries." },
            { label: "4.2.", text: "Payment is made 100% prepayment by IBAN. After payment confirmation, we begin manufacturing your lamp." },
            { label: "4.3.", text: "The Seller reserves the right to change product prices without prior notice. The product price is fixed at the time of order confirmation." },
            { label: "4.4.", text: "If the product has characteristics that affect the price, the final price is calculated based on the selected characteristics." },
          ],
        },
        delivery: {
          title: "5. Delivery",
          items: [
            { label: "5.1.", text: "Each of our products is securely packaged to arrive to you in perfect condition." },
            { label: "5.2. Delivery in Ukraine:", text: "carried out by Nova Poshta at the customer's expense." },
            { label: "5.3. International delivery:", text: "shipment is agreed individually and carried out by a local carrier at the recipient's expense." },
            { label: "5.4.", text: "Delivery terms depend on the chosen delivery method and are indicated during checkout." },
            { label: "5.5.", text: "The risk of accidental loss or damage to the product passes to the Buyer from the moment the product is transferred to the delivery service." },
          ],
        },
        production: {
          title: "6. Production Terms",
          items: [
            { label: "6.1.", text: "The production time for standard products (products available on the website) is up to 4 weeks from the moment of payment confirmation." },
            { label: "6.2.", text: "Production terms for individual orders are agreed with the customer upon order confirmation." },
            { label: "6.3.", text: "The Seller notifies the Buyer of order readiness through the specified contact details." },
          ],
        },
        obligations: {
          title: "7. Rights and Obligations of the Parties",
          seller: {
            label: "7.1. The Seller undertakes to:",
            items: [
              "Transfer the product to the Buyer in proper quality, in accordance with the description on the website",
              "Comply with production and delivery terms",
              "Refund funds in cases provided for by the agreement",
              "Ensure confidentiality of the Buyer's personal data",
            ],
          },
          buyer: {
            label: "7.2. The Buyer undertakes to:",
            items: [
              "Provide accurate data when placing an order",
              "Pay for the order on time",
              "Accept the product within the established terms",
              "Check the product upon receipt",
            ],
          },
        },
        liability: {
          title: "8. Liability of the Parties",
          items: [
            { label: "8.1.", text: "The Seller is not responsible for changes in product characteristics if this does not depend on the Seller (for example, color shades on the screen may differ from real ones)." },
            { label: "8.2.", text: "The Seller is not responsible for delivery delays caused by the actions of delivery services or force majeure circumstances." },
            { label: "8.3.", text: "In case of force majeure circumstances (natural disasters, military actions, export/import bans, etc.), the terms of fulfillment of obligations may be extended." },
          ],
        },
        disputes: {
          title: "9. Dispute Resolution",
          items: [
            { label: "9.1.", text: "All disputes and disagreements are resolved through negotiations between the parties." },
            { label: "9.2.", text: "If a dispute could not be resolved through negotiations, it is resolved in accordance with the legislation of Ukraine." },
            { label: "9.3.", text: "For consumers from the EU, consumer rights apply in accordance with European Union legislation." },
          ],
        },
        changes: {
          title: "10. Changes to the Offer",
          p: "The Seller reserves the right to make changes to this Offer. Changes take effect from the moment of their publication on the website. By continuing to use the website after changes are made, the Buyer confirms their agreement with the new terms.",
        },
        details: {
          title: "11. Seller Details",
          company: "Lucerna Studio",
          contactLink: "in the \"Contacts\" section",
        },
      },
    },
  }

  return content[locale as keyof typeof content] || content.uk
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
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
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.general.title}</h2>
              <p>{t.sections.general.p1}</p>
              <p className="mt-4">
                <strong>{t.sections.general.p2}</strong>
              </p>
              <ul className="list-disc ml-6 space-y-2">
                {t.sections.general.items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.subject.title}</h2>
              <p>{t.sections.subject.p1}</p>
              <p className="mt-4">{t.sections.subject.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.order.title}</h2>
              <p>{t.sections.order.p}</p>
              <ol className="list-decimal ml-6 space-y-2">
                {t.sections.order.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ol>
              <p className="mt-4">{t.sections.order.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.payment.title}</h2>
              {t.sections.payment.items.map((item, idx) => (
                <p key={idx} className={idx > 0 ? "mt-4" : ""}>
                  <strong>{item.label}</strong> {item.text}
                </p>
              ))}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.delivery.title}</h2>
              {t.sections.delivery.items.map((item, idx) => (
                <p key={idx} className={idx > 0 ? "mt-4" : ""}>
                  <strong>{item.label}</strong> {item.text}
                </p>
              ))}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.production.title}</h2>
              {t.sections.production.items.map((item, idx) => (
                <p key={idx} className={idx > 0 ? "mt-4" : ""}>
                  <strong>{item.label}</strong> {item.text}
                </p>
              ))}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.obligations.title}</h2>
              <p>
                <strong>{t.sections.obligations.seller.label}</strong>
              </p>
              <ul className="list-disc ml-6 space-y-2">
                {t.sections.obligations.seller.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <p className="mt-4">
                <strong>{t.sections.obligations.buyer.label}</strong>
              </p>
              <ul className="list-disc ml-6 space-y-2">
                {t.sections.obligations.buyer.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.liability.title}</h2>
              {t.sections.liability.items.map((item, idx) => (
                <p key={idx} className={idx > 0 ? "mt-4" : ""}>
                  <strong>{item.label}</strong> {item.text}
                </p>
              ))}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.disputes.title}</h2>
              {t.sections.disputes.items.map((item, idx) => (
                <p key={idx} className={idx > 0 ? "mt-4" : ""}>
                  <strong>{item.label}</strong> {item.text}
                </p>
              ))}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.changes.title}</h2>
              <p>{t.sections.changes.p}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.details.title}</h2>
              <p>
                <strong>{t.sections.details.company}</strong>
                <br />
                {locale === "uk" ? "Email:" : "Email:"}{" "}
                <Link href={`/${locale}/contacts`} className="text-[#D4834F] hover:underline">
                  {t.sections.details.contactLink}
                </Link>
                <br />
                {locale === "uk" ? "Телефон:" : "Phone:"}{" "}
                <Link href={`/${locale}/contacts`} className="text-[#D4834F] hover:underline">
                  {t.sections.details.contactLink}
                </Link>
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
