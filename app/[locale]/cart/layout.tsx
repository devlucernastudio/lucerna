import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  
  const title = locale === "uk" 
    ? "Кошик - Lucerna Studio"
    : "Cart - Lucerna Studio"
  
  const description = locale === "uk"
    ? "Ваш кошик покупок"
    : "Your shopping cart"

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

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

