"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Package, ShoppingBag, FileText, Settings, LogOut, LayoutDashboard, Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState, useEffect } from "react"

export function AdminNav() {
  const router = useRouter()
  const pathname = usePathname()
  const currentPath = pathname || "/admin"
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  const NavLink = ({ item }: { item: typeof navItems[0] }) => (
    <Link 
      href={item.href} 
      onClick={() => setOpen(false)}
      className="w-full"
    >
      <Button
        variant={currentPath === item.href ? "default" : "ghost"}
        size="sm"
        className={`w-full justify-start ${
          currentPath === item.href
            ? "bg-[#D4834F] hover:bg-[#C17340]"
            : "hover:bg-secondary hover:text-[#D4834F]"
        }`}
      >
        <item.icon className="mr-2 h-4 w-4" />
        {item.label}
      </Button>
    </Link>
  )

  // Prevent hydration mismatch by using consistent values
  const safeCurrentPath = isMounted ? currentPath : "/admin"

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D4834F]">
              <span className="text-sm font-semibold text-[#D4834F]">L</span>
            </div>
            <span className="hidden sm:inline-block text-sm font-semibold">LUCERNA ADMIN</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={safeCurrentPath === item.href ? "default" : "ghost"}
                  size="sm"
                  className={
                    safeCurrentPath === item.href
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

        <div className="flex items-center gap-2">
          {/* Mobile Menu Button - only render on client */}
          {isMounted && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Меню</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-2">
                  {navItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Вийти
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          {/* Fallback button for SSR - hidden on client when Sheet is mounted */}
          {!isMounted && (
            <Button variant="ghost" size="sm" className="lg:hidden" disabled>
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Desktop Sign Out Button */}
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden lg:flex">
            <LogOut className="mr-2 h-4 w-4" />
            Вийти
          </Button>
        </div>
      </div>
    </nav>
  )
}
