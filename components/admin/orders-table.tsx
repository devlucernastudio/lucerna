"use client"
import { useState } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import caparolColors from "@/lib/caparol-3d-plus.json"

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  customer_address?: string
  customer_city?: string
  total: number
  subtotal: number
  shipping: number
  status: string
  notes: string | null
  created_at: string
}

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  characteristics?: Record<string, string> | null
  comment?: string | null
}

interface OrdersTableProps {
  orders: Order[]
  orderItemsByOrder?: Record<string, OrderItem[]>
}

export function OrdersTable({ orders, orderItemsByOrder = {} }: OrdersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

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

  const handleStatusChange = async (orderId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const supabase = createClient()
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

    if (error) {
      alert("Помилка при оновленні статусу")
    } else {
      router.refresh()
    }
  }

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === "all") {
      params.delete("status")
    } else {
      params.set("status", status)
    }
    router.push(`/admin/orders?${params.toString()}`)
  }

  const currentStatusFilter = searchParams.get("status") || "all"

  // Helper function to get color hex from Caparol palette by color ID or name
  const getColorHex = (colorValue: string): string | null => {
    const colorsData = caparolColors as {
      system: string
      totalColors: number
      stripSize: number
      strips: Array<{
        stripIndex: number
        baseHue: number
        colors: Array<{
          name: string
          hex: string
          lch: string
        }>
      }>
    }
    
    // Search through all strips for matching color
    for (const strip of colorsData.strips) {
      const color = strip.colors.find(c => {
        // Match by name (e.g., "3D Granit 5")
        if (c.name === colorValue) return true
        // Match by hex (e.g., "3E3D3D" or "#3E3D3D")
        if (c.hex === colorValue || `#${c.hex}` === colorValue) return true
        // Match by hex without # prefix
        if (colorValue.replace('#', '') === c.hex) return true
        return false
      })
      if (color) return `#${color.hex}`
    }
    
    // If it's already a hex color code, return it
    if (colorValue.match(/^#[0-9A-Fa-f]{6}$/)) {
      return colorValue
    }
    
    return null
  }

  // Helper function to check if a value might be a color (has hex code or is from Caparol palette)
  const isColorValue = (value: string): boolean => {
    // Check if it's a hex color (with or without #)
    if (value.match(/^#?[0-9A-Fa-f]{6}$/)) return true
    // Check if it matches Caparol color name pattern (e.g., "3D Granit 5", "3D-Lavendel-10")
    if (value.match(/^3D\s?[A-Za-z]+\s?\d+$/i)) return true
    if (value.match(/^3D-[A-Za-z]+-\d+$/)) return true
    // Check if getColorHex can find it
    return getColorHex(value) !== null
  }

  return (
    <div className="space-y-4">
      {/* Status Filter Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentStatusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusFilter("all")}
          className={currentStatusFilter === "all" ? "bg-[#D4834F] hover:bg-[#C17340]" : ""}
        >
          Всі
        </Button>
        {Object.entries(statusLabels).map(([status, label]) => (
          <Button
            key={status}
            variant={currentStatusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilter(status)}
            className={currentStatusFilter === status ? "bg-[#D4834F] hover:bg-[#C17340]" : ""}
          >
            {label}
          </Button>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Замовлень поки немає</CardContent>
        </Card>
      ) : (
        <Card>
        <CardContent className="p-0">
          {/* Mobile/Tablet view */}
          <div className="block lg:hidden">
            <div className="divide-y divide-border">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id)
                const items = orderItemsByOrder[order.id] || []

                return (
                  <div key={order.id}>
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleOrder(order.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-medium text-foreground">
                              #{order.order_number}
                            </span>
                            <Badge className={`${statusColors[order.status]} text-white text-xs`}>
                              {statusLabels[order.status]}
                            </Badge>
                          </div>
                          <p className="font-medium text-foreground truncate">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                          <p className="text-sm font-semibold text-foreground mt-1">
                            {order.total.toLocaleString("uk-UA")} грн
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: uk })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleOrder(order.id)
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t border-border">
                        <div className="pt-4 space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Контактна інформація</h4>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Телефон: {order.customer_phone}</p>
                              {order.customer_email && <p>Email: {order.customer_email}</p>}
                              {order.customer_city && <p>Місто: {order.customer_city}</p>}
                              {order.customer_address && <p>Адреса: {order.customer_address}</p>}
                            </div>
                          </div>

                          {items.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-3">Товари</h4>
                              <div className="space-y-3">
                                {items.map((item) => (
                                  <Card key={item.id} className="p-3">
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium text-foreground">{item.product_name}</p>
                                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                                          {item.subtotal.toLocaleString("uk-UA")} грн
                                        </p>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {item.quantity} шт. × {item.product_price.toLocaleString("uk-UA")} грн
                                      </p>
                                      
                                      {item.characteristics && (
                                        <div className="mt-2 pt-2 border-t border-border">
                                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Характеристики:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {Array.isArray(item.characteristics) ? (
                                              // Handle array format: [{name: "...", value: "..."}]
                                              item.characteristics.map((char: any, index: number) => {
                                                const charName = char?.name || `Характеристика ${index + 1}`
                                                const charValue = char?.value || char || ""
                                                const valueStr = String(charValue)
                                                const colorHex = isColorValue(valueStr) ? getColorHex(valueStr) : null
                                                return (
                                                  <div
                                                    key={index}
                                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md text-xs"
                                                  >
                                                    <span className="font-medium text-foreground">{charName}:</span>
                                                    {colorHex ? (
                                                      <>
                                                        <div
                                                          className="w-4 h-4 rounded-md border border-gray-300 flex-shrink-0"
                                                          style={{ backgroundColor: colorHex }}
                                                          title={valueStr}
                                                        />
                                                        <span className="text-muted-foreground">{valueStr}</span>
                                                      </>
                                                    ) : (
                                                      <span className="text-muted-foreground">{valueStr}</span>
                                                    )}
                                                  </div>
                                                )
                                              })
                                            ) : (
                                              // Handle object format: {name: "value"}
                                              Object.entries(item.characteristics).map(([charName, charValue]) => {
                                                const valueStr = typeof charValue === "object" && charValue !== null && "value" in charValue
                                                  ? String((charValue as any).value)
                                                  : String(charValue)
                                                const colorHex = isColorValue(valueStr) ? getColorHex(valueStr) : null
                                                return (
                                                  <div
                                                    key={charName}
                                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md text-xs"
                                                  >
                                                    <span className="font-medium text-foreground">{charName}:</span>
                                                    {colorHex ? (
                                                      <>
                                                        <div
                                                          className="w-4 h-4 rounded-md border border-gray-300 flex-shrink-0"
                                                          style={{ backgroundColor: colorHex }}
                                                          title={valueStr}
                                                        />
                                                        <span className="text-muted-foreground">{valueStr}</span>
                                                      </>
                                                    ) : (
                                                      <span className="text-muted-foreground">{valueStr}</span>
                                                    )}
                                                  </div>
                                                )
                                              })
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {item.comment && (
                                        <div className="mt-2 pt-2 border-t border-border">
                                          <p className="text-xs font-medium text-muted-foreground mb-1">Коментар:</p>
                                          <p className="text-xs text-muted-foreground italic">{item.comment}</p>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Сума</h4>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Підсумок:</span>
                                <span>{order.subtotal.toLocaleString("uk-UA")} грн</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Доставка:</span>
                                <span>{order.shipping.toLocaleString("uk-UA")} грн</span>
                              </div>
                              <div className="flex justify-between font-semibold text-foreground">
                                <span>Разом:</span>
                                <span>{order.total.toLocaleString("uk-UA")} грн</span>
                              </div>
                            </div>
                          </div>

                          {order.notes && (
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2">Примітки</h4>
                              <p className="text-sm text-muted-foreground">{order.notes}</p>
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Змінити статус</h4>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value, e as any)}
                              onClick={(e) => e.stopPropagation()}
                              className={`rounded px-2 py-1 text-xs font-medium text-white ${statusColors[order.status]} w-full`}
                            >
                              <option value="pending">{statusLabels.pending}</option>
                              <option value="processing">{statusLabels.processing}</option>
                              <option value="shipped">{statusLabels.shipped}</option>
                              <option value="delivered">{statusLabels.delivered}</option>
                              <option value="cancelled">{statusLabels.cancelled}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Desktop view */}
          <div className="hidden lg:block overflow-x-auto">
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
                {orders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id)
                  const items = orderItemsByOrder[order.id] || []

                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleOrder(order.id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-foreground">
                              #{order.order_number}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-foreground">{order.customer_name}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground">
                            {order.customer_email && <p>{order.customer_email}</p>}
                            <p>{order.customer_phone}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-foreground">
                            {order.total.toLocaleString("uk-UA")} грн
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value, e as any)}
                            onClick={(e) => e.stopPropagation()}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleOrder(order.id)
                              }}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${order.id}-expanded`}>
                          <td colSpan={7} className="p-4 bg-muted/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-sm font-medium text-foreground mb-3">Контактна інформація</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>Телефон: {order.customer_phone}</p>
                                  {order.customer_email && <p>Email: {order.customer_email}</p>}
                                  {order.customer_city && <p>Місто: {order.customer_city}</p>}
                                  {order.customer_address && <p>Адреса: {order.customer_address}</p>}
                                </div>
                              </div>

                              <div>
                                {items.length > 0 && (
                                  <>
                                    <h4 className="text-sm font-medium text-foreground mb-3">Товари</h4>
                                    <div className="space-y-3 mb-4">
                                      {items.map((item) => (
                                        <Card key={item.id} className="p-3">
                                          <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                              <p className="font-medium text-foreground">{item.product_name}</p>
                                              <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                                                {item.subtotal.toLocaleString("uk-UA")} грн
                                              </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                              {item.quantity} шт. × {item.product_price.toLocaleString("uk-UA")} грн
                                            </p>
                                            
                                            {item.characteristics && (
                                              <div className="mt-2 pt-2 border-t border-border">
                                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Характеристики:</p>
                                                <div className="flex flex-wrap gap-2">
                                                  {Array.isArray(item.characteristics) ? (
                                                    // Handle array format: [{name: "...", value: "..."}]
                                                    item.characteristics.map((char: any, index: number) => {
                                                      const charName = char?.name || `Характеристика ${index + 1}`
                                                      const charValue = char?.value || char || ""
                                                      const valueStr = String(charValue)
                                                      const colorHex = isColorValue(valueStr) ? getColorHex(valueStr) : null
                                                      return (
                                                        <div
                                                          key={index}
                                                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md text-xs"
                                                        >
                                                          <span className="font-medium text-foreground">{charName}:</span>
                                                          {colorHex ? (
                                                            <>
                                                              <div
                                                                className="w-3 h-3 rounded border border-gray-300 flex-shrink-0"
                                                                style={{ backgroundColor: colorHex }}
                                                                title={valueStr}
                                                              />
                                                              <span className="text-muted-foreground">{valueStr}</span>
                                                            </>
                                                          ) : (
                                                            <span className="text-muted-foreground">{valueStr}</span>
                                                          )}
                                                        </div>
                                                      )
                                                    })
                                                  ) : (
                                                    // Handle object format: {name: "value"}
                                                    Object.entries(item.characteristics).map(([charName, charValue]) => {
                                                      const valueStr = typeof charValue === "object" && charValue !== null && "value" in charValue
                                                        ? String((charValue as any).value)
                                                        : String(charValue)
                                                      const colorHex = isColorValue(valueStr) ? getColorHex(valueStr) : null
                                                      return (
                                                        <div
                                                          key={charName}
                                                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md text-xs"
                                                        >
                                                          <span className="font-medium text-foreground">{charName}:</span>
                                                          {colorHex ? (
                                                            <>
                                                              <div
                                                                className="w-3 h-3 rounded border border-gray-300 flex-shrink-0"
                                                                style={{ backgroundColor: colorHex }}
                                                                title={valueStr}
                                                              />
                                                              <span className="text-muted-foreground">{valueStr}</span>
                                                            </>
                                                          ) : (
                                                            <span className="text-muted-foreground">{valueStr}</span>
                                                          )}
                                                        </div>
                                                      )
                                                    })
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                            
                                            {item.comment && (
                                              <div className="mt-2 pt-2 border-t border-border">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Коментар:</p>
                                                <p className="text-xs text-muted-foreground italic">{item.comment}</p>
                                              </div>
                                            )}
                                          </div>
                                        </Card>
                                      ))}
                                    </div>
                                  </>
                                )}

                                <h4 className="text-sm font-medium text-foreground mb-3">Сума</h4>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Підсумок:</span>
                                    <span>{order.subtotal.toLocaleString("uk-UA")} грн</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Доставка:</span>
                                    <span>{order.shipping.toLocaleString("uk-UA")} грн</span>
                                  </div>
                                  <div className="flex justify-between font-semibold text-foreground">
                                    <span>Разом:</span>
                                    <span>{order.total.toLocaleString("uk-UA")} грн</span>
                                  </div>
                                </div>

                                {order.notes && (
                                  <div className="mt-4">
                                    <h4 className="text-sm font-medium text-foreground mb-2">Примітки</h4>
                                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
