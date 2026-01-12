import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductDetails } from "@/components/product/product-details"
import { BackButton } from "@/components/product/back-button"
import { RelatedProductsSection } from "@/components/product/related-products-section"
import { ProductDescription } from "@/components/product/product-description"
import { ProductStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data"

export const revalidate = 0 // Disable caching to always show fresh data

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", id)
    .eq("is_active", true)
    .single()

  if (!product) {
    return {
      title: locale === "uk" ? "Товар не знайдено - Lucerna Studio" : "Product not found - Lucerna Studio",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/product/${id}`
  const title = `${product.name_uk || product.name_en} - Lucerna Studio`
  const description = product.description_uk || product.description_en || ""
  const image = product.images && product.images.length > 0
    ? (product.images[0].startsWith('http') ? product.images[0] : `${baseUrl}${product.images[0]}`)
    : `${baseUrl}/og-image.jpg`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/product/${id}`,
        'en-US': `${baseUrl}/en/product/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Lucerna Studio",
      locale: locale === "uk" ? "uk_UA" : "en_US",
      type: "product",
      images: [
        {
          url: image,
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
      images: [image],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
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

  // Fetch additional info block - check settings.enabled instead of is_active
  const { data: additionalInfoBlockData, error: additionalInfoError } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("type", "additional_info")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()


  // Pass block to component - let component check if enabled
  const additionalInfoBlock = additionalInfoBlockData || null

  // Check if product is available
  const isProductAvailable = (() => {
    // If there are price combinations, check if at least one is available
    if (priceCombinations && priceCombinations.length > 0) {
      return priceCombinations.some((pc: any) => pc.is_available)
    }
    // Otherwise, check is_in_stock
    return product.is_in_stock ?? true
  })()

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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lucerna-studio.com'

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { name: locale === 'uk' ? 'Головна' : 'Home', url: `${baseUrl}/${locale}` },
    { name: locale === 'uk' ? 'Каталог' : 'Catalog', url: `${baseUrl}/${locale}/catalog` },
    { name: locale === 'uk' ? product.name_uk : product.name_en, url: `${baseUrl}/${locale}/product/${product.slug}` },
  ]

  return (
    <main className="min-h-screen pb-[100px]">
      {/* Structured Data */}
      <ProductStructuredData product={product} locale={locale} isAvailable={isProductAvailable} />
      <BreadcrumbStructuredData items={breadcrumbItems} />

      <BackButton />

      {/* Product Details */}
      <section className="container mx-auto px-4 pb-24 lg:pb-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div>
            <ProductGallery
              images={product.images || []}
              productName={product.name_uk || product.name_en}
              isAvailable={isProductAvailable}
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
            additionalInfoBlock={additionalInfoBlock || null}
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
