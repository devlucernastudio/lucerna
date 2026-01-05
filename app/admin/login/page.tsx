"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [envError, setEnvError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setEnvError("Supabase environment variables are missing")
      console.error("[v0] Missing env vars:", {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "present" : "missing",
      })
    }
  }, [])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Starting login process")

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Auth response:", { authData, authError })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error("Не вдалося увійти")
      }

      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      console.log("[v0] Admin check:", { adminData, adminError })

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        throw new Error("У вас немає прав доступу до адмін-панелі")
      }

      console.log("[v0] Login successful, redirecting")
      router.push("/admin")
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "Сталася помилка")
    } finally {
      setIsLoading(false)
    }
  }

  if (envError) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F5F3EE] p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Configuration Error</CardTitle>
            <CardDescription>{envError}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Please check your environment variables in the project settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F5F3EE] p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Адмін-панель Lucerna</CardTitle>
            <CardDescription>Увійдіть, щоб керувати магазином</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-[#D4834F] hover:bg-[#C17340]" disabled={isLoading}>
                  {isLoading ? "Вхід..." : "Увійти"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
