"use client"

import { Sparkles, Leaf, Palette, Heart } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

export function FeaturesSection({ contentBlocks }: { contentBlocks: any[] | null }) {
  const { locale } = useI18n()

  const features = [
    {
      icon: Sparkles,
      title: locale === "uk" ? "Ручна робота" : "Handmade",
      description:
        locale === "uk"
          ? "Кожен світильник створений вручну майстрами з багаторічним досвідом"
          : "Each lamp is handcrafted by masters with years of experience",
    },
    {
      icon: Leaf,
      title: locale === "uk" ? "Екологічність" : "Eco-friendly",
      description:
        locale === "uk"
          ? "Використовуємо лише натуральні та безпечні матеріали"
          : "We use only natural and safe materials",
    },
    {
      icon: Palette,
      title: locale === "uk" ? "Унікальний дизайн" : "Unique Design",
      description:
        locale === "uk"
          ? "Авторські роботи, які неможливо знайти в масовому виробництві"
          : "Original works that cannot be found in mass production",
    },
    {
      icon: Heart,
      title: locale === "uk" ? "З любов'ю" : "With Love",
      description:
        locale === "uk"
          ? "Вкладаємо душу в кожен виріб, створюючи атмосферу затишку"
          : "We put our heart into every piece, creating a cozy atmosphere",
    },
  ]

  return (
    <section className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-light text-foreground">
          {locale === "uk" ? "Чому обирають нас" : "Why Choose Us"}
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4834F]/10">
                <feature.icon className="h-8 w-8 text-[#D4834F]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
