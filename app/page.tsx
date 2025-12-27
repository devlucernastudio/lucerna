import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { FeaturesSection } from "@/components/home/features-section"
import { AboutSection } from "@/components/home/about-section"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products from database
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6)

  // Fetch content blocks
  const { data: contentBlocks } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("is_active", true)
    .order("position")

  return (
    <main className="min-h-screen">
      <HeroSection contentBlocks={contentBlocks} />
      <FeaturedProducts products={products || []} />
      <FeaturesSection contentBlocks={contentBlocks} />
      <AboutSection />
      <Footer />
    </main>
  )
}
