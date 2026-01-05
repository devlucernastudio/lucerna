"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Locale } from "./i18n"

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({
  children,
  initialLocale = "uk",
}: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    // Get locale from cookie first (set by middleware), then localStorage
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
      return null
    }
    
    const cookieLocale = getCookie("locale") as Locale
    const savedLocale = localStorage.getItem("locale") as Locale
    
    if (cookieLocale && (cookieLocale === "uk" || cookieLocale === "en")) {
      setLocaleState(cookieLocale)
      localStorage.setItem("locale", cookieLocale)
    } else if (savedLocale && (savedLocale === "uk" || savedLocale === "en")) {
      setLocaleState(savedLocale)
    }
    
    // Also sync with URL if it has locale
    const pathname = window.location.pathname
    const urlLocale = pathname.split("/")[1]
    if (urlLocale === "uk" || urlLocale === "en") {
      setLocaleState(urlLocale)
      localStorage.setItem("locale", urlLocale)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
    // Update cookie
    document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
    
    // Update URL to include locale - use full navigation to trigger middleware
    const pathname = window.location.pathname
    const currentLocale = pathname.split("/")[1]
    const isCurrentLocale = currentLocale === "uk" || currentLocale === "en"
    
    let newPath = ""
    if (isCurrentLocale) {
      // Replace locale in URL
      newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    } else {
      // Add locale to URL
      newPath = `/${newLocale}${pathname}`
    }
    
    // Use full navigation to trigger middleware
    window.location.href = newPath + window.location.search
  }

  return <I18nContext.Provider value={{ locale, setLocale }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
