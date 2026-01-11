import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lucerna-studio.com'
  const supabase = await createClient()
  
  // Fetch all active products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
  
  // Fetch all published blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true)
  
  const staticPages = [
    { 
      url: `${baseUrl}/uk`, 
      lastModified: new Date(), 
      changeFrequency: 'daily' as const, 
      priority: 1 
    },
    { 
      url: `${baseUrl}/en`, 
      lastModified: new Date(), 
      changeFrequency: 'daily' as const, 
      priority: 1 
    },
    { 
      url: `${baseUrl}/uk/catalog`, 
      lastModified: new Date(), 
      changeFrequency: 'daily' as const, 
      priority: 0.9 
    },
    { 
      url: `${baseUrl}/en/catalog`, 
      lastModified: new Date(), 
      changeFrequency: 'daily' as const, 
      priority: 0.9 
    },
    { 
      url: `${baseUrl}/uk/about`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly' as const, 
      priority: 0.7 
    },
    { 
      url: `${baseUrl}/en/about`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly' as const, 
      priority: 0.7 
    },
    { 
      url: `${baseUrl}/uk/blog`, 
      lastModified: new Date(), 
      changeFrequency: 'weekly' as const, 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/en/blog`, 
      lastModified: new Date(), 
      changeFrequency: 'weekly' as const, 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/uk/contacts`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly' as const, 
      priority: 0.6 
    },
    { 
      url: `${baseUrl}/en/contacts`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly' as const, 
      priority: 0.6 
    },
    { 
      url: `${baseUrl}/uk/collaboration`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly' as const, 
      priority: 0.7 
    },
    { 
      url: `${baseUrl}/en/collaboration`, 
      lastModified: new Date(), 
      changeFrequency: 'monthly' as const, 
      priority: 0.7 
    },
    { 
      url: `${baseUrl}/uk/privacy`, 
      lastModified: new Date(), 
      changeFrequency: 'yearly' as const, 
      priority: 0.3 
    },
    { 
      url: `${baseUrl}/en/privacy`, 
      lastModified: new Date(), 
      changeFrequency: 'yearly' as const, 
      priority: 0.3 
    },
    { 
      url: `${baseUrl}/uk/terms`, 
      lastModified: new Date(), 
      changeFrequency: 'yearly' as const, 
      priority: 0.3 
    },
    { 
      url: `${baseUrl}/en/terms`, 
      lastModified: new Date(), 
      changeFrequency: 'yearly' as const, 
      priority: 0.3 
    },
    { 
      url: `${baseUrl}/uk/payment-delivery`, 
      lastModified: new Date(), 
      changeFrequency: 'yearly' as const, 
      priority: 0.3 
    },
    { 
      url: `${baseUrl}/en/payment-delivery`, 
      lastModified: new Date(), 
      changeFrequency: 'yearly' as const, 
      priority: 0.3 
    },
    { 
      url: `${baseUrl}/uk/returns`, 
      lastModified: new Date(), 
      changeFrequency: 'yearly' as const, 
      priority: 0.3 
    },
    { 
      url: `${baseUrl}/en/returns`, 
      lastModified: new Date(), 
      changeFrequency: 'yearly' as const, 
      priority: 0.3 
    },
  ]
  
  const productPages = (products || []).flatMap(product => [
    {
      url: `${baseUrl}/uk/product/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/product/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ])
  
  const blogPages = (posts || []).flatMap(post => [
    {
      url: `${baseUrl}/uk/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/en/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ])
  
  return [...staticPages, ...productPages, ...blogPages]
}

