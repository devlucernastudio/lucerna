import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  
  const title = locale === "uk" 
    ? "Оформлення замовлення - Lucerna Studio"
    : "Checkout - Lucerna Studio"
  
  const description = locale === "uk"
    ? "Оформлення замовлення"
    : "Checkout"

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

