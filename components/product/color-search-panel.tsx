"use client"

import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import type { CaparolColor } from "./caparol-palette-modal"

interface ColorSearchPanelProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  searchResults: CaparolColor[]
  onColorSelect: (color: CaparolColor) => void
  onClose: () => void
  locale: string
}

export function ColorSearchPanel({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onColorSelect,
  onClose,
  locale,
}: ColorSearchPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  const content = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
      {/* Backdrop - only covers area outside search panel */}
      <div 
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
        style={{ pointerEvents: 'auto', zIndex: 1 }}
      />
      
      {/* Search Panel - slides in from right */}
      <div 
        data-search-panel
        className="fixed right-[5vw] top-[5vh] md:top-[10vh] w-[280px] sm:w-[320px] h-[90vh] md:h-[80vh] flex flex-col rounded-xl overflow-hidden shadow-2xl transition-transform duration-300"
        style={{ 
          backgroundColor: 'rgba(255, 228, 196, 0.98)',
          pointerEvents: 'auto',
          zIndex: 2
        }}
        onClick={(e) => {
          // Prevent clicks inside panel from closing backdrop
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          // Prevent dialog from closing
          e.stopPropagation()
        }}
        onPointerDown={(e) => {
          // Prevent dialog from closing
          e.stopPropagation()
        }}
      >
        {/* Header */}
        <div className="px-4 pt-6 pb-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {locale === "uk" ? "Пошук кольору" : "Color Search"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Input */}
          <div className="px-4 py-4">
            <Input
              type="text"
              placeholder={locale === "uk" ? "Назва або LCH..." : "Name or LCH..."}
              value={searchQuery}
              onChange={(e) => {
                onSearchQueryChange(e.target.value)
              }}
              className="w-full"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {searchQuery.trim() === "" ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                {locale === "uk" ? "Введіть назву або LCH кольору" : "Enter color name or LCH"}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                {locale === "uk" ? "Нічого не знайдено" : "No results found"}
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((color, index) => (
                  <button
                    key={`${color.hex}-${index}`}
                    onClick={() => onColorSelect(color)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 transition-colors text-left"
                  >
                    {/* Color Square */}
                    <div
                      className="w-12 h-12 rounded border border-gray-300 flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: `#${color.hex}` }}
                    />
                    
                    {/* Color Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {color.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {color.lch}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Render in portal to avoid Dialog blocking events
  return createPortal(content, document.body)
}

