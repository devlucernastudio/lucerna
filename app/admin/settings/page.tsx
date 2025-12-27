import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"
import { SettingsForm } from "@/components/admin/settings-form"

export default async function AdminSettingsPage() {
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

  // Get content blocks
  const { data: contentBlocks } = await supabase.from("content_blocks").select("*").order("created_at")

  return (
    <div className="min-h-screen bg-secondary">
      <AdminNav currentPath="/admin/settings" />
      <main className="container mx-auto p-6">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Налаштування сайту</h1>
        <SettingsForm contentBlocks={contentBlocks || []} />
      </main>
    </div>
  )
}
