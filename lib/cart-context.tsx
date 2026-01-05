"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description?: string
  slug?: string // Product slug for URL
  selected_characteristics?: Record<string, string> // Normalized: { "characteristic_type_id": "option_id_or_text_value" }
  characteristics?: Record<string, string> // Display format: { "Characteristic Name": "Selected Value" }
  comment?: string // User comment for this product
}

export interface CartItem extends Product {
  quantity: number
  cartItemId: string // Unique identifier: product_id + normalized characteristics
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  updateComment: (cartItemId: string, comment: string) => void
  clearCart: () => void
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Generate unique cart item ID based on product_id + normalized characteristics
function generateCartItemId(productId: string, selectedCharacteristics?: Record<string, string>): string {
  if (!selectedCharacteristics || Object.keys(selectedCharacteristics).length === 0) {
    return productId
  }
  // Sort keys and create normalized string
  const sortedKeys = Object.keys(selectedCharacteristics).sort()
  const normalized = sortedKeys.map(key => `${key}:${selectedCharacteristics[key]}`).join("|")
  return `${productId}::${normalized}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("lucerna-cart")
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      // Migrate old cart items to new format (add cartItemId if missing)
      const migratedCart = parsedCart.map((item: CartItem) => {
        if (!item.cartItemId) {
          return {
            ...item,
            cartItemId: generateCartItemId(item.id, item.selected_characteristics),
          }
        }
        return item
      })
      setCart(migratedCart)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("lucerna-cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const newCartItemId = generateCartItemId(product.id, product.selected_characteristics)
      const existingItem = currentCart.find((item) => item.cartItemId === newCartItemId)
      
      if (existingItem) {
        // Same product with same characteristics - increase quantity
        return currentCart.map((item) => 
          item.cartItemId === newCartItemId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      }
      
      // New unique combination - add as new item
      return [...currentCart, { 
        ...product, 
        quantity: 1,
        cartItemId: newCartItemId
      }]
    })
  }

  const removeFromCart = (cartItemId: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.cartItemId !== cartItemId))
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }
    setCart((currentCart) => 
      currentCart.map((item) => 
        item.cartItemId === cartItemId 
          ? { ...item, quantity } 
          : item
      )
    )
  }

  const updateComment = (cartItemId: string, comment: string) => {
    setCart((currentCart) => 
      currentCart.map((item) => 
        item.cartItemId === cartItemId 
          ? { ...item, comment: comment.trim() || undefined } 
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateComment,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
