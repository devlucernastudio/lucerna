"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_ID || !(window as any).gtag) return

    const url =
      pathname + (searchParams.toString() ? `?${searchParams}` : "")

    ;(window as any).gtag("config", GA_ID, {
      page_path: url,
    })
  }, [pathname, searchParams])

  return null
}
