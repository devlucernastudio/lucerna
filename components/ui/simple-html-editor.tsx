"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, List, ListOrdered } from "lucide-react"

interface SimpleHtmlEditorProps {
  value: string
  onChange: (value: string) => void
  id?: string
  rows?: number
  placeholder?: string
  className?: string
}

export function SimpleHtmlEditor({
  value,
  onChange,
  id,
  rows = 4,
  placeholder,
  className,
}: SimpleHtmlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const executeCommand = (command: string, value?: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value || textarea.value.substring(start, end)
    const before = textarea.value.substring(0, start)
    const after = textarea.value.substring(end)

    let newText = ""
    let newCursorPos = start

    switch (command) {
      case "bold":
        if (selectedText) {
          newText = before + `<strong>${selectedText}</strong>` + after
          newCursorPos = start + `<strong>${selectedText}</strong>`.length
        } else {
          newText = before + `<strong></strong>` + after
          newCursorPos = start + `<strong>`.length
        }
        break
      case "ul":
        if (selectedText) {
          const lines = selectedText.split("\n").filter((line) => line.trim())
          const listItems = lines.map((line) => `  <li>${line.trim()}</li>`).join("\n")
          newText = before + `<ul>\n${listItems}\n</ul>` + after
          newCursorPos = start + `<ul>\n${listItems}\n</ul>`.length
        } else {
          newText = before + `<ul>\n  <li></li>\n</ul>` + after
          newCursorPos = start + `<ul>\n  <li>`.length
        }
        break
      case "ol":
        if (selectedText) {
          const lines = selectedText.split("\n").filter((line) => line.trim())
          const listItems = lines.map((line) => `  <li>${line.trim()}</li>`).join("\n")
          newText = before + `<ol>\n${listItems}\n</ol>` + after
          newCursorPos = start + `<ol>\n${listItems}\n</ol>`.length
        } else {
          newText = before + `<ol>\n  <li></li>\n</ol>` + after
          newCursorPos = start + `<ol>\n  <li>`.length
        }
        break
      case "p":
        if (selectedText) {
          const lines = selectedText.split("\n").filter((line) => line.trim())
          if (lines.length > 0) {
            const paragraphs = lines.map((line) => `<p>${line.trim()}</p>`).join("\n")
            newText = before + paragraphs + after
            newCursorPos = start + paragraphs.length
          } else {
            newText = before + `<p>${selectedText}</p>` + after
            newCursorPos = start + `<p>${selectedText}</p>`.length
          }
        } else {
          newText = before + `<p></p>` + after
          newCursorPos = start + `<p>`.length
        }
        break
      default:
        return
    }

    onChange(newText)

    // Restore cursor position after state update
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  return (
    <div className={className}>
      <div className="flex gap-2 mb-2 border-b pb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            executeCommand("bold")
          }}
          title="Жирний (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            executeCommand("p")
          }}
          title="Абзац"
        >
          P
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            executeCommand("ul")
          }}
          title="Маркований список"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            executeCommand("ol")
          }}
          title="Нумерований список"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p className="mt-1 text-xs text-muted-foreground">
        Використовуйте кнопки для форматування тексту. Підтримуються HTML теги: &lt;strong&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;
      </p>
    </div>
  )
}

