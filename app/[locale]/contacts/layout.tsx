import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/contacts`
  
  const title = locale === "uk" 
    ? "Контакти - Lucerna Studio"
    : "Contacts - Lucerna Studio"
  
  const description = locale === "uk"
    ? "Зв'яжіться з Lucerna Studio. Напишіть нам або знайдіть контактну інформацію."
    : "Contact Lucerna Studio. Send us a message or find contact information."

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/contacts`,
        'en-US': `${baseUrl}/en/contacts`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Lucerna Studio",
      locale: locale === "uk" ? "uk_UA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

