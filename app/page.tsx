import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomeMenu() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-pretty text-3xl font-semibold">Pilih Mode</h1>
          <p className="text-muted-foreground">
            Mulai dengan mode penyusunan (Drafter) atau pemeriksa dokumen (Terminator)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="rounded-full px-3">Beta</Badge>
          <Link href="/login" className="text-sm underline">
            Login
          </Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-muted/60 shadow-sm transition hover:shadow-md">
          <CardHeader>
            <CardTitle>Drafter</CardTitle>
            <CardDescription>
              Menyusun peraturan dengan template, auto-referencing, dan toolbar lengkap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/drafter">Mulai Drafter</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm transition hover:shadow-md">
          <CardHeader>
            <CardTitle>Terminator</CardTitle>
            <CardDescription>
              Unggah dokumen untuk cek kesalahan input: penomoran duplikat, referensi hilang, dan lainnya.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/terminator">Buka Terminator</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}