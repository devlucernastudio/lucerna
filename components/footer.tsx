"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"

export function Footer() {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Lucerna Studio</h3>
            <p className="text-sm text-muted-foreground">{t("footer.handmade")}</p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              {locale === "uk" ? "Навігація" : "Navigation"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalog" className="text-muted-foreground hover:text-[#D4834F]">
                  {t("nav.catalog")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-[#D4834F]">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-[#D4834F]">
                  {t("nav.blog")}
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-muted-foreground hover:text-[#D4834F]">
                  {t("nav.contacts")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">{t("contacts.title")}</h3>
            <p className="text-sm text-muted-foreground">Email: info@lucerna-studio.com</p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  )
}
