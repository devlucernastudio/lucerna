"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Table2, List } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ProductsTableExtended } from "./products-table-extended"

interface Product {
  id: string
  name_uk: string
  name_en: string
  slug: string
  price: number
  stock: number
  is_in_stock?: boolean
  is_featured: boolean
  is_active: boolean
  images: string[]
  productCategories?: Array<{
    name_uk: string
    name_en: string
  }>
  priceCombinations?: Array<{
    is_available: boolean
  }>
  characteristics?: Array<{
    characteristic_type_id: string
    required: boolean | null
    affects_price: boolean | null
    name_uk: string
    name_en: string
  }>
  detailedPriceCombinations?: Array<{
    is_available: boolean
    combination: any
  }>
}

interface Category {
  id: string
  name_uk: string
  name_en: string
}

interface CharacteristicOption {
  id: string
  characteristic_type_id: string
  name_uk: string | null
  name_en: string | null
  value: string
}

interface CharacteristicType {
  id: string
  name_uk: string
  name_en: string
}

interface DownloadableFile {
  id: string
  title_uk: string
  title_en: string
}

export function ProductsTable({ 
  products, 
  categories,
  characteristicOptions = [],
  characteristicTypes = [],
  downloadableFiles = []
}: { 
  products: Product[]
  categories: Category[]
  characteristicOptions?: CharacteristicOption[]
  characteristicTypes?: CharacteristicType[]
  downloadableFiles?: DownloadableFile[]
}) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"standard" | "extended">("standard")

  const handleRowClick = (productId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or links
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) {
      return
    }
    router.push(`/admin/products/${productId}/edit`)
  }

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

  if (viewMode === "extended") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={viewMode === "standard" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("standard")}
            className="bg-[#D4834F] hover:bg-[#C17340]"
          >
            <List className="h-4 w-4 mr-2" />
            Стандартна таблиця
          </Button>
          <Button
            variant={viewMode === "extended" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("extended")}
            className="bg-[#D4834F] hover:bg-[#C17340]"
          >
            <Table2 className="h-4 w-4 mr-2" />
            Розширена таблиця
          </Button>
        </div>
        <ProductsTableExtended 
          products={products} 
          categories={categories}
          characteristicOptions={characteristicOptions}
          characteristicTypes={characteristicTypes}
          downloadableFiles={downloadableFiles}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          variant={viewMode === "standard" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("standard")}
          className={viewMode === "standard" ? "bg-[#D4834F] hover:bg-[#C17340]" : ""}
        >
          <List className="h-4 w-4 mr-2" />
          Стандартна таблиця
        </Button>
        <Button
          variant={viewMode === "extended" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("extended")}
          className={viewMode === "extended" ? "bg-[#D4834F] hover:bg-[#C17340]" : ""}
        >
          <Table2 className="h-4 w-4 mr-2" />
          Розширена таблиця
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
        {/* Mobile/Tablet view */}
        <div className="block lg:hidden">
          <div className="divide-y divide-border">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={(e) => handleRowClick(product.id, e)}
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name_uk}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.name_uk}</p>
                    <p className="text-sm text-muted-foreground truncate">{product.name_en}</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {product.price.toLocaleString("uk-UA")} грн
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <div>
                      <span className="text-muted-foreground">Категорії: </span>
                      <span>
                        {product.productCategories && product.productCategories.length > 0
                          ? product.productCategories.map(c => c.name_uk).join(", ")
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Наявність: </span>
                      <span>
                        {(() => {
                          // Check if product has price combinations
                          if (product.priceCombinations && product.priceCombinations.length > 0) {
                            const hasAvailable = product.priceCombinations.some(pc => pc.is_available)
                            return hasAvailable ? "В наявності" : "Немає"
                          }
                          // Fallback to is_in_stock or stock
                          if (product.is_in_stock !== undefined) {
                            return product.is_in_stock ? "В наявності" : "Немає"
                          }
                          return product.stock > 0 ? `${product.stock} шт.` : "Немає"
                        })()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        product.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {product.is_active ? "Активний" : "Неактивний"}
                      </span>
                      {product.is_featured && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-[#D4834F] text-white">
                          Популярний
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Редагувати
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(product.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Видалити
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden lg:block overflow-x-auto">
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
                <tr 
                  key={product.id} 
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={(e) => handleRowClick(product.id, e)}
                >
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
                    <span className="text-sm text-muted-foreground">
                      {product.productCategories && product.productCategories.length > 0
                        ? product.productCategories.map(c => c.name_uk).join(", ")
                        : "—"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-foreground">{product.price.toLocaleString("uk-UA")} грн</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground">
                      {(() => {
                        // Check if product has price combinations
                        if (product.priceCombinations && product.priceCombinations.length > 0) {
                          const hasAvailable = product.priceCombinations.some(pc => pc.is_available)
                          return hasAvailable ? "В наявності" : "Немає"
                        }
                        // Fallback to is_in_stock or stock
                        if (product.is_in_stock !== undefined) {
                          return product.is_in_stock ? "В наявності" : "Немає"
                        }
                        return product.stock > 0 ? `${product.stock} шт.` : "Немає"
                      })()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        product.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {product.is_active ? "Активний" : "Неактивний"}
                      </span>
                      {product.is_featured && (
                        <span className="inline-block px-2 py-1 rounded text-xs bg-[#D4834F] text-white">
                          Популярний
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(product.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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
    </div>
  )
}
