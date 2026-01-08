"use client"

import { useState, useEffect } from "react"
import { LocaleLink } from "@/lib/locale-link"
import Image from "next/image"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import { createClient } from "@/lib/supabase/client"
import { SocialMediaIcon } from "@/components/social-media-icons"

interface SocialMediaLink {
  id: string
  platform: string
  url: string | null
  is_enabled: boolean
}

export function Footer() {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)
  const [contactSettings, setContactSettings] = useState<{
    email: string | null
    phone: string | null
  }>({
    email: null,
    phone: null,
  })
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([])

  useEffect(() => {
    loadContactData()
  }, [])

  const loadContactData = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("site_contact_settings")
      .select("email, phone")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single()

    if (data) {
      setContactSettings({
        email: data.email,
        phone: data.phone,
      })
    }

    // Load social media links
    const { data: socialData } = await supabase
      .from("social_media_links")
      .select("*")
      .eq("is_enabled", true)
      .order("platform")

    if (socialData) {
      setSocialMediaLinks(socialData)
    }
  }

  return (
    <footer className="border-t border-border bg-background">
      {/* Sticky logo bar */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-center items-center">
          <Image
            src="/logoLucernaC.png"
            alt="Lucerna Studio"
            width={180}
            height={180}
            className="h-auto w-auto max-w-[180px]"
          />
        </div>
      </div>
      
      {/* Main footer content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Lucerna Studio</h3>
              <p className="text-sm mb-4 text-muted-foreground">{t("footer.handmade")}</p>
              
              {/* Social Media Icons */}
              {socialMediaLinks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {socialMediaLinks.map((link) => (
                    link.url && (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-[#D4834F] transition-colors"
                        aria-label={link.platform}
                      >
                        <SocialMediaIcon platform={link.platform} className="h-5 w-5" />
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                {locale === "uk" ? "Навігація" : "Navigation"}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <LocaleLink href="/catalog" className="text-muted-foreground hover:text-[#D4834F]">
                    {t("nav.catalog")}
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink href="/about" className="text-muted-foreground hover:text-[#D4834F]">
                    {t("nav.about")}
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink href="/blog" className="text-muted-foreground hover:text-[#D4834F]">
                    {t("nav.blog")}
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink href="/contacts" className="text-muted-foreground hover:text-[#D4834F]">
                    {t("nav.contacts")}
                  </LocaleLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                {locale === "uk" ? "Юридична інформація" : "Legal Information"}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <LocaleLink href="/privacy" className="text-muted-foreground hover:text-[#D4834F]">
                    {locale === "uk" ? "Політика конфіденційності" : "Privacy Policy"}
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink href="/terms" className="text-muted-foreground hover:text-[#D4834F]">
                    {locale === "uk" ? "Публічна оферта" : "Terms of Service"}
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink href="/payment-delivery" className="text-muted-foreground hover:text-[#D4834F]">
                    {locale === "uk" ? "Оплата і доставка" : "Payment & Delivery"}
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink href="/returns" className="text-muted-foreground hover:text-[#D4834F]">
                    {locale === "uk" ? "Повернення товару" : "Returns"}
                  </LocaleLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">{t("contacts.title")}</h3>
              {contactSettings.email && (
                <p className="text-sm text-muted-foreground">Email: {contactSettings.email}</p>
              )}
              {contactSettings.phone && (
                <p className="text-sm text-muted-foreground mt-2">
                  {locale === "uk" ? "Телефон" : "Phone"}: {contactSettings.phone}
                </p>
              )}
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            {t("footer.rights")}
          </div>
        </div>
      </div>
    </footer>
  )
}
