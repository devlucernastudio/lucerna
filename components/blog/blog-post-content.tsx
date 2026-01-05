"use client"

import Image from "next/image"
import { Calendar } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

interface BlogPostContentProps {
  post: {
    cover_image?: string | null
    title_uk: string
    title_en: string
    content_uk: string
    content_en: string
    created_at: string
  }
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const { locale } = useI18n()

  const title = locale === "uk" ? post.title_uk : post.title_en
  const content = locale === "uk" ? post.content_uk : post.content_en

  return (
    <article className="container mx-auto px-4 pb-16">
      <div className="mx-auto max-w-3xl">
        {/* Hero Image */}
        {post.cover_image && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-lg bg-muted">
            <Image 
              src={post.cover_image} 
              alt={title} 
              fill 
              className="object-cover" 
              priority 
            />
          </div>
        )}

        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString(locale === "uk" ? "uk-UA" : "en-US")}
            </time>
          </div>
          <h1 className="text-balance text-4xl font-light text-foreground">
            {title}
          </h1>
        </header>

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ 
            __html: content 
          }}
        />
      </div>
    </article>
  )
}

