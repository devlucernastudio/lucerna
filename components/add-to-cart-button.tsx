"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/products"

interface AddToCartButtonProps {
  product: Product
  className?: string
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addToCart } = useCart()

  return (
    <Button onClick={() => addToCart(product)} className={`w-full bg-[#D4834F] hover:bg-[#C17340] ${className}`}>
      Додати у кошик
    </Button>
  )
}
