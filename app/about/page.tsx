import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Про нас - Lucerna Studio",
  description: "Дізнайтеся більше про Lucerna Studio та наші унікальні світильники ручної роботи",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex h-[400px] items-center justify-center overflow-hidden bg-gradient-to-b from-[#6B5A4D] to-[#8B7355]">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-balance font-serif text-4xl font-light tracking-wide text-white md:text-5xl">
            Про Lucerna Studio
          </h1>
        </div>
      </section>

      {/* About Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h2 className="mb-4 text-2xl font-light text-foreground">Наша історія</h2>
            <p className="leading-relaxed text-muted-foreground">
              Lucerna Studio - це команда майстрів, яка створює унікальні світильники ручної роботи. Кожен виріб - це
              результат поєднання традиційних технік та сучасного дизайну, натхненного природними формами та текстурами.
            </p>
          </div>

          <div className="my-8 h-px bg-border" />

          <div>
            <h2 className="mb-4 text-2xl font-light text-foreground">Філософія</h2>
            <p className="leading-relaxed text-muted-foreground">
              Ми віримо, що світло має бути не лише функціональним, але й естетичним елементом простору. Наші
              світильники створені з натуральних матеріалів та втілюють концепцію "живих форм світла" - органічних,
              теплих та унікальних творів мистецтва.
            </p>
          </div>

          <div className="my-8 h-px bg-border" />

          <div>
            <h2 className="mb-4 text-2xl font-light text-foreground">Виробництво</h2>
            <p className="leading-relaxed text-muted-foreground">
              Кожен світильник Lucerna виготовляється вручну з використанням екологічних матеріалів. Процес створення
              вимагає уваги до деталей та майстерності, що робить кожен виріб унікальним. Ми пишаємося якістю нашої
              роботи та індивідуальним підходом до кожного замовлення.
            </p>
          </div>

          <div className="mt-12 flex justify-center">
            <Button className="bg-[#D4834F] hover:bg-[#C17340]" size="lg" asChild>
              <Link href="/catalog">Переглянути каталог</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
