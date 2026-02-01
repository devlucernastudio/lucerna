import Image from "next/image"

interface ProductGalleryLCPImageProps {
  /** First image: string URL or { url: string } */
  firstImage: string | { url: string }
  productName: string
  isAvailable?: boolean
}

/**
 * Server-rendered LCP image for the product gallery.
 * Rendered in initial HTML so the browser can start loading immediately.
 */
export function ProductGalleryLCPImage({
  firstImage,
  productName,
  isAvailable = true,
}: ProductGalleryLCPImageProps) {
  const src = typeof firstImage === "string" ? firstImage : firstImage.url

  return (
    <span className="absolute inset-0 z-10 block overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={productName}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={85}
        priority
        fetchPriority="high"
        className={`object-cover transition-opacity ${!isAvailable ? "opacity-50 grayscale" : ""}`}
      />
    </span>
  )
}
