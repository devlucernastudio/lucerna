"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"

export function AboutSection() {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-light text-foreground">{t("about.title")}</h2>
          <p className="text-balance text-lg leading-relaxed text-muted-foreground">
            {locale === "uk"
              ? "Кожен світильник Lucerna - це унікальний витвір мистецтва, створений вручну з натуральних матеріалів. Наші роботи втілюють гармонію природних форм та сучасного дизайну, додаючи теплоти та затишку вашому простору."
              : "Each Lucerna lamp is a unique work of art, handcrafted from natural materials. Our works embody the harmony of natural forms and modern design, adding warmth and coziness to your space."}
          </p>
          <Button className="mt-8 bg-[#D4834F] hover:bg-[#C17340]" size="lg" asChild>
            <Link href="/about">{locale === "uk" ? "Дізнатись більше" : "Learn More"}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
