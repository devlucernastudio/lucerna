"use client"

import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"

interface ProductDescriptionProps {
  descriptionUk?: string | null
  descriptionEn?: string | null
}

export function ProductDescription({ descriptionUk, descriptionEn }: ProductDescriptionProps) {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)

  const description = locale === "uk" ? descriptionUk : descriptionEn

  if (!description) return null

  return (
    <div className="hidden lg:block border-t border-border pt-6 mt-6">
      <h2 className="mb-3 text-lg font-medium text-foreground">{t("product.description")}</h2>
      <div 
        className="leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ 
          __html: description 
        }}
      />
    </div>
  )
}

