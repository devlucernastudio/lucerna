"use client"

import { useState } from "react"
import { LocaleLink } from "@/lib/locale-link"
import { usePathname } from "next/navigation"
import { ShoppingCart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import Image from "next/image"

export function Header() {
  const { cart } = useCart()
  const { locale } = useI18n()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const t = (key: string) => getTranslation(locale, key)

  const isActive = (path: string) => {
    // Remove locale prefix from pathname for comparison
    let pathnameWithoutLocale = pathname
    // Remove locale prefix like /uk/ or /en/
    if (pathnameWithoutLocale.match(/^\/[a-z]{2}\//)) {
      pathnameWithoutLocale = pathnameWithoutLocale.replace(/^\/[a-z]{2}/, "")
    } else if (pathnameWithoutLocale.match(/^\/[a-z]{2}$/)) {
      pathnameWithoutLocale = "/"
    }
    
    if (path === "/") {
      return pathnameWithoutLocale === "/" || pathnameWithoutLocale === ""
    }
    return pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(path + "/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-[3px] supports-[backdrop-filter]:bg-background/60">
      <div className="container overflow-y-hidden mx-auto md:max-w-[58rem] lg:max-w-[64rem] xl:max-w-[80rem] 2xl:max-w-[96rem] flex h-17 items-center justify-between px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 justify-between">
          <nav className="flex items-center gap-6">
            <LocaleLink 
              href="/" 
              className={`text-sm font-medium transition-colors btn-feedback ${
                isActive("/") ? "text-[#D4834F]" : "hover:text-[#D4834F]"
              }`}
            >
              {t("nav.home")}
            </LocaleLink>
            <LocaleLink 
              href="/catalog" 
              className={`text-sm font-medium transition-colors btn-feedback ${
                isActive("/catalog") ? "text-[#D4834F]" : "hover:text-[#D4834F]"
              }`}
            >
              {t("nav.catalog")}
            </LocaleLink>
            <LocaleLink 
              href="/blog" 
              className={`text-sm font-medium transition-colors btn-feedback ${
                isActive("/blog") ? "text-[#D4834F]" : "hover:text-[#D4834F]"
              }`}
            >
              {t("nav.blog")}
            </LocaleLink>
            <LocaleLink 
              href="/about" 
              className={`text-sm font-medium transition-colors btn-feedback ${
                isActive("/about") ? "text-[#D4834F]" : "hover:text-[#D4834F]"
              }`}
            >
              {t("nav.about")}
            </LocaleLink>
            <LocaleLink 
              href="/contacts" 
              className={`text-sm font-medium transition-colors btn-feedback ${
                isActive("/contacts") ? "text-[#D4834F]" : "hover:text-[#D4834F]"
              }`}
            >
              {t("nav.contacts")}
            </LocaleLink>
          </nav>

          
        </div>
        <LocaleLink href="/" className="hidden md:flex ml-auto mr-auto items-center gap-2 scale-[1.8] btn-feedback">
            <Image unoptimized src="/logoLucerna.png" alt="Lucerna Studio logo" width={80} height={80} />
          </LocaleLink>

        {/* Mobile: Menu button on left */}
        <div className="md:hidden btn-feedback">
          <Button
            variant="ghost"
            className="h-full"
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t("nav.title")}
          >
            <Menu style={{height: 22, width: 22}} className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile: Logo centered */}
        <div className="md:hidden flex-1 flex justify-center btn-feedback">
          <LocaleLink href="/" className="flex items-center gap-2 scale-[1.8]">
            <Image unoptimized src="/logoLucerna.png" alt="Lucerna Studio" width={80} height={80} />
          </LocaleLink>
        </div>

        {/* Desktop: Right side actions */}
        <div className="hidden md:flex ml-auto items-center gap-4">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <LocaleLink href="/cart" className="relative btn-feedback" aria-label={t("cart.title")}>
              <ShoppingCart style={{height: 22, width: 22}} className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4834F] text-xs font-medium text-white">
                  {totalItems}
                </span>
              )}
            </LocaleLink>
          </Button>
        </div>

        {/* Mobile: Cart button on right */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm" asChild>
            <LocaleLink href="/cart" className="relative btn-feedback" aria-label={t("cart.title")}>
              <ShoppingCart style={{height: 22, width: 22}} className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4834F] text-xs font-medium text-white">
                  {totalItems}
                </span>
              )}
            </LocaleLink>
          </Button>
        </div>
      </div>

      {/* Mobile Side Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-[3px] supports-[backdrop-filter]:bg-background/85">
          <SheetHeader>
            <SheetTitle>{locale === "uk" ? "Меню" : "Menu"}</SheetTitle>
            <SheetDescription className="sr-only">
              {locale === "uk" ? "Навігаційне меню сайту" : "Site navigation menu"}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <nav className="flex flex-col gap-4 mt-6 flex-1">
              <SheetClose asChild>
                <LocaleLink
                  href="/"
                  className={`text-base font-medium transition-colors py-2 btn-feedback ${
                    isActive("/") ? "text-[#D4834F]" : "hover:text-[#D4834F]"
                  }`}
                >
                  {t("nav.home")}
                </LocaleLink>
              </SheetClose>
              <SheetClose asChild>
                <LocaleLink
                  href="/catalog"
                  className={`text-base font-medium transition-colors py-2 btn-feedback ${
                    isActive("/catalog") ? "text-[#D4834F]" : "hover:text-[#D4834F]"
                  }`}
                >
                  {t("nav.catalog")}
                </LocaleLink>
              </SheetClose>
              <SheetClose asChild>
                <LocaleLink
                  href="/blog"
                  className={`text-base font-medium transition-colors py-2 btn-feedback ${
                    isActive("/blog") ? "text-[#D4834F]" : "hover:text-[#D4834F]"
                  }`}
                >
                  {t("nav.blog")}
                </LocaleLink>
              </SheetClose>
              <SheetClose asChild>
                <LocaleLink
                  href="/about"
                  className={`text-base font-medium transition-colors py-2 btn-feedback ${
                    isActive("/about") ? "text-[#D4834F]" : "hover:text-[#D4834F]"
                  }`}
                >
                  {t("nav.about")}
                </LocaleLink>
              </SheetClose>
              <SheetClose asChild>
                <LocaleLink
                  href="/contacts"
                  className={`text-base font-medium transition-colors py-2 btn-feedback ${
                    isActive("/contacts") ? "text-[#D4834F]" : "hover:text-[#D4834F]"
                  }`}
                >
                  {t("nav.contacts")}
                </LocaleLink>
              </SheetClose>
            </nav>
            {/* Language switcher at the bottom */}
            <div className="mt-auto pt-6 pb-6 border-t">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-muted-foreground">Мова</span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
