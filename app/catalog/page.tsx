import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { products } from "@/lib/products"
import { AddToCartButton } from "@/components/add-to-cart-button"

export const metadata = {
  title: "Каталог - Lucerna Studio",
  description: "Переглянути всі світильники Lucerna Studio",
}

export default function CatalogPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-secondary py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-light text-foreground">Каталог світильників</h1>
          <p className="mt-2 text-muted-foreground">Усі світильники ручної роботи від Lucerna Studio</p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{products.length} товарів</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
              <Link href={`/product/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>
              <CardContent className="p-4">
                <Link href={`/product/${product.id}`}>
                  <h3 className="mb-2 text-base font-medium text-foreground hover:text-[#D4834F] transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                <p className="text-lg font-semibold text-foreground">{product.price.toLocaleString("uk-UA")} ₴</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <AddToCartButton product={product} />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
