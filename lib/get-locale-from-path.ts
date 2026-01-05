/**
 * Extract locale from pathname
 * Returns the locale if found, or null if not found
 */
export function getLocaleFromPath(pathname: string): string | null {
  const locales = ["uk", "en"]
  const pathParts = pathname.split("/").filter(Boolean)
  
  if (pathParts.length > 0 && locales.includes(pathParts[0])) {
    return pathParts[0]
  }
  
  return null
}

/**
 * Remove locale prefix from pathname
 * Returns the pathname without locale prefix
 */
export function removeLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname)
  if (locale) {
    const pathWithoutLocale = pathname.replace(`/${locale}`, "")
    return pathWithoutLocale || "/"
  }
  return pathname
}

