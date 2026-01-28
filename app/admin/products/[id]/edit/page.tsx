import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductFormNew } from "@/components/admin/product-form-new"

export const revalidate = 0 // Disable caching to always show fresh data

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const { data: product } = await supabase.from("products").select("*").eq("id", id).single()

  if (!product) {
    notFound()
  }

  const { data: categories } = await supabase.from("categories").select("*").order("name_uk")
  
  // Get product categories - handle case when table doesn't exist
  let productCategories: string[] = []
  try {
    const { data: productCategoriesData, error } = await supabase
      .from("product_categories")
      .select("category_id")
      .eq("product_id", id)
    if (!error) {
      productCategories = productCategoriesData?.map(pc => pc.category_id) || []
    }
  } catch (error: any) {
    // Table doesn't exist, use empty array
    console.warn('product_categories table does not exist:', error)
  }

  // Get all characteristic types
  const { data: characteristicTypes } = await supabase
    .from("characteristic_types")
    .select("*")
    .order("position", { ascending: true })

  // Get product characteristics
  const { data: productCharacteristics } = await supabase
    .from("product_characteristics")
    .select("*")
    .eq("product_id", id)
    .order("position", { ascending: true })

  // Get all characteristic options
  const characteristicTypeIds = characteristicTypes?.map(ct => ct.id) || []
  const { data: characteristicOptions } = characteristicTypeIds.length > 0
    ? await supabase
        .from("characteristic_options")
        .select("*")
        .in("characteristic_type_id", characteristicTypeIds)
        .order("position", { ascending: true })
    : { data: null }

  // Get price combinations
  const { data: priceCombinations } = await supabase
    .from("product_characteristic_price_combinations")
    .select("*")
    .eq("product_id", id)

  // Get downloadable files
  const { data: downloadableFiles } = await supabase
    .from("downloadable_files")
    .select("*")
    .order("created_at", { ascending: false })

  // Get product downloadable files
  const { data: productDownloadableFiles } = await supabase
    .from("product_downloadable_files")
    .select("*")
    .eq("product_id", id)

  return (
    <main className="container mx-auto max-w-4xl p-6">
      <ProductFormNew 
        product={product} 
        categories={categories || []} 
        productCategories={productCategories}
        characteristicTypes={characteristicTypes || []}
        productCharacteristics={productCharacteristics || []}
        characteristicOptions={characteristicOptions || []}
        priceCombinations={priceCombinations || []}
        downloadableFiles={downloadableFiles || []}
        productDownloadableFiles={productDownloadableFiles || []}
      />
    </main>
  )
}
