"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string
  title_uk: string
  title_en: string
  slug: string
  is_published: boolean
  created_at: string
}

export function BlogPostsTable({ posts }: { posts: BlogPost[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю статтю?")) return

    setLoading(id)
    const supabase = createClient()
    const { error } = await supabase.from("blog_posts").delete().eq("id", id)

    if (error) {
      alert("Помилка при видаленні статті")
      setLoading(null)
      return
    }

    router.refresh()
    setLoading(null)
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setLoading(id)
    const supabase = createClient()
    const { error } = await supabase.from("blog_posts").update({ is_published: !currentStatus }).eq("id", id)

    if (error) {
      alert("Помилка при зміні статусу")
      setLoading(null)
      return
    }

    router.refresh()
    setLoading(null)
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Немає статей. Додайте першу статтю для блогу.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Назва (UA)</TableHead>
            <TableHead>Назва (EN)</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата створення</TableHead>
            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title_uk}</TableCell>
              <TableCell>{post.title_en}</TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">{post.slug}</TableCell>
              <TableCell>
                <Badge variant={post.is_published ? "default" : "secondary"}>
                  {post.is_published ? "Опубліковано" : "Чернетка"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString("uk-UA")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/blog/${post.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublish(post.id, post.is_published)}
                    disabled={loading === post.id}
                  >
                    {post.is_published ? "Сховати" : "Опублікувати"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    disabled={loading === post.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
