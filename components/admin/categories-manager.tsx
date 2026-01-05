"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit2, X, Check } from "lucide-react"

interface Category {
  id: string
  name_uk: string
  name_en: string
  slug: string
  description_uk?: string
  description_en?: string
  parent_id?: string | null
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({})
  const [showForm, setShowForm] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name_uk: "",
    name_en: "",
    slug: "",
    description_uk: "",
    description_en: "",
    parent_id: "",
  })

  const supabase = createClient()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name_uk")
    if (data) setCategories(data)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleCreate = async () => {
    if (!newCategory.name_uk || !newCategory.name_en) return

    setLoading(true)
    const slug = newCategory.slug || generateSlug(newCategory.name_uk)
    
    const { error } = await supabase.from("categories").insert({
      name_uk: newCategory.name_uk,
      name_en: newCategory.name_en,
      slug,
      description_uk: newCategory.description_uk || null,
      description_en: newCategory.description_en || null,
      parent_id: newCategory.parent_id || null,
    })

    if (!error) {
      setNewCategory({
        name_uk: "",
        name_en: "",
        slug: "",
        description_uk: "",
        description_en: "",
        parent_id: "",
      })
      setShowForm(false)
      loadCategories()
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    if (!editingCategory.name_uk || !editingCategory.name_en || !editingId) return

    setLoading(true)
    const { error } = await supabase
      .from("categories")
      .update({
        name_uk: editingCategory.name_uk,
        name_en: editingCategory.name_en,
        slug: editingCategory.slug,
        description_uk: editingCategory.description_uk || null,
        description_en: editingCategory.description_en || null,
        parent_id: editingCategory.parent_id || null,
      })
      .eq("id", editingId)

    if (!error) {
      setEditingId(null)
      setEditingCategory({})
      loadCategories()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю категорію?")) return

    setLoading(true)
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (!error) loadCategories()
    setLoading(false)
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditingCategory(category)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingCategory({})
  }

  const topLevelCategories = categories.filter(c => !c.parent_id)
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_id === parentId)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Керування категоріями</CardTitle>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Додати категорію
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 border rounded-md space-y-4 bg-secondary">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Назва (UK)*</Label>
                <Input
                  value={newCategory.name_uk}
                  onChange={(e) => {
                    setNewCategory({
                      ...newCategory,
                      name_uk: e.target.value,
                      slug: newCategory.slug || generateSlug(e.target.value),
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Назва (EN)*</Label>
                <Input
                  value={newCategory.name_en}
                  onChange={(e) => setNewCategory({ ...newCategory, name_en: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Батьківська категорія</Label>
              <select
                value={newCategory.parent_id}
                onChange={(e) => setNewCategory({ ...newCategory, parent_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Головна категорія</option>
                {topLevelCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_uk}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={loading} size="sm">
                Створити
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" size="sm">
                Скасувати
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {topLevelCategories.map((category) => (
            <div key={category.id} className="border rounded-md p-4">
              {editingId === category.id ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Назва (UK)*</Label>
                      <Input
                        value={editingCategory.name_uk || ""}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name_uk: e.target.value,
                            slug: editingCategory.slug || generateSlug(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Назва (EN)*</Label>
                      <Input
                        value={editingCategory.name_en || ""}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, name_en: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={editingCategory.slug || ""}
                      onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} disabled={loading} size="sm">
                      <Check className="mr-2 h-4 w-4" />
                      Зберегти
                    </Button>
                    <Button onClick={cancelEdit} variant="outline" size="sm">
                      <X className="mr-2 h-4 w-4" />
                      Скасувати
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{category.name_uk}</h3>
                    <p className="text-sm text-muted-foreground">{category.name_en}</p>
                    <p className="text-xs text-muted-foreground">/{category.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => startEdit(category)} variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(category.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {getSubcategories(category.id).length > 0 && (
                <div className="mt-4 ml-6 space-y-2 border-l-2 pl-4">
                  {getSubcategories(category.id).map((subcat) => (
                    <div key={subcat.id} className="border rounded-md p-3">
                      {editingId === subcat.id ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Назва (UK)*</Label>
                              <Input
                                value={editingCategory.name_uk || ""}
                                onChange={(e) =>
                                  setEditingCategory({
                                    ...editingCategory,
                                    name_uk: e.target.value,
                                    slug: editingCategory.slug || generateSlug(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Назва (EN)*</Label>
                              <Input
                                value={editingCategory.name_en || ""}
                                onChange={(e) =>
                                  setEditingCategory({ ...editingCategory, name_en: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleUpdate} disabled={loading} size="sm">
                              <Check className="mr-2 h-4 w-4" />
                              Зберегти
                            </Button>
                            <Button onClick={cancelEdit} variant="outline" size="sm">
                              <X className="mr-2 h-4 w-4" />
                              Скасувати
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">— {subcat.name_uk}</h4>
                            <p className="text-xs text-muted-foreground">{subcat.name_en}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => startEdit(subcat)} variant="outline" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(subcat.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

