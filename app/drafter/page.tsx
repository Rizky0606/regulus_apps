import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"

const jenisList = [
  { id: "rplps-baru", title: "RPLPS Baru" },
  { id: "rplps-perubahan", title: "RPLPS Perubahan" },
  { id: "rpdk-baru", title: "RPDK Baru" },
  { id: "rpdk-perubahan", title: "RPDK Perubahan" },
]

export default function DrafterIndex() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Tombol Kembali */}
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>
          
          <h1 className="text-pretty text-3xl font-semibold">Pilih Jenis Peraturan</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="rounded-full px-3 py-1" variant="secondary">
            Fitur Tambahan {">>"}
          </Badge>
          <Badge className="bg-[color:var(--brand-600)] text-white">OMNIBUS</Badge>
          <Link href="/login" className="text-sm underline">
            Login
          </Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {jenisList.map((j) => (
          <Card key={j.id} className="border-muted/60 shadow-sm transition hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <span className="h-5 w-4 rounded-sm bg-[color:var(--brand-500)] ring-1 ring-black/5" aria-hidden />
                {j.title}
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button asChild className="ml-auto">
                <Link href={`/editor?jenis=${encodeURIComponent(j.title)}`}>Pilih</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  )
}