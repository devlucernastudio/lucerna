"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ChevronDown, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"

interface DownloadableFile {
  id: string
  title_uk: string
  title_en: string
  description_uk: string | null
  description_en: string | null
  link: string
}

interface ProductGalleryProps {
  images: Array<{ url: string; id?: string }> | string[]
  productName: string
  isAvailable?: boolean
  downloadableFiles?: DownloadableFile[]
  /** Server-rendered LCP image (first slide); when present, first slide is not rendered as Image here to avoid duplicate request */
  children?: React.ReactNode
}

export function ProductGallery({ images, productName, isAvailable = true, downloadableFiles = [], children: lcpImage }: ProductGalleryProps) {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)
  // Normalize images array
  const normalizedImages = images.map((img) =>
    typeof img === "string" ? { url: img } : img
  )

  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Swipe handling
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const mainImage = normalizedImages[mainImageIndex]

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && normalizedImages.length > 1) {
      handleNext()
    }
    if (isRightSwipe && normalizedImages.length > 1) {
      handlePrev()
    }
  }

  const handleThumbnailClick = (index: number) => {
    setMainImageIndex(index)
  }

  const handlePrev = () => {
    if (lightboxOpen) {
      setLightboxIndex((prev) => (prev === 0 ? normalizedImages.length - 1 : prev - 1))
    } else {
      setMainImageIndex((prev) => (prev === 0 ? normalizedImages.length - 1 : prev - 1))
    }
  }

  const handleNext = () => {
    if (lightboxOpen) {
      setLightboxIndex((prev) => (prev === normalizedImages.length - 1 ? 0 : prev + 1))
    } else {
      setMainImageIndex((prev) => (prev === normalizedImages.length - 1 ? 0 : prev + 1))
    }
  }

  if (normalizedImages.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src="/placeholder.svg"
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={85}
          className="object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image: LCP (children) + overlay for slide 0 (empty) or slide 1+ (Image) */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group">
        {lcpImage}
        {/* When mainImageIndex > 0: overlay Image above LCP */}
        {mainImageIndex > 0 && (
          <span className="pointer-events-none absolute inset-0 z-20 block overflow-hidden rounded-lg">
            <Image
              src={mainImage?.url || "/placeholder.svg"}
              alt={`${productName} ${mainImageIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={85}
              className={`object-cover transition-opacity ${!isAvailable ? "opacity-50 grayscale" : ""}`}
            />
          </span>
        )}

        <button
          className="absolute inset-0 z-30 w-full h-full cursor-zoom-in"
          onClick={() => {
            setLightboxIndex(mainImageIndex)
            setLightboxOpen(true)
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          type="button"
          aria-label={productName}
        >
          <span className="sr-only">{productName}</span>
        </button>

        {/* Navigation Arrows */}
        {normalizedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 z-40 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 z-40 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {normalizedImages.length > 1 && (
        <div className="relative">
          <div className="flex gap-2 max-w-[90vw] md:max-w-[80vw] justify-self-center lg:justify-self-auto xl:justify-self-auto 2xl:justify-self-auto overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {normalizedImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg bg-muted border-2 transition-all ${
                  index === mainImageIndex
                    ? "border-[#D4834F] ring-2 ring-[#D4834F]/20"
                    : "border-transparent hover:border-border"
                }`}
              >
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  quality={75}
                  className={`object-cover transition-opacity ${!isAvailable ? "opacity-50 grayscale" : ""}`}
                />
              </button>
            ))}
          </div>
          {/* Scroll arrows - only show on desktop if there are more than 4 images */}
          {normalizedImages.length > 4 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background shadow-md z-10 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto') as HTMLElement
                  if (container) {
                    container.scrollBy({ left: -120, behavior: 'smooth' })
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background shadow-md z-10 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto') as HTMLElement
                  if (container) {
                    container.scrollBy({ left: 120, behavior: 'smooth' })
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Downloadable Files */}
      {downloadableFiles.length > 0 && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-[#D4834F] hover:bg-[#C17340] text-white border-[#D4834F]"
              >
                <div className="flex items-center text-glow-white gap-2">
                  <Download className="h-4 w-4" />
                  <span>{t("product.download3DModels")}</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
              {downloadableFiles.map((file) => (
                <DropdownMenuItem
                  key={file.id}
                  asChild
                  className="cursor-pointer"
                >
                  <a
                    href={file.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-start gap-1 py-2"
                  >
                    <span className="font-medium">
                      {locale === "uk" ? file.title_uk : file.title_en}
                    </span>
                    {(file.description_uk || file.description_en) && (
                      <span className="text-xs text-muted-foreground">
                        {locale === "uk" ? file.description_uk : file.description_en}
                      </span>
                    )}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="border-b border-border md:hidden"></div>
        </>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 bg-black/95 border-none overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">
            {productName} - Зображення {lightboxIndex + 1} з {normalizedImages.length}
          </DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {normalizedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            <div
              className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
                <Image
                  src={normalizedImages[lightboxIndex]?.url || "/placeholder.svg"}
                  alt={`${productName} ${lightboxIndex + 1}`}
                  width={1200}
                  height={1200}
                  sizes="95vw"
                  quality={90}
                  className="max-w-full max-h-full w-full h-auto object-contain"
                />
              </div>
            </div>

            {normalizedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
                {normalizedImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setLightboxIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === lightboxIndex ? "bg-[#D4834F] w-8" : "bg-white/50"
                    }`}
                    aria-label={`Перейти до зображення ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

