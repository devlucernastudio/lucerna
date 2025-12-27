import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"
import { ProductsTable } from "@/components/admin/products-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

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
    .select("*, categories(name_uk, name_en)")
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*").order("name_uk")

  return (
    <div className="min-h-screen bg-secondary">
      <AdminNav currentPath="/admin/products" />
      <main className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Управління товарами</h1>
          <Button className="bg-[#D4834F] hover:bg-[#C17340]" asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Додати товар
            </Link>
          </Button>
        </div>

        <ProductsTable products={products || []} categories={categories || []} />
      </main>
    </div>
  )
}
