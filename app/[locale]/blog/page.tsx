import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { BlogHeader } from "@/components/blog/blog-header"
import { EmptyPosts } from "@/components/blog/empty-posts"

export const metadata = {
  title: "Блог - Lucerna Studio",
  description: "Новини, статті та натхнення від Lucerna Studio",
}

export const revalidate = 0 // Disable caching to always show fresh data

export default async function BlogPage() {
  const supabase = await createClient()

  // Fetch published blog posts from database
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })


  return (
    <main className="min-h-screen">
      <BlogHeader />

      {/* Blog Posts */}
      <section className="container mx-auto px-4 py-12">
        {posts && posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              // Skip posts without slug
              if (!post.slug) {
                return null
              }
              return (
                <Card key={post.id} className="overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
                  <Link href={`/blog/${encodeURIComponent(post.slug)}`}>
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={post.cover_image || "/placeholder.svg"}
                        alt={post.title_uk || post.title_en}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleDateString("uk-UA")}
                      </time>
                    </div>
                    <Link href={`/blog/${encodeURIComponent(post.slug)}`}>
                      <h3 className="mb-2 text-xl font-medium text-foreground hover:text-[#D4834F] transition-colors">
                        {post.title_uk || post.title_en}
                      </h3>
                    </Link>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt_uk || post.excerpt_en || ""}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyPosts />
        )}
      </section>
      <Footer />
    </main>
  )
}
