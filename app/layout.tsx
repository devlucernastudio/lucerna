import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { cookies } from "next/headers"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { I18nProvider } from "@/lib/i18n-context"
import { HeaderWrapper } from "@/components/header-wrapper"
import { Toaster } from "@/components/ui/toaster"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lucerna Studio - Живі форми світла",
  description: "Унікальні світильники ручної роботи від Lucerna Studio",
  generator: "Lucerna Studio",
  icons: {
    icon: [
      { url: "/favicon-dark.ico", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon.ico", media: "(prefers-color-scheme: light)" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", media: "(prefers-color-scheme: light)" },
      { url: "/apple-touch-icon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const locale = cookieStore.get("locale")?.value || "uk"
  const validLocale = locale === "uk" || locale === "en" ? locale : "uk"
  
  return (
    <html lang={validLocale}>
      <body className={`font-sans antialiased`}>
        <I18nProvider initialLocale={validLocale}>
          <CartProvider>
            <HeaderWrapper />
            {children}
          </CartProvider>
        </I18nProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
