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
import caparolColors from "@/lib/caparol-3d-plus.json"
import { useI18n } from "@/lib/i18n-context"

interface CaparolColor {
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
  const [isScrolling, setIsScrolling] = useState(false) // Track if actively scrolling (touch or momentum)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<number | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const scrollOffsetAtTouchStartRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const touchMovePendingRef = useRef<boolean>(false)
  // Momentum scrolling refs
  const velocityRef = useRef<number>(0)
  const lastTouchXRef = useRef<number | null>(null)
  const lastTouchTimeRef = useRef<number | null>(null)
  const momentumRafRef = useRef<number | null>(null)
  const isMomentumScrollingRef = useRef<boolean>(false)
  const touchHistoryRef = useRef<Array<{ x: number; time: number }>>([]) // Track touch history for velocity calculation

  // Update selected color when prop changes (fix hydration mismatch)
  // Use null initially to prevent hydration mismatch
  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return
    
    if (open) {
      // Only set after mount to prevent hydration mismatch
      const foundColor = findSelectedColor()
      setSelectedColorState(foundColor)
      setScrollOffset(0) // Reset scroll when modal opens
      setIsScrolling(false)
      // Reset all touch refs
      touchStartXRef.current = null
      lastTouchXRef.current = null
      touchStartRef.current = null
      lastTouchTimeRef.current = null
      velocityRef.current = 0
      touchHistoryRef.current = []
      // Stop any ongoing momentum scrolling
      if (momentumRafRef.current) {
        cancelAnimationFrame(momentumRafRef.current)
        momentumRafRef.current = null
        isMomentumScrollingRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColorId, open])

  // Handle horizontal wheel scroll to flip strips like pages (from right to left)
  // scrollOffset is a continuous value representing global scroll progress
  // 0 = initial state (strips from 90° to 180°)
  // Higher values = strips move left (toward 0°)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = e.deltaX || e.deltaY // Fallback to deltaY if deltaX not available
    // Adjust scroll speed - smaller value = slower turning
    const scrollStep = 0.3
    const totalStrips = colorsData.strips.length
    // Maximum scroll: allow scrolling until the last strip reaches 0°
    // Each strip needs to move 180° total, so max scroll = totalStrips * some factor
    const maxScrollOffset = totalStrips * 2 // Allow scrolling through all strips
    setScrollOffset((prev) => {
      // Positive delta (scroll right) increases offset (moves strips from right to left)
      const newOffset = prev + (delta > 0 ? scrollStep : -scrollStep)
      return Math.max(0, Math.min(maxScrollOffset, newOffset))
    })
    // Reset scrolling state for desktop wheel (no transition needed)
    setIsScrolling(false)
  }

  // Momentum scrolling with inertia
  const startMomentumScrolling = () => {
    if (isMomentumScrollingRef.current) return
    
    isMomentumScrollingRef.current = true
    setIsScrolling(true)
    const friction = 0.92 // Decay factor
    const minVelocity = 0.05 // Stop when velocity is too low
    
    const animate = () => {
      if (Math.abs(velocityRef.current) < minVelocity) {
        // Stop momentum scrolling
        isMomentumScrollingRef.current = false
        velocityRef.current = 0
        setIsScrolling(false)
        if (momentumRafRef.current) {
          cancelAnimationFrame(momentumRafRef.current)
          momentumRafRef.current = null
        }
        return
      }
      
      // Apply velocity to scroll offset
      const totalStrips = colorsData.strips.length
      const maxScrollOffset = totalStrips * 2
      setScrollOffset((prev) => {
        const newOffset = prev + velocityRef.current
        return Math.max(0, Math.min(maxScrollOffset, newOffset))
      })
      
      // Decay velocity
      velocityRef.current *= friction
      
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
    lastTouchXRef.current = touch.clientX
    touchStartRef.current = now
    lastTouchTimeRef.current = now
    scrollOffsetAtTouchStartRef.current = scrollOffset
    touchHistoryRef.current = [{ x: touch.clientX, time: now }]
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || lastTouchXRef.current === null) return
    
    const touch = e.touches[0]
    const currentX = touch.clientX
    const currentTime = Date.now()
    const deltaX = currentX - touchStartXRef.current
    
    // Track touch history for better velocity calculation
    touchHistoryRef.current.push({ x: currentX, time: currentTime })
    // Keep only last 5 points for velocity calculation
    if (touchHistoryRef.current.length > 5) {
      touchHistoryRef.current.shift()
    }
    
    // Calculate velocity from recent touch history (more accurate)
    // Use more points for better velocity calculation on slower devices
    if (touchHistoryRef.current.length >= 2) {
      const recent = touchHistoryRef.current.slice(-2)
      const timeDelta = recent[1].time - recent[0].time
      if (timeDelta > 0 && timeDelta < 100) { // Only use recent data (< 100ms)
        const distanceDelta = recent[1].x - recent[0].x
        // Velocity in pixels per millisecond, converted to scroll units
        // Negative because swipe right = scroll left
        // Increased multiplier for better responsiveness on Android
        velocityRef.current = -(distanceDelta / timeDelta) * 0.8
      }
    }
    
    lastTouchXRef.current = currentX
    lastTouchTimeRef.current = currentTime
    
    // Convert horizontal swipe to scroll offset
    const scrollStep = 0.015 // Sensitivity for touch
    const totalStrips = colorsData.strips.length
    const maxScrollOffset = totalStrips * 2
    
    // Calculate scroll offset based on initial touch position
    const scrollDelta = -deltaX * scrollStep
    const newOffset = Math.max(0, Math.min(maxScrollOffset, scrollOffsetAtTouchStartRef.current + scrollDelta))
    
    // Update immediately without transition for smooth dragging
    setScrollOffset(newOffset)
  }

  const handleTouchEnd = () => {
    // Start momentum scrolling if velocity is significant
    // Lower threshold for better responsiveness on Android
    if (Math.abs(velocityRef.current) > 0.2) {
      startMomentumScrolling()
    } else {
      setIsScrolling(false)
    }
    
    touchStartXRef.current = null
    lastTouchXRef.current = null
    touchStartRef.current = null
    lastTouchTimeRef.current = null
    touchMovePendingRef.current = false
    touchHistoryRef.current = []
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const handleColorSelect = (color: CaparolColor) => {
    setSelectedColorState(color)
  }

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
    const scrollStep = 2 // Larger step for arrow clicks
    const totalStrips = colorsData.strips.length
    const maxScrollOffset = totalStrips * 2
    
    setScrollOffset((prev) => {
      const newOffset = direction === 'right' 
        ? prev + scrollStep 
        : prev - scrollStep
      return Math.max(0, Math.min(maxScrollOffset, newOffset))
    })
  }

  // Calculate rotation angle for fan-book effect (pages flip from right to left, 180 degrees total)
  // Geometry: Half-circle from 0° (bottom-left) to 180° (bottom-right), 90° is vertical center
  // Each strip's angle is determined by its position relative to the global scroll progress
  // 
  // Key concept: scrollOffset is continuous, representing how far we've scrolled
  // Each strip's angle = baseAngle - (scrollOffset - stripIndex * spacingFactor)
  // This creates a fan effect where strips are distributed along the 0°-180° arc
  const getStripRotation = (index: number, total: number, scrollOffset: number) => {
    // Spacing factor: how many scroll units between each strip
    // This determines how tightly packed the strips are
    const spacingFactor = 1.5
    
    // Base angle for this strip when scrollOffset = 0
    // Initial state: strips are distributed from 90° to 180°
    // First strip (index 0) starts near 90°, last strip starts near 180°
    const initialAngle = 90 + (index / (total - 1 || 1)) * 90 // 90° to 180°
    
    // Calculate how much this strip has moved based on scroll progress
    // Each strip moves 180° total (from 180° to 0°)
    const stripScrollProgress = scrollOffset - (index * spacingFactor)
    
    // Convert scroll progress to rotation
    // Positive progress = strip moves left (toward 0°)
    // Each unit of scroll progress = some degrees of rotation
    const degreesPerScrollUnit = 180 / (spacingFactor * 10) // Adjust for smooth rotation
    const rotationDelta = stripScrollProgress * degreesPerScrollUnit
    
    // Calculate final angle
    // Strip starts at initialAngle, moves toward 0° as scroll increases
    let finalAngle = initialAngle - rotationDelta
    
    // Clamp angle to valid range (0° to 180°)
    finalAngle = Math.max(0, Math.min(180, finalAngle))
    
    return finalAngle
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ backgroundColor: 'rgba(255, 228, 196, 0.92)' }} className="max-w-2xl w-[90vw] max-w-[600px] h-[90vh] md:h-[80vh] p-0 flex flex-col overflow-hidden rounded-xl sm:rounded-xl">
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
          className="flex-1 overflow-hidden pb-32 md:pb-28 relative flex items-end justify-center"
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
            
            {/* Strips fanning out from bottom center - flip like pages on scroll */}
            {/* Optimized: Only render 12-15 visible strips around current scroll position */}
            {useMemo(() => {
              const totalStrips = colorsData.strips.length
              const spacingFactor = 1.5
              
              // Calculate which strip is currently in the center based on scrollOffset
              // Each strip's position in scroll space: stripIndex * spacingFactor
              // Find the strip closest to current scrollOffset
              const centerStripIndex = Math.round(scrollOffset / spacingFactor)
              
              // Render 7 strips on each side of center (total 15 strips max)
              const bufferSize = 7
              const startIndex = Math.max(0, centerStripIndex - bufferSize)
              const endIndex = Math.min(totalStrips - 1, centerStripIndex + bufferSize)
              
              // Create array of strip indices to render
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
              
              // Only render strips that are visible (within 0°-180° range)
              // After rotation: -90° to +90° (visible range)
              const rotatedAngle = totalRotation - 90
              
              // Skip strips that are outside visible range (optimization)
              // Visible range: -90° to +90° (after rotation)
              // More aggressive filtering for better performance on mobile
              // Only render strips that are actually visible on screen
              if (rotatedAngle < -95 || rotatedAngle > 95) {
                return null
              }
              
              const stripLength = 400 // Distance from center
              
              // Calculate strip position from bottom center
              const centerX = 50 // 50% from left
              const centerY = 100 // 100% from top (bottom)
              
              // Calculate z-index: strips closer to vertical (0deg after rotation) get higher z-index
              // This ensures clickable strips are on top
              const angleFromVertical = Math.abs(rotatedAngle)
              const zIndex = Math.round(1000 - (angleFromVertical * 3) - stripIndex)
              
              return (
                <div
                  key={strip.stripIndex}
                  className="absolute pointer-events-none shadow-lg"
                  style={{
                    left: `${centerX}%`,
                    bottom: 0, // Use bottom: 0 instead of top: 100% to prevent shifting on iOS Chrome
                    transform: `translateX(-50%) rotate(${rotatedAngle}deg)`,
                    transformOrigin: "center bottom", // Bottom stays fixed, top rotates
                    zIndex: zIndex,
                    // Remove transition during touch/momentum scrolling for smoothness
                    // Use shorter transition on desktop for better responsiveness
                    // No transition on desktop wheel scroll for instant response
                    transition: isScrolling 
                      ? 'none' 
                      : 'transform 100ms ease-out',
                    // Performance optimization
                    willChange: isScrolling ? 'transform' : 'auto',
                  }}
                >
                  {/* Vertical strip with colors - positioned from bottom */}
                  <div 
                    className="flex flex-col pointer-events-auto"
                    style={{
                      height: `${stripLength}px`,
                      width: '100%',
                    }}
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
                            className={`relative flex-1 w-16 sm:w-20 transition-all cursor-pointer ${
                              isSelected
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
          className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 z-1000 border-t border-border/50 shadow-lg"
          style={{ 
            backgroundColor: selectedColorState ? `#${selectedColorState.hex}` : 'rgba(233, 219, 204, 0.98)'
          }}
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
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
            <Button
              onClick={handleConfirm}
              disabled={!selectedColorState}
              className="bg-[#D4834F] hover:bg-[#C17340] text-white flex-shrink-0 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Обрати
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
