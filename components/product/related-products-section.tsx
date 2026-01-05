"use client"

import { useI18n } from "@/lib/i18n-context"
import { ProductCard } from "@/components/catalog/product-card"

interface RelatedProduct {
  id: string
  name_uk: string
  name_en: string
  slug: string
  price: number
  images?: string[] | Array<{ url: string; id?: string }>
  description_uk?: string | null
  description_en?: string | null
}

interface RelatedProductsSectionProps {
  products: RelatedProduct[]
  productCharacteristics: any[]
  characteristicTypes: any[]
  characteristicOptions: any[]
  priceCombinations: any[]
}

export function RelatedProductsSection({
  products,
  productCharacteristics,
  characteristicTypes,
  characteristicOptions,
  priceCombinations,
}: RelatedProductsSectionProps) {
  const { locale } = useI18n()

  if (products.length === 0) return null

  // Group characteristics and price combinations by product_id
  const characteristicsByProduct: Record<string, any[]> = {}
  const priceCombinationsByProduct: Record<string, any[]> = {}

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
    <section className="border-t border-border bg-secondary py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-2xl font-light text-foreground">
          {locale === "uk" ? "Схожі товари" : "Related Products"}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
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
      </div>
    </section>
  )
}

