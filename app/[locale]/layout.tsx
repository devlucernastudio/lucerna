import type React from "react"

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // I18nProvider is now in root layout, so we don't need it here
  return <>{children}</>
}

