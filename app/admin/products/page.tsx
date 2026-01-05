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

  // Add categories to products
  const productsWithCategories = products?.map((product) => ({
    ...product,
    productCategories: categoriesByProduct[product.id] || [],
  })) || []

  const { data: categories } = await supabase.from("categories").select("*").order("name_uk")

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

        <ProductsTable products={productsWithCategories} categories={categories || []} />
    </main>
  )
}
