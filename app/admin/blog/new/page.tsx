import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BlogPostForm } from "@/components/admin/blog-post-form"

export default async function NewBlogPostPage() {
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

  return (
    <main className="container mx-auto p-6">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Нова стаття</h1>
      <BlogPostForm />
    </main>
  )
}
