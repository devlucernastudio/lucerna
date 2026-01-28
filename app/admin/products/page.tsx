import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductsTable } from "@/components/admin/products-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const revalidate = 0 // Disable caching to always show fresh data

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { data: adminData } = await supabase.from("admins").select("*").eq("id", user.id).single()

  if (!adminData) {
    redirect("/admin/login")
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch product categories for all products
  const productIds = products?.map((p) => p.id) || []
  const { data: productCategories } = productIds.length > 0
    ? await supabase
        .from("product_categories")
        .select("product_id, category_id, categories(name_uk, name_en)")
        .in("product_id", productIds)
    : { data: [] }

  // Group categories by product_id
  const categoriesByProduct: Record<string, Array<{ name_uk: string; name_en: string }>> = {}
  productCategories?.forEach((pc: any) => {
    if (!categoriesByProduct[pc.product_id]) {
      categoriesByProduct[pc.product_id] = []
    }
    if (pc.categories) {
      categoriesByProduct[pc.product_id].push(pc.categories)
    }
  })

  // Fetch price combinations for all products
  const { data: priceCombinations } = productIds.length > 0
    ? await supabase
        .from("product_characteristic_price_combinations")
        .select("product_id, is_available")
        .in("product_id", productIds)
    : { data: [] }

  // Group price combinations by product_id
  const priceCombinationsByProduct: Record<string, Array<{ is_available: boolean }>> = {}
  priceCombinations?.forEach((pc: any) => {
    if (!priceCombinationsByProduct[pc.product_id]) {
      priceCombinationsByProduct[pc.product_id] = []
    }
    priceCombinationsByProduct[pc.product_id].push({ is_available: pc.is_available ?? true })
  })

  // Add categories and price combinations to products
  const productsWithCategories = products?.map((product) => ({
    ...product,
    productCategories: categoriesByProduct[product.id] || [],
    priceCombinations: priceCombinationsByProduct[product.id] || [],
  })) || []

  const { data: categories } = await supabase.from("categories").select("*").order("name_uk")

  // Fetch product characteristics for all products
  const { data: productCharacteristics } = productIds.length > 0
    ? await supabase
        .from("product_characteristics")
        .select("product_id, characteristic_type_id, required, affects_price, position, characteristic_types(name_uk, name_en)")
        .in("product_id", productIds)
        .order("position", { ascending: true })
    : { data: [] }

  // Group characteristics by product_id, maintaining order
  const characteristicsByProduct: Record<string, Array<{ 
    characteristic_type_id: string
    required: boolean | null
    affects_price: boolean | null
    position: number | null
    name_uk: string
    name_en: string
  }>> = {}
  productCharacteristics?.forEach((pc: any) => {
    if (!characteristicsByProduct[pc.product_id]) {
      characteristicsByProduct[pc.product_id] = []
    }
    if (pc.characteristic_types) {
      characteristicsByProduct[pc.product_id].push({
        characteristic_type_id: pc.characteristic_type_id,
        required: pc.required,
        affects_price: pc.affects_price,
        position: pc.position ?? null,
        name_uk: pc.characteristic_types.name_uk,
        name_en: pc.characteristic_types.name_en,
      })
    }
  })
  
  // Sort characteristics by position for each product
  Object.keys(characteristicsByProduct).forEach(productId => {
    characteristicsByProduct[productId].sort((a, b) => {
      const posA = a.position ?? 999
      const posB = b.position ?? 999
      return posA - posB
    })
  })

  // Fetch all characteristic options for displaying names
  const { data: characteristicOptions } = await supabase
    .from("characteristic_options")
    .select("id, characteristic_type_id, name_uk, name_en, value")

  // Fetch all characteristic types for displaying names
  const { data: characteristicTypes } = await supabase
    .from("characteristic_types")
    .select("id, name_uk, name_en")

  // Fetch all downloadable files for displaying names
  const { data: downloadableFiles } = await supabase
    .from("downloadable_files")
    .select("id, title_uk, title_en")

  // Fetch detailed price combinations with characteristics and price
  const { data: detailedPriceCombinations } = productIds.length > 0
    ? await supabase
        .from("product_characteristic_price_combinations")
        .select("id, product_id, is_available, combination, price")
        .in("product_id", productIds)
    : { data: [] }

  // Group detailed price combinations by product_id
  const detailedPriceCombinationsByProduct: Record<string, Array<{ 
    id: string
    is_available: boolean
    combination: any
    price: number
  }>> = {}
  detailedPriceCombinations?.forEach((pc: any) => {
    if (!detailedPriceCombinationsByProduct[pc.product_id]) {
      detailedPriceCombinationsByProduct[pc.product_id] = []
    }
    detailedPriceCombinationsByProduct[pc.product_id].push({
      id: pc.id,
      is_available: pc.is_available ?? true,
      combination: pc.combination || {},
      price: pc.price || 0,
    })
  })

  // Fetch downloadable files for all products
  const { data: productDownloadableFiles } = productIds.length > 0
    ? await supabase
        .from("product_downloadable_files")
        .select("product_id, downloadable_file_id, show_file")
        .in("product_id", productIds)
    : { data: [] }

  // Group downloadable files by product_id
  const downloadableFilesByProduct: Record<string, Array<{ 
    downloadable_file_id: string
    show_file: boolean
  }>> = {}
  productDownloadableFiles?.forEach((pdf: any) => {
    if (!downloadableFilesByProduct[pdf.product_id]) {
      downloadableFilesByProduct[pdf.product_id] = []
    }
    downloadableFilesByProduct[pdf.product_id].push({
      downloadable_file_id: pdf.downloadable_file_id,
      show_file: pdf.show_file ?? true,
    })
  })

  // Add characteristics, detailed price combinations, and downloadable files to products
  const productsWithAllData = productsWithCategories.map((product) => ({
    ...product,
    characteristics: characteristicsByProduct[product.id] || [],
    detailedPriceCombinations: detailedPriceCombinationsByProduct[product.id] || [],
    downloadableFiles: downloadableFilesByProduct[product.id] || [],
  }))

  return (
    <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Управління товарами</h1>
          <Button className="bg-[#D4834F] hover:bg-[#C17340] w-full sm:w-auto" asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Додати товар
            </Link>
          </Button>
        </div>

        <ProductsTable 
          products={productsWithAllData} 
          categories={categories || []}
          characteristicOptions={characteristicOptions || []}
          characteristicTypes={characteristicTypes || []}
          downloadableFiles={downloadableFiles || []}
        />
    </main>
  )
}
