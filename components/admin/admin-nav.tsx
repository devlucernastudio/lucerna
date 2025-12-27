"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Package, ShoppingBag, FileText, Settings, LogOut, LayoutDashboard } from "lucide-react"

export function AdminNav({ currentPath }: { currentPath: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const navItems = [
    { href: "/admin", label: "Панель", icon: LayoutDashboard },
    { href: "/admin/products", label: "Товари", icon: Package },
    { href: "/admin/orders", label: "Замовлення", icon: ShoppingBag },
    { href: "/admin/blog", label: "Блог", icon: FileText },
    { href: "/admin/settings", label: "Налаштування", icon: Settings },
  ]

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D4834F]">
              <span className="text-sm font-semibold text-[#D4834F]">L</span>
            </div>
            <span className="text-sm font-semibold">LUCERNA ADMIN</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={currentPath === item.href ? "default" : "ghost"}
                  size="sm"
                  className={
                    currentPath === item.href
                      ? "bg-[#D4834F] hover:bg-[#C17340]"
                      : "hover:bg-secondary hover:text-[#D4834F]"
                  }
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Вийти
        </Button>
      </div>
    </nav>
  )
}
