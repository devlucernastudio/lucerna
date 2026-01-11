"use client"

import { LocaleLink } from "@/lib/locale-link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"

export function CatalogButton() {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)

  return (
    <div className="container mx-auto px-4 pb-16 flex flex-row gap-2">
      <div className="mx-auto max-w-3xl flex justify-center">
        <Button className="bg-[#D4834F] hover:bg-[#C17340]" size="lg" asChild>
          <LocaleLink href="/catalog">{t("home.hero.cta")}</LocaleLink>
        </Button>
      </div>
      <div className="mx-auto max-w-3xl flex justify-center">
        <Button className="bg-[#D4834F] hover:bg-[#C17340]" size="lg" asChild>
          <LocaleLink href="/collaboration">{t("footer.collaboration")}</LocaleLink>
        </Button>
      </div>
    </div>
  )
}

