"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ContentBlock {
  id: string
  type: string
  title_uk: string | null
  title_en: string | null
  content_uk: string | null
  content_en: string | null
}

export function SettingsForm({ contentBlocks }: { contentBlocks: ContentBlock[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [blocks, setBlocks] = useState<ContentBlock[]>(contentBlocks)

  const handleUpdateBlock = (id: string, field: string, value: string) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, [field]: value } : block)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    // Update all blocks
    for (const block of blocks) {
      const { error } = await supabase
        .from("content_blocks")
        .update({
          title_uk: block.title_uk,
          title_en: block.title_en,
          content_uk: block.content_uk,
          content_en: block.content_en,
        })
        .eq("id", block.id)

      if (error) {
        const blockTypeNames: Record<string, string> = {
          hero: "Головний банер",
          features: "Особливості",
          about: "Про Lucerna Studio",
          about_page: "Сторінка 'Про нас'",
          gallery: "Галерея",
          testimonials: "Відгуки",
          cta: "Призив до дії"
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
    hero: "Головний банер",
    features: "Особливості",
    about: "Про Lucerna Studio",
    about_page: "Сторінка 'Про нас'",
    gallery: "Галерея",
    testimonials: "Відгуки",
    cta: "Призив до дії"
  }

  const blockDescriptions: Record<string, string> = {
    hero: "Великий банер з заголовком та текстом на початку головної сторінки",
    features: "Блок з особливостями/перевагами товарів або сервісу",
    about: "Секція з описом про Lucerna Studio та текст, що відображається на головній сторінці",
    about_page: "Контент для сторінки 'Про нас' - заголовок та текст з HTML форматуванням",
    gallery: "Галерея зображень товарів",
    testimonials: "Блок з відгуками клієнтів",
    cta: "Призив до дії з кнопкою замовлення"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {blocks.map((block) => {
        const blockName = blockTypeNames[block.type] || block.type
        const blockDescription = blockDescriptions[block.type] || "Редагування контенту для цього блоку на головній сторінці"
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
