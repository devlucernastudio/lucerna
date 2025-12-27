"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name_uk: string
  name_en: string
  price: number
  stock: number
  is_featured: boolean
  is_active: boolean
  images: string[]
  categories?: {
    name_uk: string
    name_en: string
  }
}

interface Category {
  id: string
  name_uk: string
  name_en: string
}

export function ProductsTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей товар?")) return

    const supabase = createClient()
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      alert("Помилка при видаленні товару")
    } else {
      router.refresh()
    }
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="mb-4">Товарів поки немає</p>
          <Button className="bg-[#D4834F] hover:bg-[#C17340]" asChild>
            <Link href="/admin/products/new">Додати перший товар</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-foreground">Фото</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Назва</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Категорія</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Ціна</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Наявність</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Статус</th>
                <th className="p-4 text-right text-sm font-medium text-foreground">Дії</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name_uk}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-foreground">{product.name_uk}</p>
                    <p className="text-sm text-muted-foreground">{product.name_en}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{product.categories?.name_uk || "—"}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-foreground">{product.price.toLocaleString("uk-UA")} грн</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {product.stock} шт
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {product.is_active ? (
                        <Badge className="bg-green-500 text-white">Активний</Badge>
                      ) : (
                        <Badge className="bg-gray-500 text-white">Неактивний</Badge>
                      )}
                      {product.is_featured && <Badge className="bg-[#D4834F] text-white">Популярний</Badge>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
