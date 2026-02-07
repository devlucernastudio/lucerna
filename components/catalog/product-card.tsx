"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { LocaleLink } from "@/lib/locale-link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductCharacteristicsModal } from "@/components/product/product-characteristics-modal"
import { useCart } from "@/lib/cart-context"
import { showToast } from "@/lib/toast"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import type { CharacteristicInputType } from "@/lib/types/characteristics"

interface CharacteristicType {
  id: string
  name_uk: string
  name_en: string
  input_type: CharacteristicInputType
  required: boolean
  affects_price: boolean
}

interface CharacteristicOption {
  id: string
  characteristic_type_id: string
  name_uk: string | null
  name_en: string | null
  value: string
  color_code: string | null
}

interface ProductCharacteristic {
  id: string
  characteristic_type_id: string
  required: boolean | null
  affects_price: boolean | null
}

interface PriceCombination {
  id: string
  combination: Record<string, string>
  price: number
  is_available: boolean
}

interface ProductCardProps {
  product: {
    id: string
    name_uk: string
    name_en: string
    slug: string
    price: number
    images?: string[] | Array<{ url: string; id?: string }>
    description_uk?: string | null
    description_en?: string | null
  }
  productCharacteristics?: ProductCharacteristic[]
  characteristicTypes?: CharacteristicType[]
  characteristicOptions?: CharacteristicOption[]
  priceCombinations?: PriceCombination[]
}

export function ProductCard({
  product,
  productCharacteristics = [],
  characteristicTypes = [],
  characteristicOptions = [],
  priceCombinations = [],
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)
  const [modalOpen, setModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const hasCharacteristics = productCharacteristics.length > 0
  
  // Get localized product name and description
  const productName = locale === "uk" ? product.name_uk : product.name_en
  const productDescription = locale === "uk" ? product.description_uk : product.description_en

  // Check if product is available
  const isProductAvailable = (() => {
    // If there are price combinations, check if at least one is available
    if (priceCombinations.length > 0) {
      return priceCombinations.some(pc => pc.is_available)
    }
    // Otherwise, assume available (we don't have is_in_stock in product card props)
    return true
  })()

  // Calculate minimum price and whether to show "від" prefix
  const { displayPrice, showFromPrice } = (() => {
    // Check if there are any price-affecting characteristics
    const priceAffectingChars = productCharacteristics.filter((pc) => {
      const charType = characteristicTypes.find(ct => ct.id === pc.characteristic_type_id)
      const affectsPrice = pc.affects_price ?? charType?.affects_price
      return affectsPrice === true && charType?.input_type !== "text" // Exclude text type
    })

    if (priceAffectingChars.length === 0) {
      // No price-affecting characteristics, show regular price
      return { displayPrice: product.price, showFromPrice: false }
    }

    // Has price-affecting characteristics, calculate minimum price
    const allPrices = [
      product.price,
      ...priceCombinations
        .filter(pc => pc.is_available)
        .map(pc => pc.price)
    ]
    const minPrice = Math.min(...allPrices)
    return { displayPrice: minPrice, showFromPrice: true }
  })()

  const handleAddToCart = () => {
    if (hasCharacteristics) {
      // Open modal for products with characteristics
      setModalOpen(true)
    } else {
      // Direct add to cart for products without characteristics
      let productImage = ""
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0]
        productImage = typeof firstImage === "string" ? firstImage : firstImage.url
      }

      addToCart({
        id: product.id,
        name: productName || product.name_uk || product.name_en,
        price: product.price,
        image: productImage || "/placeholder.svg",
        description: productDescription || product.description_uk || product.description_en || "",
        slug: product.slug,
      })

      showToast.success(locale === "uk" ? "Товар додано до кошика" : "Product added to cart")
    }
  }

  return (
    <>
      <LocaleLink href={`/product/${product.slug}`} className="block">
        <Card className="flex flex-col py-0 btn-feedback overflow-hidden border-border/50 transition-shadow hover:shadow-lg cursor-pointer h-full">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={(() => {
                const firstImage = product.images?.[0]
                if (!firstImage) return "/placeholder.svg"
                return typeof firstImage === "string" ? firstImage : firstImage.url
              })()}
              alt={productName || product.name_uk || product.name_en}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={85}
              unoptimized
              className={`object-cover transition-all ${!isProductAvailable ? "opacity-50 grayscale" : "hover:scale-105"}`}
            />
          </div>
          <CardContent className="flex flex-col flex-1 p-4">
            <h3 className="mb-2 text-base font-medium text-foreground hover:text-[#D4834F] transition-colors">
              {productName || product.name_uk || product.name_en}
            </h3>
            {(() => {
              const description = productDescription || product.description_uk || product.description_en || ""
              const stripHtml = (html: string) => {
                if (!html) return ""
                return html.replace(/<[^>]*>/g, "").trim()
              }
              const plainDescription = stripHtml(description)
              return plainDescription ? (
                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground flex-1">
                  {plainDescription}
                </p>
              ) : null
            })()}
            <div className="mt-auto">
              {isProductAvailable ? (
                <p className="mb-2 text-lg font-semibold text-foreground">
                  {showFromPrice ? `${t("product.from")} ` : ""}{displayPrice?.toLocaleString(locale === "uk" ? "uk-UA" : "en-US")} {t("common.uah")}
                </p>
              ) : (
                <p className="mb-2 text-lg font-semibold text-muted-foreground">
                  {t("product.outOfStock")}
                </p>
              )}
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handleAddToCart()
              }}
              disabled={!isProductAvailable}
              className="w-full bg-[#D4834F] hover:bg-[#C17340] text-glow-white disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_1px_3px_0_#000000ad,0_1px_1px_-1px_#00000073]"
              aria-label={locale === "uk" ? `Додати ${productName || product.name_uk || product.name_en} до кошика` : `Add ${productName || product.name_en || product.name_uk} to cart`}
            >
              {t("product.addToCart")}
            </Button>
          </CardContent>
        </Card>
      </LocaleLink>

      {mounted && hasCharacteristics && (
        <ProductCharacteristicsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          product={{
            id: product.id,
            name_uk: product.name_uk,
            name_en: product.name_en,
            slug: product.slug,
            price: product.price,
            description_uk: product.description_uk,
            description_en: product.description_en,
            images: product.images,
          }}
          productCharacteristics={productCharacteristics}
          characteristicTypes={characteristicTypes as any}
          characteristicOptions={characteristicOptions}
          priceCombinations={priceCombinations}
        />
      )}
    </>
  )
}

