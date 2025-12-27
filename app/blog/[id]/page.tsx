import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

const blogPosts = [
  {
    id: "1",
    title: "Як вибрати правильний світильник для вашого простору",
    excerpt: "Поради від наших дизайнерів щодо вибору ідеального освітлення для різних типів приміщень та інтер'єрів.",
    date: "2024-01-15",
    image: "/modern-interior-lighting.jpg",
    content: `
      <p>Вибір правильного освітлення - це мистецтво, яке може повністю трансформувати ваш простір. У цій статті ми поділимося професійними порадами щодо вибору ідеального світильника.</p>
      
      <h2>Розмір приміщення</h2>
      <p>Перший крок - визначити розмір вашого приміщення. Для великих просторів підійдуть масивні підвісні світильники, тоді як для маленьких кімнат краще обирати компактні варіанти.</p>
      
      <h2>Стиль інтер'єру</h2>
      <p>Світильник повинен гармонійно вписуватися в загальну стилістику приміщення. Наші світильники ручної роботи підходять для сучасних, мінімалістичних та екологічних інтер'єрів.</p>
      
      <h2>Функціональність</h2>
      <p>Врахуйте призначення освітлення - чи потрібно вам загальне освітлення, акцентне чи декоративне. Це визначить вибір типу та кількості світильників.</p>
    `,
  },
  {
    id: "2",
    title: "Процес створення світильників ручної роботи",
    excerpt: "Заглянемо за лаштунки нашої майстерні та дізнаємось, як народжуються унікальні світильники Lucerna.",
    date: "2024-01-10",
    image: "/handmade-craft-workshop.jpg",
    content: `
      <p>Створення світильників Lucerna - це багатоетапний процес, який вимагає майстерності, терпіння та уваги до деталей.</p>
      
      <h2>Етап 1: Концепція</h2>
      <p>Все починається з ідеї, натхненної природними формами. Ми вивчаємо текстури, силуети та органічні форми.</p>
      
      <h2>Етап 2: Створення форми</h2>
      <p>Кожен світильник формується вручну з екологічних матеріалів. Це найбільш трудомісткий етап виробництва.</p>
      
      <h2>Етап 3: Обробка та фінішування</h2>
      <p>Після формування світильник проходить ретельну обробку, що надає йому унікальної текстури та завершеного вигляду.</p>
    `,
  },
  {
    id: "3",
    title: "Тренди освітлення 2024",
    excerpt: "Огляд найактуальніших тенденцій у світі дизайнерського освітлення та інтер'єру.",
    date: "2024-01-05",
    image: "/contemporary-lighting-design.jpg",
    content: `
      <p>Розглянемо ключові тренди у світі освітлення, які будуть актуальні в 2024 році.</p>
      
      <h2>Природні матеріали</h2>
      <p>Екологічність та натуральність залишаються в пріоритеті. Світильники з паперу, льону та інших природних матеріалів особливо популярні.</p>
      
      <h2>Органічні форми</h2>
      <p>Плавні, натуральні силуети витісняють строгу геометрію. Це відображає прагнення до гармонії з природою.</p>
      
      <h2>Унікальність</h2>
      <p>Масове виробництво поступається місцем ексклюзивним виробам ручної роботи, які роблять інтер'єр неповторним.</p>
    `,
  },
]

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    id: post.id,
  }))
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const post = blogPosts.find((p) => p.id === params.id)
  if (!post) {
    return {
      title: "Стаття не знайдена - Lucerna Studio",
    }
  }
  return {
    title: `${post.title} - Lucerna Studio Blog`,
    description: post.excerpt,
  }
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = blogPosts.find((p) => p.id === params.id)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/blog">
            <ChevronLeft className="h-4 w-4" />
            Назад до блогу
          </Link>
        </Button>
      </div>

      {/* Article */}
      <article className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          {/* Hero Image */}
          <div className="relative mb-8 aspect-video overflow-hidden rounded-lg bg-muted">
            <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("uk-UA")}</time>
            </div>
            <h1 className="text-balance text-4xl font-light text-foreground">{post.title}</h1>
          </header>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </main>
  )
}
