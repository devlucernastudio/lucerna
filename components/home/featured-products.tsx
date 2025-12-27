"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import { useCart } from "@/lib/cart-context"

interface Product {
  id: string
  name_uk: string
  name_en: string
  slug: string
  price: number
  images: string[]
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  const { locale } = useI18n()
  const { addToCart } = useCart()
  const t = (key: string) => getTranslation(locale, key)

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: locale === "uk" ? product.name_uk : product.name_en,
      price: product.price,
      image: product.images[0] || "/placeholder.svg",
    })
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-12 flex items-center justify-between">
        <h2 className="text-3xl font-light text-foreground">{t("home.featured")}</h2>
        <Button
          variant="outline"
          className="border-[#D4834F] text-[#D4834F] hover:bg-[#D4834F] hover:text-white bg-transparent"
          asChild
        >
          <Link href="/catalog">{t("home.viewAll")}</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, 6).map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden border-border/50 transition-all hover:shadow-lg hover:border-[#D4834F]/30"
          >
            <Link href={`/product/${product.slug}`}>
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={locale === "uk" ? product.name_uk : product.name_en}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <Link href={`/product/${product.slug}`}>
                <h3 className="mb-2 text-base font-medium text-foreground hover:text-[#D4834F] transition-colors line-clamp-2">
                  {locale === "uk" ? product.name_uk : product.name_en}
                </h3>
              </Link>
              <p className="text-lg font-semibold text-foreground">
                {product.price.toLocaleString("uk-UA")} {t("common.uah")}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full bg-[#D4834F] hover:bg-[#C17340]" onClick={() => handleAddToCart(product)}>
                {t("product.addToCart")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
