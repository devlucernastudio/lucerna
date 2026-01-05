"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import caparolColors from "@/lib/caparol3d.json"

interface CaparolColor {
  id: string
  name: string
  hex: string
}

interface CaparolGroup {
  group: string
  colors: CaparolColor[]
}

interface CaparolPaletteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (color: CaparolColor) => void
  selectedColorId?: string
}

export function CaparolPaletteModal({
  open,
  onOpenChange,
  onSelect,
  selectedColorId,
}: CaparolPaletteModalProps) {
  const colorsData = caparolColors as {
    system: string
    note: string
    groups: CaparolGroup[]
  }

  const handleColorSelect = (color: CaparolColor) => {
    onSelect(color)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>{colorsData.system}</DialogTitle>
          <p className="text-sm text-muted-foreground">{colorsData.note}</p>
        </DialogHeader>
        <div className="space-y-4">
          {colorsData.groups.map((group) => (
            <div key={group.group} className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">{group.group}</h3>
              <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-10 gap-2">
                {group.colors.map((color) => {
                  const isSelected = selectedColorId === color.id
                  return (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(color)}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group transition-all"
                    >
                      <div
                        className={`w-12 h-12 rounded-md border-2 transition-all shadow-sm ${
                          isSelected
                            ? "border-[#D4834F] ring-2 ring-[#D4834F]/30 scale-110"
                            : "border-gray-300 group-hover:border-gray-400 group-hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                      <span className="text-[10px] text-center text-muted-foreground max-w-[60px] truncate">
                        {color.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

