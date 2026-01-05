"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit2, X, Check } from "lucide-react"

interface AttributeType {
  id: string
  name_uk: string
  name_en: string
  type: "text" | "color" | "reference"
  reference_attribute_type_id?: string | null
}

export function AttributesManager() {
  const [attributes, setAttributes] = useState<AttributeType[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingAttribute, setEditingAttribute] = useState<Partial<AttributeType>>({})
  const [showForm, setShowForm] = useState(false)
  const [newAttribute, setNewAttribute] = useState({
    name_uk: "",
    name_en: "",
    type: "text" as "text" | "color" | "reference",
    reference_attribute_type_id: "",
  })

  const supabase = createClient()

  useEffect(() => {
    loadAttributes()
  }, [])

  const loadAttributes = async () => {
    const { data } = await supabase.from("attribute_types").select("*").order("name_uk")
    if (data) setAttributes(data)
  }

  const handleCreate = async () => {
    if (!newAttribute.name_uk || !newAttribute.name_en) return

    setLoading(true)
    const { error } = await supabase.from("attribute_types").insert({
      name_uk: newAttribute.name_uk,
      name_en: newAttribute.name_en,
      type: newAttribute.type,
      reference_attribute_type_id:
        newAttribute.type === "reference" && newAttribute.reference_attribute_type_id
          ? newAttribute.reference_attribute_type_id
          : null,
    })

    if (!error) {
      setNewAttribute({
        name_uk: "",
        name_en: "",
        type: "text",
        reference_attribute_type_id: "",
      })
      setShowForm(false)
      loadAttributes()
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    if (!editingAttribute.name_uk || !editingAttribute.name_en || !editingId) return

    setLoading(true)
    const { error } = await supabase
      .from("attribute_types")
      .update({
        name_uk: editingAttribute.name_uk,
        name_en: editingAttribute.name_en,
        type: editingAttribute.type,
        reference_attribute_type_id:
          editingAttribute.type === "reference" && editingAttribute.reference_attribute_type_id
            ? editingAttribute.reference_attribute_type_id
            : null,
      })
      .eq("id", editingId)

    if (!error) {
      setEditingId(null)
      setEditingAttribute({})
      loadAttributes()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю характеристику?")) return

    setLoading(true)
    const { error } = await supabase.from("attribute_types").delete().eq("id", id)
    if (!error) loadAttributes()
    setLoading(false)
  }

  const startEdit = (attribute: AttributeType) => {
    setEditingId(attribute.id)
    setEditingAttribute(attribute)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingAttribute({})
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Текст"
      case "color":
        return "Колір"
      case "reference":
        return "Посилання"
      default:
        return type
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Керування характеристиками</CardTitle>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Додати характеристику
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
                  value={newAttribute.name_uk}
                  onChange={(e) => setNewAttribute({ ...newAttribute, name_uk: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Назва (EN)*</Label>
                <Input
                  value={newAttribute.name_en}
                  onChange={(e) => setNewAttribute({ ...newAttribute, name_en: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Тип*</Label>
              <select
                value={newAttribute.type}
                onChange={(e) =>
                  setNewAttribute({
                    ...newAttribute,
                    type: e.target.value as "text" | "color" | "reference",
                    reference_attribute_type_id: "",
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="text">Текст</option>
                <option value="color">Колір</option>
                <option value="reference">Посилання на іншу характеристику</option>
              </select>
            </div>
            {newAttribute.type === "reference" && (
              <div className="space-y-2">
                <Label>Посилання на характеристику</Label>
                <select
                  value={newAttribute.reference_attribute_type_id}
                  onChange={(e) =>
                    setNewAttribute({ ...newAttribute, reference_attribute_type_id: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Оберіть характеристику</option>
                  {attributes
                    .filter((a) => a.id !== newAttribute.reference_attribute_type_id)
                    .map((attr) => (
                      <option key={attr.id} value={attr.id}>
                        {attr.name_uk}
                      </option>
                    ))}
                </select>
              </div>
            )}
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
          {attributes.map((attribute) => (
            <div key={attribute.id} className="border rounded-md p-4">
              {editingId === attribute.id ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Назва (UK)*</Label>
                      <Input
                        value={editingAttribute.name_uk || ""}
                        onChange={(e) =>
                          setEditingAttribute({ ...editingAttribute, name_uk: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Назва (EN)*</Label>
                      <Input
                        value={editingAttribute.name_en || ""}
                        onChange={(e) =>
                          setEditingAttribute({ ...editingAttribute, name_en: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Тип*</Label>
                    <select
                      value={editingAttribute.type || "text"}
                      onChange={(e) =>
                        setEditingAttribute({
                          ...editingAttribute,
                          type: e.target.value as "text" | "color" | "reference",
                          reference_attribute_type_id: "",
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="text">Текст</option>
                      <option value="color">Колір</option>
                      <option value="reference">Посилання на іншу характеристику</option>
                    </select>
                  </div>
                  {editingAttribute.type === "reference" && (
                    <div className="space-y-2">
                      <Label>Посилання на характеристику</Label>
                      <select
                        value={editingAttribute.reference_attribute_type_id || ""}
                        onChange={(e) =>
                          setEditingAttribute({
                            ...editingAttribute,
                            reference_attribute_type_id: e.target.value,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Оберіть характеристику</option>
                        {attributes
                          .filter((a) => a.id !== editingId && a.id !== editingAttribute.reference_attribute_type_id)
                          .map((attr) => (
                            <option key={attr.id} value={attr.id}>
                              {attr.name_uk}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
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
                    <h3 className="font-semibold">{attribute.name_uk}</h3>
                    <p className="text-sm text-muted-foreground">{attribute.name_en}</p>
                    <p className="text-xs text-muted-foreground">Тип: {getTypeLabel(attribute.type)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => startEdit(attribute)} variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(attribute.id)}
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
      </CardContent>
    </Card>
  )
}

