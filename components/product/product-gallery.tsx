"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProductGalleryProps {
  images: Array<{ url: string; id?: string }> | string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
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
          className="object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group">
        <button
          className="w-full h-full cursor-zoom-in"
          onClick={() => {
            setLightboxIndex(mainImageIndex)
            setLightboxOpen(true)
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={mainImage?.url || "/placeholder.svg"}
            alt={`${productName} ${mainImageIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
        </button>

        {/* Navigation Arrows */}
        {normalizedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
          <div className="flex gap-2 max-w-[90vw] overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                  className="object-cover"
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
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  priority
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

