import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export const metadata = {
  title: "Блог - Lucerna Studio",
  description: "Новини, статті та натхнення від Lucerna Studio",
}

const blogPosts = [
  {
    id: "1",
    title: "Як вибрати правильний світильник для вашого простору",
    excerpt: "Поради від наших дизайнерів щодо вибору ідеального освітлення для різних типів приміщень та інтер'єрів.",
    date: "2024-01-15",
    image: "/modern-interior-lighting.jpg",
  },
  {
    id: "2",
    title: "Процес створення світильників ручної роботи",
    excerpt: "Заглянемо за лаштунки нашої майстерні та дізнаємось, як народжуються унікальні світильники Lucerna.",
    date: "2024-01-10",
    image: "/handmade-craft-workshop.jpg",
  },
  {
    id: "3",
    title: "Тренди освітлення 2024",
    excerpt: "Огляд найактуальніших тенденцій у світі дизайнерського освітлення та інтер'єру.",
    date: "2024-01-05",
    image: "/contemporary-lighting-design.jpg",
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-secondary py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-light text-foreground">Блог</h1>
          <p className="mt-2 text-muted-foreground">Новини, поради та натхнення</p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
              <Link href={`/blog/${post.id}`}>
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("uk-UA")}</time>
                </div>
                <Link href={`/blog/${post.id}`}>
                  <h3 className="mb-2 text-xl font-medium text-foreground hover:text-[#D4834F] transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
