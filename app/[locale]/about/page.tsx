import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { AboutContent } from "@/components/about/about-content"
import { CatalogButton } from "@/components/about/catalog-button"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/about`
  
  const title = locale === "uk" 
    ? "Про нас - Lucerna Studio"
    : "About Us - Lucerna Studio"
  
  const description = locale === "uk"
    ? "Дізнайтеся більше про Lucerna Studio та наші унікальні світильники ручної роботи. Наша історія та філософія."
    : "Learn more about Lucerna Studio and our unique handmade lamps. Our story and philosophy."

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/about`,
        'en-US': `${baseUrl}/en/about`,
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

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const supabase = await createClient()
  
  // Fetch about page content block
  const { data: aboutBlock } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("type", "about_page")
    .eq("is_active", true)
    .single()

  return (
    <main className="min-h-screen">
      <AboutContent
        titleUk={aboutBlock?.title_uk}
        titleEn={aboutBlock?.title_en}
        contentUk={aboutBlock?.content_uk}
        contentEn={aboutBlock?.content_en}
      />
      <CatalogButton />
      <Footer />
    </main>
  )
}
