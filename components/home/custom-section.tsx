"use client"

import Image from "next/image"
import { useI18n } from "@/lib/i18n-context"

interface ContentBlock {
  type: string
  title_uk?: string | null
  title_en?: string | null
  content_uk?: string | null
  content_en?: string | null
  images?: string[] | null
  settings?: {
    column1_uk?: string
    column1_en?: string
    column2_uk?: string
    column2_en?: string
    signature_uk?: string
    signature_en?: string
  }
}

export function CustomSection({ contentBlocks }: { contentBlocks: ContentBlock[] | null }) {
  const { locale } = useI18n()

  const customBlock = contentBlocks?.find((block) => block.type === "custom")
  
  if (!customBlock) {
    return null
  }

  const title = customBlock
    ? (locale === "uk" ? customBlock.title_uk : customBlock.title_en) || (locale === "uk" ? "Кастом" : "Custom")
    : locale === "uk" ? "Кастом" : "Custom"
  
  const images = customBlock.images || []
  
  // Get content from settings
  const column1 = locale === "uk" 
    ? (customBlock.settings?.column1_uk || "") 
    : (customBlock.settings?.column1_en || "")
  const column2 = locale === "uk"
    ? (customBlock.settings?.column2_uk || "")
    : (customBlock.settings?.column2_en || "")
  const signature = locale === "uk"
    ? (customBlock.settings?.signature_uk || "")
    : (customBlock.settings?.signature_en || "")

  // Parse columns into paragraphs
  const firstPart = column1 ? column1.split('\n').filter(line => line.trim()) : []
  const secondPart = column2 ? column2.split('\n').filter(line => line.trim()) : []

  if (images.length === 0 && firstPart.length === 0 && secondPart.length === 0 && !signature) {
    return null
  }

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4834F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4834F] rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Title */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4">
              {title}
            </h2>
            <div className="w-24 h-px bg-[#D4834F] mx-auto"></div>
          </div>

          {/* Main Content Grid: Image + Two Text Columns */}
          <div className="space-y-8 md:space-y-12">
            {/* Three Column Layout: Image + Text Columns (Desktop only) */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
              {/* First Image - Left Column (Desktop only) */}
              {images.length > 0 && (
                <div className="flex items-start">
                  <div className="relative group overflow-hidden rounded-md bg-muted/20 shadow-lg border border-border/50 sticky top-8 w-full">
                    <div className="relative aspect-[3/4] w-full">
                      <Image
                        src={images[0]}
                        alt="Custom work main"
                        fill
                        className="object-cover object-top transition-all duration-500 group-hover:scale-[1.03]"
                        sizes="33vw"
                      />
                    </div>
                    {/* Subtle overlay and border on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/5 group-hover:to-black/0 transition-all duration-300 pointer-events-none"></div>
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4834F]/40 transition-colors duration-300 rounded-md pointer-events-none"></div>
                  </div>
                </div>
              )}

              {/* Text Columns - Middle and Right (Desktop only) */}
              <div className={`space-y-5 ${images.length > 0 ? 'md:col-span-2' : 'md:col-span-3'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                  {/* First Text Column */}
                  <div className="space-y-5">
                    {firstPart.map((line, index) => (
                      <p 
                        key={index}
                        className="leading-relaxed text-muted-foreground text-base md:text-lg"
                      >
                        {line.trim()}
                      </p>
                    ))}
                  </div>

                  {/* Second Text Column */}
                  <div className="space-y-5">
                    {secondPart.map((line, index) => {
                      if (line.trim().startsWith('-')) {
                        return (
                          <div 
                            key={index}
                            className="flex items-start gap-3 text-muted-foreground text-base md:text-lg"
                          >
                            <span className="text-[#D4834F] text-xl leading-none mt-1">•</span>
                            <span className="leading-relaxed">{line.trim().substring(1).trim()}</span>
                          </div>
                        )
                      }
                      return (
                        <p 
                          key={index}
                          className="leading-relaxed text-muted-foreground text-base md:text-lg"
                        >
                          {line.trim()}
                        </p>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Text Columns - Mobile only */}
            <div className="md:hidden space-y-5">
              <div className="grid grid-cols-1 gap-6">
                {/* First Text Column */}
                <div className="space-y-5">
                  {firstPart.map((line, index) => (
                    <p 
                      key={index}
                      className="leading-relaxed text-muted-foreground text-base"
                    >
                      {line.trim()}
                    </p>
                  ))}
                </div>

                {/* Second Text Column */}
                <div className="space-y-5">
                  {secondPart.map((line, index) => {
                    if (line.trim().startsWith('-')) {
                      return (
                        <div 
                          key={index}
                          className="flex items-start gap-3 text-muted-foreground text-base"
                        >
                          <span className="text-[#D4834F] text-xl leading-none mt-1">•</span>
                          <span className="leading-relaxed">{line.trim().substring(1).trim()}</span>
                        </div>
                      )
                    }
                    return (
                      <p 
                        key={index}
                        className="leading-relaxed text-muted-foreground text-base"
                      >
                        {line.trim()}
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Signature - Below all three columns */}
            {signature && (
              <div className="pt-6 w-[90%] justify-self-center md:pt-8 border-t border-border/50">
                <p className="text-center text-lg md:text-xl font-light text-foreground">
                  {signature.trim()}
                </p>
              </div>
            )}

            {/* All Images - In a row below signature (Mobile: all images, Desktop: other images) */}
            {images.length > 0 && (
              <>
                {/* Mobile: All images */}
                <div className="grid grid-cols-2 md:hidden gap-3 md:gap-4">
                  {images.map((imageUrl, index) => (
                    <div 
                      key={index} 
                      className="relative group overflow-hidden rounded-md bg-muted/20 shadow-md border border-border/50"
                    >
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={imageUrl}
                          alt={`Custom work ${index + 1}`}
                          fill
                          className="object-cover object-top transition-all duration-500 group-hover:scale-[1.03]"
                          sizes="50vw"
                        />
                      </div>
                      {/* Subtle overlay and border on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/5 group-hover:to-black/0 transition-all duration-300 pointer-events-none"></div>
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4834F]/40 transition-colors duration-300 rounded-md pointer-events-none"></div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop: Other images (without first) */}
                {images.length > 1 && (
                  <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {images.slice(1).map((imageUrl, index) => (
                      <div 
                        key={index + 1} 
                        className="relative group overflow-hidden rounded-md bg-muted/20 shadow-md border border-border/50"
                      >
                        <div className="relative aspect-[4/5] w-full">
                          <Image
                            src={imageUrl}
                            alt={`Custom work ${index + 2}`}
                            fill
                            className="object-cover object-top transition-all duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 1024px) 33vw, 20vw"
                          />
                        </div>
                        {/* Subtle overlay and border on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/5 group-hover:to-black/0 transition-all duration-300 pointer-events-none"></div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4834F]/40 transition-colors duration-300 rounded-md pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

