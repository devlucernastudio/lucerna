"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { getTranslation } from "@/lib/translations"
import { Footer } from "@/components/footer"

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
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D4834F]/10">
                        <Mail className="h-6 w-6 text-[#D4834F]" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Email</p>
                        <p className="text-sm text-muted-foreground">info@lucerna-studio.com</p>
                        <p className="text-sm text-muted-foreground">orders@lucerna-studio.com</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D4834F]/10">
                        <Phone className="h-6 w-6 text-[#D4834F]" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t("contacts.phone")}</p>
                        <p className="text-sm text-muted-foreground">+380 (XX) XXX-XX-XX</p>
                        <p className="text-sm text-muted-foreground">
                          {locale === "uk" ? "Пн-Пт: 9:00 - 18:00" : "Mon-Fri: 9:00 - 18:00"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D4834F]/10">
                        <MapPin className="h-6 w-6 text-[#D4834F]" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {locale === "uk" ? "Адреса майстерні" : "Workshop Address"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {locale === "uk" ? "м. Київ, вул. Мистецька, 123" : "Kyiv, 123 Mystetska Street"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {locale === "uk" ? "За попереднім записом" : "By appointment"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-semibold text-foreground">
                      {locale === "uk" ? "Соціальні мережі" : "Social Media"}
                    </h3>
                    <div className="flex gap-4">
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4834F] text-white transition-colors hover:bg-[#C17340]"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4834F] text-white transition-colors hover:bg-[#C17340]"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
