import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { AboutContent } from "@/components/about/about-content"
import { CatalogButton } from "@/components/about/catalog-button"

export const metadata = {
  title: "Про нас - Lucerna Studio",
  description: "Дізнайтеся більше про Lucerna Studio та наші унікальні світильники ручної роботи",
}

export default async function AboutPage() {
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
