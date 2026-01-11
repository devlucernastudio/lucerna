import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { CollaborationContent } from "@/components/collaboration/collaboration-content"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/collaboration`
  
  const title = locale === "uk" 
    ? "Співпраця - Lucerna Studio"
    : "Collaboration - Lucerna Studio"
  
  const description = locale === "uk"
    ? "Співпраця з дизайнерами та архітекторами. Партнерські умови, індивідуальне виготовлення світильників під конкретний проєкт від Lucerna Studio | Люцерна Студіо."
    : "Collaboration with designers and architects. Partnership terms, custom lighting solutions for specific projects."

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/collaboration`,
        'en-US': `${baseUrl}/en/collaboration`,
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

export default async function CollaborationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  
  // Fetch social media links (Viber, WhatsApp, Telegram)
  const { data: socialMediaLinks } = await supabase
    .from("social_media_links")
    .select("platform, url")
    .in("platform", ["viber", "whatsapp", "telegram"])
    .eq("is_enabled", true)

  return (
    <main className="min-h-screen">
      <CollaborationContent 
        locale={locale}
        socialMediaLinks={socialMediaLinks || []}
      />
      <Footer />
    </main>
  )
}

