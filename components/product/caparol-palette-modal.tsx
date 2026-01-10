"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import caparolColors from "@/lib/caparol-3d-plus.json"
import { useI18n } from "@/lib/i18n-context"

export interface CaparolColor {
  name: string
  l: number
  c: number
  h: number
  lch: string
  hex: string
}

// Extended color interface for compatibility with existing code
interface CaparolColorWithId {
  id: string
  name: string
  hex: string
  lch?: string
  l?: number
  c?: number
  h?: number
}

interface CaparolStrip {
  stripIndex: number
  baseHue: number
  colors: CaparolColor[]
}

interface CaparolPaletteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (color: CaparolColorWithId) => void
  selectedColorId?: string
}

// Constants for scroll calculations - extracted to avoid duplication
const SPACING_FACTOR = 1.5
const DEGREES_PER_SCROLL_UNIT = 180 / (SPACING_FACTOR * 10)
const SCROLL_STEP_WHEEL = 0.3
const SCROLL_STEP_TOUCH = 0.015
const SCROLL_STEP_ARROW = 2
const VELOCITY_MULTIPLIER = 0.8
const MOMENTUM_FRICTION = 0.92
const MIN_VELOCITY = 0.05
const MIN_VELOCITY_THRESHOLD = 0.2

export function CaparolPaletteModal({
  open,
  onOpenChange,
  onSelect,
  selectedColorId,
}: CaparolPaletteModalProps) {
  const { locale } = useI18n()
  const colorsData = caparolColors as {
    system: string
    totalColors: number
    stripSize: number
    strips: CaparolStrip[]
  }

  const infoText = locale === "uk"
    ? "Екранна візуалізація кольорів до палітри Caparol. Відтінки можуть відрізнятися залежно від екрана пристрою."
    : "Screen visualization of colors from the Caparol palette. Shades may vary depending on the device screen."

  const clickToSelectText = locale === "uk"
    ? "Клікніть на потрібний колір"
    : "Click on the desired color"

  // Find selected color from all strips
  const findSelectedColor = (): CaparolColor | null => {
    if (!selectedColorId) return null
    for (const strip of colorsData.strips) {
      const color = strip.colors.find(c => c.hex === selectedColorId || `#${c.hex}` === selectedColorId)
      if (color) return color
    }
    return null
  }

  const [selectedColorState, setSelectedColorState] = useState<CaparolColor | null>(null)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartXRef = useRef<number | null>(null)
  const scrollOffsetAtTouchStartRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  // Momentum scrolling refs
  const velocityRef = useRef<number>(0)
  const momentumRafRef = useRef<number | null>(null)
  const isMomentumScrollingRef = useRef<boolean>(false)
  const touchHistoryRef = useRef<Array<{ x: number; time: number }>>([])
  const pendingScrollOffsetRef = useRef<number | null>(null)

  // Helper function to calculate max scroll offset - extracted to avoid duplication
  const getMaxScrollOffset = (totalStrips: number) => {
    return (totalStrips - 1) * SPACING_FACTOR + (90 / DEGREES_PER_SCROLL_UNIT)
  }

  // Update selected color when prop changes (fix hydration mismatch)
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (open) {
      const foundColor = findSelectedColor()
      setSelectedColorState(foundColor)
      setScrollOffset(0)
      setIsScrolling(false)
      // Reset all touch refs
      touchStartXRef.current = null
      velocityRef.current = 0
      touchHistoryRef.current = []
      // Stop any ongoing momentum scrolling
      if (momentumRafRef.current) {
        cancelAnimationFrame(momentumRafRef.current)
        momentumRafRef.current = null
        isMomentumScrollingRef.current = false
      }
    } else {
      // Close search panel when modal closes
      setSearchOpen(false)
      setSearchQuery("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColorId, open])

  // Handle horizontal wheel scroll to flip strips like pages (from right to left)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = e.deltaX || e.deltaY
    const totalStrips = colorsData.strips.length
    const maxScrollOffset = getMaxScrollOffset(totalStrips)
    
    setScrollOffset((prev) => {
      const newOffset = prev + (delta > 0 ? SCROLL_STEP_WHEEL : -SCROLL_STEP_WHEEL)
      return Math.max(0, Math.min(maxScrollOffset, newOffset))
    })
    setIsScrolling(false)
  }

  // Momentum scrolling with inertia
  const startMomentumScrolling = () => {
    if (isMomentumScrollingRef.current) return

    isMomentumScrollingRef.current = true
    setIsScrolling(true)
    const totalStrips = colorsData.strips.length
    const maxScrollOffset = getMaxScrollOffset(totalStrips)

    const animate = () => {
      if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
        isMomentumScrollingRef.current = false
        velocityRef.current = 0
        setIsScrolling(false)
        if (momentumRafRef.current) {
          cancelAnimationFrame(momentumRafRef.current)
          momentumRafRef.current = null
        }
        return
      }

      setScrollOffset((prev) => {
        const newOffset = prev + velocityRef.current
        return Math.max(0, Math.min(maxScrollOffset, newOffset))
      })

      velocityRef.current *= MOMENTUM_FRICTION
      momentumRafRef.current = requestAnimationFrame(animate)
    }

    momentumRafRef.current = requestAnimationFrame(animate)
  }

  // Handle touch gestures for mobile with momentum scrolling
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Stop any ongoing momentum scrolling
    if (momentumRafRef.current) {
      cancelAnimationFrame(momentumRafRef.current)
      momentumRafRef.current = null
      isMomentumScrollingRef.current = false
    }
    velocityRef.current = 0
    setIsScrolling(true)

    const touch = e.touches[0]
    const now = Date.now()
    touchStartXRef.current = touch.clientX
    scrollOffsetAtTouchStartRef.current = scrollOffset
    touchHistoryRef.current = [{ x: touch.clientX, time: now }]
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return

    const touch = e.touches[0]
    const currentX = touch.clientX
    const currentTime = Date.now()
    const deltaX = currentX - touchStartXRef.current

    // Track touch history for velocity calculation
    touchHistoryRef.current.push({ x: currentX, time: currentTime })
    if (touchHistoryRef.current.length > 5) {
      touchHistoryRef.current.shift()
    }

    // Calculate velocity from recent touch history
    if (touchHistoryRef.current.length >= 2) {
      const recent = touchHistoryRef.current.slice(-2)
      const timeDelta = recent[1].time - recent[0].time
      if (timeDelta > 0 && timeDelta < 100) {
        const distanceDelta = recent[1].x - recent[0].x
        velocityRef.current = -(distanceDelta / timeDelta) * VELOCITY_MULTIPLIER
      }
    }

    const totalStrips = colorsData.strips.length
    const maxScrollOffset = getMaxScrollOffset(totalStrips)
    const scrollDelta = -deltaX * SCROLL_STEP_TOUCH
    const newOffset = Math.max(0, Math.min(maxScrollOffset, scrollOffsetAtTouchStartRef.current + scrollDelta))

    pendingScrollOffsetRef.current = newOffset

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingScrollOffsetRef.current !== null) {
          setScrollOffset(pendingScrollOffsetRef.current)
          pendingScrollOffsetRef.current = null
        }
        rafRef.current = null
      })
    }
  }

  const handleTouchEnd = () => {
    if (Math.abs(velocityRef.current) > MIN_VELOCITY_THRESHOLD) {
      startMomentumScrolling()
    } else {
      setIsScrolling(false)
    }

    pendingScrollOffsetRef.current = null
    touchStartXRef.current = null
    touchHistoryRef.current = []
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const handleColorSelect = (color: CaparolColor) => {
    setSelectedColorState(color)
  }

  // Handle color selection from search
  const handleSearchColorSelect = (color: CaparolColor) => {
    setSelectedColorState(color)
    setSearchOpen(false)
    setSearchQuery("")
    
    // Find which strip contains this color and scroll to center it at 90 degrees
    const stripIndex = colorsData.strips.findIndex(strip => 
      strip.colors.some(c => c.hex === color.hex)
    )
    
    if (stripIndex !== -1) {
      // Calculate scroll offset to center this strip at 90 degrees (vertical/center)
      // When getStripRotation returns 90, the strip is centered vertically
      // Formula: finalAngle = initialAngle - rotationDelta = 90
      // rotationDelta = (scrollOffset - stripIndex * SPACING_FACTOR) * DEGREES_PER_SCROLL_UNIT
      // So: initialAngle - (scrollOffset - stripIndex * SPACING_FACTOR) * DEGREES_PER_SCROLL_UNIT = 90
      // Solving for scrollOffset: scrollOffset = stripIndex * SPACING_FACTOR + (initialAngle - 90) / DEGREES_PER_SCROLL_UNIT
      const totalStrips = colorsData.strips.length
      const initialAngle = 90 + (stripIndex / (totalStrips - 1 || 1)) * 90
      const targetScrollOffset = stripIndex * SPACING_FACTOR + (initialAngle - 90) / DEGREES_PER_SCROLL_UNIT
      setScrollOffset(targetScrollOffset)
    }
  }

  // Filter colors based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase()
    const results: CaparolColor[] = []
    
    colorsData.strips.forEach(strip => {
      strip.colors.forEach(color => {
        if (
          color.name.toLowerCase().includes(query) ||
          color.lch.toLowerCase().includes(query)
        ) {
          results.push(color)
        }
      })
    })
    
    return results
  }, [searchQuery, colorsData.strips])

  const handleConfirm = () => {
    if (selectedColorState) {
      // Convert to format expected by parent components with full color data
      const colorWithId: CaparolColorWithId = {
        id: selectedColorState.hex,
        name: selectedColorState.name,
        hex: selectedColorState.hex,
        lch: selectedColorState.lch,
        l: selectedColorState.l,
        c: selectedColorState.c,
        h: selectedColorState.h,
      }
      onSelect(colorWithId)
      onOpenChange(false)
    }
  }

  // Handle arrow navigation (desktop only)
  const handleArrowClick = (direction: 'left' | 'right') => {
    const totalStrips = colorsData.strips.length
    const maxScrollOffset = getMaxScrollOffset(totalStrips)

    setScrollOffset((prev) => {
      const newOffset = direction === 'right'
        ? prev + SCROLL_STEP_ARROW
        : prev - SCROLL_STEP_ARROW
      return Math.max(0, Math.min(maxScrollOffset, newOffset))
    })
  }

  // Calculate rotation angle for fan-book effect
  const getStripRotation = (index: number, total: number, scrollOffset: number) => {
    const initialAngle = 90 + (index / (total - 1 || 1)) * 90
    const stripScrollProgress = scrollOffset - (index * SPACING_FACTOR)
    const rotationDelta = stripScrollProgress * DEGREES_PER_SCROLL_UNIT
    let finalAngle = initialAngle - rotationDelta
    return Math.max(0, Math.min(180, finalAngle))
  }

  // Handle dialog close - prevent if search is open
  const handleDialogOpenChange = (open: boolean) => {
    if (!open && searchOpen) {
      // If trying to close dialog but search is open, just close search
      setSearchOpen(false)
      setSearchQuery("")
      // Prevent dialog from closing by not calling onOpenChange
      return
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent 
        style={{ backgroundColor: 'rgba(255, 228, 196, 0.92)' }} 
        className="max-w-2xl w-[90vw] max-w-[600px] h-[90vh] md:h-[80vh] p-0 flex flex-col overflow-hidden rounded-xl sm:rounded-xl"
        onPointerDownOutside={(e) => {
          // Prevent closing dialog if clicking on search panel
          if (searchOpen) {
            e.preventDefault()
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing dialog if clicking on search panel
          if (searchOpen) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          // If search is open, close it instead of closing dialog
          if (searchOpen) {
            e.preventDefault()
            setSearchOpen(false)
            setSearchQuery("")
          }
        }}
      >
        <DialogHeader className="px-4 pt-4  flex-shrink-0">
          <DialogTitle>{colorsData.system}</DialogTitle>
          <DialogDescription className="text-xs leading-snug">
            {infoText}
          </DialogDescription>
        </DialogHeader>

        {/* Fixed container with flipping strips - fan effect */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex-1 overflow-hidden pb-4 md:pb-8 relative flex items-end justify-center ${searchOpen ? 'z-0' : ''}`}
          style={{
            touchAction: 'pan-x',
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          }}
        >
          {/* Fixed size container - strips fan out from bottom center */}
          <div
            className="relative w-full h-full max-h-[500px] flex items-end justify-center modal-scale-67 modal-scale-50"
            style={{
              // Ensure container doesn't shift on mobile
              position: 'relative',
              minHeight: '400px',
            }}
          >
            {/* Bottom center point - strips originate from here */}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full z-0" />

            {/* Optimized: Only render 15 visible strips around current scroll position */}
            {useMemo(() => {
              const totalStrips = colorsData.strips.length
              let centerStripIndex = 0
              let minAngleDelta = Infinity

              for (let i = 0; i < totalStrips; i++) {
                const angle = getStripRotation(i, totalStrips, scrollOffset)
                const delta = Math.abs(angle - 90)
                if (delta < minAngleDelta) {
                  minAngleDelta = delta
                  centerStripIndex = i
                }
              }

              const bufferSize = 7
              let startIndex = Math.max(0, centerStripIndex - bufferSize)
              const endIndex = Math.min(totalStrips - 1, centerStripIndex + bufferSize)
              const expectedCount = bufferSize * 2 + 1
              const actualCount = endIndex - startIndex + 1

              if (actualCount < expectedCount) {
                const missing = expectedCount - actualCount
                startIndex = Math.max(0, startIndex - missing)
              }

              const stripsToRender: number[] = []
              for (let i = startIndex; i <= endIndex; i++) {
                stripsToRender.push(i)
              }
              return stripsToRender
            }, [scrollOffset, colorsData.strips.length]).map((stripIndex) => {
              const strip = colorsData.strips[stripIndex]
              if (!strip) return null
              const totalStrips = colorsData.strips.length
              const totalRotation = getStripRotation(stripIndex, totalStrips, scrollOffset)
              const rotatedAngle = totalRotation - 90
              const stripLength = 400
              const centerX = 50
              const angleFromVertical = Math.abs(rotatedAngle)
              const zIndex = Math.round(1000 - (angleFromVertical * 3) - stripIndex)

              return (
                <div
                  key={strip.stripIndex}
                  className="absolute pointer-events-none shadow-lg"
                  style={{
                    left: `${centerX}%`,
                    bottom: 0,
                    transform: `translateX(-50%) rotate(${rotatedAngle}deg)`,
                    transformOrigin: "center bottom",
                    zIndex: zIndex,
                    transition: isScrolling ? 'none' : 'transform 100ms ease-out',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div
                    className="flex flex-col pointer-events-auto"
                    style={{ height: `${stripLength}px`, width: '100%' }}
                  >
                    {strip.colors.map((color, colorIndex) => {
                      const isSelected = selectedColorState?.hex === color.hex
                      const isLast = colorIndex === strip.colors.length - 1
                      const colorHeight = stripLength / strip.colors.length

                      return (
                        <div key={colorIndex} className="flex flex-col">
                          {/* Color square */}
                          <button
                            onClick={() => handleColorSelect(color)}
                            className={`relative flex-1 w-16 sm:w-20 transition-all cursor-pointer ${isSelected
                              ? "ring-2 ring-[#D4834F] ring-offset-1 sm:ring-offset-2 z-50 scale-110"
                              : "hover:scale-105 hover:z-40 active:scale-100 z-30"
                              }`}
                            style={{
                              backgroundColor: `#${color.hex}`,
                              minHeight: `${colorHeight * 0.85}px`,
                            }}
                            title={color.name}
                          />

                          {/* White divider with text (between colors) */}
                          {!isLast && (
                            <div
                              className="relative w-16 sm:w-20 bg-white flex flex-col items-center justify-center px-1 z-20 border-x border-gray-200"
                              style={{ minHeight: `${colorHeight * 0.15}px` }}
                            >
                              <span className="text-[7px] sm:text-[8px] font-medium text-gray-900 truncate w-full text-center leading-tight">
                                {color.name}
                              </span>
                              <span className="text-[6px] sm:text-[7px] text-gray-600 truncate w-full text-center leading-tight">
                                {color.lch}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation arrows (desktop only) */}
          <div className="hidden md:flex absolute left-4 right-4 top-[30%] -translate-y-1/2 pointer-events-none z-1000 justify-between">
            <button
              onClick={() => handleArrowClick('left')}
              className="pointer-events-auto bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full p-2 shadow-lg border border-border/50 transition-all"
              aria-label="Попередня смуга"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => handleArrowClick('right')}
              className="pointer-events-auto bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full p-2 shadow-lg border border-border/50 transition-all"
              aria-label="Наступна смуга"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Fixed bottom panel - always visible */}
        <div
          className={`sticky bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-border/50 shadow-lg ${searchOpen ? 'z-[50]' : 'z-[1000]'}`}
          style={{
            backgroundColor: selectedColorState ? `#${selectedColorState.hex}` : 'rgba(233, 219, 204, 0.98)'
          }}
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 relative">
            <div className="flex-1 min-w-0">
              {selectedColorState ? (
                <div className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  <div className="text-base sm:text-lg font-semibold truncate">{selectedColorState.name}</div>
                  <div className="text-xs sm:text-sm opacity-90">{selectedColorState.lch}</div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <div className="text-base leading-[48px] sm:text-lg font-medium">{clickToSelectText}</div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="absolute top-0 right-0 md:static flex-shrink-0 bg-[#D4834F] hover:bg-[#C17340] text-white shadow-[0_1px_3px_0_#000000ad,0_1px_5px_-1px_#00000073]"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedColorState}
                className="bg-[#D4834F] hover:bg-[#C17340] text-white shadow-[0_1px_3px_0_#000000ad,0_1px_1px_-1px_#00000073] flex-shrink-0 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Обрати
              </Button>
            </div>
          </div>
        </div>

        {/* Search Panel - shown inside modal on the right side */}
        {searchOpen && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/20 rounded-xl">
            {/* Backdrop */}
            <div 
              className="absolute inset-0"
              onClick={() => {
                setSearchOpen(false)
                setSearchQuery("")
              }}
            />
            
            {/* Search Panel */}
            <div 
              className="absolute top-0 right-0 w-[280px] sm:w-[320px] h-full flex flex-col rounded-r-xl overflow-hidden shadow-2xl "
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'rgba(255,228,196,0.98)',
                opacity: 1,
                WebkitBackdropFilter: 'none',
                backdropFilter: 'none',
                WebkitTransform: 'translateZ(0)', // стабілізує шар
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
                  onClick={() => {
                    setSearchOpen(false)
                    setSearchQuery("")
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white"
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
                          onClick={() => handleSearchColorSelect(color)}
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
        )}
      </DialogContent>
    </Dialog>
  )
}
