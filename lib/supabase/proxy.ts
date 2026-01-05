import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const locales = ["uk", "en"]
const defaultLocale = "uk"

// Get locale from pathname or cookie
function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname
  
  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathnameHasLocale) {
    const locale = pathname.split("/")[1]
    return locales.includes(locale) ? locale : defaultLocale
  }
  
  // Check cookie
  const cookieLocale = request.cookies.get("locale")?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }
  
  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    for (const locale of locales) {
      if (acceptLanguage.includes(locale)) {
        return locale
      }
    }
  }
  
  return defaultLocale
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Handle locale routing for public pages (not admin)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  // Skip locale routing for admin, API, static files, and Next.js internals
  const shouldSkipLocale = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") || 
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  
  if (!shouldSkipLocale && !pathnameHasLocale) {
    const locale = getLocale(request)
    const newUrl = new URL(`/${locale}${pathname}`, request.url)
    newUrl.search = request.nextUrl.search
    
    const response = NextResponse.redirect(newUrl)
    response.cookies.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 })
    return response
  }
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Check admin routes (remove locale prefix if present)
  let pathForAdminCheck = pathname
  if (pathnameHasLocale) {
    pathForAdminCheck = pathname.replace(/^\/[^/]+/, "")
  }
  
  const publicPaths = ["/admin/login", "/admin/signup"]
  const isPublicPath = publicPaths.some((path) => pathForAdminCheck.startsWith(path))

  if (pathForAdminCheck.startsWith("/admin") && !isPublicPath) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }
  }

  // Set locale cookie if pathname has locale
  if (pathnameHasLocale) {
    const locale = pathname.split("/")[1]
    if (locales.includes(locale)) {
      supabaseResponse.cookies.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 })
    }
  }

  return supabaseResponse
}
