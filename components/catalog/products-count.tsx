"use client"

import { useI18n } from "@/lib/i18n-context"

interface ProductsCountProps {
  count: number
}

export function ProductsCount({ count }: ProductsCountProps) {
  const { locale } = useI18n()

  return (
    <p className="text-sm text-muted-foreground">
      {locale === "uk" 
        ? `${count} ${count === 1 ? "товар" : count < 5 ? "товари" : "товарів"}`
        : `${count} ${count === 1 ? "product" : "products"}`}
    </p>
  )
}

