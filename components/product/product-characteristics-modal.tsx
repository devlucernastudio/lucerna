"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useCart } from "@/lib/cart-context"
import { showToast } from "@/lib/toast"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import type { CharacteristicInputType } from "@/lib/types/characteristics"
import { CaparolPaletteModal } from "./caparol-palette-modal"

interface CharacteristicType {
  id: string
  name_uk: string
  name_en: string
  input_type: CharacteristicInputType
  required: boolean
  affects_price: boolean
}

interface CharacteristicOption {
  id: string
  characteristic_type_id: string
  name_uk: string | null
  name_en: string | null
  value: string
  color_code: string | null
}

interface ProductCharacteristic {
  id: string
  characteristic_type_id: string
  required: boolean | null
  affects_price: boolean | null
  selected_values?: any // JSONB: for text type, stores string value
}

interface PriceCombination {
  id: string
  combination: Record<string, string>
  price: number
  is_available: boolean
}

interface ProductCharacteristicsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: {
    id: string
    name_uk: string
    name_en: string
    slug: string
    price: number
    images?: string[] | Array<{ url: string; id?: string }>
  }
  productCharacteristics: ProductCharacteristic[]
  characteristicTypes: CharacteristicType[]
  characteristicOptions: CharacteristicOption[]
  priceCombinations: PriceCombination[]
}

export function ProductCharacteristicsModal({
  open,
  onOpenChange,
  product,
  productCharacteristics,
  characteristicTypes,
  characteristicOptions,
  priceCombinations,
}: ProductCharacteristicsModalProps) {
  const { addToCart } = useCart()
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)
  const [selectedValues, setSelectedValues] = useState<Record<string, string | string[]>>({})
  const [textValues, setTextValues] = useState<Record<string, string>>({})
  const [colorPaletteValues, setColorPaletteValues] = useState<Record<string, { id: string; name: string; hex: string }>>({})
  const [paletteModalOpen, setPaletteModalOpen] = useState<Record<string, boolean>>({})
  const [quantity, setQuantity] = useState(1)
  const [comment, setComment] = useState("")

  // Initialize text values from productCharacteristics selected_values (for text type)
  useEffect(() => {
    const textValuesMap: Record<string, string> = {}
    productCharacteristics.forEach((pc: any) => {
      const charType = characteristicTypes.find((ct) => ct.id === pc.characteristic_type_id)
      if (charType?.input_type === "text" && pc.selected_values) {
        textValuesMap[pc.characteristic_type_id] = pc.selected_values as string
      }
    })
    setTextValues(textValuesMap)
  }, [productCharacteristics, characteristicTypes])

  // Get characteristics with their types and filtered options based on price combinations
  const characteristics = useMemo(() => {
    const getAvailableOptions = (charTypeId: string, inputType: CharacteristicInputType, affectsPrice: boolean) => {
      // For color_palette type, there are no options in DB - colors come from JSON file
      if (inputType === "color_palette") {
        return [] // Return empty array - options are handled via modal
      }
      if (!affectsPrice) {
        return characteristicOptions.filter(
          (co) => co.characteristic_type_id === charTypeId
        )
      }

      if (priceCombinations.length === 0) {
        return characteristicOptions.filter(
          (co) => co.characteristic_type_id === charTypeId
        )
      }

      const appearsInCombinations = priceCombinations.some((pc) => 
        pc.combination[charTypeId] !== undefined
      )

      if (!appearsInCombinations) {
        return characteristicOptions.filter(
          (co) => co.characteristic_type_id === charTypeId
        )
      }

      const availableOptionIds = new Set<string>()
      const hasAnySelection = Object.keys(selectedValues).length > 0 || Object.keys(textValues).length > 0 || Object.keys(colorPaletteValues).length > 0
      
      priceCombinations.forEach((pc) => {
        if (!hasAnySelection) {
          if (pc.combination[charTypeId]) {
            availableOptionIds.add(pc.combination[charTypeId])
          }
        } else {
          let matchesCurrentSelections = true
          
          Object.keys(pc.combination).forEach((key) => {
            if (key === charTypeId) return
            
            const currentValue = selectedValues[key] || textValues[key] || (colorPaletteValues[key] ? colorPaletteValues[key].id : null)
            const combinationValue = pc.combination[key]
            
            if (currentValue) {
              if (Array.isArray(currentValue)) {
                if (!currentValue.includes(combinationValue)) {
                  matchesCurrentSelections = false
                }
              } else {
                if (currentValue !== combinationValue) {
                  matchesCurrentSelections = false
                }
              }
            }
          })
          
          if (matchesCurrentSelections && pc.combination[charTypeId]) {
            availableOptionIds.add(pc.combination[charTypeId])
          }
        }
      })
      
      if (availableOptionIds.size === 0) {
        return characteristicOptions.filter(
          (co) => co.characteristic_type_id === charTypeId
        )
      }
      
      return characteristicOptions.filter(
        (co) => co.characteristic_type_id === charTypeId && availableOptionIds.has(co.id)
      )
    }

    return productCharacteristics.map((pc) => {
      const charType = characteristicTypes.find((ct) => ct.id === pc.characteristic_type_id)
      if (!charType) return null

      const affectsPrice = pc.affects_price ?? charType.affects_price ?? false
      // For color_palette, pass the input_type to return empty array
      const options = getAvailableOptions(pc.characteristic_type_id, charType.input_type, affectsPrice)

      return {
        ...pc,
        characteristic_type: charType,
        options,
      }
    }).filter(Boolean) as Array<
      ProductCharacteristic & {
        characteristic_type: CharacteristicType
        options: CharacteristicOption[]
      }
    >
  }, [productCharacteristics, characteristicTypes, characteristicOptions, priceCombinations, selectedValues, textValues, colorPaletteValues])

  // Calculate current price
  const { currentPrice, showFromPrice } = useMemo(() => {
    const priceAffectingChars = characteristics.filter((pc) => {
      const charType = characteristicTypes.find(ct => ct.id === pc.characteristic_type_id);
      const affectsPrice = pc.affects_price ?? charType?.affects_price;
      return affectsPrice === true && charType?.input_type !== "text"; // Exclude text type from price affecting
    })

    if (priceAffectingChars.length === 0) {
      return { currentPrice: product.price, showFromPrice: false }
    }

    const combination: Record<string, string> = {}
    let hasAnySelection = false
    priceAffectingChars.forEach((pc) => {
      const value = selectedValues[pc.characteristic_type_id]
      if (value) {
        hasAnySelection = true
        if (Array.isArray(value)) {
          combination[pc.characteristic_type_id] = value[0]
        } else {
          combination[pc.characteristic_type_id] = value
        }
      } else if (textValues[pc.characteristic_type_id]) {
        hasAnySelection = true
        combination[pc.characteristic_type_id] = textValues[pc.characteristic_type_id]
      } else if (pc.characteristic_type.input_type === "color_palette" && colorPaletteValues[pc.characteristic_type_id]) {
        hasAnySelection = true
        combination[pc.characteristic_type_id] = colorPaletteValues[pc.characteristic_type_id].id
      }
    })

    if (!hasAnySelection) {
      const allPrices = [
        product.price,
        ...priceCombinations
          .filter(pc => pc.is_available)
          .map(pc => pc.price)
      ]
      const minPrice = Math.min(...allPrices)
      return { currentPrice: minPrice, showFromPrice: true }
    }

    const matchingCombination = priceCombinations.find((pc) => {
      const pcKeys = Object.keys(pc.combination).sort()
      const comboKeys = Object.keys(combination).sort()

      if (pcKeys.length !== comboKeys.length) return false

      return pcKeys.every((key) => pc.combination[key] === combination[key])
    })

    if (matchingCombination && matchingCombination.is_available) {
      return { currentPrice: matchingCombination.price, showFromPrice: false }
    }

    return { currentPrice: product.price, showFromPrice: false }
  }, [product.price, characteristics, selectedValues, textValues, colorPaletteValues, priceCombinations])

  // Validate required characteristics
  const validationErrors = useMemo(() => {
    const errors: string[] = []
    characteristics.forEach((pc) => {
      const required = pc.required ?? pc.characteristic_type.required
      if (required) {
        const value = selectedValues[pc.characteristic_type_id]
        const textValue = textValues[pc.characteristic_type_id]
        const paletteValue = colorPaletteValues[pc.characteristic_type_id]

        if (
          pc.characteristic_type.input_type === "color_palette" &&
          !paletteValue
        ) {
          errors.push(locale === "uk" ? pc.characteristic_type.name_uk : pc.characteristic_type.name_en)
        } else if (
          !value &&
          !textValue &&
          pc.characteristic_type.input_type !== "text" &&
          pc.characteristic_type.input_type !== "color_palette"
        ) {
          errors.push(locale === "uk" ? pc.characteristic_type.name_uk : pc.characteristic_type.name_en)
        } else if (
          pc.characteristic_type.input_type === "text" &&
          !textValue?.trim()
        ) {
          errors.push(locale === "uk" ? pc.characteristic_type.name_uk : pc.characteristic_type.name_en)
        }
      }
    })
    return errors
  }, [characteristics, selectedValues, textValues, colorPaletteValues])

  const handleSelectChange = (charTypeId: string, value: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [charTypeId]: value,
    }))
  }

  const handleCheckboxChange = (charTypeId: string, optionId: string, checked: boolean) => {
    setSelectedValues((prev) => {
      const current = (prev[charTypeId] as string[]) || []
      if (checked) {
        return { ...prev, [charTypeId]: [...current, optionId] }
      } else {
        return { ...prev, [charTypeId]: current.filter((id) => id !== optionId) }
      }
    })
  }

  const handleTextChange = (charTypeId: string, value: string) => {
    setTextValues((prev) => ({
      ...prev,
      [charTypeId]: value,
    }))
  }

  const handlePaletteColorSelect = (charTypeId: string, color: { id: string; name: string; hex: string }) => {
    setColorPaletteValues((prev) => ({
      ...prev,
      [charTypeId]: color,
    }))
    // Also store in selectedValues for price combination matching
    setSelectedValues((prev) => ({
      ...prev,
      [charTypeId]: color.id,
    }))
  }

  const handleAddToCart = () => {
    if (validationErrors.length > 0) {
      return
    }

    let productImage = ""
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0]
      productImage = typeof firstImage === "string" ? firstImage : firstImage.url
    }

    const selectedCharacteristicsNormalized: Record<string, string> = {}
    characteristics.forEach((pc) => {
      const charType = pc.characteristic_type
      const value = selectedValues[pc.characteristic_type_id]
      const textValue = textValues[pc.characteristic_type_id]
      const paletteValue = colorPaletteValues[pc.characteristic_type_id]

      if (charType.input_type === "color_palette" && paletteValue) {
        selectedCharacteristicsNormalized[pc.characteristic_type_id] = paletteValue.id
      } else if (charType.input_type === "text" && textValue) {
        selectedCharacteristicsNormalized[pc.characteristic_type_id] = textValue
      } else if (value) {
        if (Array.isArray(value)) {
          selectedCharacteristicsNormalized[pc.characteristic_type_id] = value.join(",")
        } else {
          selectedCharacteristicsNormalized[pc.characteristic_type_id] = value
        }
      }
    })

    const characteristicsData: Record<string, string | { name: string; value: string; hex?: string }> = {}
    characteristics.forEach((pc) => {
      const charType = pc.characteristic_type
      const value = selectedValues[pc.characteristic_type_id]
      const textValue = textValues[pc.characteristic_type_id]
      const paletteValue = colorPaletteValues[pc.characteristic_type_id]

      if (charType.input_type === "color_palette" && paletteValue) {
        characteristicsData[locale === "uk" ? charType.name_uk : charType.name_en] = {
          name: paletteValue.name,
          value: paletteValue.name,
          hex: paletteValue.hex,
        }
      } else if (charType.input_type === "text" && textValue) {
        characteristicsData[locale === "uk" ? charType.name_uk : charType.name_en] = textValue
      } else if (value) {
        if (Array.isArray(value)) {
          const selectedOptions = characteristicOptions.filter(opt => value.includes(opt.id))
          characteristicsData[locale === "uk" ? charType.name_uk : charType.name_en] = selectedOptions.map(opt => (locale === "uk" ? opt.name_uk : opt.name_en) || opt.value).join(", ")
        } else {
          const selectedOption = characteristicOptions.find(opt => opt.id === value)
          if (selectedOption) {
            characteristicsData[locale === "uk" ? charType.name_uk : charType.name_en] = (locale === "uk" ? selectedOption.name_uk : selectedOption.name_en) || selectedOption.value
          }
        }
      }
    })

    // Add to cart with quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: locale === "uk" ? product.name_uk : product.name_en,
        price: currentPrice,
        image: productImage,
        description: "",
        slug: product.slug,
        selected_characteristics: Object.keys(selectedCharacteristicsNormalized).length > 0 ? selectedCharacteristicsNormalized : undefined,
        characteristics: Object.keys(characteristicsData).length > 0 ? (characteristicsData as any) : undefined,
        comment: comment.trim() || undefined,
      })
    }

    showToast.success(t("product.productAddedToCart"))
    onOpenChange(false)
    
    // Reset form
    setSelectedValues({})
    setTextValues({})
    setColorPaletteValues({})
    setQuantity(1)
    setComment("")
  }

  const getSelectedOptionDisplay = (charTypeId: string, inputType: CharacteristicInputType): { text: string | null; colorHex?: string } | null => {
    if (inputType === "color_palette") {
      const paletteValue = colorPaletteValues[charTypeId]
      if (!paletteValue) return null
      return { text: paletteValue.name, colorHex: paletteValue.hex }
    }
    if (inputType === "select" || inputType === "color_custom") {
      const selectedId = selectedValues[charTypeId] as string
      if (!selectedId) return null
      const option = characteristicOptions.find(opt => opt.id === selectedId)
      return option ? { text: (locale === "uk" ? option.name_uk : option.name_en) || option.value } : null
    }
    if (inputType === "checkbox") {
      const selectedIds = selectedValues[charTypeId] as string[]
      if (!selectedIds || selectedIds.length === 0) return null
      const selectedOptions = characteristicOptions.filter(opt => selectedIds.includes(opt.id))
      return { text: selectedOptions.map(opt => (locale === "uk" ? opt.name_uk : opt.name_en) || opt.value).join(", ") }
    }
    if (inputType === "text") {
      const textValue = textValues[charTypeId]
      return textValue ? { text: textValue } : null
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{locale === "uk" ? product.name_uk : product.name_en}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Characteristics */}
          {characteristics.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characteristics.map((pc) => {
                  const charType = pc.characteristic_type
                  const required = pc.required ?? charType.required
                  const isRequired = required === true
                  const selectedDisplay = getSelectedOptionDisplay(pc.characteristic_type_id, charType.input_type)
                  
                  // Determine error state based on input type (text type doesn't need validation - it's readonly)
                  let displayHasError = false
                  if (isRequired && charType.input_type !== "text") {
                    if (charType.input_type === "color_palette") {
                      displayHasError = !colorPaletteValues[pc.characteristic_type_id]
                    } else {
                      displayHasError = !selectedValues[pc.characteristic_type_id]
                    }
                  }

                  return (
                    <div key={pc.characteristic_type_id} className="space-y-2">
                      {/* Text type - show only name and value in label */}
                      {charType.input_type === "text" ? (
                        <Label className="text-sm font-medium gap-0 flex items-center">
                          {charType.name_uk}: <span className="text-[#D4834F] font-normal ml-1">{textValues[pc.characteristic_type_id] || "—"}</span>
                        </Label>
                      ) : (
                        <>
                          <Label htmlFor={pc.characteristic_type_id} className="text-sm font-medium gap-0 flex items-center">
                            {locale === "uk" ? charType.name_uk : charType.name_en}
                            {selectedDisplay?.text ? (
                              <>
                                <span>:</span>
                                {isRequired && <span className="text-red-500">*</span>}
                                {charType.input_type === "color_palette" && selectedDisplay.colorHex && (
                                  <div
                                    className="w-4 h-4 rounded border border-gray-300 ml-1.5 flex-shrink-0"
                                    style={{ backgroundColor: selectedDisplay.colorHex }}
                                  />
                                )}
                                <span className="text-[#D4834F] font-normal ml-1"> {selectedDisplay.text}</span>
                              </>
                            ) : (
                              <>
                                <span>:</span>
                                {isRequired && <span className="text-red-500">*</span>}
                              </>
                            )}
                          </Label>

                      {charType.input_type === "select" && (
                        <select
                          value={(selectedValues[pc.characteristic_type_id] as string) || ""}
                          onChange={(e) => handleSelectChange(pc.characteristic_type_id, e.target.value)}
                          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 pr-8 py-2 text-sm ${
                            displayHasError ? "border-red-500" : ""
                          }`}
                        >
                          <option value="">{t("product.selectOption")}</option>
                          {pc.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {(locale === "uk" ? opt.name_uk : opt.name_en) || opt.value}
                            </option>
                          ))}
                        </select>
                      )}

                      {charType.input_type === "checkbox" && (
                        <div className="space-y-2">
                          {pc.options.map((opt) => (
                            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(selectedValues[pc.characteristic_type_id] as string[])?.includes(opt.id) || false}
                                onChange={(e) =>
                                  handleCheckboxChange(pc.characteristic_type_id, opt.id, e.target.checked)
                                }
                                className="rounded"
                              />
                              <span>{(locale === "uk" ? opt.name_uk : opt.name_en) || opt.value}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {charType.input_type === "color_custom" && (
                        <div className="flex flex-wrap gap-1.5">
                          {pc.options.map((opt) => {
                            const isSelected = selectedValues[pc.characteristic_type_id] === opt.id
                            return (
                              <label
                                key={opt.id}
                                className="flex flex-col items-center gap-0.5 cursor-pointer group"
                              >
                                <input
                                  type="radio"
                                  name={pc.characteristic_type_id}
                                  value={opt.id}
                                  checked={isSelected}
                                  onChange={(e) => handleSelectChange(pc.characteristic_type_id, e.target.value)}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-8 h-8 rounded-md border-2 transition-all shadow-sm ${
                                    isSelected 
                                      ? "border-[#D4834F] scale-110 shadow-md" 
                                      : "border-gray-300 group-hover:border-gray-400"
                                  }`}
                                  style={{ backgroundColor: opt.color_code || "#ccc" }}
                                />
                                <span className={`text-xs max-w-[60px] truncate ${isSelected ? "font-medium" : ""}`}>
                                  {(locale === "uk" ? opt.name_uk : opt.name_en) || opt.value}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      )}

                      {charType.input_type === "color_palette" && (
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPaletteModalOpen((prev) => ({ ...prev, [pc.characteristic_type_id]: true }))}
                            className={displayHasError ? "border-red-500" : ""}
                          >
                            {t("product.viewPalette")}
                          </Button>
                          {colorPaletteValues[pc.characteristic_type_id] && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-md border border-gray-300"
                                style={{ backgroundColor: colorPaletteValues[pc.characteristic_type_id].hex }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {colorPaletteValues[pc.characteristic_type_id].name}
                              </span>
                            </div>
                          )}
                          <CaparolPaletteModal
                            open={paletteModalOpen[pc.characteristic_type_id] || false}
                            onOpenChange={(open) => setPaletteModalOpen((prev) => ({ ...prev, [pc.characteristic_type_id]: open }))}
                            onSelect={(color) => handlePaletteColorSelect(pc.characteristic_type_id, color)}
                            selectedColorId={colorPaletteValues[pc.characteristic_type_id]?.id}
                          />
                        </div>
                      )}

                        </>
                      )}

                      {displayHasError && (
                        <p className="text-sm text-red-500">{t("product.requiredField")}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">{t("product.quantity")}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0
                  if (val <= 0) {
                    setQuantity(1)
                  } else {
                    setQuantity(val)
                  }
                }}
                onBlur={(e) => {
                  const numValue = parseInt(e.target.value) || 0
                  if (numValue <= 0) {
                    setQuantity(1)
                    e.target.value = "1"
                  }
                }}
                className="w-20 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">{t("product.comment")}</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("product.commentPlaceholder")}
              rows={3}
            />
          </div>

          {/* Price */}
          <div className="text-xl font-semibold">
            {showFromPrice ? `${t("product.from")} ` : ""}
            {currentPrice.toLocaleString("uk-UA")} {t("common.uah")}
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="text-sm text-red-500">
              {t("product.fillRequiredFields")}: {validationErrors.join(", ")}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("product.cancel")}
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={validationErrors.length > 0}
            className="bg-[#D4834F] hover:bg-[#C17340]"
          >
            {t("product.addToCart")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

