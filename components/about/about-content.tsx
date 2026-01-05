"use client"

import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"

interface AboutContentProps {
  titleUk?: string | null
  titleEn?: string | null
  contentUk?: string | null
  contentEn?: string | null
}

export function AboutContent({ titleUk, titleEn, contentUk, contentEn }: AboutContentProps) {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)

  const title = locale === "uk" ? (titleUk || "Про Lucerna Studio") : (titleEn || "About Lucerna Studio")
  const content = locale === "uk" ? contentUk : contentEn

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex h-[400px] items-center justify-center overflow-hidden bg-gradient-to-b from-[#6B5A4D] to-[#8B7355]">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-balance font-serif text-4xl font-light tracking-wide text-white md:text-5xl">
            {title}
          </h1>
        </div>
      </section>

      {/* About Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          {content ? (
            <div 
              className="leading-relaxed text-muted-foreground [&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-foreground [&_h2]:mb-4 [&_h2]:mt-8 [&_h2:first-child]:mt-0 [&_p]:mb-4 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div>
              <h2 className="mb-4 text-2xl font-light text-foreground">
                {locale === "uk" ? "Майстерня природної естетики" : "Natural Aesthetics Workshop"}
              </h2>
              <p className="leading-relaxed text-muted-foreground mb-4">
                {locale === "uk" 
                  ? "Наші колекції народжуються на стику ремесла й сучасного дизайну. У кожному виробі відчувається тепло ручної роботи, увага до деталей та прагнення до гармонії. Ми віримо, що наші вироби здатні змінювати атмосферу простору, робити його більш живим, затишним, і по-справжньому наближеним до природи."
                  : "Our collections are born at the intersection of craftsmanship and modern design. Each piece feels the warmth of handwork, attention to detail, and a desire for harmony. We believe that our products can change the atmosphere of space, make it more alive, cozy, and truly close to nature."}
              </p>
              
              <h2 className="mb-4 text-2xl font-light text-foreground mt-8">
                {locale === "uk" ? "Природна естетика як філософія" : "Natural Aesthetics as Philosophy"}
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {locale === "uk"
                  ? "Філософія Lucerna Studio базується на природній естетиці. Це про речі, які створюють емоцію, стають не просто частиною вашого простору, а справжнім арт-об'єктом."
                  : "The philosophy of Lucerna Studio is based on natural aesthetics. It's about things that create emotion, become not just part of your space, but a true art object."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

