"use client"

import Image from "next/image"
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
      <section className="relative flex h-[150px] items-center justify-center overflow-hidden bg-gradient-to-b from-[#6B5A4D] to-[#8B7355]">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-balance font-serif text-4xl font-light tracking-wide text-white md:text-5xl">
            {title}
          </h1>
        </div>
      </section>

      {/* About Content with Image */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Desktop Layout: Image left, Content right */}
          <div className="hidden lg:grid lg:grid-cols-[repeat(2,minmax(0,auto))] lg:gap-8 lg:items-start">
            {/* Image - Desktop: left */}
            <div>
              <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                  unoptimized
                  src="/aboutUs.jpg"
                  alt={locale === "uk" ? "Lucerna Studio" : "Lucerna Studio"}
                  width={778}
                  height={1179}
                  className="object-cover lg:h-[500px] w-auto"
                  priority
                  sizes="(max-width: 1024px) 50vw, 500px"
                />
              </div>
            </div>

            {/* Content - Desktop: right */}
            <div className="lg:sticky lg:top-18">
              <div className="space-y-6 md:space-y-8">
                {content ? (
                  <div 
                    className="leading-relaxed text-muted-foreground [&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-foreground [&_h2]:mb-4 [&_h2]:mt-8 [&_h2:first-child]:mt-0 [&_p]:mb-4 [&_p]:text-base [&_p]:md:text-lg [&_p]:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  <div>
                    <h2 className="mb-4 text-2xl font-light text-foreground">
                      {locale === "uk" ? "Майстерня природної естетики" : "Natural Aesthetics Workshop"}
                    </h2>
                    <p className="leading-relaxed text-muted-foreground mb-4 text-base md:text-lg">
                      {locale === "uk" 
                        ? "Наші колекції народжуються на стику ремесла й сучасного дизайну. У кожному виробі відчувається тепло ручної роботи, увага до деталей та прагнення до гармонії. Ми віримо, що наші вироби здатні змінювати атмосферу простору, робити його більш живим, затишним, і по-справжньому наближеним до природи."
                        : "Our collections are born at the intersection of craftsmanship and modern design. Each piece feels the warmth of handwork, attention to detail, and a desire for harmony. We believe that our products can change the atmosphere of space, make it more alive, cozy, and truly close to nature."}
                    </p>
                    
                    <h2 className="mb-4 text-2xl font-light text-foreground mt-8">
                      {locale === "uk" ? "Природна естетика як філософія" : "Natural Aesthetics as Philosophy"}
                    </h2>
                    <p className="leading-relaxed text-muted-foreground text-base md:text-lg">
                      {locale === "uk"
                        ? "Філософія Lucerna Studio базується на природній естетиці. Це про речі, які створюють емоцію, стають не просто частиною вашого простору, а справжнім арт-об'єктом."
                        : "The philosophy of Lucerna Studio is based on natural aesthetics. It's about things that create emotion, become not just part of your space, but a true art object."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Layout: Content with image between paragraphs */}
          <div className="lg:hidden space-y-6">
            {content ? (
              <div className="leading-relaxed text-muted-foreground">
                {/* Parse HTML and insert image after first paragraph */}
                {(() => {
                  // Find first </p> tag and insert image after it
                  const firstPIndex = content.indexOf('</p>')
                  if (firstPIndex !== -1) {
                    const beforeImage = content.substring(0, firstPIndex + 4)
                    const afterImage = content.substring(firstPIndex + 4)
                    return (
                      <>
                        <div 
                          className="[&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-foreground [&_h2]:mb-4 [&_h2]:mt-8 [&_h2:first-child]:mt-0 [&_p]:mb-4 [&_p]:text-base [&_p]:last-child]:mb-0"
                          dangerouslySetInnerHTML={{ __html: beforeImage }}
                        />
                        <div className="my-6">
                          <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
                            <Image
                              unoptimized
                              src="/aboutUs.jpg"
                              alt={locale === "uk" ? "Lucerna Studio" : "Lucerna Studio"}
                              width={778}
                              height={1179}
                              className="w-full h-auto object-cover"
                              priority
                              sizes="100vw"
                            />
                          </div>
                        </div>
                        <div 
                          className="[&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-foreground [&_h2]:mb-4 [&_h2]:mt-8 [&_h2:first-child]:mt-0 [&_p]:mb-4 [&_p]:text-base [&_p]:last-child]:mb-0"
                          dangerouslySetInnerHTML={{ __html: afterImage }}
                        />
                      </>
                    )
                  }
                  // Fallback if no </p> found
                  return (
                    <div 
                      className="[&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-foreground [&_h2]:mb-4 [&_h2]:mt-8 [&_h2:first-child]:mt-0 [&_p]:mb-4 [&_p]:text-base [&_p]:last-child]:mb-0"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  )
                })()}
              </div>
            ) : (
              <div>
                <h2 className="mb-4 text-2xl font-light text-foreground">
                  {locale === "uk" ? "Майстерня природної естетики" : "Natural Aesthetics Workshop"}
                </h2>
                <p className="leading-relaxed text-muted-foreground mb-4 text-base">
                  {locale === "uk" 
                    ? "Наші колекції народжуються на стику ремесла й сучасного дизайну. У кожному виробі відчувається тепло ручної роботи, увага до деталей та прагнення до гармонії. Ми віримо, що наші вироби здатні змінювати атмосферу простору, робити його більш живим, затишним, і по-справжньому наближеним до природи."
                    : "Our collections are born at the intersection of craftsmanship and modern design. Each piece feels the warmth of handwork, attention to detail, and a desire for harmony. We believe that our products can change the atmosphere of space, make it more alive, cozy, and truly close to nature."}
                </p>
                
                {/* Image between paragraphs on mobile */}
                <div className="my-6">
                  <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
                    <Image
                      unoptimized
                      src="/aboutUs.jpg"
                      alt={locale === "uk" ? "Lucerna Studio" : "Lucerna Studio"}
                      width={778}
                      height={1179}
                      className="w-full h-auto object-cover"
                      priority
                      sizes="100vw"
                    />
                  </div>
                </div>
                
                <h2 className="mb-4 text-2xl font-light text-foreground mt-8">
                  {locale === "uk" ? "Природна естетика як філософія" : "Natural Aesthetics as Philosophy"}
                </h2>
                <p className="leading-relaxed text-muted-foreground text-base">
                  {locale === "uk"
                    ? "Філософія Lucerna Studio базується на природній естетиці. Це про речі, які створюють емоцію, стають не просто частиною вашого простору, а справжнім арт-об'єктом."
                    : "The philosophy of Lucerna Studio is based on natural aesthetics. It's about things that create emotion, become not just part of your space, but a true art object."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

