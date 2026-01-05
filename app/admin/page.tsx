import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentOrders } from "@/components/admin/recent-orders"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: adminData } = await supabase.from("admins").select("*").eq("id", user.id).single()

  if (!adminData) {
    redirect("/admin/login")
  }

  // Get statistics
  const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { count: pendingOrdersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <main className="container mx-auto p-6">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Панель управління</h1>

        <DashboardStats
          stats={{
            products: productsCount || 0,
            orders: ordersCount || 0,
            pendingOrders: pendingOrdersCount || 0,
          }}
        />

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Останні замовлення</h2>
          <RecentOrders orders={recentOrders || []} />
        </div>
    </main>
  )
}
