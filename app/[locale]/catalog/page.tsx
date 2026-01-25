import { createClient } from "@/lib/supabase/server"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/catalog/product-card"
import { CategoryFilter } from "@/components/catalog/category-filter"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { ProductsCount } from "@/components/catalog/products-count"
import { EmptyProducts } from "@/components/catalog/empty-products"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/catalog`
  
  const title = locale === "uk" 
    ? "Каталог - Lucerna Studio | Люцерна Студіо"
    : "Catalog - Lucerna Studio"
  
  const description = locale === "uk"
    ? "Переглянути всі світильники ручної роботи від Lucerna Studio | Люцерна Студіо. Унікальні дизайни для вашого інтер'єру."
    : "Browse all handmade lamps from Lucerna Studio. Unique designs for your interior."

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/catalog`,
        'en-US': `${baseUrl}/en/catalog`,
        'x-default': `${baseUrl}/uk/catalog`,
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

export const revalidate = 0 // Disable caching to always show fresh data

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const searchParamsData = await searchParams
  const categorySlug = searchParamsData.category

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name_uk")

  // Fetch active products from database
  let productsQuery = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)

  // Filter by category if provided
  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()

    if (category) {
      // Get product IDs from product_categories
      const { data: productCategories } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", category.id)

      const productIds = productCategories?.map((pc) => pc.product_id) || []
      if (productIds.length > 0) {
        productsQuery = productsQuery.in("id", productIds)
      } else {
        // No products in this category
        productsQuery = productsQuery.eq("id", "00000000-0000-0000-0000-000000000000") // Return empty
      }
    }
  }

  const { data: products } = await productsQuery.order("created_at", { ascending: false })

  // Fetch all product characteristics, types, options, and price combinations
  const productIds = products?.map((p) => p.id) || []

  // Fetch product characteristics
  const { data: allProductCharacteristics } = productIds.length > 0
    ? await supabase
        .from("product_characteristics")
        .select("*")
        .in("product_id", productIds)
    : { data: [] }

  // Fetch characteristic types
  const characteristicTypeIds = allProductCharacteristics?.map((pc) => pc.characteristic_type_id) || []
  const { data: allCharacteristicTypes } = characteristicTypeIds.length > 0
    ? await supabase
        .from("characteristic_types")
        .select("*")
        .in("id", [...new Set(characteristicTypeIds)])
    : { data: [] }

  // Fetch characteristic options
  const { data: allCharacteristicOptions } = characteristicTypeIds.length > 0
    ? await supabase
        .from("characteristic_options")
        .select("*")
        .in("characteristic_type_id", [...new Set(characteristicTypeIds)])
    : { data: [] }

  // Fetch price combinations
  const { data: allPriceCombinations } = productIds.length > 0
    ? await supabase
        .from("product_characteristic_price_combinations")
        .select("*")
        .in("product_id", productIds)
    : { data: [] }

  // Group data by product_id for easy lookup (use plain objects instead of Map for serialization)
  const characteristicsByProduct: Record<string, typeof allProductCharacteristics> = {}
  const priceCombinationsByProduct: Record<string, typeof allPriceCombinations> = {}

  allProductCharacteristics?.forEach((pc) => {
    if (!characteristicsByProduct[pc.product_id]) {
      characteristicsByProduct[pc.product_id] = []
    }
    characteristicsByProduct[pc.product_id].push(pc)
  })

  allPriceCombinations?.forEach((pc) => {
    if (!priceCombinationsByProduct[pc.product_id]) {
      priceCombinationsByProduct[pc.product_id] = []
    }
    priceCombinationsByProduct[pc.product_id].push(pc)
  })

  return (
    <main className="min-h-screen">
      <CatalogHeader />

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <CategoryFilter categories={categories || []} />
        <div className="mb-6 flex items-center justify-between">
          <ProductsCount count={products?.length || 0} />
        </div>

        {products && products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const productCharacteristics = characteristicsByProduct[product.id] || []
              const priceCombinations = priceCombinationsByProduct[product.id] || []

              return (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name_uk: product.name_uk,
                    name_en: product.name_en,
                    slug: product.slug,
                    price: product.price,
                    images: product.images,
                    description_uk: product.description_uk,
                    description_en: product.description_en,
                  }}
                  productCharacteristics={productCharacteristics}
                  characteristicTypes={allCharacteristicTypes || []}
                  characteristicOptions={allCharacteristicOptions || []}
                  priceCombinations={priceCombinations}
                />
              )
            })}
          </div>
        ) : (
          <EmptyProducts />
        )}
      </section>
      <Footer />
    </main>
  )
}
