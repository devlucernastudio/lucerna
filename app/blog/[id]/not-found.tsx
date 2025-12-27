import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-4xl font-light text-foreground">Стаття не знайдена</h1>
      <p className="mb-8 text-muted-foreground">На жаль, ця стаття не існує або була видалена</p>
      <Button className="bg-[#D4834F] hover:bg-[#C17340]" asChild>
        <Link href="/blog">Повернутися до блогу</Link>
      </Button>
    </div>
  )
}
