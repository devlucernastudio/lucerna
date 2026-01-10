"use client"

import { LocaleLink } from "@/lib/locale-link"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n-context"

interface Category {
  id: string
  name_uk: string
  name_en: string
  slug: string
  parent_id?: string | null
}

interface CategoryFilterProps {
  categories: Category[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category")
  const { locale } = useI18n()

  // Filter out subcategories for main filter (or show all if needed)
  const mainCategories = categories.filter(cat => !cat.parent_id)

  if (mainCategories.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <LocaleLink href="/catalog">
          <Badge
            variant={!selectedCategory ? "default" : "outline"}
            className={`cursor-pointer transition-colors btn-feedback ${
              !selectedCategory
                ? "bg-[#D4834F] text-white hover:bg-[#C17340]"
                : "hover:bg-muted"
            }`}
          >
            {locale === "uk" ? "Всі товари" : "All Products"}
          </Badge>
        </LocaleLink>
        {mainCategories.map((category) => (
          <LocaleLink key={category.id} href={`/catalog?category=${category.slug}`}>
            <Badge
              variant={selectedCategory === category.slug ? "default" : "outline"}
              className={`cursor-pointer transition-colors btn-feedback ${
                selectedCategory === category.slug
                  ? "bg-[#D4834F] text-white hover:bg-[#C17340]"
                  : "hover:bg-muted"
              }`}
            >
              {locale === "uk" ? category.name_uk : category.name_en}
            </Badge>
          </LocaleLink>
        ))}
      </div>
    </div>
  )
}

