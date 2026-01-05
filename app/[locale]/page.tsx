import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { FeaturesSection } from "@/components/home/features-section"
import { AboutSection } from "@/components/home/about-section"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 0 // Disable caching to always show fresh data

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

  // Fetch product characteristics for featured products
  const productIds = products?.map((p) => p.id) || []
  const { data: productCharacteristics } = productIds.length > 0
    ? await supabase
        .from("product_characteristics")
        .select("*")
        .in("product_id", productIds)
    : { data: [] }

  // Fetch characteristic types
  const characteristicTypeIds = productCharacteristics?.map((pc) => pc.characteristic_type_id) || []
  const { data: characteristicTypes } = characteristicTypeIds.length > 0
    ? await supabase
        .from("characteristic_types")
        .select("*")
        .in("id", [...new Set(characteristicTypeIds)])
    : { data: [] }

  // Fetch characteristic options
  const { data: characteristicOptions } = characteristicTypeIds.length > 0
    ? await supabase
        .from("characteristic_options")
        .select("*")
        .in("characteristic_type_id", [...new Set(characteristicTypeIds)])
    : { data: [] }

  // Fetch price combinations
  const { data: priceCombinations } = productIds.length > 0
    ? await supabase
        .from("product_characteristic_price_combinations")
        .select("*")
        .in("product_id", productIds)
    : { data: [] }

  // Fetch content blocks
  const { data: contentBlocks } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("is_active", true)
    .order("position")

  return (
    <main className="min-h-screen">
      <HeroSection contentBlocks={contentBlocks} />
      <FeaturedProducts 
        products={products || []}
        productCharacteristics={productCharacteristics || []}
        characteristicTypes={characteristicTypes || []}
        characteristicOptions={characteristicOptions || []}
        priceCombinations={priceCombinations || []}
      />
      <FeaturesSection contentBlocks={contentBlocks} />
      <AboutSection contentBlocks={contentBlocks} />
      <Footer />
    </main>
  )
}
