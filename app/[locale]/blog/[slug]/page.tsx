import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BlogBackButton } from "@/components/blog/blog-back-button"
import { BlogPostContent } from "@/components/blog/blog-post-content"

export const revalidate = 0 // Disable caching to always show fresh data

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!post) {
    return {
      title: locale === "uk" ? "Стаття не знайдена - Lucerna Studio" : "Article not found - Lucerna Studio",
    }
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/blog/${encodeURIComponent(slug)}`
  const title = `${post.title_uk || post.title_en} - Lucerna Studio Blog`
  const description = post.excerpt_uk || post.excerpt_en || ""
  const image = post.cover_image ? `${baseUrl}${post.cover_image}` : `${baseUrl}/og-image.jpg`
  
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/blog/${encodeURIComponent(slug)}`,
        'en-US': `${baseUrl}/en/blog/${encodeURIComponent(slug)}`,
        'x-default': `${baseUrl}/uk/blog/${encodeURIComponent(slug)}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Lucerna Studio",
      locale: locale === "uk" ? "uk_UA" : "en_US",
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const supabase = await createClient()

  // Decode slug in case it's URL encoded
  const decodedSlug = decodeURIComponent(slug).trim()

  // Try to find the post by slug - first try with exact match
  let { data: posts, error: postsError } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", decodedSlug)
    .eq("is_published", true)

  // If not found, try case-insensitive search
  if (postsError || !posts || posts.length === 0) {
    const { data: allPosts } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
    
    // Manual filter for case-insensitive match
    if (allPosts) {
      posts = allPosts.filter(p => p.slug && p.slug.toLowerCase() === decodedSlug.toLowerCase())
    }
  }

  // If still no posts found, show not found
  if (!posts || posts.length === 0) {
    notFound()
  }

  // Get the first post (should be only one due to unique slug constraint)
  const post = posts[0]

  return (
    <main className="min-h-screen">
      <BlogBackButton />
      <BlogPostContent post={post} />
    </main>
  )
}

