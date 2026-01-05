import { LocaleLink } from "@/lib/locale-link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
          <LocaleLink href="/blog">
            <ChevronLeft className="h-4 w-4" />
            Назад до блогу
          </LocaleLink>
        </Button>
      </div>

      {/* Not Found Message */}
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-4xl font-light text-foreground">Стаття не знайдена</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          На жаль, ця стаття не існує або була видалена
        </p>
        <Button className="bg-[#D4834F] hover:bg-[#C17340]" asChild>
          <LocaleLink href="/blog">Повернутися до блогу</LocaleLink>
        </Button>
      </div>
    </main>
  )
}

