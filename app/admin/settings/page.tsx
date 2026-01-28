import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/admin/settings-form"
import { CategoriesManager } from "@/components/admin/categories-manager"
import { CharacteristicsManager } from "@/components/admin/characteristics-manager"
import { ContactSettingsManager } from "@/components/admin/contact-settings-manager"
import { DownloadableFilesManager } from "@/components/admin/downloadable-files-manager"

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
    <main className="container mx-auto p-4 md:p-6 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">Налаштування сайту</h1>
      
      <ContactSettingsManager />
      
      <CategoriesManager />
      
      <CharacteristicsManager />
      
      <DownloadableFilesManager />
      
      <SettingsForm contentBlocks={contentBlocks || []} />
    </main>
  )
}
