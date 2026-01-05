"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BlogPost {
  id: string
  title_uk: string
  title_en: string
  slug: string
  excerpt_uk: string
  excerpt_en: string
  content_uk: string
  content_en: string
  image_url?: string
  is_published: boolean
}

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title_uk: post?.title_uk || "",
    title_en: post?.title_en || "",
    slug: post?.slug || "",
    excerpt_uk: post?.excerpt_uk || "",
    excerpt_en: post?.excerpt_en || "",
    content_uk: post?.content_uk || "",
    content_en: post?.content_en || "",
    cover_image: post?.cover_image || "",
    is_published: post?.is_published || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    if (post) {
      // Update existing post
      const { error } = await supabase.from("blog_posts").update(formData).eq("id", post.id)

      if (error) {
        alert("Помилка при оновленні статті")
        setLoading(false)
        return
      }
    } else {
      // Create new post
      const { error } = await supabase.from("blog_posts").insert([formData])

      if (error) {
        alert("Помилка при створенні статті")
        setLoading(false)
        return
      }
    }

    router.push("/admin/blog")
    router.refresh()
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-яії]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Українська версія</CardTitle>
          <CardDescription>Контент статті українською мовою</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title_uk">Назва *</Label>
            <Input
              id="title_uk"
              value={formData.title_uk}
              onChange={(e) => {
                setFormData({ ...formData, title_uk: e.target.value })
                if (!post && !formData.slug) {
                  setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))
                }
              }}
              required
            />
          </div>

          <div>
            <Label htmlFor="excerpt_uk">Короткий опис *</Label>
            <Textarea
              id="excerpt_uk"
              value={formData.excerpt_uk}
              onChange={(e) => setFormData({ ...formData, excerpt_uk: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="content_uk">Контент *</Label>
            <Textarea
              id="content_uk"
              value={formData.content_uk}
              onChange={(e) => setFormData({ ...formData, content_uk: e.target.value })}
              rows={10}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>English version</CardTitle>
          <CardDescription>Article content in English</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title_en">Title *</Label>
            <Input
              id="title_en"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="excerpt_en">Excerpt *</Label>
            <Textarea
              id="excerpt_en"
              value={formData.excerpt_en}
              onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="content_en">Content *</Label>
            <Textarea
              id="content_en"
              value={formData.content_en}
              onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
              rows={10}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Додаткові налаштування</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
            <p className="mt-1 text-sm text-muted-foreground">URL: /blog/{formData.slug}</p>
          </div>

          <div>
            <Label htmlFor="cover_image">URL зображення</Label>
            <Input
              id="cover_image"
              type="url"
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="is_published">Опублікувати статтю</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="bg-[#D4834F] hover:bg-[#C17340]">
          {loading ? "Збереження..." : post ? "Оновити" : "Створити"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Скасувати
        </Button>
      </div>
    </form>
  )
}
