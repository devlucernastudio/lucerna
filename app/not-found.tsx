import { LocaleLink } from "@/lib/locale-link"
import { Button } from "@/components/ui/button"
import { HeaderWrapper } from "@/components/header-wrapper"

export default function NotFound() {
  return (
    <>
      <HeaderWrapper />
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-2 text-4xl font-light text-foreground">Сторінку не знайдено</h1>
        <p className="mb-8 text-muted-foreground">На жаль, ця сторінка не існує</p>
        <Button className="bg-[#D4834F] hover:bg-[#C17340]" asChild>
          <LocaleLink href="/">Повернутися на головну</LocaleLink>
        </Button>
      </div>
    </>
  )
}

