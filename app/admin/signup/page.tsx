"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function AdminSignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Starting signup process")

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/admin/login`
          : process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "http://localhost:3000/admin/login"

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectUrl,
        },
      })

      console.log("[v0] Signup response:", { authData, authError })

      if (authError) throw authError
      if (!authData.user) throw new Error("Не вдалося створити користувача")

      const { error: adminError } = await supabase.from("admins").insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        is_super_admin: true,
      })

      console.log("[v0] Admin insert:", { adminError })

      if (adminError) {
        console.error("[v0] Admin insert error:", adminError)
        // Continue - trigger might have created it
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin/login")
      }, 2000)
    } catch (error: unknown) {
      console.error("[v0] Signup error:", error)
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

  if (success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F5F3EE] p-6">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Успішно!</CardTitle>
              <CardDescription>Адмін аккаунт створено. Перенаправлення на сторінку входу...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F5F3EE] p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Реєстрація адміністратора</CardTitle>
            <CardDescription>Створіть перший адмін аккаунт для Lucerna Studio</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Повне імʼя</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Ваше імʼя"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
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
                    placeholder="Мінімум 6 символів"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-[#D4834F] hover:bg-[#C17340]" disabled={isLoading}>
                  {isLoading ? "Створення..." : "Створити адмін аккаунт"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Вже є аккаунт?{" "}
                  <a href="/admin/login" className="text-[#D4834F] hover:underline">
                    Увійти
                  </a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
