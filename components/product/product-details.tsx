"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
}

interface PriceCombination {
  id: string
  combination: Record<string, string>
  price: number
  is_available: boolean
}

interface AdditionalInfoBlock {
  id: string
  title_uk: string | null
  title_en: string | null
  content_uk: string | null
  content_en: string | null
  settings?: {
    enabled?: boolean
  }
}

interface ProductDetailsProps {
  product: {
    id: string
    name_uk: string
    name_en: string
    slug: string
    price: number
    compare_at_price?: number | null
    description_uk?: string | null
    description_en?: string | null
    stock?: number | null
    is_in_stock?: boolean
    sku?: string | null
    images?: string[] | Array<{ url: string; id?: string }>
  }
  productCharacteristics: ProductCharacteristic[]
  characteristicTypes: CharacteristicType[]
  characteristicOptions: CharacteristicOption[]
  priceCombinations: PriceCombination[]
  additionalInfoBlock?: AdditionalInfoBlock | null
}

export function ProductDetails({
  product,
  productCharacteristics,
  characteristicTypes,
  characteristicOptions,
  priceCombinations,
  additionalInfoBlock,
}: ProductDetailsProps) {
  const { addToCart } = useCart()
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)
  const [selectedValues, setSelectedValues] = useState<Record<string, string | string[]>>({})
  const [textValues, setTextValues] = useState<Record<string, string>>({})
  const [colorPaletteValues, setColorPaletteValues] = useState<Record<string, { id: string; name: string; hex: string; lch?: string; l?: number; c?: number; h?: number }>>({})
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
    // Helper function to get available options for a characteristic
    const getAvailableOptions = (charTypeId: string, inputType: CharacteristicInputType, affectsPrice: boolean) => {
      // For color_palette type, there are no options in DB - colors come from JSON file
      if (inputType === "color_palette") {
        return [] // Return empty array - options are handled via modal
      }

      // If characteristic doesn't affect price, show all options
      if (!affectsPrice) {
        return characteristicOptions.filter(
          (co) => co.characteristic_type_id === charTypeId
        )
      }

      // If no price combinations, return all options for this characteristic
      if (priceCombinations.length === 0) {
        return characteristicOptions.filter(
          (co) => co.characteristic_type_id === charTypeId
        )
      }

      // Check if this characteristic appears in any price combination
      const appearsInCombinations = priceCombinations.some((pc) =>
        pc.combination[charTypeId] !== undefined
      )

      // If characteristic doesn't appear in any combination, show all options
      if (!appearsInCombinations) {
        return characteristicOptions.filter(
          (co) => co.characteristic_type_id === charTypeId
        )
      }

      // Get all unique option IDs for this characteristic from price combinations
      const availableOptionIds = new Set<string>()

      // Check if there are any current selections (including color palette)
      const hasAnySelection = Object.keys(selectedValues).length > 0 || Object.keys(textValues).length > 0 || Object.keys(colorPaletteValues).length > 0

      priceCombinations.forEach((pc) => {
        // If no selections made yet, show all options that appear in any combination
        if (!hasAnySelection) {
          if (pc.combination[charTypeId]) {
            availableOptionIds.add(pc.combination[charTypeId])
          }
        } else {
          // Check if this combination matches current selections (except the current characteristic)
          // Only check characteristics that have been selected
          let matchesCurrentSelections = true

          Object.keys(pc.combination).forEach((key) => {
            if (key === charTypeId) {
              // This is the characteristic we're filtering for, skip it
              return
            }

            const currentValue = selectedValues[key] || textValues[key] || colorPaletteValues[key]?.id
            const combinationValue = pc.combination[key]

            // Only check if there's a current selection for this characteristic
            if (currentValue) {
              // Check if current selection matches combination
              if (Array.isArray(currentValue)) {
                // For checkbox, check if any selected value matches
                if (!currentValue.includes(combinationValue)) {
                  matchesCurrentSelections = false
                }
              } else {
                // For select/text/color_palette, exact match
                if (currentValue !== combinationValue) {
                  matchesCurrentSelections = false
                }
              }
            }
            // If no selection for this characteristic, don't check it
            // (combination might not require all characteristics to be selected)
          })

          // If combination matches current selections, add its option for this characteristic
          if (matchesCurrentSelections && pc.combination[charTypeId]) {
            availableOptionIds.add(pc.combination[charTypeId])
          }
        }
      })

      // If no options found in combinations, show all options (fallback)
      if (availableOptionIds.size === 0) {
        return characteristicOptions.filter(
          (co) => co.characteristic_type_id === charTypeId
        )
      }

      // Filter options to only include those in availableOptionIds
      return characteristicOptions.filter(
        (co) => co.characteristic_type_id === charTypeId && availableOptionIds.has(co.id)
      )
    }

    return productCharacteristics.map((pc) => {
      const charType = characteristicTypes.find((ct) => ct.id === pc.characteristic_type_id)
      if (!charType) return null

      // Check if this characteristic affects price
      const affectsPrice = pc.affects_price ?? charType.affects_price ?? false

      // Get filtered options based on price combinations (only if affects price)
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

  // Check if product is available
  const isProductAvailable = useMemo(() => {
    // If there are price combinations, check if at least one is available
    if (priceCombinations.length > 0) {
      return priceCombinations.some(pc => pc.is_available)
    }
    // Otherwise, check is_in_stock
    return product.is_in_stock ?? true
  }, [priceCombinations, product.is_in_stock])

  // Calculate current price based on selected characteristics
  const { currentPrice, showFromPrice } = useMemo(() => {
    const priceAffectingChars = characteristics.filter((pc) => {
      const affectsPrice = pc.affects_price ?? pc.characteristic_type.affects_price
      return affectsPrice === true
    })

    if (priceAffectingChars.length === 0) {
      return { currentPrice: product.price, showFromPrice: false }
    }

    // Build combination key from selected values
    const combination: Record<string, string> = {}
    let hasAnySelection = false
    priceAffectingChars.forEach((pc) => {
      const value = selectedValues[pc.characteristic_type_id]
      if (value) {
        hasAnySelection = true
        if (Array.isArray(value)) {
          // For checkbox, use first selected (or handle differently)
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

    // If no characteristics are selected, show minimum price with "від"
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

    // Find matching price combination
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
          pc.characteristic_type.input_type !== "text" &&
          pc.characteristic_type.input_type !== "color_palette"
        ) {
          errors.push(locale === "uk" ? pc.characteristic_type.name_uk : pc.characteristic_type.name_en)
        }
        // Text type doesn't need validation - it's readonly, admin sets the value
      }
    })
    return errors
  }, [characteristics, selectedValues, textValues, colorPaletteValues])

  const handleAddToCart = () => {
    if (validationErrors.length > 0) {
      return
    }

    // Get first image from product images
    let productImage = ""
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0]
      productImage = typeof firstImage === "string" ? firstImage : firstImage.url
    }

    // Build normalized characteristics object (characteristic_type_id -> value) for cart item ID
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
          // For checkbox, join multiple values with comma
          selectedCharacteristicsNormalized[pc.characteristic_type_id] = value.join(",")
        } else {
          // For select/color, use option ID
          selectedCharacteristicsNormalized[pc.characteristic_type_id] = value
        }
      }
    })

    // Build characteristics object for display (name -> value)
    const characteristicsData: Record<string, string> = {}
    characteristics.forEach((pc) => {
      const charType = pc.characteristic_type
      const value = selectedValues[pc.characteristic_type_id]
      const textValue = textValues[pc.characteristic_type_id]
      const paletteValue = colorPaletteValues[pc.characteristic_type_id]

      if (charType.input_type === "color_palette" && paletteValue) {
        characteristicsData[locale === "uk" ? charType.name_uk : charType.name_en] = paletteValue.name
      } else if (charType.input_type === "text" && textValue) {
        characteristicsData[locale === "uk" ? charType.name_uk : charType.name_en] = textValue
      } else if (value) {
        if (Array.isArray(value)) {
          // For checkbox, get display values for all selected options
          const selectedOptions = value.map(optId => {
            const opt = characteristicOptions.find(o => o.id === optId)
            return opt ? ((locale === "uk" ? opt.name_uk : opt.name_en) || opt.value) : optId
          })
          characteristicsData[locale === "uk" ? charType.name_uk : charType.name_en] = selectedOptions.join(", ")
        } else {
          // For select/color, get display value
          const opt = characteristicOptions.find(o => o.id === value)
          characteristicsData[locale === "uk" ? charType.name_uk : charType.name_en] = opt ? ((locale === "uk" ? opt.name_uk : opt.name_en) || opt.value) : value
        }
      }
    })

    addToCart({
      id: product.id,
      name: locale === "uk" ? product.name_uk : product.name_en,
      price: currentPrice, // Price is fixed at the moment of adding to cart
      image: productImage || "/placeholder.svg",
      description: locale === "uk" ? (product.description_uk || "") : (product.description_en || ""),
      slug: product.slug,
      selected_characteristics: Object.keys(selectedCharacteristicsNormalized).length > 0 ? selectedCharacteristicsNormalized : undefined,
      characteristics: Object.keys(characteristicsData).length > 0 ? characteristicsData : undefined,
      comment: comment.trim() || undefined,
    })

    showToast.success(t("product.productAddedToCart"))
  }

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

  const handlePaletteColorSelect = (charTypeId: string, color: { id: string; name: string; hex: string; lch?: string; l?: number; c?: number; h?: number }) => {
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

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue <= 0) {
      setQuantity(1)
    } else {
      setQuantity(numValue)
    }
  }

  // Add to Cart Button Component (to avoid duplication)
  const AddToCartButton = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <Button
        onClick={handleAddToCart}
        disabled={!isProductAvailable || validationErrors.length > 0}
        className="w-full h-12 text-base bg-[#D4834F] hover:bg-[#C17340] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("product.addToCart")}
      </Button>
      {!isProductAvailable ? (
        <p className={`text-sm text-muted-foreground ${isMobile ? "mt-2" : ""}`}>
          {t("product.outOfStock")}
        </p>
      ) : validationErrors.length > 0 && (
        <p className={`text-sm text-red-500 ${isMobile ? "mt-2" : ""}`}>
          {t("product.fillRequiredFields")}: {validationErrors.join(", ")}
        </p>
      )}
    </>
  )

  // Get selected option display value
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
    <div className="flex flex-col gap-6">
      {/* Title and Price - shown on mobile after images, on desktop at top */}
      <div>
        <h1 className="mb-2 text-3xl font-light text-foreground">
          {locale === "uk" ? product.name_uk : product.name_en}
        </h1>
        <div className="flex items-baseline gap-3">
          {isProductAvailable ? (
            <>
              <p className="text-2xl font-semibold text-foreground">
                {showFromPrice ? `${t("product.from")} ` : ""}{currentPrice.toLocaleString(locale === "uk" ? "uk-UA" : "en-US")} {t("common.uah")}
              </p>
              {product.compare_at_price && product.compare_at_price > currentPrice && (
                <p className="text-lg text-muted-foreground line-through">
                  {product.compare_at_price.toLocaleString(locale === "uk" ? "uk-UA" : "en-US")} {t("common.uah")}
                </p>
              )}
            </>
          ) : (
            <p className="text-2xl font-semibold text-muted-foreground">
              {t("product.outOfStock")}
            </p>
          )}
        </div>
      </div>

      {/* Characteristics */}
      {characteristics.length > 0 && isProductAvailable && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:[grid-template-columns:repeat(2,minmax(0,auto))] lg:[grid-template-columns:repeat(auto-fill, minmax(max-content, 1fr))] gap-4">
            {characteristics.map((pc) => {
              const charType = pc.characteristic_type
              const isRequired = pc.required ?? charType.required
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
                <div key={pc.id} className="space-y-2">
                  {/* Text type - show only name and value in label */}
                  {charType.input_type === "text" ? (
                    <Label className="text-sm font-medium gap-0 flex items-center">
                      <span className="whitespace-nowrap">{locale === "uk" ? charType.name_uk : charType.name_en}:</span> 
                      <span className="text-[#D4834F] font-normal ml-1 text-glow-orange">{textValues[pc.characteristic_type_id] || "—"}</span>
                    </Label>
                  ) : (
                    <>
                      {/* Select type - inline with label */}
                      {charType.input_type === "select" ? (
                        <Label className="text-sm font-medium gap-0 flex items-center flex-wrap">
                          {locale === "uk" ? charType.name_uk : charType.name_en}
                          <span className="mx-0">:</span>
                          {isRequired && <span className="text-red-500">*</span>}
                          <select
                            value={(selectedValues[pc.characteristic_type_id] as string) || ""}
                            onChange={(e) => handleSelectChange(pc.characteristic_type_id, e.target.value)}
                            className={`
                              appearance-none btn-feedback select-arrow ml-1 bg-transparent outline-none text-[#D4834F] font-normal cursor-pointer pr-5 relative focus:outline-none
                              ${!selectedValues[pc.characteristic_type_id] ? "select-empty" : ""}
                            `}
                          >
                            <option value="" className="text-muted-foreground">
                              {locale === "uk" ? "Виберіть..." : "Select..."}
                            </option>
                            {pc.options.map((opt) => (
                              <option key={opt.id} value={opt.id} className="text-foreground">
                                {(locale === "uk" ? opt.name_uk : opt.name_en) || opt.value}
                              </option>
                            ))}
                          </select>
                        </Label>
                      ) : (
                        <>
                          {/* Other types (checkbox, color_custom) - show label with selected value */}
                          {charType.input_type !== "color_palette" && (
                            <Label className="text-sm font-medium gap-0 flex items-center">
                              {locale === "uk" ? charType.name_uk : charType.name_en}
                              {selectedDisplay?.text ? (
                                <>
                                  <span>:</span>
                                  {isRequired && <span className="text-red-500">*</span>}
                                  <span className="text-[#D4834F] font-normal ml-1 text-glow-orange"> {selectedDisplay.text}</span>
                                </>
                              ) : (
                                <>
                                  <span>:</span>
                                  {isRequired && <span className="text-red-500">*</span>}
                                </>
                              )}
                            </Label>
                          )}
                        </>
                      )}

                      {/* Checkbox type */}
                      {charType.input_type === "checkbox" && (
                        <div className="space-y-2">
                          {pc.options.map((opt) => (
                            <label key={opt.id} className="flex items-center gap-2 cursor-pointer btn-feedback">
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

                      {/* Color custom type */}
                      {charType.input_type === "color_custom" && (
                        <div className="flex flex-wrap gap-1.5">
                          {pc.options.map((opt) => {
                            const isSelected = selectedValues[pc.characteristic_type_id] === opt.id
                            return (
                              <label
                                key={opt.id}
                                className="flex flex-col items-center gap-0.5 cursor-pointer group btn-feedback"
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
                                  className={`w-8 h-8 rounded-md border-2 transition-all shadow-sm ${isSelected
                                    ? "border-[#D4834F] ring-2 ring-[#D4834F]/30 scale-110"
                                    : "border-gray-300 group-hover:border-gray-400 group-hover:scale-105"
                                    }`}
                                  style={{ backgroundColor: opt.color_code || "#000000" }}
                                />
                                {((locale === "uk" ? opt.name_uk : opt.name_en) || opt.value) && (
                                  <span className="text-[10px] text-center text-muted-foreground max-w-[40px] truncate">
                                    {(locale === "uk" ? opt.name_uk : opt.name_en) || opt.value}
                                  </span>
                                )}
                              </label>
                            )
                          })}
                        </div>
                      )}

                      {/* Color palette type - inline with label */}
                      {charType.input_type === "color_palette" && (
                        <>
                          <Label className="text-sm font-medium gap-0 flex items-center flex-wrap">
                            {locale === "uk" ? charType.name_uk : charType.name_en}
                            <span className="mx-0">:</span>
                            {isRequired && <span className="text-red-500">*</span>}
                            {selectedDisplay?.text ? (
                              <button
                                type="button"
                                onClick={() => setPaletteModalOpen((prev) => ({ ...prev, [pc.characteristic_type_id]: true }))}
                                className="appearance-none btn-feedback ml-1 select-arrow bg-transparent border-none outline-none text-[#D4834F] font-normal cursor-pointer pr-5 relative focus:outline-none hover:opacity-80 transition-opacity flex items-center gap-1.5"
                              >
                                {selectedDisplay.colorHex && (
                                  <div
                                    className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                                    style={{ backgroundColor: selectedDisplay.colorHex.startsWith('#') ? selectedDisplay.colorHex : `#${selectedDisplay.colorHex}` }}
                                  />
                                )}
                                <span>{selectedDisplay.text}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPaletteModalOpen((prev) => ({ ...prev, [pc.characteristic_type_id]: true }))}
                                className={`appearance-none btn-feedback ml-1 select-arrow bg-transparent border-none outline-none text-[#D4834F] font-normal cursor-pointer pr-5 relative focus:outline-none hover:opacity-80 transition-opacity 
                                  ${!selectedDisplay?.text ? "select-empty" : ""}
                                `}
                              >
                                {locale === "uk" ? "Виберіть..." : "Select..."}
                              </button>
                            )}
                          </Label>

                          <CaparolPaletteModal
                            open={paletteModalOpen[pc.characteristic_type_id] || false}
                            onOpenChange={(open) => setPaletteModalOpen((prev) => ({ ...prev, [pc.characteristic_type_id]: open }))}
                            onSelect={(color) => handlePaletteColorSelect(pc.characteristic_type_id, color)}
                            selectedColorId={colorPaletteValues[pc.characteristic_type_id]?.id}
                          />
                        </>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      {isProductAvailable && (
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
              onChange={(e) => handleQuantityChange(e.target.value)}
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
      )}

      {/* Comment (if allowed) */}
      {isProductAvailable && (
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
      )}

      {/* Additional Info Section */}
      {additionalInfoBlock && additionalInfoBlock.settings?.enabled && (additionalInfoBlock.content_uk || additionalInfoBlock.content_en) && (
        <>
          <div className="border-t border-border mt-4" />
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              {locale === "uk" ? additionalInfoBlock.title_uk : additionalInfoBlock.title_en || "Additional Information"}
            </div>
            <div
              className="text-xs text-muted-foreground leading-relaxed [&_strong]:font-semibold [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-2 [&_li]:mb-1"
              dangerouslySetInnerHTML={{
                __html: locale === "uk" ? (additionalInfoBlock.content_uk || "") : (additionalInfoBlock.content_en || "")
              }}
            />
          </div>
        </>
      )}

      {/* Description - shown after comment on mobile, after add to cart on desktop */}
      {(product.description_uk || product.description_en) && (
        <div className="lg:hidden border-y border-border py-6">
          <h2 className="mb-3 text-lg font-medium text-foreground">{t("product.description")}</h2>
          <div
            className="leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3 [&_li]:mb-1"
            dangerouslySetInnerHTML={{
              __html: product.description_uk || product.description_en || ""
            }}
          />
        </div>
      )}

      {/* Add to Cart Button - fixed on mobile */}
      <div className="space-y-2 lg:space-y-2">
        <div className="lg:hidden fixed bottom-0 mb-[0px] left-0 right-0 bg-background border-t border-border p-4 z-50 shadow-lg">
          <AddToCartButton isMobile={true} />
        </div>
        <div className="hidden lg:block space-y-2">
          <AddToCartButton />
        </div>
      </div>
    </div>
  )
}

