import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BlogPostsTable } from "@/components/admin/blog-posts-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminBlogPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: adminData } = await supabase.from("admins").select("*").eq("id", user.id).single()

  if (!adminData) {
    redirect("/admin/login")
  }

  // Get all blog posts
  const { data: posts } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })

  return (
    <main className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Управління блогом</h1>
          <Link href="/admin/blog/new">
            <Button className="bg-[#D4834F] hover:bg-[#C17340]">
              <Plus className="mr-2 h-4 w-4" />
              Додати статтю
            </Button>
          </Link>
        </div>

        <BlogPostsTable posts={posts || []} />
    </main>
  )
}
