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

interface CharacteristicType {
  id: string
  name_uk: string
  name_en: string
  input_type: string
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
      <Card className="flex flex-col py-0 overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
        <LocaleLink href={`/product/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.images?.[0] || "/placeholder.svg"}
              alt={productName || product.name_uk || product.name_en}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
        </LocaleLink>
        <CardContent className="flex flex-col flex-1 p-4">
          <LocaleLink href={`/product/${product.slug}`}>
            <h3 className="mb-2 text-base font-medium text-foreground hover:text-[#D4834F] transition-colors">
              {productName || product.name_uk || product.name_en}
            </h3>
          </LocaleLink>
          {(() => {
            const description = productDescription || product.description_uk || product.description_en || ""
            // Strip HTML tags for display in card
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
            <p className="mb-2 text-lg font-semibold text-foreground">
              {product.price?.toLocaleString(locale === "uk" ? "uk-UA" : "en-US")} ₴
            </p>
            <Button
              onClick={handleAddToCart}
              className="w-full bg-[#D4834F] hover:bg-[#C17340]"
            >
              {t("product.addToCart")}
            </Button>
          </div>
        </CardContent>
      </Card>

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
            images: product.images,
          }}
          productCharacteristics={productCharacteristics}
          characteristicTypes={characteristicTypes}
          characteristicOptions={characteristicOptions}
          priceCombinations={priceCombinations}
        />
      )}
    </>
  )
}

