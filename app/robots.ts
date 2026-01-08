import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lucerna-studio.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/cart', '/checkout'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

