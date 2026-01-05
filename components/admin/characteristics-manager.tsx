"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Edit2, X, Check, ChevronDown, ChevronUp } from "lucide-react"
import { showToast } from "@/lib/toast"
import type { CharacteristicInputType } from "@/lib/types/characteristics"

interface CharacteristicType {
  id: string
  name_uk: string
  name_en: string
  input_type: CharacteristicInputType
  required: boolean
  reusable: boolean
  affects_price: boolean
  position: number
  created_at: string
  updated_at: string
}

interface CharacteristicOption {
  id: string
  characteristic_type_id: string
  name_uk: string | null
  name_en: string | null
  value: string
  color_code: string | null
  position: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export function CharacteristicsManager() {
  const supabase = createClient()
  const [characteristics, setCharacteristics] = useState<CharacteristicType[]>([])
  const [options, setOptions] = useState<Record<string, CharacteristicOption[]>>({})
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  
  const [editingChar, setEditingChar] = useState<Partial<CharacteristicType>>({})
  const [newChar, setNewChar] = useState({
    name_uk: "",
    name_en: "",
    input_type: "text" as CharacteristicInputType,
    required: false,
    reusable: true,
    affects_price: false,
  })

  const [editingOptions, setEditingOptions] = useState<Record<string, Partial<CharacteristicOption>[]>>({})
  const [newOptions, setNewOptions] = useState<Record<string, Partial<CharacteristicOption>[]>>({})

  useEffect(() => {
    loadCharacteristics()
  }, [])

  const loadCharacteristics = async () => {
    const { data, error } = await supabase
      .from("characteristic_types")
      .select("*")
      .order("position", { ascending: true })
      .order("name_uk", { ascending: true })

    if (error) {
      showToast.error("Помилка завантаження характеристик")
      return
    }

    if (data) {
      setCharacteristics(data)
      // Load options for all characteristics
      for (const char of data) {
        await loadOptions(char.id)
      }
    }
  }

  const loadOptions = async (characteristicTypeId: string) => {
    const { data, error } = await supabase
      .from("characteristic_options")
      .select("*")
      .eq("characteristic_type_id", characteristicTypeId)
      .order("position", { ascending: true })

    if (!error && data) {
      setOptions(prev => ({ ...prev, [characteristicTypeId]: data }))
    }
  }

  const getInputTypeLabel = (type: CharacteristicInputType) => {
    const labels: Record<CharacteristicInputType, string> = {
      color_palette: "Палітра кольорів (Caparol)",
      color_custom: "Кольори (ручні)",
      select: "Вибір зі списку",
      checkbox: "Чекбокс",
      text: "Текст",
    }
    return labels[type] || type
  }

  const needsOptions = (type: CharacteristicInputType) => {
    return type === "select" || type === "color_custom" || type === "checkbox"
  }

  const handleCreateChar = async () => {
    if (!newChar.name_uk || !newChar.name_en) {
      showToast.error("Заповніть назви українською та англійською")
      return
    }

    // Validate options for types that need them
    if (needsOptions(newChar.input_type)) {
      if (!newOptions["new"] || newOptions["new"].length === 0) {
        showToast.error("Додайте хоча б одну опцію для цього типу")
        return
      }
      // Validate option values
      for (const opt of newOptions["new"]) {
        if (!opt.value && !opt.color_code) {
          showToast.error("Всі опції повинні мати значення або колір")
          return
        }
      }
    }

    setLoading(true)

    // Get max position
    const maxPosition = characteristics.length > 0 
      ? Math.max(...characteristics.map(c => c.position))
      : -1

    // Prepare data for insert, handle affects_price gracefully
    const insertData: any = {
      name_uk: newChar.name_uk,
      name_en: newChar.name_en,
      input_type: newChar.input_type,
      required: newChar.required ?? false,
      reusable: newChar.reusable ?? true,
      position: maxPosition + 1,
    }
    
    // Only include affects_price if it's defined (may not exist in DB yet)
    if (newChar.affects_price !== undefined) {
      insertData.affects_price = newChar.affects_price
    }

    const { data, error } = await supabase
      .from("characteristic_types")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      showToast.error(`Помилка створення: ${error.message}`)
      setLoading(false)
      return
    }

    // Create options if needed
    if (needsOptions(newChar.input_type) && newOptions["new"]?.length) {
      const optionsToInsert = newOptions["new"].map((opt, idx) => ({
        characteristic_type_id: data.id,
        name_uk: opt.name_uk || null,
        name_en: opt.name_en || null,
        value: opt.value || opt.color_code || "",
        color_code: opt.color_code || null,
        position: idx,
        is_available: opt.is_available ?? true,
      }))

      const { error: optionsError } = await supabase.from("characteristic_options").insert(optionsToInsert)
      
      if (optionsError) {
        showToast.error(`Помилка створення опцій: ${optionsError.message}`)
        // Delete the characteristic if options failed
        await supabase.from("characteristic_types").delete().eq("id", data.id)
        setLoading(false)
        return
      }

      await loadOptions(data.id)
    }

    showToast.success("Характеристику створено")
    setNewChar({ name_uk: "", name_en: "", input_type: "text", required: false, reusable: true, affects_price: false })
    setNewOptions({})
    setShowForm(false)
    await loadCharacteristics()
    setLoading(false)
  }

  const handleUpdateChar = async () => {
    if (!editingChar.name_uk || !editingChar.name_en || !editingId) {
      showToast.error("Заповніть всі обов'язкові поля")
      return
    }

    setLoading(true)

    // Check if characteristic is used in products before allowing type change
    if (editingChar.input_type && editingId) {
      const currentChar = characteristics.find(c => c.id === editingId)
      if (currentChar && currentChar.input_type !== editingChar.input_type) {
        // Check if used in products
        const { data: usedInProducts } = await supabase
          .from("product_characteristics")
          .select("product_id")
          .eq("characteristic_type_id", editingId)
          .limit(1)
        
        if (usedInProducts && usedInProducts.length > 0) {
          showToast.error("Неможливо змінити тип: характеристика використовується в товарах")
          setLoading(false)
          return
        }
      }
    }

    // Prepare update data, handle affects_price gracefully
    const updateData: any = {
      name_uk: editingChar.name_uk,
      name_en: editingChar.name_en,
      input_type: editingChar.input_type,
      required: editingChar.required,
      reusable: editingChar.reusable,
    }
    
    // Only include affects_price if it's defined (may not exist in DB yet)
    if (editingChar.affects_price !== undefined) {
      updateData.affects_price = editingChar.affects_price
    }

    const { error } = await supabase
      .from("characteristic_types")
      .update(updateData)
      .eq("id", editingId)

    if (error) {
      showToast.error(`Помилка оновлення: ${error.message}`)
      setLoading(false)
      return
    }

    // Update options if provided
    if (editingOptions[editingId]) {
      const existingOptions = options[editingId] || []
      
      // Delete removed options
      const keptOptionIds = editingOptions[editingId]
        .filter(opt => opt.id)
        .map(opt => opt.id!)
      const toDelete = existingOptions.filter(opt => !keptOptionIds.includes(opt.id))
      
      if (toDelete.length > 0) {
        await supabase
          .from("characteristic_options")
          .delete()
          .in("id", toDelete.map(opt => opt.id))
      }

      // Update/create options
      for (let idx = 0; idx < editingOptions[editingId].length; idx++) {
        const opt = editingOptions[editingId][idx]
        if (opt.id) {
          // Update existing
          await supabase
            .from("characteristic_options")
            .update({
              name_uk: opt.name_uk || null,
              name_en: opt.name_en || null,
              value: opt.value || opt.color_code || "",
              color_code: opt.color_code || null,
              position: idx,
              is_available: opt.is_available ?? true,
            })
            .eq("id", opt.id)
        } else {
          // Create new
          await supabase
            .from("characteristic_options")
            .insert({
              characteristic_type_id: editingId,
              name_uk: opt.name_uk || null,
              name_en: opt.name_en || null,
              value: opt.value || opt.color_code || "",
              color_code: opt.color_code || null,
              position: idx,
              is_available: opt.is_available ?? true,
            })
        }
      }

      await loadOptions(editingId)
    }

    showToast.success("Характеристику оновлено")
    setEditingId(null)
    setEditingChar({})
    setEditingOptions({})
    await loadCharacteristics()
    setLoading(false)
  }

  const checkCharacteristicUsage = async (id: string) => {
    const { data: products, error } = await supabase
      .from("product_characteristics")
      .select("product_id, products(name_uk, name_en)")
      .eq("characteristic_type_id", id)
      .limit(10)

    if (error) {
      console.error("Error checking usage:", error)
      return { used: false, products: [] }
    }

    return {
      used: products && products.length > 0,
      products: products || []
    }
  }

  const handleDeleteChar = async (id: string) => {
    // Check if characteristic is used in products
    const usage = await checkCharacteristicUsage(id)
    
    if (usage.used) {
      const productNames = usage.products
        .slice(0, 5)
        .map((p: any) => p.products?.name_uk || p.products?.name_en || "Товар")
        .join(", ")
      const moreCount = usage.products.length > 5 ? ` та ще ${usage.products.length - 5}` : ""
      
      const confirmMessage = `Характеристика використовується в ${usage.products.length} товар${usage.products.length > 1 ? "ах" : "і"}: ${productNames}${moreCount}.\n\nВидалити характеристику з усіх товарів?`
      
      if (!confirm(confirmMessage)) {
        return
      }
    } else {
      if (!confirm("Ви впевнені, що хочете видалити цю характеристику? Це видалить всі пов'язані опції.")) {
        return
      }
    }

    setLoading(true)
    const { error } = await supabase.from("characteristic_types").delete().eq("id", id)

    if (error) {
      showToast.error(`Помилка видалення: ${error.message}`)
      setLoading(false)
      return
    }

    showToast.success("Характеристику видалено")
    await loadCharacteristics()
    setLoading(false)
  }

  const startEdit = (char: CharacteristicType) => {
    setEditingId(char.id)
    setEditingChar(char)
    // Initialize editing options
    setEditingOptions({
      [char.id]: options[char.id] || [],
    })
    setExpandedIds(new Set([char.id]))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingChar({})
    setEditingOptions({})
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const addOption = (charId: string, isNew: boolean) => {
    if (isNew) {
      setNewOptions(prev => ({
        ...prev,
        [charId]: [...(prev[charId] || []), { value: "", color_code: "", is_available: true }],
      }))
    } else {
      setEditingOptions(prev => ({
        ...prev,
        [charId]: [...(prev[charId] || []), { value: "", color_code: "", is_available: true }],
      }))
    }
  }

  const removeOption = (charId: string, index: number, isNew: boolean) => {
    if (isNew) {
      setNewOptions(prev => ({
        ...prev,
        [charId]: prev[charId]?.filter((_, i) => i !== index) || [],
      }))
    } else {
      setEditingOptions(prev => ({
        ...prev,
        [charId]: prev[charId]?.filter((_, i) => i !== index) || [],
      }))
    }
  }

  const updateOption = (charId: string, index: number, field: keyof CharacteristicOption, value: any, isNew: boolean) => {
    if (isNew) {
      setNewOptions(prev => ({
        ...prev,
        [charId]: prev[charId]?.map((opt, i) =>
          i === index ? { ...opt, [field]: value } : opt
        ) || [],
      }))
    } else {
      setEditingOptions(prev => ({
        ...prev,
        [charId]: prev[charId]?.map((opt, i) =>
          i === index ? { ...opt, [field]: value } : opt
        ) || [],
      }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Керування характеристиками</CardTitle>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-[#D4834F] hover:bg-[#C17340]">
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
                  value={newChar.name_uk}
                  onChange={(e) => setNewChar({ ...newChar, name_uk: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Назва (EN)*</Label>
                <Input
                  value={newChar.name_en}
                  onChange={(e) => setNewChar({ ...newChar, name_en: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Тип введення*</Label>
              <select
                value={newChar.input_type}
                onChange={(e) => {
                  setNewChar({ ...newChar, input_type: e.target.value as CharacteristicInputType })
                  setNewOptions({}) // Clear options when type changes
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="text">Текст</option>
                <option value="checkbox">Чекбокс</option>
                <option value="select">Вибір зі списку</option>
                <option value="color_custom">Кольори (ручні)</option>
                <option value="color_palette">Палітра кольорів (Caparol)</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newChar.required}
                  onCheckedChange={(checked) => setNewChar({ ...newChar, required: checked })}
                />
                <Label>Обов'язкова</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newChar.reusable}
                  onCheckedChange={(checked) => setNewChar({ ...newChar, reusable: checked })}
                />
                <Label>Переважна між товарами</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newChar.affects_price}
                  onCheckedChange={(checked) => setNewChar({ ...newChar, affects_price: checked })}
                />
                <Label>Впливає на ціну</Label>
              </div>
            </div>

            {/* Options for select/color_custom/checkbox */}
            {needsOptions(newChar.input_type) && (
              <div className="space-y-3 p-3 bg-background rounded-md border">
                <div className="flex items-center justify-between">
                  <Label>Опції</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addOption("new", true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {(newOptions["new"] || []).map((opt, idx) => (
                  <div key={idx} className="grid gap-2 md:grid-cols-4 items-end">
                    {newChar.input_type === "color_custom" && (
                      <div>
                        <Label>Колір (hex)</Label>
                        <Input
                          type="color"
                          value={opt.color_code || "#000000"}
                          onChange={(e) => {
                            const colorCode = e.target.value
                            updateOption("new", idx, "color_code", colorCode, true)
                            updateOption("new", idx, "value", colorCode, true)
                          }}
                          className="h-10"
                        />
                      </div>
                    )}
                    <div>
                      <Label>Назва (UK)</Label>
                      <Input
                        value={opt.name_uk || ""}
                        onChange={(e) => updateOption("new", idx, "name_uk", e.target.value, true)}
                      />
                    </div>
                    <div>
                      <Label>Назва (EN)</Label>
                      <Input
                        value={opt.name_en || ""}
                        onChange={(e) => updateOption("new", idx, "name_en", e.target.value, true)}
                      />
                    </div>
                    {newChar.input_type !== "color_custom" && (
                      <div>
                        <Label>Значення*</Label>
                        <Input
                          value={opt.value || ""}
                          onChange={(e) => updateOption("new", idx, "value", e.target.value, true)}
                        />
                      </div>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeOption("new", idx, true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {newChar.input_type === "color_palette" && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                <p>Палітра Caparol буде доступна при виборі цієї характеристики в товарі.</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleCreateChar} disabled={loading} size="sm" className="bg-[#D4834F] hover:bg-[#C17340]">
                Створити
              </Button>
              <Button onClick={() => {
                setShowForm(false)
                setNewChar({ name_uk: "", name_en: "", input_type: "text", required: false, reusable: true })
                setNewOptions({})
              }} variant="outline" size="sm">
                Скасувати
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {characteristics.map((char) => (
            <div key={char.id} className="border rounded-md">
              {editingId === char.id ? (
                <div className="p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Назва (UK)*</Label>
                      <Input
                        value={editingChar.name_uk || ""}
                        onChange={(e) => setEditingChar({ ...editingChar, name_uk: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Назва (EN)*</Label>
                      <Input
                        value={editingChar.name_en || ""}
                        onChange={(e) => setEditingChar({ ...editingChar, name_en: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Тип введення*</Label>
                    <select
                      value={editingChar.input_type || "text"}
                      onChange={(e) => setEditingChar({ ...editingChar, input_type: e.target.value as CharacteristicInputType })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="text">Текст</option>
                      <option value="checkbox">Чекбокс</option>
                      <option value="select">Вибір зі списку</option>
                      <option value="color_custom">Кольори (ручні)</option>
                      <option value="color_palette">Палітра кольорів (Caparol)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingChar.required ?? false}
                        onCheckedChange={(checked) => setEditingChar({ ...editingChar, required: checked })}
                      />
                      <Label>Обов'язкова</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingChar.reusable ?? true}
                        onCheckedChange={(checked) => setEditingChar({ ...editingChar, reusable: checked })}
                      />
                      <Label>Переважна між товарами</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingChar.affects_price ?? false}
                        onCheckedChange={(checked) => setEditingChar({ ...editingChar, affects_price: checked })}
                      />
                      <Label>Впливає на ціну</Label>
                    </div>
                  </div>

                  {/* Options editing */}
                  {needsOptions(editingChar.input_type || char.input_type) && (
                    <div className="space-y-3 p-3 bg-background rounded-md border">
                      <div className="flex items-center justify-between">
                        <Label>Опції</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addOption(char.id, false)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {(editingOptions[char.id] || []).map((opt, idx) => (
                        <div key={idx} className="grid gap-2 md:grid-cols-4 items-end">
                          {(editingChar.input_type || char.input_type) === "color_custom" && (
                            <div>
                              <Label>Колір (hex)</Label>
                              <Input
                                type="color"
                                value={opt.color_code || "#000000"}
                                onChange={(e) => {
                                  const colorCode = e.target.value
                                  updateOption(char.id, idx, "color_code", colorCode, false)
                                  updateOption(char.id, idx, "value", colorCode, false)
                                }}
                                className="h-10"
                              />
                            </div>
                          )}
                          <div>
                            <Label>Назва (UK)</Label>
                            <Input
                              value={opt.name_uk || ""}
                              onChange={(e) => updateOption(char.id, idx, "name_uk", e.target.value, false)}
                            />
                          </div>
                          <div>
                            <Label>Назва (EN)</Label>
                            <Input
                              value={opt.name_en || ""}
                              onChange={(e) => updateOption(char.id, idx, "name_en", e.target.value, false)}
                            />
                          </div>
                          {(editingChar.input_type || char.input_type) !== "color_custom" && (
                            <div>
                              <Label>Значення*</Label>
                              <Input
                                value={opt.value || ""}
                                onChange={(e) => updateOption(char.id, idx, "value", e.target.value, false)}
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={opt.is_available ?? true}
                              onCheckedChange={(checked) => updateOption(char.id, idx, "is_available", checked, false)}
                            />
                            <Label className="text-xs">Доступний</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => removeOption(char.id, idx, false)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(editingChar.input_type || char.input_type) === "color_palette" && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                      <p>Палітра Caparol буде доступна при виборі цієї характеристики в товарі.</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleUpdateChar} disabled={loading} size="sm" className="bg-[#D4834F] hover:bg-[#C17340]">
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
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{char.name_uk}</h3>
                        {char.required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Обов'язкова</span>
                        )}
                        {char.reusable && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Переважна</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{char.name_en}</p>
                      <p className="text-xs text-muted-foreground">Тип: {getInputTypeLabel(char.input_type)}</p>
                      {needsOptions(char.input_type) && options[char.id] && options[char.id].length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Опцій: {options[char.id].length}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleExpand(char.id)}
                        variant="outline"
                        size="sm"
                      >
                        {expandedIds.has(char.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button onClick={() => startEdit(char)} variant="outline" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteChar(char.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {expandedIds.has(char.id) && needsOptions(char.input_type) && options[char.id] && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Опції:</h4>
                      <div className="space-y-2">
                        {options[char.id].map((opt) => (
                          <div key={opt.id} className="flex items-center gap-2 text-sm">
                            {char.input_type === "color_custom" && opt.color_code && (
                              <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: opt.color_code }}
                              />
                            )}
                            <span>{opt.name_uk || opt.value}</span>
                            {opt.name_en && <span className="text-muted-foreground">({opt.name_en})</span>}
                            {!opt.is_available && (
                              <span className="text-xs text-muted-foreground">(недоступний)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

