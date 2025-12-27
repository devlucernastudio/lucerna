"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
  const { cart } = useCart()
  const { locale } = useI18n()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const t = (key: string) => getTranslation(locale, key)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D4834F]">
              <span className="text-sm font-semibold text-[#D4834F]">L</span>
            </div>
            <span className="hidden text-sm font-medium md:inline-block">LUCERNA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-[#D4834F] transition-colors">
              {t("nav.home")}
            </Link>
            <Link href="/catalog" className="text-sm font-medium hover:text-[#D4834F] transition-colors">
              {t("nav.catalog")}
            </Link>
            <Link href="/blog" className="text-sm font-medium hover:text-[#D4834F] transition-colors">
              {t("nav.blog")}
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-[#D4834F] transition-colors">
              {t("nav.about")}
            </Link>
            <Link href="/contacts" className="text-sm font-medium hover:text-[#D4834F] transition-colors">
              {t("nav.contacts")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4834F] text-xs font-medium text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
