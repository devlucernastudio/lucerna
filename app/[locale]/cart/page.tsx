"use client"

import { useState } from "react"
import Image from "next/image"
import { LocaleLink } from "@/lib/locale-link"
import { Minus, Plus, Trash2, ShoppingBag, ChevronLeft, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, updateComment, totalPrice } = useCart()
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)

  if (cart.length === 0) {
    return (
      <main className="container mx-auto min-h-[70vh] px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground" />
          <div>
            <h1 className="mb-2 text-3xl font-light text-foreground">{t("cart.empty")}</h1>
            <p className="text-muted-foreground">
              {locale === "uk"
                ? "Додайте товари до кошика, щоб продовжити покупки"
                : "Add products to cart to continue shopping"}
            </p>
          </div>
          <Button className="bg-[#D4834F] hover:bg-[#C17340]" size="lg" asChild>
            <LocaleLink href="/catalog">{t("cart.continueShopping")}</LocaleLink>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-border bg-secondary py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-light text-foreground">{t("cart.title")}</h1>
        </div>
      </section>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
          <LocaleLink href="/catalog">
            <ChevronLeft className="h-4 w-4" />
            {t("cart.backToCatalog")}
          </LocaleLink>
        </Button>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.cartItemId} className="overflow-hidden py-1">
                <CardContent className="p-4">
                  {/* Row 1: Photo + Name, Price, Characteristics */}
                  <div className="flex gap-4">
                    <LocaleLink
                      href={`/product/${item.slug || item.id}`}
                      className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted"
                    >
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </LocaleLink>

                    <div className="flex-1 min-w-0">
                      <LocaleLink href={`/product/${item.slug || item.id}`}>
                        <h3 className="font-medium text-foreground hover:text-[#D4834F] transition-colors">
                          {item.name}
                        </h3>
                      </LocaleLink>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("cart.price")}: {item.price.toLocaleString("uk-UA")} {t("common.uah")}
                      </p>
                      {item.characteristics && Object.keys(item.characteristics).length > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {Object.entries(item.characteristics).map(([charName, charValue], index) => {
                            // Handle case where charValue might be an object
                            const valueStr = typeof charValue === "object" && charValue !== null && "value" in charValue
                              ? String((charValue as any).value)
                              : String(charValue)
                            return (
                              <span key={charName}>
                                {index > 0 && ", "}
                                {charName}: {valueStr}
                              </span>
                            )
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Quantity, Price, Delete button */}
                  <div className="flex items-center justify-between mt-4 w-full">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-foreground">
                        {(item.price * item.quantity).toLocaleString("uk-UA")} {t("common.uah")}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeFromCart(item.cartItemId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Row 3: Comment section */}
                  <div className="mt-4 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{t("cart.comment")}:</p>
                      {!editingCommentId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingCommentId(item.cartItemId)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {editingCommentId === item.cartItemId ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder={t("cart.commentPlaceholder")}
                          value={item.comment || ""}
                          onChange={(e) => updateComment(item.cartItemId, e.target.value)}
                          onBlur={() => setEditingCommentId(null)}
                          rows={2}
                          className="text-sm resize-none"
                          autoFocus
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCommentId(null)}
                          className="text-xs"
                        >
                          {t("cart.save")}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic min-h-[1.5rem]">
                        {item.comment || t("cart.noComment")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-foreground">{t("cart.total")}</h2>

                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("cart.itemsInCart")}:
                    </span>
                    <span className="font-medium text-foreground">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.subtotal")}:</span>
                    <span className="font-medium text-foreground">
                      {totalPrice.toLocaleString("uk-UA")} {t("common.uah")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-lg font-semibold text-foreground">{t("cart.total")}:</span>
                    <span className="text-lg font-semibold text-foreground">
                      {totalPrice.toLocaleString("uk-UA")} {t("common.uah")}
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-[#D4834F] hover:bg-[#C17340]" size="lg" asChild>
                  <LocaleLink href="/checkout">{t("cart.checkout")}</LocaleLink>
                </Button>

                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <LocaleLink href="/catalog">{t("cart.continueShopping")}</LocaleLink>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
