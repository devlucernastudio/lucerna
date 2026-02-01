import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { FeaturesSection } from "@/components/home/features-section"
import { AboutSection } from "@/components/home/about-section"
import { CustomSection } from "@/components/home/custom-section"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 60 // Cache for 60 seconds (ISR)

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const supabase = await createClient()

  // Single RPC: all home page data
  const { data: pageData, error: rpcError } = await supabase.rpc("get_home_page_data")

  if (rpcError || pageData == null) {
    return (
      <main className="min-h-screen">
        <HeroSection contentBlocks={[]} />
        <CustomSection contentBlocks={[]} />
        <FeaturedProducts
          products={[]}
          productCharacteristics={[]}
          characteristicTypes={[]}
          characteristicOptions={[]}
          priceCombinations={[]}
        />
        <FeaturesSection contentBlocks={[]} />
        <AboutSection contentBlocks={[]} />
        <Footer />
      </main>
    )
  }

  const products = (pageData.products ?? []) as any[]
  const productCharacteristics = (pageData.product_characteristics ?? []) as any[]
  const characteristicTypes = (pageData.characteristic_types ?? []) as any[]
  const characteristicOptions = (pageData.characteristic_options ?? []) as any[]
  const priceCombinations = (pageData.price_combinations ?? []) as any[]
  const contentBlocks = (pageData.content_blocks ?? []) as any[]

  return (
    <main className="min-h-screen">
      <HeroSection contentBlocks={contentBlocks} />
      <CustomSection contentBlocks={contentBlocks} />
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
