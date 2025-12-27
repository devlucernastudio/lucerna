import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingBag, Clock } from "lucide-react"

interface StatsProps {
  stats: {
    products: number
    orders: number
    pendingOrders: number
  }
}

export function DashboardStats({ stats }: StatsProps) {
  const statCards = [
    {
      title: "Всього товарів",
      value: stats.products,
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Всього замовлень",
      value: stats.orders,
      icon: ShoppingBag,
      color: "text-green-500",
    },
    {
      title: "Нові замовлення",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
