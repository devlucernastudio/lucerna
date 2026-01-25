interface ProductStructuredDataProps {
  product: {
    id: string
    name_uk: string
    name_en: string
    description_uk?: string | null
    description_en?: string | null
    price: number
    images?: string[] | Array<{ url: string }>
    slug: string
    is_in_stock?: boolean
  }
  locale: string
  isAvailable: boolean
}

export function ProductStructuredData({ product, locale, isAvailable }: ProductStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lucerna-studio.com'
  const name = locale === 'uk' ? product.name_uk : product.name_en
  const rawDescription = locale === 'uk' ? product.description_uk : product.description_en
  
  // Strip HTML tags from description; не залишати порожнім (вимога Google для Merchant listing)
  const cleanDescription = rawDescription
    ? rawDescription.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 500)
    : ''
  const description = cleanDescription || name || (locale === 'uk'
    ? 'Унікальний світильник ручної роботи від Lucerna Studio.'
    : 'Unique handmade lamp from Lucerna Studio.')
  
  // Get first image URL
  let imageUrl = ''
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0]
    imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${baseUrl}${imageUrl}`
    }
  }

  // priceValidUntil: щонайменше 30 днів (рекомендація Google). Ставимо 1 рік.
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const productUrl = `${baseUrl}/${locale}/product/${encodeURIComponent(product.slug)}`

  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'UAH',
    priceValidUntil,
    availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: productUrl,
    // shippingDetails — вимога для «Пропозиції від продавців»
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 28, unitCode: 'd' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 14, unitCode: 'd' },
      },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'UA' },
    },
    // hasMerchantReturnPolicy — вимога для «Пропозиції від продавців» (20 днів, повернення за рахунок покупця)
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      applicableCountry: 'UA',
      merchantReturnDays: 20,
      merchantReturnLink: `${baseUrl}/${locale}/returns`,
    },
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: imageUrl || `${baseUrl}/og-image.jpg`,
    brand: { '@type': 'Brand', name: 'Lucerna Studio' },
    offers,
    url: productUrl,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface OrganizationStructuredDataProps {
  socialMedia?: Array<{ url: string; enabled: boolean }>
}

export function OrganizationStructuredData({ socialMedia = [] }: OrganizationStructuredDataProps = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lucerna-studio.com'
  
  // Filter enabled social media URLs
  const sameAs = socialMedia
    .filter(sm => sm.enabled && sm.url)
    .map(sm => sm.url)
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lucerna Studio',
    alternateName: ['Люцерна Студіо', 'Луцерна Студія'],
    description: 'Унікальні світильники ручної роботи від Lucerna Studio',
    url: baseUrl,
    logo: `${baseUrl}/logoLucernaC.png`,
    ...(sameAs.length > 0 && { sameAs }),
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

