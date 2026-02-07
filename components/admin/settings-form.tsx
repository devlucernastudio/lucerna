"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { X, Upload, Star, GripVertical } from "lucide-react"
import { SimpleHtmlEditor } from "@/components/ui/simple-html-editor"
import { Switch } from "@/components/ui/switch"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface FeatureItem {
  title_uk: string
  title_en: string
  description_uk: string
  description_en: string
}

interface ContentBlock {
  id: string
  type: string
  title_uk: string | null
  title_en: string | null
  content_uk: string | null
  content_en: string | null
  images?: string[] | null
  settings?: any
  created_at?: string
}

interface FeaturesBlockEditorProps {
  block: ContentBlock
  onUpdate: (id: string, field: string, value: any) => void
  blockName: string
  blockDescription: string
}

function FeaturesBlockEditor({ block, onUpdate, blockName, blockDescription }: FeaturesBlockEditorProps) {
  const [features, setFeatures] = useState<FeatureItem[]>(() => {
    if (block.settings?.features && Array.isArray(block.settings.features)) {
      return block.settings.features
    }
    // Fallback to default features if settings is empty
    return [
      { title_uk: "Ручна робота", title_en: "Handmade", description_uk: "Кожен світильник створений вручну майстрами з багаторічним досвідом", description_en: "Each lamp is handcrafted by masters with years of experience" },
      { title_uk: "Екологічність", title_en: "Eco-friendly", description_uk: "Використовуємо лише натуральні та безпечні матеріали", description_en: "We use only natural and safe materials" },
      { title_uk: "Унікальний дизайн", title_en: "Unique Design", description_uk: "Авторські роботи, які неможливо знайти в масовому виробництві", description_en: "Original works that cannot be found in mass production" },
      { title_uk: "З любов'ю", title_en: "With Love", description_uk: "Вкладаємо душу в кожен виріб, створюючи атмосферу затишку", description_en: "We put our heart into every piece, creating a cozy atmosphere" }
    ]
  })

  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    const updated = [...features]
    updated[index] = { ...updated[index], [field]: value }
    setFeatures(updated)
    onUpdate(block.id, "settings", { features: updated })
  }

  const addFeature = () => {
    const newFeature: FeatureItem = { title_uk: "", title_en: "", description_uk: "", description_en: "" }
    const updated = [...features, newFeature]
    setFeatures(updated)
    onUpdate(block.id, "settings", { features: updated })
  }

  const removeFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index)
    setFeatures(updated)
    onUpdate(block.id, "settings", { features: updated })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{blockName}</CardTitle>
        <CardDescription>{blockDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor={`${block.id}-title_uk`}>Заголовок секції (UA)</Label>
            <Input
              id={`${block.id}-title_uk`}
              value={block.title_uk || ""}
              onChange={(e) => onUpdate(block.id, "title_uk", e.target.value)}
              placeholder="Чому обирають нас"
            />
          </div>
          <div>
            <Label htmlFor={`${block.id}-title_en`}>Section Title (EN)</Label>
            <Input
              id={`${block.id}-title_en`}
              value={block.title_en || ""}
              onChange={(e) => onUpdate(block.id, "title_en", e.target.value)}
              placeholder="Why Choose Us"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Особливості</Label>
            <Button type="button" variant="outline" size="sm" onClick={addFeature}>
              + Додати особливість
            </Button>
          </div>

          {features.map((feature, index) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold">Особливість {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    className="text-destructive"
                  >
                    Видалити
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`feature-${index}-title-uk`}>Заголовок (UA)</Label>
                    <Input
                      id={`feature-${index}-title-uk`}
                      value={feature.title_uk}
                      onChange={(e) => updateFeature(index, "title_uk", e.target.value)}
                      placeholder="Ручна робота"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`feature-${index}-title-en`}>Title (EN)</Label>
                    <Input
                      id={`feature-${index}-title-en`}
                      value={feature.title_en}
                      onChange={(e) => updateFeature(index, "title_en", e.target.value)}
                      placeholder="Handmade"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div>
                    <Label htmlFor={`feature-${index}-desc-uk`}>Опис (UA)</Label>
                    <Textarea
                      id={`feature-${index}-desc-uk`}
                      value={feature.description_uk}
                      onChange={(e) => updateFeature(index, "description_uk", e.target.value)}
                      rows={3}
                      placeholder="Кожен світильник створений вручну..."
                    />
                  </div>
                  <div>
                    <Label htmlFor={`feature-${index}-desc-en`}>Description (EN)</Label>
                    <Textarea
                      id={`feature-${index}-desc-en`}
                      value={feature.description_en}
                      onChange={(e) => updateFeature(index, "description_en", e.target.value)}
                      rows={3}
                      placeholder="Each lamp is handcrafted..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface CustomBlockEditorProps {
  block: ContentBlock
  onUpdate: (id: string, field: string, value: any) => void
  blockName: string
  blockDescription: string
}

interface AdditionalInfoBlockEditorProps {
  block: ContentBlock
  onUpdate: (id: string, field: string, value: any) => void
  blockName: string
  blockDescription: string
}

function AdditionalInfoBlockEditor({ block, onUpdate, blockName, blockDescription }: AdditionalInfoBlockEditorProps) {
  const [enabled, setEnabled] = useState<boolean>(block.settings?.enabled ?? false)
  const [titleUk, setTitleUk] = useState<string>(block.title_uk || "")
  const [titleEn, setTitleEn] = useState<string>(block.title_en || "")
  const [contentUk, setContentUk] = useState<string>(block.content_uk || "")
  const [contentEn, setContentEn] = useState<string>(block.content_en || "")

  // Sync state when block props change (e.g., after save)
  useEffect(() => {
    if (block.settings?.enabled !== undefined) {
      setEnabled(block.settings.enabled)
    }
    if (block.title_uk !== undefined) setTitleUk(block.title_uk || "")
    if (block.title_en !== undefined) setTitleEn(block.title_en || "")
    if (block.content_uk !== undefined) setContentUk(block.content_uk || "")
    if (block.content_en !== undefined) setContentEn(block.content_en || "")
  }, [block.id, block.settings?.enabled, block.title_uk, block.title_en, block.content_uk, block.content_en])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{blockName}</CardTitle>
        <CardDescription>{blockDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Відображення блоку</Label>
            <p className="text-xs text-muted-foreground">Увімкнути/вимкнути відображення розділу "Додаткова інформація" на сторінці товару</p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => {
              setEnabled(checked)
              const newSettings = {
                ...(block.settings || {}),
                enabled: checked,
              }
              onUpdate(block.id, "settings", newSettings)
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor={`${block.id}-title_uk`}>Заголовок (UA)</Label>
            <Input
              id={`${block.id}-title_uk`}
              value={titleUk}
              onChange={(e) => {
                const value = e.target.value
                setTitleUk(value)
                onUpdate(block.id, "title_uk", value)
              }}
              placeholder="Додаткова інформація"
            />
          </div>
          <div>
            <Label htmlFor={`${block.id}-title_en`}>Title (EN)</Label>
            <Input
              id={`${block.id}-title_en`}
              value={titleEn}
              onChange={(e) => {
                const value = e.target.value
                setTitleEn(value)
                onUpdate(block.id, "title_en", value)
              }}
              placeholder="Additional Information"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor={`${block.id}-content_uk`}>Текст (UA)</Label>
            <SimpleHtmlEditor
              id={`${block.id}-content_uk`}
              value={contentUk}
              onChange={(value) => {
                setContentUk(value)
                onUpdate(block.id, "content_uk", value)
              }}
              rows={6}
              placeholder="Додаткова інформація про товар"
            />
          </div>
          <div>
            <Label htmlFor={`${block.id}-content_en`}>Content (EN)</Label>
            <SimpleHtmlEditor
              id={`${block.id}-content_en`}
              value={contentEn}
              onChange={(value) => {
                setContentEn(value)
                onUpdate(block.id, "content_en", value)
              }}
              rows={6}
              placeholder="Additional product information"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomBlockEditor({ block, onUpdate, blockName, blockDescription }: CustomBlockEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(block.images || [])
  const [column1Uk, setColumn1Uk] = useState<string>(block.settings?.column1_uk || "")
  const [column1En, setColumn1En] = useState<string>(block.settings?.column1_en || "")
  const [column2Uk, setColumn2Uk] = useState<string>(block.settings?.column2_uk || "")
  const [column2En, setColumn2En] = useState<string>(block.settings?.column2_en || "")
  const [signatureUk, setSignatureUk] = useState<string>(block.settings?.signature_uk || "")
  const [signatureEn, setSignatureEn] = useState<string>(block.settings?.signature_en || "")
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    const oldIndex = images.findIndex((_, i) => i.toString() === active.id)
    const newIndex = images.findIndex((_, i) => i.toString() === over.id)
    
    if (oldIndex === -1 || newIndex === -1) return
    
    const newImages = arrayMove(images, oldIndex, newIndex)
    setImages(newImages)
    onUpdate(block.id, "images", newImages)
  }

  const setMainImage = (index: number) => {
    if (index === 0) return // Already main
    
    const newImages = [images[index], ...images.filter((_, i) => i !== index)]
    setImages(newImages)
    onUpdate(block.id, "images", newImages)
  }

  const updateSettings = (field?: string, value?: string) => {
    const newSettings = {
      ...(block.settings || {}),
      column1_uk: column1Uk,
      column1_en: column1En,
      column2_uk: column2Uk,
      column2_en: column2En,
      signature_uk: signatureUk,
      signature_en: signatureEn,
    }
    if (field && value !== undefined) {
      newSettings[field] = value
    }
    onUpdate(block.id, "settings", newSettings)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 6) {
      alert("Максимум 6 зображень")
      return
    }

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        if (!file.type.startsWith('image/')) {
          alert(`${file.name}: не є зображенням`)
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name}: розмір файлу перевищує 5MB`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `custom-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `content-blocks/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          alert(`${file.name}: ${uploadError.message}`)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      const updatedImages = [...images, ...uploadedUrls]
      setImages(updatedImages)
      onUpdate(block.id, "images", updatedImages)
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Помилка при завантаженні зображень')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index]
    
    // Delete from storage if it's a Supabase URL
    if (imageUrl && imageUrl.includes('supabase.co/storage')) {
      try {
        const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/product-images\/(.+)$/)
        if (pathMatch) {
          const pathPart = pathMatch[1]
          const { error } = await supabase.storage.from('product-images').remove([pathPart])
          if (error) {
            console.error('Error deleting image from storage:', error)
          }
        }
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }

    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onUpdate(block.id, "images", updatedImages)
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>{blockName}</CardTitle>
        <CardDescription>{blockDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor={`${block.id}-title_uk`}>Заголовок блоку (UA)</Label>
            <Input
              id={`${block.id}-title_uk`}
              value={block.title_uk || ""}
              onChange={(e) => onUpdate(block.id, "title_uk", e.target.value)}
              placeholder="Кастом"
            />
          </div>
          <div>
            <Label htmlFor={`${block.id}-title_en`}>Block Title (EN)</Label>
            <Input
              id={`${block.id}-title_en`}
              value={block.title_en || ""}
              onChange={(e) => onUpdate(block.id, "title_en", e.target.value)}
              placeholder="Custom"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-4 block">Колонка 1 (ліва)</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor={`${block.id}-column1_uk`}>Текст колонки 1 (UA)</Label>
                <Textarea
                  id={`${block.id}-column1_uk`}
                  value={column1Uk}
                  onChange={(e) => {
                    setColumn1Uk(e.target.value)
                  }}
                  onBlur={() => updateSettings()}
                  rows={6}
                  placeholder="Окрім наявних моделей в колекціях, ми створюємо світильники на замовлення..."
                />
                <p className="text-xs text-muted-foreground mt-1">Кожен параграф з нового рядка</p>
              </div>
              <div>
                <Label htmlFor={`${block.id}-column1_en`}>Column 1 Text (EN)</Label>
                <Textarea
                  id={`${block.id}-column1_en`}
                  value={column1En}
                  onChange={(e) => {
                    setColumn1En(e.target.value)
                  }}
                  onBlur={() => updateSettings()}
                  rows={6}
                  placeholder="In addition to existing models in collections, we create custom lamps..."
                />
                <p className="text-xs text-muted-foreground mt-1">Each paragraph on a new line</p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-4 block">Колонка 2 (права)</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor={`${block.id}-column2_uk`}>Текст колонки 2 (UA)</Label>
                <Textarea
                  id={`${block.id}-column2_uk`}
                  value={column2Uk}
                  onChange={(e) => {
                    setColumn2Uk(e.target.value)
                  }}
                  onBlur={() => updateSettings()}
                  rows={8}
                  placeholder="Ви можете обрати:&#10;- індивідуальні форми та розміри..."
                />
                <p className="text-xs text-muted-foreground mt-1">Для списку використовуйте дефіс (-) на початку рядка</p>
              </div>
              <div>
                <Label htmlFor={`${block.id}-column2_en`}>Column 2 Text (EN)</Label>
                <Textarea
                  id={`${block.id}-column2_en`}
                  value={column2En}
                  onChange={(e) => {
                    setColumn2En(e.target.value)
                  }}
                  onBlur={() => updateSettings()}
                  rows={8}
                  placeholder="You can choose:&#10;- individual forms and sizes..."
                />
                <p className="text-xs text-muted-foreground mt-1">For lists, use dash (-) at the start of line</p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-4 block">Підпис (під обома колонками)</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor={`${block.id}-signature_uk`}>Підпис (UA)</Label>
                <Input
                  id={`${block.id}-signature_uk`}
                  value={signatureUk}
                  onChange={(e) => {
                    setSignatureUk(e.target.value)
                  }}
                  onBlur={() => updateSettings()}
                  placeholder="Lucerna Studio - світло, створене спеціально для вас 🤍"
                />
              </div>
              <div>
                <Label htmlFor={`${block.id}-signature_en`}>Signature (EN)</Label>
                <Input
                  id={`${block.id}-signature_en`}
                  value={signatureEn}
                  onChange={(e) => {
                    setSignatureEn(e.target.value)
                  }}
                  onBlur={() => updateSettings()}
                  placeholder="Lucerna Studio - light created specifically for you 🤍"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Зображення (максимум 6)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{images.length}/6</span>
              <label>
                <Button type="button" variant="outline" size="sm" disabled={uploading || images.length >= 6} asChild>
                  <span className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Завантаження..." : "Завантажити"}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading || images.length >= 6}
                />
              </label>
            </div>
          </div>

          {images.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map((_, i) => i.toString())}
                strategy={undefined}
              >
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                  {images.map((imageUrl, index) => (
                    <SortableImageItem
                      key={index}
                      id={index.toString()}
                      url={imageUrl}
                      index={index}
                      isMain={index === 0}
                      onRemove={() => handleRemoveImage(index)}
                      onSetMain={() => setMainImage(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface SortableImageItemProps {
  id: string
  url: string
  index: number
  isMain: boolean
  onRemove: () => void
  onSetMain: () => void
}

function SortableImageItem({
  id,
  url,
  index,
  isMain,
  onRemove,
  onSetMain,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-grab active:cursor-grabbing"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        onContextMenu={(e) => {
          e.preventDefault()
          if (!isMain) {
            onSetMain()
          }
        }}
      />
      
      <div className="relative aspect-square overflow-hidden rounded-md border-2 bg-muted/30 pointer-events-none">
        {isMain && (
          <div className="absolute top-1 left-1 z-20 bg-[#D4834F] text-white rounded-full p-1 shadow-lg pointer-events-auto">
            <Star className="h-3 w-3 fill-current" />
          </div>
        )}
        <Image
          unoptimized
          src={url}
          alt={`Custom work ${index + 1}`}
          fill
          className="object-contain p-1"
          sizes="(max-width: 768px) 33vw, 16vw"
        />
        {isMain && (
          <div className="absolute inset-0 border-2 border-[#D4834F] rounded-md pointer-events-none" />
        )}
      </div>
      
      {isMain && (
        <div className="absolute -top-1 -left-1 z-20 bg-[#D4834F] text-white text-xs font-medium px-1.5 py-0.5 rounded-full shadow-md pointer-events-none">
          Головне
        </div>
      )}
      
      <div className="absolute top-1 right-1 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {!isMain && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-6 w-6 p-0 bg-[#D4834F] hover:bg-[#C17340] text-white pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onSetMain()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Зробити головним"
          >
            <Star className="h-3 w-3" />
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-6 w-6 p-0 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onRemove()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Видалити"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="absolute bottom-1 left-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}

export function SettingsForm({ contentBlocks }: { contentBlocks: ContentBlock[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration mismatch by initializing state after mount
  useEffect(() => {
    setIsMounted(true)
    // Filter out duplicates - keep only the newest block of each type (by created_at or id)
    const uniqueBlocksMap = new Map<string, ContentBlock>()
    contentBlocks.forEach((block) => {
      const existing = uniqueBlocksMap.get(block.type)
      if (!existing) {
        uniqueBlocksMap.set(block.type, block)
      } else {
        // Compare by created_at if available, otherwise by id
        const blockDate = block.created_at ? new Date(block.created_at).getTime() : 0
        const existingDate = existing.created_at ? new Date(existing.created_at).getTime() : 0
        if (blockDate > existingDate || (blockDate === existingDate && block.id > existing.id)) {
          uniqueBlocksMap.set(block.type, block)
        }
      }
    })
    const uniqueBlocks = Array.from(uniqueBlocksMap.values())
    setBlocks(uniqueBlocks)
  }, [contentBlocks])

  const handleUpdateBlock = (id: string, field: string, value: any) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, [field]: value } : block)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    // Update all blocks
    for (const block of blocks) {
      const updateData: any = {
        title_uk: block.title_uk,
        title_en: block.title_en,
        content_uk: block.content_uk,
        content_en: block.content_en,
      }
      
      // For features block, also update settings
      if (block.type === "features" && block.settings) {
        updateData.settings = block.settings
      }
      
      // For custom block, also update images and settings
      if (block.type === "custom") {
        updateData.images = block.images || []
        if (block.settings) {
          updateData.settings = block.settings
        }
      }
      
      // For additional_info block, also update settings and sync is_active
      if (block.type === "additional_info") {
        if (block.settings) {
          updateData.settings = block.settings
        }
        // Sync is_active with settings.enabled
        if (block.settings?.enabled !== undefined) {
          updateData.is_active = block.settings.enabled
        }
      }
      
      const { error } = await supabase
        .from("content_blocks")
        .update(updateData)
        .eq("id", block.id)

      if (error) {
        const blockTypeNames: Record<string, string> = {
          hero: "Головна сторінка: Головний банер",
          features: "Головна сторінка: Особливості",
          about: "Головна сторінка: Про Lucerna Studio",
          about_page: "Сторінка 'Про нас': Контент",
          custom: "Головна сторінка: Кастом"
        }
        const blockName = blockTypeNames[block.type] || block.type
        alert(`Помилка при оновленні блоку ${blockName}`)
        setLoading(false)
        return
      }
    }

    alert("Налаштування успішно збережено!")
    router.refresh()
    setLoading(false)
  }

  const blockTypeNames: Record<string, string> = {
    hero: "Головна сторінка: Головний банер",
    features: "Головна сторінка: Особливості",
    about: "Головна сторінка: Про Lucerna Studio",
    about_page: "Сторінка 'Про нас': Контент",
    custom: "Головна сторінка: Кастом",
    additional_info: "Товари: Додаткова інформація"
  }

  const blockDescriptions: Record<string, string> = {
    hero: "Великий банер з заголовком та текстом на початку головної сторінки",
    features: "Блок з особливостями/перевагами товарів або сервісу",
    about: "Секція з описом про Lucerna Studio та текст, що відображається на головній сторінці",
    about_page: "Контент для сторінки 'Про нас' - заголовок та текст з HTML форматуванням",
    custom: "Блок про кастомні світильники з галереєю з 6 фото",
    additional_info: "Розділ з додатковою інформацією, що відображається на сторінці товару та в модалці після коментаря"
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Завантаження налаштувань...</div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {blocks
        .filter((block) => !["testimonials", "cta", "gallery"].includes(block.type))
        .map((block) => {
        const blockName = blockTypeNames[block.type] || block.type
        const blockDescription = blockDescriptions[block.type] || "Редагування контенту для цього блоку"
        
        // Special handling for features block
        if (block.type === "features") {
          return <FeaturesBlockEditor key={block.id} block={block} onUpdate={handleUpdateBlock} blockName={blockName} blockDescription={blockDescription} />
        }
        
        // Special handling for custom block
        if (block.type === "custom") {
          return <CustomBlockEditor key={block.id} block={block} onUpdate={handleUpdateBlock} blockName={blockName} blockDescription={blockDescription} />
        }
        
        // Special handling for additional_info block
        if (block.type === "additional_info") {
          return <AdditionalInfoBlockEditor key={block.id} block={block} onUpdate={handleUpdateBlock} blockName={blockName} blockDescription={blockDescription} />
        }
        
        return (
        <Card key={block.id}>
          <CardHeader>
            <CardTitle>{blockName}</CardTitle>
            <CardDescription>{blockDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor={`${block.id}-title_uk`}>Заголовок (UA)</Label>
                <Input
                  id={`${block.id}-title_uk`}
                  value={block.title_uk || ""}
                  onChange={(e) => handleUpdateBlock(block.id, "title_uk", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`${block.id}-title_en`}>Title (EN)</Label>
                <Input
                  id={`${block.id}-title_en`}
                  value={block.title_en}
                  onChange={(e) => handleUpdateBlock(block.id, "title_en", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor={`${block.id}-content_uk`}>Контент (UA)</Label>
                <Textarea
                  id={`${block.id}-content_uk`}
                  value={block.content_uk || ""}
                  onChange={(e) => handleUpdateBlock(block.id, "content_uk", e.target.value)}
                  rows={block.type === "about" || block.type === "about_page" ? 8 : 4}
                  placeholder={block.type === "about_page" ? "Використовуйте HTML теги для форматування (h2, p, strong, em, ul, ol, li)" : ""}
                />
              </div>
              <div>
                <Label htmlFor={`${block.id}-content_en`}>Content (EN)</Label>
                <Textarea
                  id={`${block.id}-content_en`}
                  value={block.content_en}
                  onChange={(e) => handleUpdateBlock(block.id, "content_en", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        )
      })}

      <Button type="submit" disabled={loading} className="bg-[#D4834F] hover:bg-[#C17340]">
        {loading ? "Збереження..." : "Зберегти налаштування"}
      </Button>
    </form>
  )
}
