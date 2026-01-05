import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OrdersTable } from "@/components/admin/orders-table"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
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

  const params = await searchParams
  const statusFilter = params.status

  // Fetch orders with optional status filter
  let ordersQuery = supabase.from("orders").select("*")
  
  if (statusFilter && statusFilter !== "all") {
    ordersQuery = ordersQuery.eq("status", statusFilter)
  }

  const { data: orders } = await ordersQuery.order("created_at", { ascending: false })

  // Fetch order items for all orders
  const orderIds = orders?.map((o) => o.id) || []
  const { data: orderItems } = orderIds.length > 0
    ? await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds)
    : { data: [] }

  // Group order items by order_id
  const itemsByOrder: Record<string, typeof orderItems> = {}
  orderItems?.forEach((item: any) => {
    if (!itemsByOrder[item.order_id]) {
      itemsByOrder[item.order_id] = []
    }
    itemsByOrder[item.order_id].push(item)
  })

  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="mb-6 md:mb-8 text-2xl md:text-3xl font-bold text-foreground">Управління замовленнями</h1>
      <OrdersTable orders={orders || []} orderItemsByOrder={itemsByOrder} />
    </main>
  )
}
