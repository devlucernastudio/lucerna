"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showToast } from "@/lib/toast"
import { Plus, Trash2 } from "lucide-react"

interface DownloadableFile {
  id: string
  title_uk: string
  title_en: string
  description_uk: string | null
  description_en: string | null
  link: string
  created_at?: string
  updated_at?: string
}

export function DownloadableFilesManager() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<DownloadableFile[]>([])

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from("downloadable_files")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      showToast.error("Помилка при завантаженні файлів")
      return
    }

    if (data) {
      setFiles(data)
    }
  }

  const handleAddFile = () => {
    const newFile: DownloadableFile = {
      id: `temp-${Date.now()}`,
      title_uk: "",
      title_en: "",
      description_uk: null,
      description_en: null,
      link: "",
    }
    setFiles([...files, newFile])
  }

  const handleUpdateFile = (id: string, field: keyof DownloadableFile, value: string | null) => {
    setFiles(
      files.map((file) => (file.id === id ? { ...file, [field]: value } : file))
    )
  }

  const handleDeleteFile = async (id: string) => {
    // If it's a temporary file (not saved yet), just remove from state
    if (id.startsWith("temp-")) {
      setFiles(files.filter((file) => file.id !== id))
      return
    }

    setLoading(true)
    const { error } = await supabase.from("downloadable_files").delete().eq("id", id)

    if (error) {
      showToast.error("Помилка при видаленні файлу")
    } else {
      showToast.success("Файл видалено")
      loadFiles()
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setLoading(true)

    // Validate all files
    for (const file of files) {
      if (!file.title_uk.trim() || !file.title_en.trim() || !file.link.trim()) {
        showToast.error("Заповніть всі обов'язкові поля (заголовок UA, заголовок EN, посилання)")
        setLoading(false)
        return
      }
    }

    try {
      // Process each file
      for (const file of files) {
        const fileData = {
          title_uk: file.title_uk.trim(),
          title_en: file.title_en.trim(),
          description_uk: file.description_uk?.trim() || null,
          description_en: file.description_en?.trim() || null,
          link: file.link.trim(),
        }

        if (file.id.startsWith("temp-")) {
          // Insert new file
          const { error } = await supabase.from("downloadable_files").insert(fileData)
          if (error) throw error
        } else {
          // Update existing file
          const { error } = await supabase
            .from("downloadable_files")
            .update(fileData)
            .eq("id", file.id)
          if (error) throw error
        }
      }

      showToast.success("Файли збережено")
      loadFiles()
    } catch (error: any) {
      showToast.error(error.message || "Помилка при збереженні файлів")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Файли для завантаження</CardTitle>
        <CardDescription>
          Створюйте файли для завантаження, які можна буде прив'язати до товарів
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">Немає створених файлів</p>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">
                    {file.title_uk || file.title_en || "Новий файл"}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`title_uk-${file.id}`}>
                      Заголовок (Українська) *
                    </Label>
                    <Input
                      id={`title_uk-${file.id}`}
                      value={file.title_uk}
                      onChange={(e) =>
                        handleUpdateFile(file.id, "title_uk", e.target.value)
                      }
                      placeholder="Назва файлу українською"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`title_en-${file.id}`}>
                      Заголовок (English) *
                    </Label>
                    <Input
                      id={`title_en-${file.id}`}
                      value={file.title_en}
                      onChange={(e) =>
                        handleUpdateFile(file.id, "title_en", e.target.value)
                      }
                      placeholder="File name in English"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`description_uk-${file.id}`}>
                      Опис (Українська)
                    </Label>
                    <Textarea
                      id={`description_uk-${file.id}`}
                      value={file.description_uk || ""}
                      onChange={(e) =>
                        handleUpdateFile(
                          file.id,
                          "description_uk",
                          e.target.value || null
                        )
                      }
                      placeholder="Опис файлу українською (необов'язково)"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`description_en-${file.id}`}>
                      Опис (English)
                    </Label>
                    <Textarea
                      id={`description_en-${file.id}`}
                      value={file.description_en || ""}
                      onChange={(e) =>
                        handleUpdateFile(
                          file.id,
                          "description_en",
                          e.target.value || null
                        )
                      }
                      placeholder="File description in English (optional)"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`link-${file.id}`}>Посилання *</Label>
                  <Input
                    id={`link-${file.id}`}
                    type="url"
                    value={file.link}
                    onChange={(e) =>
                      handleUpdateFile(file.id, "link", e.target.value)
                    }
                    placeholder="https://example.com/file.pdf"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddFile}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Додати файл
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-[#D4834F] hover:bg-[#C17340]"
          >
            {loading ? "Збереження..." : "Зберегти всі файли"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
