import type React from "react"
import { OrganizationStructuredData } from "@/components/seo/structured-data"
import { createClient } from "@/lib/supabase/server"

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Fetch social media links for Organization Schema
  const supabase = await createClient()
  const { data: socialMediaLinks } = await supabase
    .from("social_media_links")
    .select("url, is_enabled")
    .eq("is_enabled", true)
  
  const socialMedia = (socialMediaLinks || []).map(link => ({
    url: link.url || '',
    enabled: link.is_enabled,
  }))
  
  return (
    <>
      <OrganizationStructuredData socialMedia={socialMedia} />
      {children}
    </>
  )
}

