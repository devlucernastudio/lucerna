import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"
import { BlogPostForm } from "@/components/admin/blog-post-form"

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Get blog post
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single()

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-secondary">
      <AdminNav currentPath="/admin/blog" />
      <main className="container mx-auto p-6">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Редагувати статтю</h1>
        <BlogPostForm post={post} />
      </main>
    </div>
  )
}
