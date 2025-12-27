"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  total: number
  status: string
  created_at: string
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter()

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    processing: "bg-blue-500",
    shipped: "bg-purple-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
  }

  const statusLabels: Record<string, string> = {
    pending: "Нове",
    processing: "В обробці",
    shipped: "Відправлено",
    delivered: "Доставлено",
    cancelled: "Скасовано",
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

    if (error) {
      alert("Помилка при оновленні статусу")
    } else {
      router.refresh()
    }
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">Замовлень поки немає</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-foreground">Номер</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Клієнт</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Контакти</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Сума</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Статус</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Дата</th>
                <th className="p-4 text-right text-sm font-medium text-foreground">Дії</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <span className="font-mono text-sm font-medium text-foreground">#{order.order_number}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-foreground">{order.customer_name}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">
                      <p>{order.customer_email}</p>
                      <p>{order.customer_phone}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-foreground">{order.total.toLocaleString("uk-UA")} грн</span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`rounded px-2 py-1 text-xs font-medium text-white ${statusColors[order.status]}`}
                    >
                      <option value="pending">{statusLabels.pending}</option>
                      <option value="processing">{statusLabels.processing}</option>
                      <option value="shipped">{statusLabels.shipped}</option>
                      <option value="delivered">{statusLabels.delivered}</option>
                      <option value="cancelled">{statusLabels.cancelled}</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: uk })}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
