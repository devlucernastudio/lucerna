"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"
import { Asterisk, DollarSign } from "lucide-react"

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
    position?: number | null
    name_uk: string
    name_en: string
  }>
  detailedPriceCombinations?: Array<{
    id: string
    is_available: boolean
    combination: any
    price: number
  }>
  downloadableFiles?: Array<{
    downloadable_file_id: string
    show_file: boolean
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

export function ProductsTableExtended({ 
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
  const [editedProducts, setEditedProducts] = useState<Record<string, Partial<Product>>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({})

  const getProductData = (productId: string): Partial<Product> => {
    const product = products.find(p => p.id === productId)
    if (!product) return {}
    const edited = editedProducts[productId]
    if (!edited) return product
    // Merge edited data with original, preserving characteristics order
    return {
      ...product,
      ...edited,
      // Preserve original characteristics order if not explicitly updated
      characteristics: edited.characteristics || product.characteristics
    }
  }

  const updateProductField = (productId: string, field: keyof Product, value: any) => {
    setEditedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        ...getProductData(productId),
        [field]: value,
      }
    }))
  }

  // Check if product has unsaved changes
  const hasChanges = (productId: string): boolean => {
    const product = products.find(p => p.id === productId)
    if (!product) return false
    const edited = editedProducts[productId]
    if (!edited) return false
    
    return (
      (edited.name_uk !== undefined && edited.name_uk !== product.name_uk) ||
      (edited.name_en !== undefined && edited.name_en !== product.name_en) ||
      (edited.slug !== undefined && edited.slug !== product.slug) ||
      (edited.price !== undefined && edited.price !== product.price) ||
      (edited.is_featured !== undefined && edited.is_featured !== product.is_featured) ||
      (edited.is_active !== undefined && edited.is_active !== product.is_active) ||
      (edited.is_in_stock !== undefined && edited.is_in_stock !== product.is_in_stock)
    )
  }

  const handleSave = async (productId: string) => {
    setSaving(productId)
    const supabase = createClient()
    const productData = editedProducts[productId]
    const originalProduct = products.find(p => p.id === productId)
    
    if (!originalProduct || !productData) {
      setSaving(null)
      return
    }

    try {
      const updateData: any = {}
      
      if (productData.name_uk !== undefined) updateData.name_uk = productData.name_uk
      if (productData.name_en !== undefined) updateData.name_en = productData.name_en
      if (productData.slug !== undefined) updateData.slug = productData.slug
      if (productData.price !== undefined) updateData.price = productData.price
      if (productData.is_featured !== undefined) updateData.is_featured = productData.is_featured
      if (productData.is_active !== undefined) updateData.is_active = productData.is_active
      if (productData.is_in_stock !== undefined) updateData.is_in_stock = productData.is_in_stock

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId)

      if (error) throw error

      // Update price combinations if is_in_stock changed
      if (productData.is_in_stock !== undefined && originalProduct.detailedPriceCombinations && originalProduct.detailedPriceCombinations.length > 0) {
        const { error: pcError } = await supabase
          .from("product_characteristic_price_combinations")
          .update({ is_available: productData.is_in_stock })
          .eq("product_id", productId)

        if (pcError) {
          console.error("Error updating price combinations:", pcError)
        }
      }

      showToast.success("Товар успішно оновлено")
      setEditedProducts(prev => {
        const newState = { ...prev }
        delete newState[productId]
        return newState
      })
      router.refresh()
    } catch (error: any) {
      showToast.error(`Помилка: ${error.message}`)
    } finally {
      setSaving(null)
    }
  }


  const getMainImage = (product: Product) => {
    return product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"
  }

  // Helper function to get characteristic name by ID
  const getCharacteristicName = (characteristicTypeId: string): string => {
    const charType = characteristicTypes.find(ct => ct.id === characteristicTypeId)
    return charType ? charType.name_uk : characteristicTypeId
  }

  // Helper function to get option name by ID
  const getOptionName = (optionId: string | number, characteristicTypeId?: string): string => {
    const optionIdStr = String(optionId)
    
    // First try to find by ID (exact match)
    const optionById = characteristicOptions.find(co => co.id === optionIdStr)
    if (optionById) {
      return optionById.name_uk || optionById.value || optionIdStr
    }
    
    // If not found and we have characteristicTypeId, try to find by value or name
    if (characteristicTypeId) {
      // Try to find by value
      const optionByValue = characteristicOptions.find(
        co => co.characteristic_type_id === characteristicTypeId && 
        co.value === optionIdStr
      )
      if (optionByValue) {
        return optionByValue.name_uk || optionByValue.value || optionIdStr
      }
      
      // Try to find by name_uk
      const optionByName = characteristicOptions.find(
        co => co.characteristic_type_id === characteristicTypeId && 
        co.name_uk === optionIdStr
      )
      if (optionByName) {
        return optionByName.name_uk || optionByName.value || optionIdStr
      }
      
      // Try to find by name_en
      const optionByNameEn = characteristicOptions.find(
        co => co.characteristic_type_id === characteristicTypeId && 
        co.name_en === optionIdStr
      )
      if (optionByNameEn) {
        return optionByNameEn.name_uk || optionByNameEn.value || optionIdStr
      }
    }
    
    // If still not found, it might be a direct text value (for text type characteristics)
    // Return it as-is, but truncate if too long
    if (optionIdStr.length > 50) {
      return optionIdStr.substring(0, 47) + '...'
    }
    return optionIdStr
  }

  // Helper function to format combination for display
  const formatCombination = (combination: any): string => {
    if (!combination) {
      return ''
    }
    
    // Handle array format
    if (Array.isArray(combination)) {
      return combination.map(item => {
        if (typeof item === 'object' && item !== null) {
          return formatCombination(item)
        }
        return String(item)
      }).join(", ")
    }
    
    // Handle object format
    if (typeof combination === 'object') {
      return Object.entries(combination)
        .map(([charTypeId, optionValue]) => {
          const charName = getCharacteristicName(charTypeId)
          // optionValue might be an ID, a value string, or an object
          let optionName: string
          
          if (typeof optionValue === 'object' && optionValue !== null) {
            // If it's an object, try to extract value or name
            optionName = (optionValue as any).name_uk || 
                        (optionValue as any).value || 
                        (optionValue as any).id || 
                        JSON.stringify(optionValue)
          } else {
            // Try to find option by ID or value
            optionName = getOptionName(
              typeof optionValue === 'string' || typeof optionValue === 'number' 
                ? optionValue 
                : String(optionValue), 
              charTypeId
            )
          }
          
          return `${charName}: ${optionName}`
        })
        .join(", ")
    }
    
    // Fallback for primitive values
    return String(combination)
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="min-w-[1200px] md:min-w-0">
            <table className="w-full">
            <thead className="border-b border-border bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="p-2 md:p-3 text-left text-xs font-medium text-foreground bg-muted/50 min-w-[60px]">Зображення</th>
                <th className="p-2 md:p-3 text-left text-xs font-medium text-foreground bg-muted/50 min-w-[200px]">Назва</th>
                <th className="p-2 md:p-3 text-left text-xs font-medium text-foreground bg-muted/50 min-w-[150px]">Ціна / Слаг</th>
                <th className="p-2 md:p-3 text-left text-xs font-medium text-foreground bg-muted/50 min-w-[200px]">Наявність</th>
                <th className="p-2 md:p-3 text-left text-xs font-medium text-foreground bg-muted/50 min-w-[250px]">Характеристики</th>
                <th className="p-2 md:p-3 text-left text-xs font-medium text-foreground bg-muted/50 min-w-[180px] max-w-[200px]">Файли</th>
                <th className="p-2 md:p-3 text-left text-xs font-medium text-foreground bg-muted/50 min-w-[100px]">Популярний</th>
                <th className="p-2 md:p-3 text-left text-xs font-medium text-foreground bg-muted/50 min-w-[100px]">Активний</th>
                <th className="p-2 md:p-3 text-right text-xs font-medium text-foreground bg-muted/50 min-w-[100px]">Дії</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const productData = getProductData(product.id)
                // Use updated characteristics if available, otherwise use original
                const currentCharacteristics = productData.characteristics || product.characteristics
                const hasPriceCombinations = product.detailedPriceCombinations && product.detailedPriceCombinations.length > 0
                const hasAvailable = hasPriceCombinations
                  ? product.detailedPriceCombinations!.some(pc => pc.is_available)
                  : productData.is_in_stock ?? product.is_in_stock ?? false
                const productHasChanges = hasChanges(product.id)

                return (
                  <tr 
                    key={product.id} 
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {/* Image */}
                    <td className="p-2 md:p-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="block">
                        <div className="relative h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded cursor-pointer hover:opacity-80 transition-opacity">
                          <Image
                            unoptimized
                            src={getMainImage(product)}
                            alt={product.name_uk}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                    </td>

                    {/* Name - Combined UK and EN */}
                    <td className="p-2 md:p-3 min-w-[200px]">
                      <div className="space-y-2">
                        <div>
                          <Label className="text-[10px] md:text-xs text-muted-foreground mb-1 block">Назва (UA)</Label>
                          <Input
                            value={productData.name_uk || product.name_uk}
                            onChange={(e) => updateProductField(product.id, "name_uk", e.target.value)}
                            className="h-7 md:h-8 text-[11px] md:text-xs w-full"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] md:text-xs text-muted-foreground mb-1 block">Назва (EN)</Label>
                          <Input
                            value={productData.name_en || product.name_en}
                            onChange={(e) => updateProductField(product.id, "name_en", e.target.value)}
                            className="h-7 md:h-8 text-[11px] md:text-xs w-full"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Price and Slug - Combined */}
                    <td className="p-2 md:p-3 min-w-[150px]">
                      <div className="space-y-2">
                        <div>
                          <Label className="text-[10px] md:text-xs text-muted-foreground mb-1 block">Ціна</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={productData.price !== undefined ? productData.price : product.price}
                            onChange={(e) => updateProductField(product.id, "price", parseFloat(e.target.value) || 0)}
                            className="h-7 md:h-8 text-[11px] md:text-xs w-full [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] md:text-xs text-muted-foreground mb-1 block">Слаг</Label>
                          <Input
                            value={productData.slug || product.slug}
                            onChange={(e) => updateProductField(product.id, "slug", e.target.value)}
                            className="h-7 md:h-8 text-[11px] md:text-xs w-full font-mono"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Availability */}
                    <td className="p-2 md:p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={hasAvailable}
                            onCheckedChange={async (checked) => {
                              const supabase = createClient()
                              const { error: productError } = await supabase
                                .from("products")
                                .update({ is_in_stock: checked })
                                .eq("id", product.id)
                              
                              if (productError) {
                                showToast.error(`Помилка: ${productError.message}`)
                                return
                              }
                              
                              // If has price combinations, update them too
                              if (hasPriceCombinations && product.detailedPriceCombinations) {
                                for (const pc of product.detailedPriceCombinations) {
                                  const { error: pcError } = await supabase
                                    .from("product_characteristic_price_combinations")
                                    .update({ is_available: checked })
                                    .eq("id", pc.id)
                                  
                                  if (pcError) {
                                    showToast.error(`Помилка оновлення комбінації: ${pcError.message}`)
                                    return
                                  }
                                }
                              }
                              
                              showToast.success("Наявність оновлено")
                              router.refresh()
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Label className="text-xs">{hasAvailable ? "В наявності" : "Немає"}</Label>
                        </div>
                        {hasPriceCombinations && (
                          <div className="text-xs text-muted-foreground mt-1 pl-6">
                            <div className="font-medium mb-1">Комбінації:</div>
                            <div className="space-y-2">
                              {product.detailedPriceCombinations!.map((pc, idx) => {
                                const combinationKey = `${product.id}-${pc.id}`
                                const editingPrice = editingPrices[combinationKey]
                                const currentPrice = editingPrice !== undefined ? editingPrice : pc.price
                                
                                return (
                                  <div key={pc.id || idx} className="flex items-center gap-2">
                                    <span className="text-xs leading-relaxed whitespace-nowrap">
                                      {formatCombination(pc.combination)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={currentPrice}
                                          onChange={(e) => {
                                            setEditingPrices(prev => ({
                                              ...prev,
                                              [combinationKey]: parseFloat(e.target.value) || 0
                                            }))
                                          }}
                                          onBlur={async () => {
                                            const priceToSave = editingPrices[combinationKey]
                                            if (priceToSave !== undefined && priceToSave !== pc.price) {
                                              const supabase = createClient()
                                              const { error } = await supabase
                                                .from("product_characteristic_price_combinations")
                                                .update({ price: priceToSave })
                                                .eq("id", pc.id)
                                              
                                              if (error) {
                                                showToast.error(`Помилка: ${error.message}`)
                                                setEditingPrices(prev => {
                                                  const newState = { ...prev }
                                                  delete newState[combinationKey]
                                                  return newState
                                                })
                                              } else {
                                                showToast.success("Ціну оновлено")
                                                setEditingPrices(prev => {
                                                  const newState = { ...prev }
                                                  delete newState[combinationKey]
                                                  return newState
                                                })
                                                router.refresh()
                                              }
                                            } else {
                                              setEditingPrices(prev => {
                                                const newState = { ...prev }
                                                delete newState[combinationKey]
                                                return newState
                                              })
                                            }
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="h-6 text-[10px] w-24 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        />
                                      <span className="text-[10px] text-muted-foreground">грн</span>
                                    </div>
                                    <Switch
                                      checked={pc.is_available}
                                      onCheckedChange={async (checked) => {
                                        const supabase = createClient()
                                        const { error } = await supabase
                                          .from("product_characteristic_price_combinations")
                                          .update({ is_available: checked })
                                          .eq("id", pc.id)
                                        
                                        if (error) {
                                          showToast.error(`Помилка: ${error.message}`)
                                        } else {
                                          showToast.success("Наявність оновлено")
                                          router.refresh()
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="scale-75 flex-shrink-0"
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Characteristics */}
                    <td className="p-2 md:p-3">
                      <div className="space-y-2">
                        {currentCharacteristics && currentCharacteristics.length > 0 ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="min-w-[100px]"></div>
                              <div className="grid grid-cols-2 gap-2 flex-1">
                                <div className="flex items-center justify-center">
                                  <Asterisk className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <div className="flex items-center justify-center">
                                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </div>
                            </div>
                            {currentCharacteristics.map((char) => (
                              <div key={`${product.id}-${char.characteristic_type_id}`} className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-foreground flex-shrink-0 min-w-[100px]">{char.name_uk}</span>
                                <div className="grid grid-cols-2 gap-2 flex-1">
                                  <div className="flex items-center justify-center">
                                    <Switch
                                      checked={char.required ?? false}
                                      onCheckedChange={async (checked) => {
                                        const supabase = createClient()
                                        const { error } = await supabase
                                          .from("product_characteristics")
                                          .update({ required: checked })
                                          .eq("product_id", product.id)
                                          .eq("characteristic_type_id", char.characteristic_type_id)
                                        
                                        if (error) {
                                          showToast.error(`Помилка: ${error.message}`)
                                        } else {
                                          showToast.success("Оновлено")
                                          // Update local state to reflect change immediately
                                          const currentChars = currentCharacteristics || product.characteristics || []
                                          const updatedCharacteristics = currentChars.map(c => 
                                            c.characteristic_type_id === char.characteristic_type_id
                                              ? { ...c, required: checked }
                                              : c
                                          )
                                          // Update the product in the local state
                                          setEditedProducts(prev => ({
                                            ...prev,
                                            [product.id]: {
                                              ...prev[product.id],
                                              ...getProductData(product.id),
                                              characteristics: updatedCharacteristics
                                            }
                                          }))
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="scale-75 flex-shrink-0"
                                    />
                                  </div>
                                  <div className="flex items-center justify-center">
                                    <Switch
                                      checked={char.affects_price ?? false}
                                      onCheckedChange={async (checked) => {
                                        const supabase = createClient()
                                        const { error } = await supabase
                                          .from("product_characteristics")
                                          .update({ affects_price: checked })
                                          .eq("product_id", product.id)
                                          .eq("characteristic_type_id", char.characteristic_type_id)
                                        
                                        if (error) {
                                          showToast.error(`Помилка: ${error.message}`)
                                        } else {
                                          showToast.success("Оновлено")
                                          // Update local state to reflect change immediately
                                          const currentChars = currentCharacteristics || product.characteristics || []
                                          const updatedCharacteristics = currentChars.map(c => 
                                            c.characteristic_type_id === char.characteristic_type_id
                                              ? { ...c, affects_price: checked }
                                              : c
                                          )
                                          // Update the product in the local state
                                          setEditedProducts(prev => ({
                                            ...prev,
                                            [product.id]: {
                                              ...prev[product.id],
                                              ...getProductData(product.id),
                                              characteristics: updatedCharacteristics
                                            }
                                          }))
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="scale-75 flex-shrink-0"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>

                    {/* Downloadable Files */}
                    <td className="p-2 md:p-3">
                      <div className="space-y-2">
                        {product.downloadableFiles && product.downloadableFiles.length > 0 ? (
                          product.downloadableFiles.map((file) => {
                            const fileInfo = downloadableFiles.find(df => df.id === file.downloadable_file_id)
                            const fileTitle = fileInfo ? (fileInfo.title_uk || fileInfo.title_en) : ""
                            return (
                              <div key={file.downloadable_file_id} className="flex items-center gap-2">
                                <Switch
                                  checked={file.show_file}
                                  onCheckedChange={async (checked) => {
                                    const supabase = createClient()
                                    const { error } = await supabase
                                      .from("product_downloadable_files")
                                      .update({ show_file: checked })
                                      .eq("product_id", product.id)
                                      .eq("downloadable_file_id", file.downloadable_file_id)
                                    
                                    if (error) {
                                      showToast.error(`Помилка: ${error.message}`)
                                    } else {
                                      showToast.success("Оновлено")
                                      router.refresh()
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="scale-75 flex-shrink-0"
                                />
                                <Label 
                                  className="text-xs text-muted-foreground truncate max-w-[120px]" 
                                  title={fileTitle}
                                >
                                  {fileTitle || "—"}
                                </Label>
                              </div>
                            )
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>

                    {/* Featured */}
                    <td className="p-2 md:p-3">
                      <Switch
                        checked={productData.is_featured !== undefined ? productData.is_featured : product.is_featured}
                        onCheckedChange={async (checked) => {
                          const supabase = createClient()
                          const { error } = await supabase
                            .from("products")
                            .update({ is_featured: checked })
                            .eq("id", product.id)
                          
                          if (error) {
                            showToast.error(`Помилка: ${error.message}`)
                          } else {
                            showToast.success("Оновлено")
                            router.refresh()
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>

                    {/* Active */}
                    <td className="p-2 md:p-3">
                      <Switch
                        checked={productData.is_active !== undefined ? productData.is_active : product.is_active}
                        onCheckedChange={async (checked) => {
                          const supabase = createClient()
                          const { error } = await supabase
                            .from("products")
                            .update({ is_active: checked })
                            .eq("id", product.id)
                          
                          if (error) {
                            showToast.error(`Помилка: ${error.message}`)
                          } else {
                            showToast.success("Оновлено")
                            router.refresh()
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>

                    {/* Actions */}
                    <td className="p-2 md:p-3">
                      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSave(product.id)}
                          disabled={saving === product.id || !productHasChanges}
                          className="h-7 md:h-8 text-[11px] md:text-xs px-2 md:px-3"
                        >
                          {saving === product.id ? "..." : "Зберегти"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

