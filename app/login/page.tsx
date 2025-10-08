"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Masuk</h1>
            <p className="text-sm text-muted-foreground">Gunakan email dan kata sandi Anda.</p>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@instansi.go.id"
                autoComplete="email"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Kata sandi</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button
              disabled={loading || !email || !password}
              onClick={() => {
                setLoading(true)
                // Simulasi login lokal
                localStorage.setItem("auth-email", email)
                setTimeout(() => {
                  setLoading(false)
                  router.push("/")
                }, 500)
              }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Lanjut tanpa akun
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
