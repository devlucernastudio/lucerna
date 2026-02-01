import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductGalleryLCPImage } from "@/components/product/product-gallery-lcp-image"
import { ProductDetails } from "@/components/product/product-details"
import { BackButton } from "@/components/product/back-button"
import { RelatedProductsSection } from "@/components/product/related-products-section"
import { ProductDescription } from "@/components/product/product-description"
import { ProductStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data"
import { Footer } from "@/components/footer"

export const revalidate = 0 // Disable caching to always show fresh data

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", id)
    .eq("is_active", true)
    .single()

  if (!product) {
    return {
      title: locale === "uk" ? "Товар не знайдено - Lucerna Studio" : "Product not found - Lucerna Studio",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucerna-studio.com"
  const url = `${baseUrl}/${locale}/product/${encodeURIComponent(id)}`
  const title = (locale === "uk" ? product.seo_title_uk : product.seo_title_en) || `${product.name_uk || product.name_en} - Lucerna Studio`
  const descriptionRaw = (locale === "uk" ? product.meta_description_uk : product.meta_description_en) || product.description_uk || product.description_en || ""
  const description = descriptionRaw
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ') 
    .trim()
    .substring(0, 300)
  const image = product.images && product.images.length > 0
    ? (product.images[0].startsWith('http') ? product.images[0] : `${baseUrl}${product.images[0]}`)
    : `${baseUrl}/og-image.jpg`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'uk-UA': `${baseUrl}/uk/product/${encodeURIComponent(id)}`,
        'en-US': `${baseUrl}/en/product/${encodeURIComponent(id)}`,
        'x-default': `${baseUrl}/uk/product/${encodeURIComponent(id)}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Lucerna Studio",
      locale: locale === "uk" ? "uk_UA" : "en_US",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()

  // Single RPC: all product page data
  const { data: pageData, error: rpcError } = await supabase.rpc("get_product_page_data", { p_slug: id })

  if (rpcError || pageData == null) {
    notFound()
  }

  const product = pageData.product as any
  const productCharacteristics = (pageData.product_characteristics ?? []) as any[]
  const characteristicTypes = (pageData.characteristic_types ?? []) as any[]
  const characteristicOptions = (pageData.characteristic_options ?? []) as any[]
  const priceCombinations = (pageData.price_combinations ?? []) as any[]
  const additionalInfoBlock = pageData.additional_info_block as any
  const downloadableFiles = (pageData.downloadable_files ?? []) as any[]
  const relatedProducts = (pageData.related_products ?? []) as any[]
  const relatedProductCharacteristics = (pageData.related_product_characteristics ?? []) as any[]
  const relatedCharacteristicTypes = (pageData.related_characteristic_types ?? []) as any[]
  const relatedCharacteristicOptions = (pageData.related_characteristic_options ?? []) as any[]
  const relatedPriceCombinations = (pageData.related_price_combinations ?? []) as any[]

  const isProductAvailable =
    priceCombinations.length > 0
      ? priceCombinations.some((pc: any) => pc.is_available)
      : (product?.is_in_stock ?? true)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lucerna-studio.com'

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { name: locale === 'uk' ? 'Головна' : 'Home', url: `${baseUrl}/${locale}` },
    { name: locale === 'uk' ? 'Каталог' : 'Catalog', url: `${baseUrl}/${locale}/catalog` },
    { name: locale === 'uk' ? product.name_uk : product.name_en, url: `${baseUrl}/${locale}/product/${product.slug}` },
  ]

  return (
    <>
      <main className="min-h-screen">
        {/* Structured Data */}
        <ProductStructuredData product={product} locale={locale} isAvailable={isProductAvailable} />
        <BreadcrumbStructuredData items={breadcrumbItems} />

        <BackButton />

        {/* Product Details */}
        <section className="container mx-auto px-4 pb-12">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Images */}
            <div>
              <ProductGallery
                images={product.images || []}
                productName={product.name_uk || product.name_en}
                isAvailable={isProductAvailable}
                downloadableFiles={downloadableFiles}
              >
                {product.images && product.images.length > 0 && (
                  <ProductGalleryLCPImage
                    firstImage={product.images[0]}
                    productName={product.name_uk || product.name_en}
                    isAvailable={isProductAvailable}
                  />
                )}
              </ProductGallery>

              {/* Description - shown below gallery on desktop */}
              <ProductDescription
                descriptionUk={product.description_uk}
                descriptionEn={product.description_en}
              />
            </div>

            {/* Product Info */}
            <ProductDetails
              product={{
                id: product.id,
                name_uk: product.name_uk,
                name_en: product.name_en,
                slug: product.slug,
                price: product.price,
                compare_at_price: product.compare_at_price,
                description_uk: product.description_uk,
                description_en: product.description_en,
                stock: product.stock,
                is_in_stock: product.is_in_stock,
                sku: product.sku,
                images: product.images,
              }}
              productCharacteristics={productCharacteristics || []}
              characteristicTypes={characteristicTypes || []}
              characteristicOptions={characteristicOptions || []}
              priceCombinations={priceCombinations || []}
              additionalInfoBlock={additionalInfoBlock || null}
            />
          </div>
        </section>

        <RelatedProductsSection
          products={relatedProducts}
          productCharacteristics={relatedProductCharacteristics || []}
          characteristicTypes={relatedCharacteristicTypes || []}
          characteristicOptions={relatedCharacteristicOptions || []}
          priceCombinations={relatedPriceCombinations || []}
        />
      </main>
      <Footer footerRightsStyle="pb-[100px] md:pb-0" />
    </>
  )
}
