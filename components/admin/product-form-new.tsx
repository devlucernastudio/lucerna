"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect, useMemo } from "react"
import { X, Upload, Plus, Trash2, ChevronLeft, Loader2, Star } from "lucide-react"
import { SimpleHtmlEditor } from "@/components/ui/simple-html-editor"
import Image from "next/image"
import { showToast } from "@/lib/toast"
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
import type { CharacteristicInputType } from "@/lib/types/characteristics"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Product {
  id: string
  name_uk: string
  name_en: string
  slug: string
  description_uk?: string
  description_en?: string
  price: number
  compare_at_price?: number
  stock?: number | null
  is_in_stock?: boolean
  sku?: string
  category_id?: string
  images: string[]
  is_featured: boolean
  is_active: boolean
  seo_title_uk?: string | null
  seo_title_en?: string | null
  meta_description_uk?: string | null
  meta_description_en?: string | null
}

interface Category {
  id: string
  name_uk: string
  name_en: string
  parent_id?: string | null
}


interface FieldError {
  field: string
  message: string
}

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
  id?: string
  characteristic_type_id: string
  required: boolean | null
  affects_price: boolean | null
  position?: number
  selected_values?: any // JSONB: for text type, stores string value
}

interface PriceCombination {
  id?: string
  combination: Record<string, string>
  price: number
  is_available: boolean
  stock?: number | null
}

interface DownloadableFile {
  id: string
  title_uk: string
  title_en: string
  description_uk: string | null
  description_en: string | null
  link: string
}

interface ProductDownloadableFile {
  id: string
  downloadable_file_id: string
  show_file: boolean
}

export function ProductFormNew({ 
  product, 
  categories,
  productCategories = [],
  characteristicTypes = [],
  productCharacteristics = [],
  characteristicOptions = [],
  priceCombinations = [],
  downloadableFiles = [],
  productDownloadableFiles = []
}: { 
  product?: Product
  categories: Category[]
  productCategories?: string[]
  characteristicTypes?: CharacteristicType[]
  productCharacteristics?: any[]
  characteristicOptions?: CharacteristicOption[]
  priceCombinations?: any[]
  downloadableFiles?: DownloadableFile[]
  productDownloadableFiles?: ProductDownloadableFile[]
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FieldError[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const [useStockQuantity, setUseStockQuantity] = useState(product?.stock !== null && product?.stock !== undefined)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(productCategories || [])
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images || [])
  const longPressTimerRef = useRef<number | null>(null)
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Characteristics state - for text type, selected_values contains the text value
  const [productChars, setProductChars] = useState<ProductCharacteristic[]>(
    productCharacteristics && productCharacteristics.length > 0
      ? productCharacteristics
          .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
          .map((pc: any, index: number) => ({
            id: pc.id,
            characteristic_type_id: pc.characteristic_type_id,
            required: pc.required,
            affects_price: pc.affects_price,
            position: pc.position ?? index,
            selected_values: pc.selected_values || null, // For text type, this contains the text
          }))
      : []
  )
  const [priceCombs, setPriceCombs] = useState<PriceCombination[]>(
    priceCombinations.map((pc: any) => ({
      id: pc.id,
      combination: pc.combination,
      price: pc.price,
      is_available: pc.is_available,
      stock: pc.stock ?? null,
    })) || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveStateRef = useRef<string>("") // Track last saved state to avoid unnecessary saves
  const lastSavedPriceCombsRef = useRef<string>("") // Track last saved price combinations state
  const lastSavedPriceFieldsRef = useRef<{
    price: number
    compare_at_price: number
    stock: number | null
    is_in_stock: boolean
    sku: string
    useStockQuantity: boolean
  } | null>(null) // Track last saved price fields state
  
  // Modal state for creating new characteristic
  const [showCreateCharModal, setShowCreateCharModal] = useState(false)
  const [newCharForm, setNewCharForm] = useState({
    name_uk: "",
    name_en: "",
    input_type: "text" as CharacteristicInputType,
    required: false,
    reusable: true,
    affects_price: false,
  })
  const [newCharOptions, setNewCharOptions] = useState<Array<{name_uk?: string, name_en?: string, value?: string, color_code?: string}>>([])
  const [creatingChar, setCreatingChar] = useState(false)
  
  // Downloadable files state
  const [availableFiles, setAvailableFiles] = useState<DownloadableFile[]>(downloadableFiles || [])
  const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    productDownloadableFiles.forEach(pdf => {
      initial[pdf.downloadable_file_id] = pdf.show_file
    })
    return initial
  })

  const initialFormData = {
    name_uk: product?.name_uk || "",
    name_en: product?.name_en || "",
    slug: product?.slug || "",
    description_uk: product?.description_uk || "",
    description_en: product?.description_en || "",
    price: product?.price || 0,
    compare_at_price: product?.compare_at_price || 0,
    stock: product?.stock || 0,
    is_in_stock: product?.is_in_stock ?? true,
    sku: product?.sku || "",
    images: product?.images || [],
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
    seo_title_uk: (product as any)?.seo_title_uk || "",
    seo_title_en: (product as any)?.seo_title_en || "",
    meta_description_uk: (product as any)?.meta_description_uk || "",
    meta_description_en: (product as any)?.meta_description_en || "",
  }

  const [formData, setFormData] = useState(initialFormData)
  
  // Keep initialFormData reference for comparison (mutable) - updated when basic info is saved
  const initialFormDataRef = useRef({ ...initialFormData })

  // Create a stable reference for current form state
  const getCurrentStateString = () => {
    return JSON.stringify({
      formData,
      imageUrls,
      selectedCategories,
      productChars,
      priceCombs,
      selectedFiles,
    })
  }

  // Load downloadable files on mount
  useEffect(() => {
    const loadFiles = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("downloadable_files")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (data) {
        setAvailableFiles(data)
      }
    }
    loadFiles()
  }, [])

  // Initialize last saved state when product loads
  useEffect(() => {
    if (product) {
      // Update initialFormDataRef with current formData values
      initialFormDataRef.current = { ...formData }
      lastSaveStateRef.current = getCurrentStateString()
      // Initialize saved price combinations state
      const initialPriceCombsString = JSON.stringify([...(priceCombinations || [])].map((pc: any) => ({
        combination: pc.combination,
        price: pc.price,
        is_available: pc.is_available ?? true,
        stock: pc.stock ?? null,
      })).sort((a, b) => JSON.stringify(a.combination).localeCompare(JSON.stringify(b.combination))))
      lastSavedPriceCombsRef.current = initialPriceCombsString
      // Initialize saved price fields state - use formData values to ensure consistency
      lastSavedPriceFieldsRef.current = {
        price: formData.price,
        compare_at_price: formData.compare_at_price || 0,
        stock: useStockQuantity ? (formData.stock || 0) : null,
        is_in_stock: formData.is_in_stock,
        sku: formData.sku || "",
        useStockQuantity: useStockQuantity,
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  // Sync general is_in_stock with price combinations when combinations change
  // Only sync if there are combinations and not using stock quantity
  useEffect(() => {
    if (priceCombs.length > 0 && !useStockQuantity) {
      const hasAnyAvailable = priceCombs.some(c => c.is_available)
      // Only update if the value actually changed to avoid infinite loops
      if (hasAnyAvailable !== formData.is_in_stock) {
        setFormData(prev => ({ ...prev, is_in_stock: hasAnyAvailable }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(priceCombs.map(c => c.is_available)), useStockQuantity])

  // Save only basic info block
  const saveBasicInfo = async () => {
    if (!product || isSaving || isSubmitting) return

    // Basic validation
    if (!formData.name_uk.trim() || !formData.name_en.trim() || !formData.slug.trim()) {
      showToast.error("Заповніть обов'язкові поля")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      const productData: any = {
        name_uk: formData.name_uk.trim(),
        name_en: formData.name_en.trim(),
        slug: formData.slug.trim(),
        description_uk: formData.description_uk || null,
        description_en: formData.description_en || null,
        seo_title_uk: formData.seo_title_uk?.trim() || null,
        seo_title_en: formData.seo_title_en?.trim() || null,
        meta_description_uk: formData.meta_description_uk?.trim() || null,
        meta_description_en: formData.meta_description_en?.trim() || null,
      }

      // Update product
      const { error: productError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id)

      if (productError) throw productError

      // Update initialFormData to reflect saved state
      setFormData(prev => ({
        ...prev,
        name_uk: productData.name_uk,
        name_en: productData.name_en,
        slug: productData.slug,
        description_uk: productData.description_uk,
        description_en: productData.description_en,
        seo_title_uk: productData.seo_title_uk,
        seo_title_en: productData.seo_title_en,
        meta_description_uk: productData.meta_description_uk,
        meta_description_en: productData.meta_description_en,
      }))
      
      // Update formData to ensure no null values - convert all to empty strings
      setFormData(prev => ({
        ...prev,
        name_uk: productData.name_uk || "",
        name_en: productData.name_en || "",
        slug: productData.slug || "",
        description_uk: productData.description_uk || "",
        description_en: productData.description_en || "",
        seo_title_uk: productData.seo_title_uk || "",
        seo_title_en: productData.seo_title_en || "",
        meta_description_uk: productData.meta_description_uk || "",
        meta_description_en: productData.meta_description_en || "",
      }))
      
      // Update initialFormData ref
      initialFormDataRef.current.name_uk = productData.name_uk
      initialFormDataRef.current.name_en = productData.name_en
      initialFormDataRef.current.slug = productData.slug
      initialFormDataRef.current.description_uk = productData.description_uk || ""
      initialFormDataRef.current.description_en = productData.description_en || ""
      initialFormDataRef.current.seo_title_uk = productData.seo_title_uk || ""
      initialFormDataRef.current.seo_title_en = productData.seo_title_en || ""
      initialFormDataRef.current.meta_description_uk = productData.meta_description_uk || ""
      initialFormDataRef.current.meta_description_en = productData.meta_description_en || ""
      
      // Update last saved state
      lastSaveStateRef.current = getCurrentStateString()
      
      showToast.success("Основну інформацію збережено")
      router.refresh()
    } catch (error) {
      console.error('Error saving basic info:', error)
      const errorMessage = error instanceof Error ? error.message : "Помилка при збереженні"
      showToast.error(`Помилка: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save function (excludes basic info block - saved via saveBasicInfo button)
  const autoSave = async () => {
    if (!product || isSaving || isSubmitting) return

    // Skip if only basic block has changes
    if (changedBlocks.size === 1 && changedBlocks.has("basic")) {
      return
    }

    // Basic validation (only for fields that auto-save)
    if (formData.price <= 0) {
      return
    }

    const currentState = getCurrentStateString()
    // Skip if state hasn't changed since last save
    if (currentState === lastSaveStateRef.current) {
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      const productData: any = {
        // Exclude basic info fields - they are saved separately via saveBasicInfo button
        price: Number(formData.price),
        compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
        stock: useStockQuantity ? Number(formData.stock) : null,
        is_in_stock: !useStockQuantity ? formData.is_in_stock : (formData.stock !== null && formData.stock > 0),
        sku: formData.sku || null,
        images: imageUrls,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      }

      // Update product
      const { error: productError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id)

      if (productError) throw productError

      // Update categories - skip if table doesn't exist (migration not run)
      try {
        const { error: deleteCategoriesError } = await supabase.from("product_categories").delete().eq("product_id", product.id)
        // Check if error is about table not existing (PGRST205) - skip in that case
        if (deleteCategoriesError) {
          if (deleteCategoriesError.code === "PGRST205" || deleteCategoriesError.message?.includes("Could not find the table")) {
            console.warn('product_categories table does not exist, skipping category updates')
          } else {
            console.error('Error deleting categories:', deleteCategoriesError)
            throw deleteCategoriesError
          }
        }
        
        if (selectedCategories.length > 0) {
          const { error: insertCategoriesError } = await supabase.from("product_categories").insert(
            selectedCategories.map(catId => ({ product_id: product.id, category_id: catId }))
          )
          if (insertCategoriesError) {
            if (insertCategoriesError.code === "PGRST205" || insertCategoriesError.message?.includes("Could not find the table")) {
              console.warn('product_categories table does not exist, skipping category insert')
            } else {
              console.error('Error inserting categories:', insertCategoriesError)
              throw insertCategoriesError
            }
          }
        }
      } catch (error: any) {
        // If table doesn't exist, just log and continue
        if (error?.code === "PGRST205" || error?.message?.includes("Could not find the table")) {
          console.warn('product_categories table does not exist, skipping category updates')
        } else {
          throw error
        }
      }

      // Update characteristics
      const { error: deleteCharsError } = await supabase.from("product_characteristics").delete().eq("product_id", product.id)
      if (deleteCharsError) {
        console.error('Error deleting characteristics:', deleteCharsError)
        throw deleteCharsError
      }
      
      if (productChars.length > 0) {
        const { error: insertCharsError } = await supabase.from("product_characteristics").insert(
          productChars.map((pc, index) => ({
            product_id: product.id,
            characteristic_type_id: pc.characteristic_type_id,
            required: pc.required,
            affects_price: pc.affects_price,
            position: pc.position ?? index,
            selected_values: pc.selected_values || null, // For text type, stores text value
          }))
        )
        if (insertCharsError) {
          console.error('Error inserting characteristics:', insertCharsError)
          throw insertCharsError
        }
      }

      // Update price combinations
      if (priceCombs.length > 0) {
        // Delete existing combinations first
        const { error: deletePriceCombsError } = await supabase
          .from("product_characteristic_price_combinations")
          .delete()
          .eq("product_id", product.id)
        
        if (deletePriceCombsError && (deletePriceCombsError.message || deletePriceCombsError.code || deletePriceCombsError.hint)) {
          console.error('Error deleting price combinations:', deletePriceCombsError)
          throw deletePriceCombsError
        }
        
        // Insert new combinations
        const { error: insertPriceCombsError } = await supabase
          .from("product_characteristic_price_combinations")
            .insert(
              priceCombs.map(pc => ({
                product_id: product.id,
                combination: pc.combination,
                price: Number(pc.price),
                is_available: pc.is_available ?? true,
                stock: useStockQuantity ? (pc.stock ?? null) : null,
              }))
            )
        
        if (insertPriceCombsError) {
          console.error('Error inserting price combinations:', insertPriceCombsError)
          throw insertPriceCombsError
        }
      } else {
        // If no combinations, delete all existing ones
        const { error: deletePriceCombsError } = await supabase
          .from("product_characteristic_price_combinations")
          .delete()
          .eq("product_id", product.id)
        
        if (deletePriceCombsError && (deletePriceCombsError.message || deletePriceCombsError.code || deletePriceCombsError.hint)) {
          console.error('Error deleting price combinations:', deletePriceCombsError)
          throw deletePriceCombsError
        }
      }

      // Update downloadable files
      try {
        const { error: deleteFilesError } = await supabase
          .from("product_downloadable_files")
          .delete()
          .eq("product_id", product.id)
        
        if (deleteFilesError && deleteFilesError.code !== "PGRST205" && !deleteFilesError.message?.includes("Could not find the table")) {
          console.error('Error deleting downloadable files:', deleteFilesError)
          throw deleteFilesError
        }
        
        const filesToInsert = Object.entries(selectedFiles)
          .filter(([_, show]) => show !== undefined)
          .map(([fileId, showFile]) => ({
            product_id: product.id,
            downloadable_file_id: fileId,
            show_file: showFile,
          }))
        
        if (filesToInsert.length > 0) {
          const { error: insertFilesError } = await supabase
            .from("product_downloadable_files")
            .insert(filesToInsert)
          
          if (insertFilesError && insertFilesError.code !== "PGRST205" && !insertFilesError.message?.includes("Could not find the table")) {
            console.error('Error inserting downloadable files:', insertFilesError)
            throw insertFilesError
          }
        }
      } catch (error: any) {
        if (error?.code === "PGRST205" || error?.message?.includes("Could not find the table")) {
          console.warn('product_downloadable_files table does not exist, skipping file updates')
        } else {
          throw error
        }
      }

      // Update last saved state AFTER successful save
      lastSaveStateRef.current = getCurrentStateString()
      
      // Update saved price combinations state
      const savedPriceCombsString = JSON.stringify([...priceCombs].sort((a, b) => JSON.stringify(a.combination).localeCompare(JSON.stringify(b.combination))).map(pc => ({
        combination: pc.combination,
        price: pc.price,
        is_available: pc.is_available ?? true,
        stock: pc.stock ?? null,
      })))
      lastSavedPriceCombsRef.current = savedPriceCombsString
      
      // Update saved price fields state
      lastSavedPriceFieldsRef.current = {
        price: formData.price,
        compare_at_price: formData.compare_at_price || 0,
        stock: useStockQuantity ? (formData.stock || 0) : null,
        is_in_stock: formData.is_in_stock,
        sku: formData.sku || "",
        useStockQuantity: useStockQuantity,
      }
      
      showToast.success("Зміни збережено")
      
      // Refresh router to update cached data on other pages
      router.refresh()
    } catch (error) {
      console.error('Auto-save error:', error)
      const errorMessage = error instanceof Error ? error.message : "Помилка при збереженні"
      showToast.error(`Помилка: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Track which blocks have changes - use useMemo to avoid infinite loops
  const changedBlocks = useMemo(() => {
    if (!product) return new Set<string>()

    const blocks = new Set<string>()

    // Check basic info block
    if (
      formData.name_uk !== initialFormDataRef.current.name_uk ||
      formData.name_en !== initialFormDataRef.current.name_en ||
      formData.slug !== initialFormDataRef.current.slug ||
      formData.description_uk !== initialFormDataRef.current.description_uk ||
      formData.description_en !== initialFormDataRef.current.description_en ||
      formData.seo_title_uk !== initialFormDataRef.current.seo_title_uk ||
      formData.seo_title_en !== initialFormDataRef.current.seo_title_en ||
      formData.meta_description_uk !== initialFormDataRef.current.meta_description_uk ||
      formData.meta_description_en !== initialFormDataRef.current.meta_description_en
    ) {
      blocks.add("basic")
    }

    // Check price block - compare with last saved state
    // Only check if lastSavedPriceFieldsRef is initialized (after first save or on load)
    if (lastSavedPriceFieldsRef.current) {
      const saved = lastSavedPriceFieldsRef.current
      const currentStock = useStockQuantity ? (formData.stock || 0) : null
      if (
        Number(formData.price) !== Number(saved.price) ||
        Number(formData.compare_at_price || 0) !== Number(saved.compare_at_price) ||
        currentStock !== saved.stock ||
        Boolean(formData.is_in_stock) !== Boolean(saved.is_in_stock) ||
        String(formData.sku || "") !== String(saved.sku) ||
        useStockQuantity !== saved.useStockQuantity
      ) {
        blocks.add("price")
      }
    } else {
      // On initial load, compare with initialFormData
      // But don't add to blocks if values match (to avoid showing loader on load)
      const initialUseStockQuantity = (product?.stock !== null && product?.stock !== undefined)
      const currentStock = useStockQuantity ? (formData.stock || 0) : null
      const initialStock = initialUseStockQuantity ? (initialFormData.stock || 0) : null
      if (
        Number(formData.price) !== Number(initialFormData.price) ||
        Number(formData.compare_at_price || 0) !== Number(initialFormData.compare_at_price || 0) ||
        currentStock !== initialStock ||
        Boolean(formData.is_in_stock) !== Boolean(initialFormData.is_in_stock) ||
        String(formData.sku || "") !== String(initialFormData.sku || "") ||
        useStockQuantity !== initialUseStockQuantity
      ) {
        blocks.add("price")
      }
    }

        // Check categories block - use sorted arrays for comparison
        const sortedCategories = [...selectedCategories].sort()
        const sortedProductCategories = [...(productCategories || [])].sort()
        if (JSON.stringify(sortedCategories) !== JSON.stringify(sortedProductCategories)) {
          blocks.add("categories")
        }

        // Check images block
        if (JSON.stringify(imageUrls) !== JSON.stringify(initialFormData.images)) {
          blocks.add("images")
        }

        // Check characteristics block
        const sortedProductChars = JSON.stringify([...productChars].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map(pc => ({
          characteristic_type_id: pc.characteristic_type_id,
          required: pc.required,
          affects_price: pc.affects_price,
        })))
        const sortedInitialChars = JSON.stringify([...(productCharacteristics || [])]
          .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
          .map((pc: any) => ({
            characteristic_type_id: pc.characteristic_type_id,
            required: pc.required,
            affects_price: pc.affects_price,
          })))
        if (sortedProductChars !== sortedInitialChars) {
          blocks.add("characteristics")
        }

        // Check price combinations block - compare with last saved state
        // Only check if lastSavedPriceCombsRef is initialized (not empty string)
        if (lastSavedPriceCombsRef.current) {
          const sortedPriceCombs = JSON.stringify([...priceCombs].sort((a, b) => JSON.stringify(a.combination).localeCompare(JSON.stringify(b.combination))).map(pc => ({
            combination: pc.combination,
            price: pc.price,
            is_available: pc.is_available ?? true,
            stock: pc.stock ?? null,
          })))
          if (sortedPriceCombs !== lastSavedPriceCombsRef.current) {
            blocks.add("price")
          }
        } else {
          // On initial load, compare with priceCombinations from props
          const sortedPriceCombs = JSON.stringify([...priceCombs].sort((a, b) => JSON.stringify(a.combination).localeCompare(JSON.stringify(b.combination))).map(pc => ({
            combination: pc.combination,
            price: pc.price,
            is_available: pc.is_available ?? true,
            stock: pc.stock ?? null,
          })))
          const sortedInitialPriceCombs = JSON.stringify([...(priceCombinations || [])].map((pc: any) => ({
            combination: pc.combination,
            price: pc.price,
            is_available: pc.is_available ?? true,
            stock: pc.stock ?? null,
          })).sort((a, b) => JSON.stringify(a.combination).localeCompare(JSON.stringify(b.combination))))
          if (sortedPriceCombs !== sortedInitialPriceCombs) {
            blocks.add("price")
          }
        }

    // Check downloadable files block
    const initialFilesMap: Record<string, boolean> = {}
    productDownloadableFiles.forEach(pdf => {
      initialFilesMap[pdf.downloadable_file_id] = pdf.show_file
    })
    const currentFilesString = JSON.stringify(selectedFiles)
    const initialFilesString = JSON.stringify(initialFilesMap)
    if (currentFilesString !== initialFilesString) {
      blocks.add("files")
    }

    // Check settings block
    if (
      formData.is_featured !== initialFormData.is_featured ||
      formData.is_active !== initialFormData.is_active
    ) {
      blocks.add("settings")
    }

    return blocks
  }, [
    product,
    formData.name_uk,
    formData.name_en,
    formData.slug,
    formData.description_uk,
    formData.description_en,
    formData.seo_title_uk,
    formData.seo_title_en,
    formData.meta_description_uk,
    formData.meta_description_en,
    formData.price,
    formData.compare_at_price,
    formData.stock,
    formData.is_in_stock,
    formData.sku,
    formData.is_featured,
    formData.is_active,
    JSON.stringify(imageUrls),
    JSON.stringify(selectedCategories),
    JSON.stringify(productChars),
    JSON.stringify(priceCombs),
    initialFormDataRef.current.name_uk,
    initialFormDataRef.current.name_en,
    initialFormDataRef.current.slug,
    initialFormDataRef.current.description_uk,
    initialFormDataRef.current.description_en,
    initialFormDataRef.current.seo_title_uk,
    initialFormDataRef.current.seo_title_en,
    initialFormDataRef.current.meta_description_uk,
    initialFormDataRef.current.meta_description_en,
    initialFormData.price,
    initialFormData.compare_at_price,
    initialFormData.stock,
    initialFormData.is_in_stock,
    initialFormData.sku,
    initialFormData.is_featured,
    initialFormData.is_active,
    JSON.stringify(initialFormData.images),
    JSON.stringify(productCategories),
    JSON.stringify(productCharacteristics),
    JSON.stringify(priceCombinations),
    JSON.stringify(selectedFiles),
    JSON.stringify(productDownloadableFiles),
  ])

  // Auto-save on changes with debounce (excluding basic info block)
  useEffect(() => {
    if (!product || isSaving || changedBlocks.size === 0) return // Only auto-save for existing products with changes
    
    // Skip auto-save if only basic block has changes
    if (changedBlocks.size === 1 && changedBlocks.has("basic")) {
      return
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save (2 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      autoSave()
    }, 2000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.price, formData.compare_at_price, formData.stock, formData.is_in_stock, formData.sku, formData.is_featured, formData.is_active, useStockQuantity, JSON.stringify(imageUrls), JSON.stringify(selectedCategories), JSON.stringify(productChars), JSON.stringify(priceCombs), JSON.stringify(selectedFiles), changedBlocks.size])

  // No warnings - changes save automatically

  const validateForm = (): boolean => {
    const newErrors: FieldError[] = []

    if (!formData.name_uk.trim()) {
      newErrors.push({ field: "name_uk", message: "Назва українською обов'язкова" })
    }
    if (!formData.name_en.trim()) {
      newErrors.push({ field: "name_en", message: "Назва англійською обов'язкова" })
    }
    if (!formData.slug.trim()) {
      newErrors.push({ field: "slug", message: "Slug обов'язковий" })
    }
    if (formData.price <= 0) {
      newErrors.push({ field: "price", message: "Ціна повинна бути більше 0" })
    }
    if (useStockQuantity && formData.stock !== null && formData.stock < 0) {
      newErrors.push({ field: "stock", message: "Кількість не може бути від'ємною" })
    }
    if (imageUrls.length === 0) {
      newErrors.push({ field: "images", message: "Додайте хоча б одне зображення" })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const supabase = createClient()
    const uploadedUrls: string[] = []
    const uploadErrors: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          uploadErrors.push(`${file.name}: не є зображенням`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          uploadErrors.push(`${file.name}: розмір файлу перевищує 5MB`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `products/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          uploadErrors.push(`${file.name}: ${uploadError.message}`)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      if (uploadedUrls.length > 0) {
        const newImageUrls = [...imageUrls, ...uploadedUrls]
        setImageUrls(newImageUrls)
        
        // Update DB immediately for existing products
        if (product) {
          const { error } = await supabase
            .from("products")
            .update({ images: newImageUrls })
            .eq("id", product.id)
          
          if (error) {
            console.error('Error saving images:', error)
            showToast.error("Помилка при збереженні зображень")
            setErrors(prev => [...prev, { field: "images", message: "Помилка при збереженні зображень" }])
          } else {
            showToast.success("Зображення збережено")
            // Refresh page to show updated images
            router.refresh()
          }
        }
      }

      if (uploadErrors.length > 0) {
        setErrors(prev => [
          ...prev,
          { field: "images", message: `Помилки завантаження: ${uploadErrors.join(', ')}` }
        ])
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      const errorMessage = error instanceof Error ? error.message : "Невідома помилка при завантаженні"
      setErrors(prev => [
        ...prev,
        { field: "images", message: errorMessage }
      ])
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = async (index: number) => {
    const imageUrl = imageUrls[index]
    
    // Remove from UI immediately
    let newImageUrls = imageUrls.filter((_, i) => i !== index)
    
    // Якщо видаляємо головне (перше) зображення, перше з наявних стає головним (залишається на позиції 0)
    // Це вже автоматично, оскільки ми просто фільтруємо масив
    
    setImageUrls(newImageUrls)
    
    // Update DB immediately for existing products
    if (product) {
      const supabase = createClient()
      const { error } = await supabase
        .from("products")
        .update({ images: newImageUrls })
        .eq("id", product.id)
      
      if (error) {
        console.error('Error removing image from DB:', error)
        // Restore image if DB update failed
        setImageUrls(imageUrls)
        showToast.error("Помилка при видаленні зображення")
        return
      }
      
      showToast.success("Зображення видалено")
      // Refresh page to show updated images
      router.refresh()
    }
    
    // If it's a Supabase Storage URL, delete it from Storage
    if (imageUrl && imageUrl.includes('supabase.co/storage')) {
      try {
        const supabase = createClient()
        
        // Extract file path from URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/product-images/products/filename.jpg
        if (imageUrl.includes('/product-images/')) {
          const urlParts = imageUrl.split('/product-images/')
          if (urlParts.length > 1) {
            // Remove query parameters if present
            const pathPart = urlParts[1].split('?')[0]
            
            // Delete from Storage
            const { error } = await supabase.storage.from('product-images').remove([pathPart])
            
            if (error) {
              console.error('Error deleting image from storage:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }
  }

  // Set main image (move to first position)
  const setMainImage = async (index: number) => {
    if (index === 0) return // Already main
    
    const newImageUrls = [imageUrls[index], ...imageUrls.filter((_, i) => i !== index)]
    setImageUrls(newImageUrls)
    
    // Update DB immediately for existing products
    if (product) {
      const supabase = createClient()
      const { error } = await supabase
        .from("products")
        .update({ images: newImageUrls })
        .eq("id", product.id)
      
      if (error) {
        console.error('Error updating main image:', error)
        setImageUrls(imageUrls)
        showToast.error("Помилка при зміні головного зображення")
        return
      }
      
      showToast.success("Головне зображення змінено")
      router.refresh()
    }
  }

  // Handle drag end for image sorting
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    const oldIndex = imageUrls.findIndex((_, i) => i.toString() === active.id)
    const newIndex = imageUrls.findIndex((_, i) => i.toString() === over.id)
    
    if (oldIndex === -1 || newIndex === -1) return
    
    const newImageUrls = arrayMove(imageUrls, oldIndex, newIndex)
    setImageUrls(newImageUrls)
    
    // Update DB immediately for existing products
    if (product) {
      const supabase = createClient()
      const { error } = await supabase
        .from("products")
        .update({ images: newImageUrls })
        .eq("id", product.id)
      
      if (error) {
        console.error('Error updating image order:', error)
        setImageUrls(imageUrls)
        showToast.error("Помилка при зміні порядку зображень")
        return
      }
      
      showToast.success("Порядок зображень змінено")
      router.refresh()
    }
  }

  // Long press handler for setting main image
  const handleLongPressStart = (index: number) => {
    longPressTimerRef.current = window.setTimeout(() => {
      setMainImage(index)
    }, 500) // 500ms for long press
  }

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Delete images from Storage
  const deleteImagesFromStorage = async (imageUrls: string[]) => {
    if (imageUrls.length === 0) return
    
    const supabase = createClient()
    const filesToDelete: string[] = []
    
    for (const url of imageUrls) {
      try {
        // Extract file path from URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/product-images/products/filename.jpg
        // or: https://[project].supabase.co/storage/v1/object/sign/product-images/products/filename.jpg?token=...
        if (url.includes('/product-images/')) {
          const urlParts = url.split('/product-images/')
          if (urlParts.length > 1) {
            // Remove query parameters if present
            const pathPart = urlParts[1].split('?')[0]
            filesToDelete.push(pathPart)
          }
        }
      } catch (error) {
        console.error('Error parsing image URL:', error)
      }
    }
    
    if (filesToDelete.length > 0) {
      try {
        const { error } = await supabase.storage.from('product-images').remove(filesToDelete)
        if (error) {
          console.error('Error deleting images from storage:', error)
        }
      } catch (error) {
        console.error('Error deleting images from storage:', error)
      }
    }
  }

  // For new products, we still need a submit button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (product) {
      // For existing products, just trigger auto-save
      await autoSave()
      return
    }

    // For new products, create it
    setIsLoading(true)
    setIsSubmitting(true)
    setErrors([])

    const supabase = createClient()

    try {
      const productData: any = {
        name_uk: formData.name_uk.trim(),
        name_en: formData.name_en.trim(),
        slug: formData.slug.trim(),
        description_uk: formData.description_uk || null,
        description_en: formData.description_en || null,
        price: Number(formData.price),
        compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
        stock: useStockQuantity ? Number(formData.stock) : null,
        is_in_stock: !useStockQuantity ? formData.is_in_stock : (formData.stock !== null && formData.stock > 0),
        sku: formData.sku || null,
        images: imageUrls,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        seo_title_uk: formData.seo_title_uk?.trim() || null,
        seo_title_en: formData.seo_title_en?.trim() || null,
        meta_description_uk: formData.meta_description_uk?.trim() || null,
        meta_description_en: formData.meta_description_en?.trim() || null,
      }

      const { error, data } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single()

      if (error) throw error
      const productId = data.id

      // Update categories (many-to-many)
      if (selectedCategories.length > 0) {
        await supabase.from("product_categories").insert(
          selectedCategories.map(catId => ({ product_id: productId, category_id: catId }))
        )
      }

      // Update characteristics
      if (productChars.length > 0) {
        await supabase.from("product_characteristics").insert(
          productChars.map((pc, index) => ({
            product_id: productId,
            characteristic_type_id: pc.characteristic_type_id,
            required: pc.required,
            affects_price: pc.affects_price,
            position: pc.position ?? index,
            selected_values: pc.selected_values || null, // For text type, stores text value
          }))
        )
      }

      // Update price combinations
      if (priceCombs.length > 0) {
        const { error: insertPriceCombsError } = await supabase.from("product_characteristic_price_combinations").insert(
          priceCombs.map(pc => ({
            product_id: productId,
            combination: pc.combination,
            price: Number(pc.price),
            is_available: pc.is_available ?? true,
            stock: useStockQuantity ? (pc.stock ?? null) : null,
          }))
        )
        if (insertPriceCombsError) {
          console.error('Error inserting price combinations:', insertPriceCombsError)
          throw insertPriceCombsError
        }
      }

      // Update downloadable files
      const filesToInsert = Object.entries(selectedFiles)
        .filter(([_, show]) => show !== undefined && show === true)
        .map(([fileId, showFile]) => ({
          product_id: productId,
          downloadable_file_id: fileId,
          show_file: showFile,
        }))
      
      if (filesToInsert.length > 0) {
        const { error: insertFilesError } = await supabase
          .from("product_downloadable_files")
          .insert(filesToInsert)
        
        if (insertFilesError && insertFilesError.code !== "PGRST205" && !insertFilesError.message?.includes("Could not find the table")) {
          console.error('Error inserting downloadable files:', insertFilesError)
          throw insertFilesError
        }
      }

      showToast.success("Товар створено успішно")
      router.push("/admin/products")
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Сталася помилка"
      showToast.error(`Помилка при створенні товару: ${errorMessage}`)
      setErrors([{ field: "general", message: errorMessage }])
    } finally {
      setIsLoading(false)
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(e => e.field === fieldName)?.message
  }

  const hasFieldError = (fieldName: string): boolean => {
    return errors.some(e => e.field === fieldName)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }


  const categoriesTree = categories.filter(c => !c.parent_id)
  const subcategoriesMap = new Map<string, Category[]>()
  categories.filter(c => c.parent_id).forEach(cat => {
    if (!subcategoriesMap.has(cat.parent_id!)) {
      subcategoriesMap.set(cat.parent_id!, [])
    }
    subcategoriesMap.get(cat.parent_id!)!.push(cat)
  })

  return (
    <div className="space-y-6">
      {/* Back button and status */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleCancel} className="gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          Назад до товарів
        </Button>
        {product ? (
          <div className="flex items-center gap-2 text-sm">
            {isSaving && <span className="text-blue-600">Збереження...</span>}
          </div>
        ) : (
          <h1 className="text-3xl font-bold text-foreground">Новий товар</h1>
        )}
      </div>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between min-h-[1.5rem]">
            <CardTitle>Основна інформація</CardTitle>
            <div className="min-w-[120px] text-right min-h-[1.5rem] flex items-center justify-end gap-2">
              {isSaving && changedBlocks.has("basic") ? (
                <div className="flex items-center gap-2 text-sm text-[#D4834F]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Збереження...</span>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={saveBasicInfo}
                  disabled={!changedBlocks.has("basic") || isSaving || !product}
                  className="bg-[#D4834F] hover:bg-[#C17340] h-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Зберегти
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name_uk">Назва (Українська)*</Label>
              <Input
                id="name_uk"
                value={formData.name_uk || ""}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, name_uk: value })
                  if (!formData.slug && value) {
                    setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
                  }
                }}
                className={hasFieldError("name_uk") ? "border-red-500" : ""}
              />
              {getFieldError("name_uk") && (
                <p className="text-sm text-red-500">{getFieldError("name_uk")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_en">Назва (English)*</Label>
              <Input
                id="name_en"
                value={formData.name_en || ""}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className={hasFieldError("name_en") ? "border-red-500" : ""}
              />
              {getFieldError("name_en") && (
                <p className="text-sm text-red-500">{getFieldError("name_en")}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)*</Label>
            <Input
              id="slug"
              value={formData.slug || ""}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="product-name"
              className={hasFieldError("slug") ? "border-red-500" : ""}
            />
            {getFieldError("slug") && (
              <p className="text-sm text-red-500">{getFieldError("slug")}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description_uk">Опис (Українська)</Label>
              <SimpleHtmlEditor
                id="description_uk"
                value={formData.description_uk || ""}
                onChange={(value) => setFormData({ ...formData, description_uk: value })}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_en">Опис (English)</Label>
              <SimpleHtmlEditor
                id="description_en"
                value={formData.description_en || ""}
                onChange={(value) => setFormData({ ...formData, description_en: value })}
                rows={6}
              />
            </div>
          </div>

          {/* SEO Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seo_title_uk">SEO Заголовок (Українська)</Label>
              <Input
                id="seo_title_uk"
                value={formData.seo_title_uk || ""}
                onChange={(e) => setFormData({ ...formData, seo_title_uk: e.target.value })}
                placeholder="SEO заголовок для пошукових систем"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo_title_en">SEO Title (English)</Label>
              <Input
                id="seo_title_en"
                value={formData.seo_title_en || ""}
                onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
                placeholder="SEO title for search engines"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meta_description_uk">Мета-опис (Українська)</Label>
              <Textarea
                id="meta_description_uk"
                value={formData.meta_description_uk || ""}
                onChange={(e) => setFormData({ ...formData, meta_description_uk: e.target.value })}
                placeholder="Короткий опис для пошукових систем (до 160 символів)"
                rows={3}
                className="resize-none"
                maxLength={160}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description_en">Meta Description (English)</Label>
              <Textarea
                id="meta_description_en"
                value={formData.meta_description_en || ""}
                onChange={(e) => setFormData({ ...formData, meta_description_en: e.target.value })}
                placeholder="Short description for search engines (up to 160 characters)"
                rows={3}
                className="resize-none"
                maxLength={160}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price and Stock */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between min-h-[1.5rem]">
            <CardTitle>Ціна та наявність</CardTitle>
            <div className="min-w-[120px] text-right min-h-[1.5rem] flex items-center justify-end">
              {changedBlocks.has("price") && (
                <div className="flex items-center gap-2 text-sm text-[#D4834F]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Збереження...</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Ціна*</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className={hasFieldError("price") ? "border-red-500" : ""}
              />
              {getFieldError("price") && (
                <p className="text-sm text-red-500">{getFieldError("price")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="compare_at_price">Стара ціна</Label>
              <Input
                id="compare_at_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.compare_at_price || ""}
                onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value ? Number(e.target.value) : 0 })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Switch
                  checked={useStockQuantity}
                  onCheckedChange={setUseStockQuantity}
                />
                <Label>Використовувати кількість</Label>
              </div>
              {useStockQuantity ? (
                <>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className={hasFieldError("stock") ? "border-red-500" : ""}
                  />
                  {getFieldError("stock") && (
                    <p className="text-sm text-red-500">{getFieldError("stock")}</p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_in_stock}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, is_in_stock: checked })
                      // If there are price combinations, sync them with the general switch
                      if (priceCombs.length > 0) {
                        const updated = priceCombs.map(comb => ({
                          ...comb,
                          is_available: checked
                        }))
                        setPriceCombs(updated)
                      }
                    }}
                  />
                  <Label>В наявності</Label>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">Артикул (SKU)</Label>
            <Input
              id="sku"
              value={formData.sku || ""}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>
          
          {/* Price combinations table if >=1 price-affecting characteristics */}
          {(() => {
            const priceAffectingChars = productChars.filter(pc => {
              const charType = characteristicTypes.find(ct => ct.id === pc.characteristic_type_id)
              return (pc.affects_price ?? charType?.affects_price) === true
            })
            
            if (priceAffectingChars.length < 1) return null
            
            // Generate combinations function - based on ALL options from characteristic types
            const generateCombinations = (chars: typeof priceAffectingChars): Record<string, string>[] => {
              const combinations: Record<string, string>[] = []
              
              const recurse = (remainingChars: typeof priceAffectingChars, current: Record<string, string> = {}) => {
                if (remainingChars.length === 0) {
                  // Only add combination if it has at least one value
                  if (Object.keys(current).length > 0) {
                    combinations.push({ ...current })
                  }
                  return
                }
                
                const [first, ...rest] = remainingChars
                const charType = characteristicTypes.find(ct => ct.id === first.characteristic_type_id)
                if (!charType) {
                  recurse(rest, current)
                  return
                }
                
                // Get ALL options for this characteristic type (not selected ones)
                const allOptions = characteristicOptions.filter(co => co.characteristic_type_id === first.characteristic_type_id)
                
                if (allOptions.length > 0) {
                  // For select/checkbox/color types with options - use ALL options
                  allOptions.forEach(opt => {
                    recurse(rest, { ...current, [first.characteristic_type_id]: opt.id })
                  })
                } else if (charType.input_type === "text") {
                  // For text input type - client will enter text, we can't pre-generate combinations
                  // Skip text characteristics in price combinations
                  recurse(rest, current)
                } else if (charType.input_type === "color_palette") {
                  // For color palette - would need palette integration
                  // Skip for now
                  recurse(rest, current)
                } else {
                  // No options available - skip this characteristic
                  recurse(rest, current)
                }
              }
              
              recurse(chars)
              return combinations
            }
            
            return (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base font-semibold">Комбінації цін для характеристик</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Встановіть ціни для кожної комбінації характеристик
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const combinations = generateCombinations(priceAffectingChars)
                        
                        if (combinations.length === 0) {
                          showToast.error("Немає комбінацій для генерації. Перевірте, що характеристики мають опції в налаштуваннях.")
                          return
                        }
                        
                        // Merge with existing combinations to preserve prices
                        const existingCombinationsMap = new Map<string, PriceCombination>()
                        priceCombs.forEach(pc => {
                          const key = JSON.stringify(pc.combination)
                          existingCombinationsMap.set(key, pc)
                        })
                        
                        // Create price combinations for each, preserving existing prices
                        const newCombs = combinations.map(comb => {
                          const key = JSON.stringify(comb)
                          const existing = existingCombinationsMap.get(key)
                          return {
                            combination: comb,
                            price: existing?.price ?? formData.price,
                            is_available: existing?.is_available ?? formData.is_in_stock ?? true,
                            stock: existing?.stock ?? null,
                          }
                        })
                        
                        setPriceCombs(newCombs)
                        // Sync general switch with combinations
                        const hasAnyAvailable = newCombs.some(c => c.is_available)
                        if (hasAnyAvailable !== formData.is_in_stock) {
                          setFormData(prev => ({ ...prev, is_in_stock: hasAnyAvailable }))
                        }
                        showToast.success("Комбінації згенеровано")
                      } catch (error) {
                        console.error('Error generating combinations:', error)
                        showToast.error("Помилка при генерації комбінацій")
                      }
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {priceCombs.length > 0 ? "Оновити комбінації" : "Згенерувати комбінації"}
                  </Button>
                </div>
                
                {priceCombs.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          {priceAffectingChars.map(pc => {
                            const charType = characteristicTypes.find(ct => ct.id === pc.characteristic_type_id)
                            return <th key={pc.characteristic_type_id} className="text-left p-2 text-sm font-medium">{charType?.name_uk}</th>
                          })}
                          <th className="text-left p-2 text-sm font-medium">Ціна</th>
                          <th className="text-left p-2 text-sm font-medium">Наявність</th>
                          {useStockQuantity && (
                            <th className="text-left p-2 text-sm font-medium">Кількість</th>
                          )}
                          <th className="text-left p-2 text-sm font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceCombs.map((comb, idx) => (
                          <tr key={idx} className="border-b">
                            {priceAffectingChars.map(pc => {
                              const charType = characteristicTypes.find(ct => ct.id === pc.characteristic_type_id)
                              const value = comb.combination[pc.characteristic_type_id]
                              let displayValue = value
                              
                              if (charType?.input_type === "text") {
                                displayValue = value
                              } else {
                                const opt = characteristicOptions.find(o => o.id === value)
                                displayValue = opt?.name_uk || opt?.value || value
                              }
                              
                              return <td key={pc.characteristic_type_id} className="p-2 text-sm">{displayValue}</td>
                            })}
                            <td className="p-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={comb.price}
                                onChange={(e) => {
                                  const updated = [...priceCombs]
                                  updated[idx].price = Number(e.target.value)
                                  setPriceCombs(updated)
                                }}
                                className="w-24"
                              />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={comb.is_available ?? true}
                                  onCheckedChange={(checked) => {
                                    const updated = [...priceCombs]
                                    updated[idx].is_available = checked
                                    setPriceCombs(updated)
                                    // If at least one combination is available, set general switch to true
                                    const hasAnyAvailable = updated.some(c => c.is_available)
                                    if (hasAnyAvailable && !formData.is_in_stock) {
                                      setFormData({ ...formData, is_in_stock: true })
                                    } else if (!hasAnyAvailable && formData.is_in_stock) {
                                      setFormData({ ...formData, is_in_stock: false })
                                    }
                                  }}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {comb.is_available ? "Є" : "Немає"}
                                </span>
                              </div>
                            </td>
                            {useStockQuantity && (
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={comb.stock ?? ""}
                                  onChange={(e) => {
                                    const updated = [...priceCombs]
                                    updated[idx].stock = e.target.value ? Number(e.target.value) : null
                                    setPriceCombs(updated)
                                  }}
                                  className="w-24"
                                  placeholder="0"
                                />
                              </td>
                            )}
                            <td className="p-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPriceCombs(priceCombs.filter((_, i) => i !== idx))
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between min-h-[1.5rem]">
            <CardTitle>Категорії</CardTitle>
            <div className="min-w-[120px] text-right min-h-[1.5rem] flex items-center justify-end">
              {changedBlocks.has("categories") && (
                <div className="flex items-center gap-2 text-sm text-[#D4834F]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Збереження...</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Оберіть категорії (можна декілька)</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
              {categoriesTree.map((category) => (
                <div key={category.id} className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id])
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                        }
                      }}
                      className="rounded"
                    />
                    <span>{category.name_uk}</span>
                  </label>
                  {subcategoriesMap.has(category.id) && (
                    <div className="ml-6 space-y-1">
                      {subcategoriesMap.get(category.id)!.map((subcat) => (
                        <label key={subcat.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(subcat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, subcat.id])
                              } else {
                                setSelectedCategories(selectedCategories.filter(id => id !== subcat.id))
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-muted-foreground">— {subcat.name_uk}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between min-h-[1.5rem]">
            <CardTitle>Зображення</CardTitle>
            <div className="min-w-[140px] text-right min-h-[1.5rem] flex items-center justify-end">
              {(changedBlocks.has("images") || uploadingImages) && (
                <div className="flex items-center gap-2 text-sm text-[#D4834F]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{uploadingImages ? "Завантаження..." : "Збереження..."}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Завантажити зображення</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImages}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadingImages ? "Завантаження..." : "Вибрати файли"}
            </Button>
            {getFieldError("images") && (
              <p className="text-sm text-red-500">{getFieldError("images")}</p>
            )}
          </div>

          {imageUrls.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={imageUrls.map((_, i) => i.toString())}
                strategy={undefined}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <SortableImageItem
                      key={index}
                      id={index.toString()}
                      url={url}
                      index={index}
                      isMain={index === 0}
                      onRemove={() => removeImage(index)}
                      onSetMain={() => setMainImage(index)}
                      onLongPressStart={() => handleLongPressStart(index)}
                      onLongPressEnd={handleLongPressEnd}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Characteristics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between min-h-[1.5rem]">
            <CardTitle>Характеристики товару</CardTitle>
            <div className="min-w-[120px] text-right min-h-[1.5rem] flex items-center justify-end">
              {changedBlocks.has("characteristics") && (
                <div className="flex items-center gap-2 text-sm text-[#D4834F]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Збереження...</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event: DragEndEvent) => {
              const { active, over } = event
              if (over && active.id !== over.id) {
                setProductChars((items) => {
                  const oldIndex = items.findIndex((pc) => pc.characteristic_type_id === active.id)
                  const newIndex = items.findIndex((pc) => pc.characteristic_type_id === over.id)
                  const reordered = arrayMove(items, oldIndex, newIndex)
                  // Update positions
                  return reordered.map((item, index) => ({
                    ...item,
                    position: index,
                  }))
                })
              }
            }}
          >
            <SortableContext
              items={productChars.map(pc => pc.characteristic_type_id)}
              strategy={undefined}
            >
              <div className="space-y-4">
                {productChars.map((pc, index) => {
                  const charType = characteristicTypes.find(ct => ct.id === pc.characteristic_type_id)
                  if (!charType) return null
                  
                  const charOptions = characteristicOptions.filter(co => co.characteristic_type_id === pc.characteristic_type_id)
                  
                  return (
                    <SortableCharacteristicItem
                      key={pc.characteristic_type_id}
                      id={pc.characteristic_type_id}
                      pc={pc}
                      index={index}
                      charType={charType}
                      charOptions={charOptions}
                      productChars={productChars}
                      setProductChars={setProductChars}
                    />
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
          
          <div className="space-y-2">
            <Label>Додати характеристику</Label>
            <select
              onChange={(e) => {
                const charTypeId = e.target.value
                if (!charTypeId) return
                
                const charType = characteristicTypes.find(ct => ct.id === charTypeId)
                if (!charType) return
                
                // Check if already added
                if (productChars.some(pc => pc.characteristic_type_id === charTypeId)) {
                  showToast.error("Ця характеристика вже додана")
                  return
                }
                
                const newChar: ProductCharacteristic = {
                  characteristic_type_id: charTypeId,
                  required: charType.required,
                  affects_price: charType.affects_price,
                  position: productChars.length,
                }
                
                setProductChars([...productChars, newChar])
                e.target.value = ""
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Виберіть характеристику</option>
              {characteristicTypes
                .filter(ct => !productChars.some(pc => pc.characteristic_type_id === ct.id))
                .map(ct => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name_uk} ({ct.name_en})
                  </option>
                ))}
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateCharModal(true)
                setNewCharForm({
                  name_uk: "",
                  name_en: "",
                  input_type: "text",
                  required: false,
                  reusable: true,
                  affects_price: false,
                })
                setNewCharOptions([])
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Створити нову характеристику
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Characteristic Modal */}
      <Dialog open={showCreateCharModal} onOpenChange={setShowCreateCharModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Створити нову характеристику</DialogTitle>
            <DialogDescription>
              Створіть нову характеристику, яку можна використовувати для товарів
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Назва (UK)*</Label>
                <Input
                  value={newCharForm.name_uk}
                  onChange={(e) => setNewCharForm({ ...newCharForm, name_uk: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Назва (EN)*</Label>
                <Input
                  value={newCharForm.name_en}
                  onChange={(e) => setNewCharForm({ ...newCharForm, name_en: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Тип введення*</Label>
              <select
                value={newCharForm.input_type}
                onChange={(e) => {
                  setNewCharForm({ ...newCharForm, input_type: e.target.value as CharacteristicInputType })
                  setNewCharOptions([])
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
                  checked={newCharForm.required}
                  onCheckedChange={(checked) => setNewCharForm({ ...newCharForm, required: checked })}
                />
                <Label>Обов'язкова</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newCharForm.reusable}
                  onCheckedChange={(checked) => setNewCharForm({ ...newCharForm, reusable: checked })}
                />
                <Label>Переважна між товарами</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newCharForm.affects_price}
                  onCheckedChange={(checked) => setNewCharForm({ ...newCharForm, affects_price: checked })}
                />
                <Label>Впливає на ціну</Label>
              </div>
            </div>

            {/* Options for select/color_custom/checkbox */}
            {(newCharForm.input_type === "select" || newCharForm.input_type === "color_custom" || newCharForm.input_type === "checkbox") && (
              <div className="space-y-3 p-3 bg-background rounded-md border">
                <div className="flex items-center justify-between">
                  <Label>Опції</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setNewCharOptions([...newCharOptions, {}])}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newCharOptions.map((opt, idx) => (
                  <div key={idx} className="grid gap-2 md:grid-cols-4 items-end">
                    {newCharForm.input_type === "color_custom" && (
                      <div>
                        <Label>Колір (hex)</Label>
                        <Input
                          type="color"
                          value={opt.color_code || "#000000"}
                          onChange={(e) => {
                            const updated = [...newCharOptions]
                            updated[idx] = { ...updated[idx], color_code: e.target.value, value: e.target.value }
                            setNewCharOptions(updated)
                          }}
                          className="h-10"
                        />
                      </div>
                    )}
                    <div>
                      <Label>Назва (UK)</Label>
                      <Input
                        value={opt.name_uk || ""}
                        onChange={(e) => {
                          const updated = [...newCharOptions]
                          updated[idx] = { ...updated[idx], name_uk: e.target.value }
                          setNewCharOptions(updated)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Назва (EN)</Label>
                      <Input
                        value={opt.name_en || ""}
                        onChange={(e) => {
                          const updated = [...newCharOptions]
                          updated[idx] = { ...updated[idx], name_en: e.target.value }
                          setNewCharOptions(updated)
                        }}
                      />
                    </div>
                    {newCharForm.input_type !== "color_custom" && (
                      <div>
                        <Label>Значення*</Label>
                        <Input
                          value={opt.value || ""}
                          onChange={(e) => {
                            const updated = [...newCharOptions]
                            updated[idx] = { ...updated[idx], value: e.target.value }
                            setNewCharOptions(updated)
                          }}
                        />
                      </div>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setNewCharOptions(newCharOptions.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateCharModal(false)}
                disabled={creatingChar}
              >
                Скасувати
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!newCharForm.name_uk || !newCharForm.name_en) {
                    showToast.error("Заповніть назви українською та англійською")
                    return
                  }

                  const needsOptions = newCharForm.input_type === "select" || newCharForm.input_type === "color_custom" || newCharForm.input_type === "checkbox"
                  if (needsOptions && newCharOptions.length === 0) {
                    showToast.error("Додайте хоча б одну опцію для цього типу")
                    return
                  }

                  setCreatingChar(true)
                  const supabase = createClient()

                  try {
                    // Get max position
                    const { data: existingChars } = await supabase
                      .from("characteristic_types")
                      .select("position")
                      .order("position", { ascending: false })
                      .limit(1)
                    
                    const maxPosition = existingChars && existingChars.length > 0 ? existingChars[0].position : -1

                    // Prepare insert data
                    const insertData: any = {
                      name_uk: newCharForm.name_uk,
                      name_en: newCharForm.name_en,
                      input_type: newCharForm.input_type,
                      required: newCharForm.required,
                      reusable: newCharForm.reusable,
                      position: maxPosition + 1,
                    }
                    
                    // Only include affects_price if it's defined
                    if (newCharForm.affects_price !== undefined) {
                      insertData.affects_price = newCharForm.affects_price
                    }

                    const { data: newChar, error: charError } = await supabase
                      .from("characteristic_types")
                      .insert(insertData)
                      .select()
                      .single()

                    if (charError) throw charError

                    // Create options if needed
                    if (needsOptions && newCharOptions.length > 0) {
                      const optionsToInsert = newCharOptions.map((opt, idx) => ({
                        characteristic_type_id: newChar.id,
                        name_uk: opt.name_uk || null,
                        name_en: opt.name_en || null,
                        value: opt.value || opt.color_code || "",
                        color_code: opt.color_code || null,
                        position: idx,
                        is_available: true,
                        stock: useStockQuantity ? null : null,
                      }))

                      const { error: optionsError } = await supabase
                        .from("characteristic_options")
                        .insert(optionsToInsert)
                      
                      if (optionsError) throw optionsError
                    }

                    showToast.success("Характеристику створено")
                    setShowCreateCharModal(false)
                    router.refresh()
                  } catch (error: any) {
                    console.error("Error creating characteristic:", error)
                    showToast.error(`Помилка створення: ${error.message || "Невідома помилка"}`)
                  } finally {
                    setCreatingChar(false)
                  }
                }}
                disabled={creatingChar}
                className="bg-[#D4834F] hover:bg-[#C17340]"
              >
                {creatingChar ? "Створення..." : "Створити"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Downloadable Files */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between min-h-[1.5rem]">
            <CardTitle>Файли для завантаження</CardTitle>
            <div className="min-w-[120px] text-right min-h-[1.5rem] flex items-center justify-end">
              {changedBlocks.has("files") && (
                <div className="flex items-center gap-2 text-sm text-[#D4834F]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Збереження...</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Files */}
          {Object.keys(selectedFiles).length > 0 && (
            <div className="space-y-3">
              {Object.entries(selectedFiles).map(([fileId, showFile]) => {
                const file = availableFiles.find(f => f.id === fileId)
                if (!file) return null
                return (
                  <div key={fileId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="font-medium">
                        {file.title_uk || file.title_en}
                      </div>
                      {(file.description_uk || file.description_en) && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {file.description_uk || file.description_en}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={showFile ?? false}
                        onCheckedChange={(checked) => {
                          setSelectedFiles({ ...selectedFiles, [fileId]: checked })
                        }}
                      />
                      <Label className="text-sm">
                        {showFile ? "Показати" : "Приховати"}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSelected = { ...selectedFiles }
                          delete newSelected[fileId]
                          setSelectedFiles(newSelected)
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add Files Button */}
          {availableFiles.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Додати файли
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                {availableFiles
                  .filter(file => !selectedFiles.hasOwnProperty(file.id))
                  .map((file) => (
                    <DropdownMenuItem
                      key={file.id}
                      onClick={() => {
                        setSelectedFiles({ ...selectedFiles, [file.id]: true })
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{file.title_uk || file.title_en}</span>
                        {(file.description_uk || file.description_en) && (
                          <span className="text-xs text-muted-foreground">
                            {file.description_uk || file.description_en}
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                {availableFiles.filter(file => !selectedFiles.hasOwnProperty(file.id)).length === 0 && (
                  <DropdownMenuItem disabled>
                    Всі файли додані
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {availableFiles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Немає доступних файлів. Створіть файли в налаштуваннях.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between min-h-[1.5rem]">
            <CardTitle>Налаштування</CardTitle>
            <div className="min-w-[120px] text-right min-h-[1.5rem] flex items-center justify-end">
              {changedBlocks.has("settings") && (
                <div className="flex items-center gap-2 text-sm text-[#D4834F]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Збереження...</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label>Популярний товар</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Активний</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.some(e => e.field === "general") && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.find(e => e.field === "general")?.message}</p>
        </div>
      )}

      {/* Submit - only for new products */}
      {!product && (
        <div className="flex gap-4">
          <Button type="submit" className="bg-[#D4834F] hover:bg-[#C17340]" disabled={isLoading}>
            {isLoading ? "Створення..." : "Створити товар"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Скасувати
          </Button>
        </div>
      )}
    </form>
    </div>
  )
}

// Sortable Characteristic Item Component
interface SortableCharacteristicItemProps {
  id: string
  pc: ProductCharacteristic
  index: number
  charType: CharacteristicType
  charOptions: CharacteristicOption[]
  productChars: ProductCharacteristic[]
  setProductChars: (chars: ProductCharacteristic[]) => void
}

function SortableCharacteristicItem({
  id,
  pc,
  index,
  charType,
  charOptions,
  productChars,
  setProductChars,
}: SortableCharacteristicItemProps) {
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
      className="relative p-4 border rounded-md space-y-3"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing rounded-md"
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
        suppressHydrationWarning
      />
      <div className="flex items-center justify-between relative z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 text-muted-foreground">⋮⋮</div>
          <div>
            <h4 className="font-medium">{charType.name_uk}</h4>
            <p className="text-sm text-muted-foreground">{charType.name_en}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setProductChars(productChars.filter((_, i) => i !== index))
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="pointer-events-auto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4 relative z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <Switch
            checked={pc.required ?? charType.required}
            onCheckedChange={(checked) => {
              const updated = [...productChars]
              updated[index].required = checked
              setProductChars(updated)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="pointer-events-auto"
          />
          <Label className="text-sm">Обов'язкова</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={pc.affects_price ?? charType.affects_price}
            onCheckedChange={(checked) => {
              const updated = [...productChars]
              updated[index].affects_price = checked
              setProductChars(updated)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="pointer-events-auto"
          />
          <Label className="text-sm">Впливає на ціну</Label>
        </div>
      </div>
      
      {/* Text input for text type characteristics */}
      {charType.input_type === "text" && (
        <div className="relative z-10 pointer-events-auto space-y-2">
          <Label className="text-sm">Текст</Label>
          <Input
            value={(pc.selected_values as string) || ""}
            onChange={(e) => {
              const updated = [...productChars]
              updated[index].selected_values = e.target.value
              setProductChars(updated)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Введіть текст"
          />
        </div>
      )}
      
      {/* Show available options - client will choose on public page (not for text type) */}
      {charType.input_type !== "text" && (
        <div className="space-y-2 relative z-10">
          <Label className="text-sm font-medium">Доступні опції для клієнта:</Label>
          {charOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {charOptions.map(opt => (
                <div
                  key={opt.id}
                  className="px-3 py-1.5 bg-muted rounded-md text-sm"
                >
                  {opt.name_uk || opt.value}
                  {opt.color_code && (
                    <span
                      className="ml-2 inline-block w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: opt.color_code }}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Немає опцій. Додайте опції в налаштуваннях.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Sortable Image Item Component
interface SortableImageItemProps {
  id: string
  url: string
  index: number
  isMain: boolean
  onRemove: () => void
  onSetMain: () => void
  onLongPressStart: () => void
  onLongPressEnd: () => void
}

function SortableImageItem({
  id,
  url,
  index,
  isMain,
  onRemove,
  onSetMain,
  onLongPressStart,
  onLongPressEnd,
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
      suppressHydrationWarning
    >
      {/* Drag handle - covers entire area */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
        onContextMenu={(e) => {
          e.preventDefault()
          if (!isMain) {
            onSetMain()
          }
        }}
        suppressHydrationWarning
      />
      
      <div className="relative aspect-square rounded-md overflow-hidden border-2 border-border pointer-events-none">
        {isMain && (
          <div className="absolute top-2 left-2 z-10 bg-[#D4834F] text-white rounded-full p-1.5 shadow-lg pointer-events-auto">
            <Star className="h-4 w-4 fill-current" />
          </div>
        )}
        <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
        {isMain && (
          <div className="absolute inset-0 border-2 border-[#D4834F] rounded-md pointer-events-none" />
        )}
      </div>
      
      {/* Main image badge */}
      {isMain && (
        <div className="absolute -top-2 -left-2 z-10 bg-[#D4834F] text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-md">
          Головне
        </div>
      )}
      
      {/* Action buttons */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isMain && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 w-7 p-0 bg-[#D4834F] hover:bg-[#C17340] text-white"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onSetMain()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Зробити головним"
          >
            <Star className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onRemove()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Видалити"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {/* Drag handle indicator */}
      <div className="absolute bottom-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
          Перетягнути
        </div>
      </div>
    </div>
  )
}

