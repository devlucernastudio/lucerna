"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const { locale } = useI18n()
  const orderNumber = searchParams.get("order")

  return (
    <main className="container mx-auto min-h-[70vh] px-4 py-12">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
          <div>
            <h1 className="mb-2 text-3xl font-light text-foreground">
              {locale === "uk" ? "Дякуємо за замовлення!" : "Thank you for your order!"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {locale === "uk" ? "Ваше замовлення успішно оформлено" : "Your order has been successfully placed"}
            </p>
          </div>

          {orderNumber && (
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground">{locale === "uk" ? "Номер замовлення:" : "Order Number:"}</p>
              <p className="text-xl font-semibold text-foreground">{orderNumber}</p>
            </div>
          )}

          <p className="text-balance text-sm text-muted-foreground">
            {locale === "uk"
              ? "Ми зв'яжемось з вами найближчим часом для підтвердження деталей замовлення."
              : "We will contact you shortly to confirm your order details."}
          </p>

          <div className="flex gap-4">
            <Button className="bg-[#D4834F] hover:bg-[#C17340]" asChild>
              <Link href="/">{locale === "uk" ? "На головну" : "Go Home"}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/catalog">{locale === "uk" ? "Продовжити покупки" : "Continue Shopping"}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto min-h-[70vh] px-4 py-12">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
