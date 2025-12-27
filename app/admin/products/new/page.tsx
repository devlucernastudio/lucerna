import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"
import { ProductForm } from "@/components/admin/product-form"

export default async function NewProductPage() {
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

  const { data: categories } = await supabase.from("categories").select("*").order("name_uk")

  return (
    <div className="min-h-screen bg-secondary">
      <AdminNav currentPath="/admin/products" />
      <main className="container mx-auto max-w-4xl p-6">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Новий товар</h1>
        <ProductForm categories={categories || []} />
      </main>
    </div>
  )
}
