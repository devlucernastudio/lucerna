"use client"

import { useI18n } from "@/lib/i18n-context"

export function EmptyProducts() {
  const { locale } = useI18n()

  return (
    <div className="py-12 text-center">
      <p className="text-muted-foreground">
        {locale === "uk" ? "Товари відсутні" : "No products available"}
      </p>
    </div>
  )
}

