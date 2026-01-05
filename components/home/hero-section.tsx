"use client"

import { LocaleLink } from "@/lib/locale-link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import { useEffect, useState, useRef } from "react"

interface ContentBlock {
  type: string
  title_uk?: string
  title_en?: string
  content_uk?: string
  content_en?: string
  images?: string[]
  settings?: any
}

export function HeroSection({ contentBlocks }: { contentBlocks: ContentBlock[] | null }) {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)
  const [scrollY, setScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    // Detect mobile on mount
    setIsMobile(window.innerWidth < 768)
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current)
        }
        
        rafId.current = requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  const heroBlock = contentBlocks?.find((block) => block.type === "hero")
  const title = heroBlock ? (locale === "uk" ? heroBlock.title_uk : heroBlock.title_en) : t("home.hero.title")
  const subtitle = heroBlock ? (locale === "uk" ? heroBlock.content_uk : heroBlock.content_en) : t("home.hero.subtitle")

  // Adjust multipliers for mobile devices (smaller values = smoother)
  const imageMultiplier = isMobile ? 0.3 : 0.5
  const contentMultiplier = isMobile ? 0.1 : 0.2
  const opacityDivisor = isMobile ? 400 : 600

  return (
    <section className="relative flex h-[600px] md:h-[900px] items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/mainImg.jpg"
          alt="Lucerna hero"
          fill
          className="object-cover will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * imageMultiplier}px, 0)`,
          }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40" />
      </div>

      <div
        className="relative z-10 top-[27%] flex flex-col items-center gap-6 px-4 text-center md:top-[25%] will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * contentMultiplier}px, 0)`,
          opacity: Math.max(0, 1 - scrollY / opacityDivisor),
        }}
      >
        <h1 className="text-balance font-serif text-4xl font-light tracking-wide text-white md:text-6xl">{title}</h1>
        <p className="text-balance text-lg text-white/90 md:text-xl">{subtitle}</p>
        <Button size="lg" className="bg-[#D4834F] px-8 text-base hover:bg-[#C17340]" asChild>
          <LocaleLink href="/catalog">{t("home.hero.cta")}</LocaleLink>
        </Button>
      </div>
    </section>
  )
}
