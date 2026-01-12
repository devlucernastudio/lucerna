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
  const description = locale === 'uk' ? product.description_uk : product.description_en
  
  // Strip HTML tags from description
  const cleanDescription = description
    ? description.replace(/<[^>]*>/g, '').substring(0, 500)
    : ''
  
  // Get first image URL
  let imageUrl = ''
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0]
    imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url
    // Ensure absolute URL
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${baseUrl}${imageUrl}`
    }
  }
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: cleanDescription,
    image: imageUrl || `${baseUrl}/og-image.jpg`,
    brand: {
      '@type': 'Brand',
      name: 'Lucerna Studio',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'UAH',
      availability: isAvailable 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/${locale}/product/${product.slug}`,
    },
    url: `${baseUrl}/${locale}/product/${product.slug}`,
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

