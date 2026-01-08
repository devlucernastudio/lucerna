"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
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
import { showToast } from "@/lib/toast"

export default function ContactsPage() {
  const { locale } = useI18n()
  const t = (key: string) => getTranslation(locale, key)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    comment: "", // Honeypot field
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Validation functions
  const validateName = (name: string): string | null => {
    if (!name.trim()) return locale === "uk" ? "Ім'я обов'язкове" : "Name is required"
    if (!/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s-]+$/.test(name.trim())) {
      return locale === "uk" ? "Ім'я може містити тільки літери, пробіли та дефіс" : "Name can only contain letters, spaces, and hyphens"
    }
    return null
  }

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return locale === "uk" ? "Email обов'язковий" : "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return locale === "uk" ? "Невірний формат email" : "Invalid email format"
    }
    return null
  }

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null // Phone is optional
    if (!/^\+?[0-9]+$/.test(phone.trim())) {
      return locale === "uk" ? "Телефон може містити тільки цифри та + на початку" : "Phone can only contain digits and optional + at the start"
    }
    return null
  }

  const validateMessage = (message: string): string | null => {
    if (!message.trim()) return locale === "uk" ? "Повідомлення обов'язкове" : "Message is required"
    if (!/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9\s.,\-_+=()*?%;:№@#&!/]+$/.test(message.trim())) {
      return locale === "uk" ? "Повідомлення містить недозволені символи" : "Message contains invalid characters"
    }
    return null
  }

  // Check if form is valid and all required fields are filled
  const isFormValid = useMemo(() => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.message.trim() !== "" &&
      Object.keys(validationErrors).length === 0
    )
  }, [formData, validationErrors])

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

  const handleChange = (field: string, value: string) => {
    // Real-time validation for name field - block invalid characters
    if (field === "name") {
      // Only allow letters, spaces, and hyphens
      if (value === "" || /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s-]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [field]: value }))
      }
      return
    }
    
    // For message field - block invalid characters
    if (field === "message") {
      // Only allow text and allowed punctuation
      if (value === "" || /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9\s.,\-_+=()*?%;:№@#&!/]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [field]: value }))
      }
      return
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleBlur = (field: string, value: string) => {
    let error: string | null = null
    
    switch (field) {
      case "name":
        error = validateName(value)
        break
      case "email":
        error = validateEmail(value)
        break
      case "phone":
        error = validatePhone(value)
        break
      case "message":
        error = validateMessage(value)
        break
    }
    
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [field]: error! }))
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all fields
    const errors: Record<string, string> = {}
    const nameError = validateName(formData.name)
    const emailError = validateEmail(formData.email)
    const phoneError = validatePhone(formData.phone)
    const messageError = validateMessage(formData.message)

    if (nameError) errors.name = nameError
    if (emailError) errors.email = emailError
    if (phoneError) errors.phone = phoneError
    if (messageError) errors.message = messageError

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/send-contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          message: formData.message.trim(),
          comment: formData.comment, // Honeypot
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send message")
      }

      showToast.success(locale === "uk" ? "Ваше повідомлення надіслано!" : "Your message has been sent!")
      
      // Reset form
      setFormData({ name: "", email: "", phone: "", message: "", comment: "" })
      setValidationErrors({})
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message"
      setError(errorMessage)
      showToast.error(locale === "uk" ? `Помилка: ${errorMessage}` : `Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
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
                    {/* Honeypot field - hidden but not with display: none */}
                    <div style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
                      <Label htmlFor="comment">Comment</Label>
                      <Input
                        id="comment"
                        name="comment"
                        type="text"
                        value={formData.comment}
                        onChange={(e) => handleChange("comment", e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">{t("contacts.name")}*</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        onBlur={(e) => handleBlur("name", e.target.value)}
                        className={validationErrors.name ? "border-red-500" : ""}
                      />
                      {validationErrors.name && (
                        <p className="text-sm text-red-500">{validationErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t("contacts.email")}*</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={(e) => handleBlur("email", e.target.value)}
                        className={validationErrors.email ? "border-red-500" : ""}
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-red-500">{validationErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("contacts.phone")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          // Only allow digits and + at the start
                          const value = e.target.value
                          if (value === "" || /^\+?[0-9]*$/.test(value)) {
                            handleChange("phone", value)
                          }
                        }}
                        onBlur={(e) => handleBlur("phone", e.target.value)}
                        className={validationErrors.phone ? "border-red-500" : ""}
                      />
                      {validationErrors.phone && (
                        <p className="text-sm text-red-500">{validationErrors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t("contacts.message")}*</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        onBlur={(e) => handleBlur("message", e.target.value)}
                        rows={5}
                        className={validationErrors.message ? "border-red-500" : ""}
                      />
                      {validationErrors.message && (
                        <p className="text-sm text-red-500">{validationErrors.message}</p>
                      )}
                    </div>

                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-[#D4834F] hover:bg-[#C17340] disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                      disabled={isLoading || !isFormValid}
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
