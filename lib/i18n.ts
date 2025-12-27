export type Locale = "uk" | "en"

export const defaultLocale: Locale = "uk"
export const locales: Locale[] = ["uk", "en"]

export const localeNames: Record<Locale, string> = {
  uk: "Українська",
  en: "English",
}
