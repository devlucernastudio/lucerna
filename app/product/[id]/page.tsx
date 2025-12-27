import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { products } from "@/lib/products"
import { AddToCartButton } from "@/components/add-to-cart-button"

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id)
  if (!product) {
    return {
      title: "Товар не знайдено - Lucerna Studio",
    }
  }
  return {
    title: `${product.name} - Lucerna Studio`,
    description: product.description,
  }
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3)

  return (
    <main className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/catalog">
            <ChevronLeft className="h-4 w-4" />
            Назад до каталогу
          </Link>
        </Button>
      </div>

      {/* Product Details */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="mb-2 text-3xl font-light text-foreground">{product.name}</h1>
              <p className="text-2xl font-semibold text-foreground">{product.price.toLocaleString("uk-UA")} ₴</p>
            </div>

            <div className="border-y border-border py-6">
              <h2 className="mb-3 text-lg font-medium text-foreground">Опис</h2>
              <p className="leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            <div className="space-y-4">
              <AddToCartButton product={product} className="h-12 text-base" />
              <div className="rounded-lg bg-secondary p-4">
                <h3 className="mb-2 font-medium text-foreground">Деталі виробу</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Ручна робота</li>
                  <li>• Натуральні матеріали</li>
                  <li>• Унікальний дизайн</li>
                  <li>• Можлива індивідуальна комплектація</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border bg-secondary py-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-2xl font-light text-foreground">Схожі товари</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="overflow-hidden border-border/50 transition-shadow hover:shadow-lg"
                >
                  <Link href={`/product/${relatedProduct.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={relatedProduct.image || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/product/${relatedProduct.id}`}>
                      <h3 className="mb-2 text-base font-medium text-foreground hover:text-[#D4834F] transition-colors">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-semibold text-foreground">
                      {relatedProduct.price.toLocaleString("uk-UA")} ₴
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <AddToCartButton product={relatedProduct} />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
