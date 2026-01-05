import type React from "react"
import { AdminNav } from "@/components/admin/admin-nav"
import { I18nProvider } from "@/lib/i18n-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider initialLocale="uk">
      <div className="min-h-screen bg-secondary">
        <AdminNav />
        <main>{children}</main>
      </div>
    </I18nProvider>
  )
}
