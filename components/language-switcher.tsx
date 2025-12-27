"use client"

import { useI18n } from "@/lib/i18n-context"
import { localeNames } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  const toggleLocale = () => {
    setLocale(locale === "uk" ? "en" : "uk")
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleLocale} className="gap-2">
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">{localeNames[locale === "uk" ? "en" : "uk"]}</span>
    </Button>
  )
}
