"use client"

import { LocaleLink } from "@/lib/locale-link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"

interface ContentBlock {
  type: string
  title_uk?: string | null
  title_en?: string | null
  content_uk?: string | null
  content_en?: string | null
}

interface AboutSectionProps {
  contentBlocks?: ContentBlock[] | null
}

export function AboutSection({ contentBlocks }: AboutSectionProps) {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)

  const aboutBlock = contentBlocks?.find((block) => block.type === "about")
  const title = aboutBlock 
    ? (locale === "uk" ? aboutBlock.title_uk : aboutBlock.title_en) || t("about.title")
    : t("about.title")
  const content = aboutBlock
    ? (locale === "uk" ? aboutBlock.content_uk : aboutBlock.content_en) || ""
    : locale === "uk"
      ? "Кожен світильник Lucerna - це унікальний витвір мистецтва, створений вручну з натуральних матеріалів. Наші роботи втілюють гармонію природних форм та сучасного дизайну, додаючи теплоти та затишку вашому простору."
      : "Each Lucerna lamp is a unique work of art, handcrafted from natural materials. Our works embody the harmony of natural forms and modern design, adding warmth and coziness to your space."

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-light text-foreground">{title}</h2>
          {content && (
            <p className="text-balance text-lg leading-relaxed text-muted-foreground">
              {content}
            </p>
          )}
          <Button 
            className="mt-8 text-glow-white bg-[#D4834F] hover:bg-[#C17340] shadow-[0_1px_3px_0_#000000ad,0_1px_1px_-1px_#00000073]" 
            size="lg" 
            asChild
            aria-label={locale === "uk" ? "Дізнатись більше про Lucerna Studio" : "Learn more about Lucerna Studio"}
          >
            <LocaleLink href="/about">{locale === "uk" ? "Дізнатись більше" : "Learn More"}</LocaleLink>
          </Button>
        </div>
      </div>
    </section>
  )
}
