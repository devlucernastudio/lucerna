"use client"

export { ProductFormNew as ProductForm } from "./product-form-new"

interface Product {
  id: string
  name_uk: string
  name_en: string
  slug: string
  description_uk?: string
  description_en?: string
  price: number
  compare_at_price?: number
  stock: number
  sku?: string
  category_id?: string
  images: string[]
  is_featured: boolean
  is_active: boolean
}

interface Category {
  id: string
  name_uk: string
  name_en: string
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name_uk: product?.name_uk || "",
    name_en: product?.name_en || "",
    slug: product?.slug || "",
    description_uk: product?.description_uk || "",
    description_en: product?.description_en || "",
    price: product?.price || 0,
    compare_at_price: product?.compare_at_price || 0,
    stock: product?.stock || 0,
    sku: product?.sku || "",
    category_id: product?.category_id || "",
    images: product?.images?.join(", ") || "",
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    const data = {
      ...formData,
      price: Number(formData.price),
      compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
      stock: Number(formData.stock),
      images: formData.images
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean),
    }

    try {
      if (product) {
        const { error } = await supabase.from("products").update(data).eq("id", product.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("products").insert(data)
        if (error) throw error
      }

      router.push("/admin/products")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Сталася помилка")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name_uk">Назва (Українська)*</Label>
              <Input
                id="name_uk"
                value={formData.name_uk}
                onChange={(e) => setFormData({ ...formData, name_uk: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_en">Назва (English)*</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)*</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="product-name"
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description_uk">Опис (Українська)</Label>
              <Textarea
                id="description_uk"
                value={formData.description_uk}
                onChange={(e) => setFormData({ ...formData, description_uk: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_en">Опис (English)</Label>
              <Textarea
                id="description_en"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Ціна*</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compare_at_price">Стара ціна</Label>
              <Input
                id="compare_at_price"
                type="number"
                step="0.01"
                value={formData.compare_at_price}
                onChange={(e) => setFormData({ ...formData, compare_at_price: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Кількість*</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">Артикул (SKU)</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Категорія</Label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Без категорії</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_uk}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Зображення (URL через кому)</Label>
            <Textarea
              id="images"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="/image1.jpg, /image2.jpg"
              rows={2}
            />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is_featured">Популярний товар</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Активний</Label>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" className="bg-[#D4834F] hover:bg-[#C17340]" disabled={isLoading}>
              {isLoading ? "Збереження..." : product ? "Оновити товар" : "Створити товар"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Скасувати
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
