"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import type { ComponentProps } from "react"

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string
}

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const { locale } = useI18n()
  
  // Don't add locale to admin routes, API routes, or external links
  if (href.startsWith("/admin") || href.startsWith("/api") || href.startsWith("http")) {
    return <Link href={href} {...props} />
  }
  
  // If href already has locale, use it as is
  if (href.startsWith("/uk/") || href.startsWith("/en/")) {
    return <Link href={href} {...props} />
  }
  
  // Add locale prefix
  const localizedHref = `/${locale}${href}`
  return <Link href={localizedHref} {...props} />
}

