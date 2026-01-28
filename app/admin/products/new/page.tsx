import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductFormNew } from "@/components/admin/product-form-new"

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

  // Get all characteristic types
  const { data: characteristicTypes } = await supabase
    .from("characteristic_types")
    .select("*")
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

  // Get downloadable files
  const { data: downloadableFiles } = await supabase
    .from("downloadable_files")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <main className="container mx-auto max-w-4xl p-6">
      <ProductFormNew 
        categories={categories || []} 
        characteristicTypes={characteristicTypes || []}
        characteristicOptions={characteristicOptions || []}
        downloadableFiles={downloadableFiles || []}
      />
    </main>
  )
}
