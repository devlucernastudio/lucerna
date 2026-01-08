"use client"

import { Sparkles, Leaf, Palette, Heart, Star, Award, Shield, Zap } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

interface ContentBlock {
  type: string
  title_uk?: string | null
  title_en?: string | null
  settings?: {
    features?: Array<{
      title_uk: string
      title_en: string
      description_uk: string
      description_en: string
    }>
  }
}

// Icon mapping for features
const iconMap: Record<string, any> = {
  "Ручна робота": Sparkles,
  "Handmade": Sparkles,
  "Екологічність": Leaf,
  "Eco-friendly": Leaf,
  "Унікальний дизайн": Palette,
  "Unique Design": Palette,
  "З любов'ю": Heart,
  "With Love": Heart,
}

// Default icons array for fallback
const defaultIcons = [Sparkles, Leaf, Palette, Heart, Star, Award, Shield, Zap]

export function FeaturesSection({ contentBlocks }: { contentBlocks: ContentBlock[] | null }) {
  const { locale } = useI18n()

  const featuresBlock = contentBlocks?.find((block) => block.type === "features")
  
  // Get features from database or use empty array
  const dbFeatures = featuresBlock?.settings?.features || []
  
  // Get section title from database
  const sectionTitle = featuresBlock
    ? (locale === "uk" ? featuresBlock.title_uk : featuresBlock.title_en) || (locale === "uk" ? "Чому обирають нас" : "Why Choose Us")
    : locale === "uk" ? "Чому обирають нас" : "Why Choose Us"

  // Map database features to display format
  const features = dbFeatures.map((feature, index) => {
    const title = locale === "uk" ? feature.title_uk : feature.title_en
    const description = locale === "uk" ? feature.description_uk : feature.description_en
    
    // Try to find icon by title, otherwise use default icon by index
    let Icon = iconMap[title] || iconMap[feature.title_uk] || iconMap[feature.title_en]
    if (!Icon) {
      Icon = defaultIcons[index % defaultIcons.length]
    }
    
    return {
      icon: Icon,
      title,
      description,
    }
  })

  // Don't render if no features
  if (features.length === 0) {
    return null
  }

  return (
    <section className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-light text-foreground">
          {sectionTitle}
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={`${feature.title}-${index}`} className="flex flex-col items-center text-center">
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
