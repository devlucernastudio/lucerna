import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BlogBackButton } from "@/components/blog/blog-back-button"
import { BlogPostContent } from "@/components/blog/blog-post-content"

export const revalidate = 0 // Disable caching to always show fresh data

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!post) {
    return {
      title: "Стаття не знайдена - Lucerna Studio",
    }
  }
  
  return {
    title: `${post.title_uk || post.title_en} - Lucerna Studio Blog`,
    description: post.excerpt_uk || post.excerpt_en || "",
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
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

