import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"

interface Order {
  id: string
  order_number: string
  customer_name: string
  total: number
  status: string
  created_at: string
}

export function RecentOrders({ orders }: { orders: Order[] }) {
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

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Замовлень поки немає</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
              <div>
                <p className="font-medium text-foreground">#{order.order_number}</p>
                <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: uk })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{order.total.toLocaleString("uk-UA")} грн</p>
                <Badge className={`${statusColors[order.status]} text-white`}>{statusLabels[order.status]}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
