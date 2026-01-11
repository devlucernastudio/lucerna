import type React from "react"
import type { Metadata } from "next"
import { OrganizationStructuredData } from "@/components/seo/structured-data"
import { createClient } from "@/lib/supabase/server"


export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const isEn = params.locale === "en"

  return {
    title: isEn
      ? "Lucerna Studio - Living Forms of Light"
      : "Lucerna Studio - Живі форми світла",

    description: isEn
      ? "Unique handmade lighting by Lucerna Studio"
      : "Унікальні світильники ручної роботи від Lucerna Studio | Люцерна Студіо",

    alternates: {
      canonical: `/${params.locale}`,
      languages: {
        uk: "/uk",
        en: "/en",
      },
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

