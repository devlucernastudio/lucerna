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
  key: string
  title_uk: string
  title_en: string
  content_uk: string
  content_en: string
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
        alert(`Помилка при оновленні блоку ${block.key}`)
        setLoading(false)
        return
      }
    }

    alert("Налаштування успішно збережено!")
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {blocks.map((block) => (
        <Card key={block.id}>
          <CardHeader>
            <CardTitle>Блок: {block.key}</CardTitle>
            <CardDescription>Редагування контенту для цього блоку</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor={`${block.id}-title_uk`}>Заголовок (UA)</Label>
                <Input
                  id={`${block.id}-title_uk`}
                  value={block.title_uk}
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
                  value={block.content_uk}
                  onChange={(e) => handleUpdateBlock(block.id, "content_uk", e.target.value)}
                  rows={4}
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
      ))}

      <Button type="submit" disabled={loading} className="bg-[#D4834F] hover:bg-[#C17340]">
        {loading ? "Збереження..." : "Зберегти налаштування"}
      </Button>
    </form>
  )
}
