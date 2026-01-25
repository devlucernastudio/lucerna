import type React from "react"
import type { Metadata } from "next"
import { OrganizationStructuredData } from "@/components/seo/structured-data"
import { createClient } from "@/lib/supabase/server"


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}`
  
  const title = locale === "uk" 
    ? "Lucerna Studio - Живі форми світла"
    : "Lucerna Studio - Living Forms of Light"
  
  const description = locale === "uk"
    ? "Унікальні світильники ручної роботи від Lucerna Studio | Люцерна Студіо. Створюємо світло, яке надихає та перетворює простір."
    : "Unique handmade lamps from Lucerna Studio. Creating light that inspires and transforms space."

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk`,
        'en-US': `${baseUrl}/en`,
        'x-default': `${baseUrl}/uk`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Lucerna Studio",
      locale: locale === "uk" ? "uk_UA" : "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.jpg`],
    },
  }
}


export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Fetch social media links for Organization Schema
  const supabase = await createClient()
  const { data: socialMediaLinks } = await supabase
    .from("social_media_links")
    .select("url, is_enabled")
    .eq("is_enabled", true)
  
  const socialMedia = (socialMediaLinks || []).map(link => ({
    url: link.url || '',
    enabled: link.is_enabled,
  }))
  
  return (
    <>
      <OrganizationStructuredData socialMedia={socialMedia} />
      {children}
    </>
  )
}

