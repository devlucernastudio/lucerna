"use client"

import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"

export function CatalogHeader() {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)

  return (
    <section className="border-b border-border bg-secondary py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-light text-foreground">{t("catalog.title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {locale === "uk" 
            ? "Усі світильники ручної роботи від Lucerna Studio"
            : "All handmade lamps from Lucerna Studio"}
        </p>
      </div>
    </section>
  )
}

