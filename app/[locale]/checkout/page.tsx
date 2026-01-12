"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  })

  if (cart.length === 0) {
    return (
      <main className="container mx-auto min-h-[70vh] px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground" />
          <div>
            <h1 className="mb-2 text-3xl font-light text-foreground">{t("cart.empty")}</h1>
            <p className="text-muted-foreground">
              {locale === "uk"
                ? "Додайте товари до кошика перед оформленням замовлення"
                : "Add products to cart before checkout"}
            </p>
          </div>
          <Button className="bg-[#D4834F] hover:bg-[#C17340]" size="lg" asChild>
            <Link href="/catalog">{t("cart.continueShopping")}</Link>
          </Button>
        </div>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Generate order number
      const orderNumber = `LUC-${Date.now()}`

      // Combine name fields
      const fullName = [formData.lastName, formData.firstName, formData.middleName]
        .filter(Boolean)
        .join(" ")

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: fullName,
          customer_email: formData.email.trim() || null,
          customer_phone: formData.phone,
          customer_address: formData.address,
          customer_city: formData.city,
          customer_postal_code: null,
          subtotal: totalPrice,
          shipping: 0,
          total: totalPrice,
          status: "pending",
          notes: formData.notes.trim() || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items with characteristics and comment
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        characteristics: item.characteristics || null,
        comment: item.comment || null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Send order notification email
      try {
        await fetch("/api/send-order-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderNumber,
            customerName: fullName,
            customerEmail: formData.email.trim() || null,
            customerPhone: formData.phone,
            customerCity: formData.city,
            customerAddress: formData.address,
            notes: formData.notes.trim() || null,
            total: totalPrice,
            items: orderItems.map((item: any) => ({
              product_name: item.product_name,
              quantity: item.quantity,
              product_price: item.product_price,
              subtotal: item.subtotal,
              characteristics: item.characteristics || null,
              comment: item.comment || null,
            })),
          }),
        })
      } catch (emailError) {
        // Log error but don't block order creation
        console.error("Failed to send notification email:", emailError)
      }

      // Clear cart and redirect to success page
      clearCart()
      router.push(`/checkout/success?order=${orderNumber}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Сталася помилка при оформленні замовлення")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-secondary py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-3xl font-light text-foreground">
          {locale === "uk" ? "Оформлення замовлення" : "Checkout"}
        </h1>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === "uk" ? "Контактна інформація" : "Contact Information"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{locale === "uk" ? "Прізвище" : "Last Name"}*</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{locale === "uk" ? "Ім'я" : "First Name"}*</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">{locale === "uk" ? "По батькові" : "Middle Name"}</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("contacts.phone")}*</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        let value = e.target.value
                        // Remove all non-digit and non-plus characters
                        value = value.replace(/[^\d+]/g, "")
                        // Allow + only at the beginning - remove all + signs and add one at start if needed
                        const hasPlusAtStart = value.startsWith("+")
                        // Remove all + signs
                        value = value.replace(/\+/g, "")
                        // Add + at the beginning if it was there originally
                        if (hasPlusAtStart) {
                          value = "+" + value
                        }
                        setFormData({ ...formData, phone: value })
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("contacts.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">{locale === "uk" ? "Місто" : "City"}*</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{locale === "uk" ? "Адреса (вулиця або № Нової пошти)" : "Address (street or Nova Poshta number)"}*</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{locale === "uk" ? "Примітки до замовлення" : "Order Notes"}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" className="w-full bg-[#D4834F] hover:bg-[#C17340]" size="lg" disabled={isLoading}>
                  {isLoading
                    ? locale === "uk"
                      ? "Оформлення..."
                      : "Processing..."
                    : locale === "uk"
                      ? "Підтвердити замовлення"
                      : "Confirm Order"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === "uk" ? "Ваше замовлення" : "Your Order"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium text-foreground">
                          {item.name} × {item.quantity}
                        </p>
                        {item.characteristics && Object.keys(item.characteristics).length > 0 && (
                          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                            {Object.entries(item.characteristics).map(([charName, charValue]) => {
                              // Handle case where charValue might be an object
                              const valueStr = typeof charValue === "object" && charValue !== null && "value" in charValue
                                ? String((charValue as any).value)
                                : String(charValue)
                              return (
                                <li key={charName}>
                                  – {charName}: {valueStr}
                                </li>
                              )
                            })}
                          </ul>
                        )}
                        {item.comment && (
                          <p className="mt-1 text-xs text-muted-foreground italic">
                            Коментар: {item.comment}
                          </p>
                        )}
                      </div>
                      <p className="font-medium text-foreground">
                        {(item.price * item.quantity).toLocaleString("uk-UA")} {t("common.uah")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("cart.subtotal")}:</span>
                  <span className="font-medium text-foreground">
                    {totalPrice.toLocaleString("uk-UA")} {t("common.uah")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("cart.shipping")}:</span>
                  <span className="font-medium text-foreground">{locale === "uk" ? "Розраховується" : "TBD"}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-lg font-semibold text-foreground">{t("cart.total")}:</span>
                  <span className="text-lg font-semibold text-foreground">
                    {totalPrice.toLocaleString("uk-UA")} {t("common.uah")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
