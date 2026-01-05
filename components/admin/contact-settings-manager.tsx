"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { showToast } from "@/lib/toast"

interface ContactSettings {
  id: string
  email: string | null
  phone: string | null
  working_hours_uk: string | null
  working_hours_en: string | null
  address_uk: string | null
  address_en: string | null
  notification_email: string | null
  resend_api_key: string | null
}

interface SocialMediaLink {
  id: string
  platform: string
  url: string | null
  is_enabled: boolean
}

const PLATFORM_NAMES: Record<string, { uk: string; en: string }> = {
  facebook: { uk: "Facebook", en: "Facebook" },
  instagram: { uk: "Instagram", en: "Instagram" },
  viber: { uk: "Viber", en: "Viber" },
  telegram: { uk: "Telegram", en: "Telegram" },
  whatsapp: { uk: "WhatsApp", en: "WhatsApp" },
  threads: { uk: "Threads", en: "Threads" },
  x: { uk: "X (Twitter)", en: "X (Twitter)" },
}

export function ContactSettingsManager() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    id: "",
    email: "",
    phone: "",
    working_hours_uk: "",
    working_hours_en: "",
    address_uk: "",
    address_en: "",
    notification_email: "",
    resend_api_key: "",
  })
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Load contact settings
    const { data: contactData } = await supabase
      .from("site_contact_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single()

    if (contactData) {
      setContactSettings(contactData)
    }

    // Load social media links
    const { data: socialData } = await supabase
      .from("social_media_links")
      .select("*")
      .order("platform")

    if (socialData) {
      setSocialMediaLinks(socialData)
    }
  }

  const handleContactSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from("site_contact_settings")
      .upsert({
        ...contactSettings,
        id: "00000000-0000-0000-0000-000000000001",
      })

    if (error) {
      showToast.error("Помилка при збереженні контактів")
    } else {
      showToast.success("Контакти збережено")
    }
    setLoading(false)
  }

  const handleSocialMediaSave = async () => {
    setLoading(true)
    for (const link of socialMediaLinks) {
      const { error } = await supabase
        .from("social_media_links")
        .update({
          url: link.url,
          is_enabled: link.is_enabled,
        })
        .eq("id", link.id)

      if (error) {
        showToast.error(`Помилка при збереженні ${PLATFORM_NAMES[link.platform]?.uk}`)
        setLoading(false)
        return
      }
    }
    showToast.success("Соцмережі збережено")
    setLoading(false)
  }

  const handleSocialMediaToggle = (id: string, enabled: boolean) => {
    setSocialMediaLinks(
      socialMediaLinks.map((link) => (link.id === id ? { ...link, is_enabled: enabled } : link))
    )
  }

  const handleSocialMediaUrlChange = (id: string, url: string) => {
    setSocialMediaLinks(
      socialMediaLinks.map((link) => (link.id === id ? { ...link, url } : link))
    )
  }

  return (
    <div className="space-y-6">
      {/* Contact Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Контактна інформація</CardTitle>
          <CardDescription>Налаштування контактів для відображення на сторінці Контакти</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactSettings.email || ""}
                onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                placeholder="info@lucerna-studio.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={contactSettings.phone || ""}
                onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                placeholder="+380 (XX) XXX-XX-XX"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="working_hours_uk">Графік роботи (UA)</Label>
              <Textarea
                id="working_hours_uk"
                value={contactSettings.working_hours_uk || ""}
                onChange={(e) =>
                  setContactSettings({ ...contactSettings, working_hours_uk: e.target.value })
                }
                placeholder="Пн-Пт: 9:00 - 18:00&#10;Субота: 10:00 - 16:00"
                rows={4}
                className="resize-none"
              />
            </div>
            <div>
              <Label htmlFor="working_hours_en">Working Hours (EN)</Label>
              <Textarea
                id="working_hours_en"
                value={contactSettings.working_hours_en || ""}
                onChange={(e) =>
                  setContactSettings({ ...contactSettings, working_hours_en: e.target.value })
                }
                placeholder="Mon-Fri: 9:00 - 18:00&#10;Saturday: 10:00 - 16:00"
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="address_uk">Адреса (UA)</Label>
              <Input
                id="address_uk"
                value={contactSettings.address_uk || ""}
                onChange={(e) =>
                  setContactSettings({ ...contactSettings, address_uk: e.target.value })
                }
                placeholder="м. Київ, вул. Мистецька, 123"
              />
            </div>
            <div>
              <Label htmlFor="address_en">Address (EN)</Label>
              <Input
                id="address_en"
                value={contactSettings.address_en || ""}
                onChange={(e) =>
                  setContactSettings({ ...contactSettings, address_en: e.target.value })
                }
                placeholder="Kyiv, 123 Mystetska Street"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleContactSave}
            disabled={loading}
            className="bg-[#D4834F] hover:bg-[#C17340]"
          >
            {loading ? "Збереження..." : "Зберегти контакти"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Сповіщення про замовлення</CardTitle>
          <CardDescription>Налаштування email для отримання сповіщень про нові замовлення через Resend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notification_email">Email для сповіщень</Label>
            <Input
              id="notification_email"
              type="email"
              value={contactSettings.notification_email || ""}
              onChange={(e) =>
                setContactSettings({ ...contactSettings, notification_email: e.target.value })
              }
              placeholder="notifications@lucerna-studio.com"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              На цю пошту будуть надходити сповіщення про нові замовлення
            </p>
          </div>

          <div>
            <Label htmlFor="resend_api_key">Resend API Key</Label>
            <Input
              id="resend_api_key"
              type="password"
              value={contactSettings.resend_api_key || ""}
              onChange={(e) =>
                setContactSettings({ ...contactSettings, resend_api_key: e.target.value })
              }
              placeholder="re_xxxxxxxxxxxxx"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              API ключ з вашого облікового запису Resend. Можна отримати на{" "}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D4834F] hover:underline"
              >
                resend.com/api-keys
              </a>
            </p>
          </div>

          <Button
            type="button"
            onClick={handleContactSave}
            disabled={loading}
            className="bg-[#D4834F] hover:bg-[#C17340]"
          >
            {loading ? "Збереження..." : "Зберегти налаштування сповіщень"}
          </Button>
        </CardContent>
      </Card>

      {/* Social Media Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Соціальні мережі</CardTitle>
          <CardDescription>Налаштування посилань на соціальні мережі</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialMediaLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex-1">
                <Label className="font-medium">{PLATFORM_NAMES[link.platform]?.uk}</Label>
                <Input
                  type="url"
                  value={link.url || ""}
                  onChange={(e) => handleSocialMediaUrlChange(link.id, e.target.value)}
                  placeholder="https://..."
                  className="mt-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`toggle-${link.id}`}>Показати</Label>
                <Switch
                  id={`toggle-${link.id}`}
                  checked={link.is_enabled}
                  onCheckedChange={(checked) => handleSocialMediaToggle(link.id, checked)}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            onClick={handleSocialMediaSave}
            disabled={loading}
            className="bg-[#D4834F] hover:bg-[#C17340]"
          >
            {loading ? "Збереження..." : "Зберегти соцмережі"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

