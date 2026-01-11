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
import Script from "next/script"
import GoogleAnalytics from "@/components/GoogleAnalytics"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  generator: "Lucerna Studio",
  icons: {
    icon: [
      { url: "/favicon-dark.ico", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon.ico", media: "(prefers-color-scheme: light)" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" },
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
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
            </Script>
          </>
        )}
      </head>
      <body className={`font-sans antialiased`}>
        <I18nProvider initialLocale={validLocale}>
          <CartProvider>
            <HeaderWrapper />
            {children}
          </CartProvider>
        </I18nProvider>
        <Analytics />
        <GoogleAnalytics />
        <Toaster />
      </body>
    </html>
  )
}
