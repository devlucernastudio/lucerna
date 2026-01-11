"use client"

import { SocialMediaIcon } from "@/components/social-media-icons"

interface SocialMediaLink {
  platform: string
  url: string | null
}

interface CollaborationContentProps {
  locale: string
  socialMediaLinks: SocialMediaLink[]
}

const content = {
  uk: {
    title: "Співпраця",
    subtitle: "Співпраця з дизайнерами та архітекторами",
    intro: "Lucerna Studio | Люцерна Студіо - відкриті до довготривалої та взаємовигідної співпраці з дизайнерами й архітекторами, які цінують натуральні матеріали та уважне ставлення до деталей.",
    description: "Ми створюємо авторські світильники ручної роботи, що легко інтегруються в сучасні житлові та комерційні інтер'єри - від приватних просторів до готелів, ресторанів і концептуальних просторів.",
    benefitsTitle: "Що ви отримуєте, співпрацюючи з нами:",
    benefits: [
      "партнерські умови та спеціальні ціни для дизайнерів і архітекторів",
      "індивідуальне виготовлення світильників під конкретний проєкт: форма, розмір, фактура, колір",
      "консультації на етапі проєктування та допомогу з підбором моделей",
      "гнучкість у роботі з кастомними рішеннями та серіями світильників",
      "високу якість виконання та натуральні матеріали",
      "доставка по Україні та за кордон",
    ],
    closing: "Ми цінуємо авторський підхід і прагнемо бути надійним партнером у реалізації продуманих, атмосферних інтер'єрів, де світло є частиною архітектурної ідеї.",
    cta: "Якщо ви шукаєте світло, яке підкреслює простір і працює на концепцію - будемо раді співпраці з Lucerna Studio.",
    contactTitle: "Зв'яжіться з нами:",
  },
  en: {
    title: "Collaboration",
    subtitle: "Collaboration with designers and architects",
    intro: "Lucerna Studio is open to long-term and mutually beneficial collaboration with designers and architects who value natural materials and attention to detail.",
    description: "We create original handmade lamps that easily integrate into modern residential and commercial interiors - from private spaces to hotels, restaurants, and conceptual spaces.",
    benefitsTitle: "What you get when working with us:",
    benefits: [
      "partnership terms and special prices for designers and architects",
      "custom manufacturing of lamps for specific projects: shape, size, texture, color",
      "consultations at the design stage and assistance with model selection",
      "flexibility in working with custom solutions and lamp series",
      "high quality execution and natural materials",
      "delivery across Ukraine and internationally",
    ],
    closing: "We value an authorial approach and strive to be a reliable partner in realizing thoughtful, atmospheric interiors where light is part of the architectural idea.",
    cta: "If you're looking for light that highlights space and works for the concept - we'll be happy to collaborate with Lucerna Studio.",
    contactTitle: "Contact us:",
  },
}

export function CollaborationContent({ locale, socialMediaLinks }: CollaborationContentProps) {
  const t = content[locale === "uk" ? "uk" : "en"]
  const contactLinks = socialMediaLinks.filter(link => 
    ["viber", "whatsapp", "telegram"].includes(link.platform.toLowerCase())
  )

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4834F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4834F] rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-4xl">
          {/* Title */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-4">
              {t.title}
            </h1>
            <div className="w-24 h-px bg-[#D4834F] mx-auto"></div>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-6">
              {t.subtitle}
            </h2>
          </div>

          {/* Intro */}
          <div className="mb-12 space-y-6">
            <p className="text-lg md:text-xl leading-relaxed text-foreground">
              {t.intro}
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-foreground">
              {t.description}
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-12 md:mb-16">
            <h3 className="text-2xl md:text-3xl font-light text-foreground mb-8">
              {t.benefitsTitle}
            </h3>
            <ul className="space-y-4">
              {t.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="text-[#D4834F] text-2xl leading-none mt-1 flex-shrink-0">•</span>
                  <span className="text-lg md:text-xl leading-relaxed text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Closing */}
          <div className="mb-12 space-y-6">
            <p className="text-lg md:text-xl leading-relaxed text-foreground">
              {t.closing}
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-foreground font-light italic">
              {t.cta}
            </p>
          </div>

          {/* Contact Section */}
          {contactLinks.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border/50">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-light text-foreground mb-4">
                  {t.contactTitle}
                </h3>
              </div>
              <div className="flex justify-center gap-6">
                {contactLinks.map((link) => (
                  link.url && (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-14 h-14 rounded-full bg-background border-2 border-[#D4834F]/30 hover:border-[#D4834F] hover:bg-[#D4834F]/5 transition-all duration-300 hover:scale-110"
                      aria-label={link.platform}
                    >
                      <SocialMediaIcon 
                        platform={link.platform} 
                        className="h-7 w-7 text-[#D4834F]" 
                      />
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

