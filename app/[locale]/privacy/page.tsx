import { Footer } from "@/components/footer"
import Link from "next/link"
import { cookies } from "next/headers"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/privacy`
  
  const title = locale === "uk" 
    ? "Політика конфіденційності - Lucerna Studio"
    : "Privacy Policy - Lucerna Studio"
  
  const description = locale === "uk"
    ? "Політика конфіденційності Lucerna Studio. Як ми збираємо, використовуємо та захищаємо ваші персональні дані."
    : "Privacy Policy of Lucerna Studio. How we collect, use and protect your personal data."

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/privacy`,
        'en-US': `${baseUrl}/en/privacy`,
        'x-default': `${baseUrl}/uk/privacy`,
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
      title: "Політика конфіденційності",
      sections: {
        general: {
          title: "1. Загальні положення",
          p1: 'Ця Політика конфіденційності описує, як Lucerna Studio ("ми", "наш", "нас") збирає, використовує та захищає персональні дані користувачів нашого інтернет-магазину.',
          p2: 'Ми дотримуємося вимог Закона України "Про захист персональних даних" та Загального регламенту ЄС про захист даних (GDPR) для користувачів з Європейського Союзу.',
        },
        data: {
          title: "2. Які персональні дані ми збираємо",
          p: "Ми збираємо наступні категорії персональних даних:",
          items: [
            { label: "Ідентифікаційні дані:", text: "ім'я, прізвище" },
            { label: "Контактні дані:", text: "email адреса, номер телефону, адреса доставки" },
            { label: "Дані про замовлення:", text: "інформація про товари, які ви замовляєте, характеристики товарів, коментарі до замовлення" },
            { label: "Платіжні дані:", text: "інформація про спосіб оплати (обробляється платіжними системами, ми не зберігаємо дані банківських карток)" },
            { label: "Технічні дані:", text: "IP-адреса, тип браузера, інформація про пристрій (через cookies)" },
          ],
        },
        purpose: {
          title: "3. Мета збору та обробки персональних даних",
          p: "Ми використовуємо ваші персональні дані для наступних цілей:",
          items: [
            "Обробка та виконання ваших замовлень",
            "Доставка товарів за вашою адресою",
            "Зв'язок з вами щодо замовлення (підтвердження, статус доставки)",
            "Надання технічної підтримки",
            "Відправка маркетингових повідомлень (тільки за вашою згодою)",
            "Покращення якості нашого сервісу",
            "Дотримання юридичних зобов'язань",
          ],
        },
        legal: {
          title: "4. Правова основа обробки",
          p: "Обробка ваших персональних даних здійснюється на основі:",
          items: [
            { label: "Виконання договору:", text: "обробка замовлень та доставка товарів" },
            { label: "Згода:", text: "для маркетингових повідомлень" },
            { label: "Юридичні зобов'язання:", text: "зберігання фінансових документів" },
            { label: "Законні інтереси:", text: "покращення сервісу, безпека" },
          ],
        },
        thirdParty: {
          title: "5. Передача даних третім особам",
          p: "Ми можемо передавати ваші персональні дані наступним третім особам:",
          items: [
            { label: "Служби доставки:", text: "Нова Пошта, інші перевізники (для доставки замовлень)" },
            { label: "Платіжні системи:", text: "для обробки платежів (ми не маємо доступу до повних даних ваших карток)" },
            { label: "Постачальники послуг:", text: "хостинг, email-сервіси (Resend) для технічної підтримки" },
          ],
          p2: "Ми не продаємо та не передаємо ваші дані третім особам для маркетингових цілей без вашої згоди.",
        },
        storage: {
          title: "6. Зберігання даних",
          p: "Ми зберігаємо ваші персональні дані протягом необхідного періоду для виконання цілей, зазначених у цій політиці, або протягом періоду, встановленого законодавством.",
          items: [
            "Дані про замовлення зберігаються протягом 3 років (згідно з вимогами бухгалтерського обліку)",
            "Контактні дані зберігаються до відкликання вашої згоди або видалення облікового запису",
            "Дані для маркетингу зберігаються до відкликання згоди",
          ],
        },
        rights: {
          title: "7. Ваші права",
          p: "Відповідно до GDPR та українського законодавства, ви маєте право:",
          items: [
            { label: "Право доступу:", text: "отримати інформацію про те, які ваші дані ми обробляємо" },
            { label: "Право виправлення:", text: "виправити неточні або неповні дані" },
            { label: "Право видалення:", text: 'видалити ваші дані ("право на забуття")' },
            { label: "Право обмеження обробки:", text: "обмежити обробку ваших даних" },
            { label: "Право на портування даних:", text: "отримати ваші дані в структурованому форматі" },
            { label: "Право на відкликання згоди:", text: "відкликати згоду на обробку даних у будь-який час" },
            { label: "Право на заперечення:", text: "заперечити проти обробки даних для маркетингу" },
          ],
          p2: 'Для реалізації ваших прав, будь ласка, зв\'яжіться з нами через форму "Напишіть нам" або на email, вказаний в контактах.',
        },
        cookies: {
          title: "8. Cookies",
          p: "Наш сайт використовує cookies для покращення користувацького досвіду. Ми використовуємо:",
          items: [
            { label: "Необхідні cookies:", text: "для функціонування сайту (кошик, авторизація)" },
            { label: "Аналітичні cookies:", text: "для аналізу відвідуваності сайту" },
          ],
          p2: "Ви можете налаштувати браузер для відмови від cookies, але це може вплинути на функціональність сайту.",
        },
        security: {
          title: "9. Безпека даних",
          p: "Ми вживаємо технічних та організаційних заходів для захисту ваших персональних даних від несанкціонованого доступу, втрати або знищення. Дані передаються через зашифроване з'єднання (HTTPS).",
        },
        changes: {
          title: "10. Зміни в політиці конфіденційності",
          p: "Ми залишаємо за собою право оновлювати цю Політику конфіденційності. Про значні зміни ми повідомимо вас через email або повідомлення на сайті.",
        },
        contacts: {
          title: "11. Контакти",
          p: "Якщо у вас є питання щодо обробки ваших персональних даних або ви хочете реалізувати свої права, зв'яжіться з нами:",
          company: "Lucerna Studio",
          contactLink: "в розділі \"Контакти\"",
        },
      },
    },
    en: {
      title: "Privacy Policy",
      sections: {
        general: {
          title: "1. General Provisions",
          p1: 'This Privacy Policy describes how Lucerna Studio ("we", "our", "us") collects, uses, and protects personal data of users of our online store.',
          p2: 'We comply with the requirements of the Law of Ukraine "On Personal Data Protection" and the General Data Protection Regulation (GDPR) for users from the European Union.',
        },
        data: {
          title: "2. What Personal Data We Collect",
          p: "We collect the following categories of personal data:",
          items: [
            { label: "Identification data:", text: "first name, last name" },
            { label: "Contact data:", text: "email address, phone number, delivery address" },
            { label: "Order data:", text: "information about products you order, product characteristics, order comments" },
            { label: "Payment data:", text: "payment method information (processed by payment systems, we do not store bank card data)" },
            { label: "Technical data:", text: "IP address, browser type, device information (via cookies)" },
          ],
        },
        purpose: {
          title: "3. Purpose of Collection and Processing of Personal Data",
          p: "We use your personal data for the following purposes:",
          items: [
            "Processing and fulfillment of your orders",
            "Delivery of goods to your address",
            "Communication with you regarding the order (confirmation, delivery status)",
            "Providing technical support",
            "Sending marketing messages (only with your consent)",
            "Improving the quality of our service",
            "Compliance with legal obligations",
          ],
        },
        legal: {
          title: "4. Legal Basis for Processing",
          p: "Processing of your personal data is carried out on the basis of:",
          items: [
            { label: "Contract performance:", text: "order processing and delivery of goods" },
            { label: "Consent:", text: "for marketing messages" },
            { label: "Legal obligations:", text: "storage of financial documents" },
            { label: "Legitimate interests:", text: "service improvement, security" },
          ],
        },
        thirdParty: {
          title: "5. Transfer of Data to Third Parties",
          p: "We may transfer your personal data to the following third parties:",
          items: [
            { label: "Delivery services:", text: "Nova Poshta, other carriers (for order delivery)" },
            { label: "Payment systems:", text: "for payment processing (we do not have access to full data of your cards)" },
            { label: "Service providers:", text: "hosting, email services (Resend) for technical support" },
          ],
          p2: "We do not sell or transfer your data to third parties for marketing purposes without your consent.",
        },
        storage: {
          title: "6. Data Storage",
          p: "We store your personal data for the period necessary to fulfill the purposes specified in this policy, or for the period established by law.",
          items: [
            "Order data is stored for 3 years (according to accounting requirements)",
            "Contact data is stored until withdrawal of your consent or account deletion",
            "Marketing data is stored until consent withdrawal",
          ],
        },
        rights: {
          title: "7. Your Rights",
          p: "In accordance with GDPR and Ukrainian legislation, you have the right to:",
          items: [
            { label: "Right of access:", text: "obtain information about what data we process" },
            { label: "Right to rectification:", text: "correct inaccurate or incomplete data" },
            { label: "Right to erasure:", text: "delete your data (\"right to be forgotten\")" },
            { label: "Right to restriction of processing:", text: "restrict processing of your data" },
            { label: "Right to data portability:", text: "receive your data in a structured format" },
            { label: "Right to withdraw consent:", text: "withdraw consent to data processing at any time" },
            { label: "Right to object:", text: "object to data processing for marketing" },
          ],
          p2: 'To exercise your rights, please contact us through the "Send us a message" form or the email specified in the contacts.',
        },
        cookies: {
          title: "8. Cookies",
          p: "Our website uses cookies to improve user experience. We use:",
          items: [
            { label: "Necessary cookies:", text: "for website functionality (shopping cart, authorization)" },
            { label: "Analytical cookies:", text: "for website traffic analysis" },
          ],
          p2: "You can configure your browser to refuse cookies, but this may affect website functionality.",
        },
        security: {
          title: "9. Data Security",
          p: "We take technical and organizational measures to protect your personal data from unauthorized access, loss, or destruction. Data is transmitted through an encrypted connection (HTTPS).",
        },
        changes: {
          title: "10. Changes to Privacy Policy",
          p: "We reserve the right to update this Privacy Policy. We will notify you of significant changes via email or a notice on the website.",
        },
        contacts: {
          title: "11. Contacts",
          p: "If you have questions about the processing of your personal data or want to exercise your rights, contact us:",
          company: "Lucerna Studio",
          contactLink: "in the \"Contacts\" section",
        },
      },
    },
  }

  return content[locale as keyof typeof content] || content.uk
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
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
              <p>{t.sections.general.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.data.title}</h2>
              <p>{t.sections.data.p}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.sections.data.items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.purpose.title}</h2>
              <p>{t.sections.purpose.p}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.sections.purpose.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.legal.title}</h2>
              <p>{t.sections.legal.p}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.sections.legal.items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.thirdParty.title}</h2>
              <p>{t.sections.thirdParty.p}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.sections.thirdParty.items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
              <p className="mt-4">{t.sections.thirdParty.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.storage.title}</h2>
              <p>{t.sections.storage.p}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.sections.storage.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.rights.title}</h2>
              <p>{t.sections.rights.p}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.sections.rights.items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
              <p className="mt-4">{t.sections.rights.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.cookies.title}</h2>
              <p>{t.sections.cookies.p}</p>
              <ul className="list-disc ml-6 space-y-2">
                {t.sections.cookies.items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
              <p className="mt-4">{t.sections.cookies.p2}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.security.title}</h2>
              <p>{t.sections.security.p}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.changes.title}</h2>
              <p>{t.sections.changes.p}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sections.contacts.title}</h2>
              <p>{t.sections.contacts.p}</p>
              <p className="mt-4">
                <strong>{t.sections.contacts.company}</strong>
                <br />
                {locale === "uk" ? "Email:" : "Email:"}{" "}
                <Link href={`/${locale}/contacts`} className="text-[#D4834F] hover:underline">
                  {t.sections.contacts.contactLink}
                </Link>
                <br />
                {locale === "uk" ? "Телефон:" : "Phone:"}{" "}
                <Link href={`/${locale}/contacts`} className="text-[#D4834F] hover:underline">
                  {t.sections.contacts.contactLink}
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
