import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"
import { OrdersTable } from "@/components/admin/orders-table"

export default async function AdminOrdersPage() {
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

  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-secondary">
      <AdminNav currentPath="/admin/orders" />
      <main className="container mx-auto p-6">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Управління замовленнями</h1>
        <OrdersTable orders={orders || []} />
      </main>
    </div>
  )
}
