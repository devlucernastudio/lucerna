import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductDetails } from "@/components/product/product-details"
import { BackButton } from "@/components/product/back-button"
import { RelatedProductsSection } from "@/components/product/related-products-section"
import { ProductDescription } from "@/components/product/product-description"

export const revalidate = 0 // Disable caching to always show fresh data

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", id)
    .eq("is_active", true)
    .single()

  if (!product) {
    return {
      title: "Товар не знайдено - Lucerna Studio",
    }
  }
  return {
    title: `${product.name_uk || product.name_en} - Lucerna Studio`,
    description: product.description_uk || product.description_en || "",
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch product by slug
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", id)
    .eq("is_active", true)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch product characteristics
  const { data: productCharacteristics } = await supabase
    .from("product_characteristics")
    .select("*")
    .eq("product_id", product.id)

  // Fetch characteristic types
  const characteristicTypeIds = productCharacteristics?.map((pc) => pc.characteristic_type_id) || []
  const { data: characteristicTypes } = characteristicTypeIds.length > 0
    ? await supabase
        .from("characteristic_types")
        .select("*")
        .in("id", characteristicTypeIds)
        .order("position", { ascending: true })
    : { data: [] }

  // Fetch characteristic options
  const { data: characteristicOptions } = characteristicTypeIds.length > 0
    ? await supabase
        .from("characteristic_options")
        .select("*")
        .in("characteristic_type_id", characteristicTypeIds)
        .order("position", { ascending: true })
    : { data: [] }

  // Fetch price combinations
  const { data: priceCombinations } = await supabase
    .from("product_characteristic_price_combinations")
    .select("*")
    .eq("product_id", product.id)

  // Fetch related products (from same categories)
  const { data: productCategories } = await supabase
    .from("product_categories")
    .select("category_id")
    .eq("product_id", product.id)

  let relatedProducts: any[] = []
  if (productCategories && productCategories.length > 0) {
    const categoryIds = productCategories.map((pc) => pc.category_id)
    
    // First get product IDs from same categories
    const { data: relatedProductIds } = await supabase
      .from("product_categories")
      .select("product_id")
      .in("category_id", categoryIds)
      .neq("product_id", product.id)

    if (relatedProductIds && relatedProductIds.length > 0) {
      const productIds = [...new Set(relatedProductIds.map((r) => r.product_id))]
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .in("id", productIds)
        .limit(3)
      relatedProducts = data || []
    }
  }

  // Fetch characteristics for related products
  const relatedProductIds = relatedProducts.map((p) => p.id)
  const { data: relatedProductCharacteristics } = relatedProductIds.length > 0
    ? await supabase
        .from("product_characteristics")
        .select("*")
        .in("product_id", relatedProductIds)
    : { data: [] }

  // Fetch characteristic types for related products
  const relatedCharTypeIds = relatedProductCharacteristics?.map((pc) => pc.characteristic_type_id) || []
  const { data: relatedCharacteristicTypes } = relatedCharTypeIds.length > 0
    ? await supabase
        .from("characteristic_types")
        .select("*")
        .in("id", [...new Set(relatedCharTypeIds)])
    : { data: [] }

  // Fetch characteristic options for related products
  const { data: relatedCharacteristicOptions } = relatedCharTypeIds.length > 0
    ? await supabase
        .from("characteristic_options")
        .select("*")
        .in("characteristic_type_id", [...new Set(relatedCharTypeIds)])
    : { data: [] }

  // Fetch price combinations for related products
  const { data: relatedPriceCombinations } = relatedProductIds.length > 0
    ? await supabase
        .from("product_characteristic_price_combinations")
        .select("*")
        .in("product_id", relatedProductIds)
    : { data: [] }

  // Group characteristics and price combinations by product_id
  const relatedCharacteristicsByProduct: Record<string, any[]> = {}
  const relatedPriceCombinationsByProduct: Record<string, any[]> = {}

  if (relatedProductCharacteristics) {
    relatedProductCharacteristics.forEach((pc) => {
      if (!relatedCharacteristicsByProduct[pc.product_id]) {
        relatedCharacteristicsByProduct[pc.product_id] = []
      }
      relatedCharacteristicsByProduct[pc.product_id].push(pc)
    })
  }

  if (relatedPriceCombinations) {
    relatedPriceCombinations.forEach((pc) => {
      if (!relatedPriceCombinationsByProduct[pc.product_id]) {
        relatedPriceCombinationsByProduct[pc.product_id] = []
      }
      relatedPriceCombinationsByProduct[pc.product_id].push(pc)
    })
  }

  return (
    <main className="min-h-screen pb-[100px]">
      <BackButton />

      {/* Product Details */}
      <section className="container mx-auto px-4 pb-24 lg:pb-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div>
            <ProductGallery
              images={product.images || []}
              productName={product.name_uk || product.name_en}
            />
            
            {/* Description - shown below gallery on desktop */}
            <ProductDescription
              descriptionUk={product.description_uk}
              descriptionEn={product.description_en}
            />
          </div>

          {/* Product Info */}
          <ProductDetails
            product={{
              id: product.id,
              name_uk: product.name_uk,
              name_en: product.name_en,
              slug: product.slug,
              price: product.price,
              compare_at_price: product.compare_at_price,
              description_uk: product.description_uk,
              description_en: product.description_en,
              stock: product.stock,
              is_in_stock: product.is_in_stock,
              sku: product.sku,
              images: product.images,
            }}
            productCharacteristics={productCharacteristics || []}
            characteristicTypes={characteristicTypes || []}
            characteristicOptions={characteristicOptions || []}
            priceCombinations={priceCombinations || []}
          />
        </div>
      </section>

      <RelatedProductsSection
        products={relatedProducts}
        productCharacteristics={relatedProductCharacteristics || []}
        characteristicTypes={relatedCharacteristicTypes || []}
        characteristicOptions={relatedCharacteristicOptions || []}
        priceCombinations={relatedPriceCombinations || []}
      />
    </main>
  )
}
