"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, Clock, MapPin } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { SocialMediaIcon } from "@/components/social-media-icons"

export default function ContactsPage() {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [contactSettings, setContactSettings] = useState({
    email: "",
    phone: "",
    working_hours_uk: "",
    working_hours_en: "",
    address_uk: "",
    address_en: "",
  })
  const [socialMediaLinks, setSocialMediaLinks] = useState<
    Array<{ platform: string; url: string; is_enabled: boolean }>
  >([])

  useEffect(() => {
    loadContactData()
  }, [])

  const loadContactData = async () => {
    const supabase = createClient()

    // Load contact settings
    const { data: contactData } = await supabase
      .from("site_contact_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single()

    if (contactData) {
      setContactSettings({
        email: contactData.email || "",
        phone: contactData.phone || "",
        working_hours_uk: contactData.working_hours_uk || "",
        working_hours_en: contactData.working_hours_en || "",
        address_uk: contactData.address_uk || "",
        address_en: contactData.address_en || "",
      })
    }

    // Load enabled social media links
    const { data: socialData } = await supabase
      .from("social_media_links")
      .select("*")
      .eq("is_enabled", true)
      .order("platform")

    if (socialData) {
      setSocialMediaLinks(
        socialData.map((item) => ({
          platform: item.platform,
          url: item.url || "",
          is_enabled: item.is_enabled,
        }))
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSuccess(true)
    setIsLoading(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setSuccess(false)
      setFormData({ name: "", email: "", phone: "", message: "" })
    }, 3000)
  }

  const workingHours = locale === "uk" ? contactSettings.working_hours_uk : contactSettings.working_hours_en
  const address = locale === "uk" ? contactSettings.address_uk : contactSettings.address_en

  return (
    <>
      <main className="min-h-screen">
        <section className="border-b border-border bg-secondary py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-4xl font-light text-foreground">{t("contacts.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("contacts.getInTouch")}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{locale === "uk" ? "Напишіть нам" : "Send us a message"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("contacts.name")}*</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t("contacts.email")}*</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("contacts.phone")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t("contacts.message")}*</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        required
                      />
                    </div>

                    {success && (
                      <p className="text-sm text-green-600">
                        {locale === "uk" ? "Ваше повідомлення надіслано!" : "Your message has been sent!"}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-[#D4834F] hover:bg-[#C17340]"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (locale === "uk" ? "Надсилання..." : "Sending...") : t("contacts.send")}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("contacts.info")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {contactSettings.email && (
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D4834F]/10">
                          <Mail className="h-6 w-6 text-[#D4834F]" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Email</p>
                          <p className="text-sm text-muted-foreground">{contactSettings.email}</p>
                        </div>
                      </div>
                    )}

                    {contactSettings.phone && (
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D4834F]/10">
                          <Phone className="h-6 w-6 text-[#D4834F]" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{t("contacts.phone")}</p>
                          <p className="text-sm text-muted-foreground">{contactSettings.phone}</p>
                        </div>
                      </div>
                    )}

                    {workingHours && (
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D4834F]/10">
                          <Clock className="h-6 w-6 text-[#D4834F]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {locale === "uk" ? "Графік роботи" : "Working Hours"}
                          </p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{workingHours}</p>
                        </div>
                      </div>
                    )}

                    {address && (
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D4834F]/10">
                          <MapPin className="h-6 w-6 text-[#D4834F]" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {locale === "uk" ? "Адреса" : "Address"}
                          </p>
                          <p className="text-sm text-muted-foreground">{address}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {socialMediaLinks.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 font-semibold text-foreground">
                        {locale === "uk" ? "Соціальні мережі" : "Social Media"}
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        {socialMediaLinks.map((link) => (
                          <a
                            key={link.platform}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4834F] text-white transition-colors hover:bg-[#C17340]"
                          >
                            <SocialMediaIcon platform={link.platform} />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
