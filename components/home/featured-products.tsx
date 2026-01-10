"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import { ProductCard } from "@/components/catalog/product-card"

interface Product {
  id: string
  name_uk: string
  name_en: string
  slug: string
  price: number
  images: string[]
  description_uk?: string | null
  description_en?: string | null
}

interface ProductCharacteristic {
  id: string
  product_id: string
  characteristic_type_id: string
  required: boolean | null
  affects_price: boolean | null
}

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

interface PriceCombination {
  id: string
  product_id: string
  combination: Record<string, string>
  price: number
  is_available: boolean
}

interface FeaturedProductsProps {
  products: Product[]
  productCharacteristics?: ProductCharacteristic[]
  characteristicTypes?: CharacteristicType[]
  characteristicOptions?: CharacteristicOption[]
  priceCombinations?: PriceCombination[]
}

export function FeaturedProducts({ 
  products,
  productCharacteristics = [],
  characteristicTypes = [],
  characteristicOptions = [],
  priceCombinations = [],
}: FeaturedProductsProps) {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)

  // Group characteristics and price combinations by product_id
  const characteristicsByProduct: Record<string, ProductCharacteristic[]> = {}
  const priceCombinationsByProduct: Record<string, PriceCombination[]> = {}

  productCharacteristics.forEach((pc) => {
    if (!characteristicsByProduct[pc.product_id]) {
      characteristicsByProduct[pc.product_id] = []
    }
    characteristicsByProduct[pc.product_id].push(pc)
  })

  priceCombinations.forEach((pc) => {
    if (!priceCombinationsByProduct[pc.product_id]) {
      priceCombinationsByProduct[pc.product_id] = []
    }
    priceCombinationsByProduct[pc.product_id].push(pc)
  })

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-12 flex items-center justify-between">
        <h2 className="text-3xl font-light text-foreground">{t("home.featured")}</h2>
        <Button
          variant="outline"
          className="border-[#D4834F] text-[#D4834F] hover:bg-[#D4834F] hover:text-white bg-transparent shadow-[0_1px_3px_0_#00000038,0_1px_1px_-1px_#00000073]"
          asChild
        >
          <Link href="/catalog">{t("home.viewAll")}</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, 6).map((product) => {
          const productChars = characteristicsByProduct[product.id] || []
          const productPriceCombinations = priceCombinationsByProduct[product.id] || []

          return (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name_uk: product.name_uk,
                name_en: product.name_en,
                slug: product.slug,
                price: product.price,
                images: product.images,
                description_uk: product.description_uk,
                description_en: product.description_en,
              }}
              productCharacteristics={productChars}
              characteristicTypes={characteristicTypes}
              characteristicOptions={characteristicOptions}
              priceCombinations={productPriceCombinations}
            />
          )
        })}
      </div>
    </section>
  )
}
