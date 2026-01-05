"use client"

import { LocaleLink } from "@/lib/locale-link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"

export function BackButton() {
  const { locale } = useI18n()

  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
        <LocaleLink href="/catalog">
          <ChevronLeft className="h-4 w-4" />
          {locale === "uk" ? "Назад до каталогу" : "Back to catalog"}
        </LocaleLink>
      </Button>
    </div>
  )
}

