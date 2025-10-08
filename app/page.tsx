import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  FileTextIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";

export default function HomeMenu() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50/30 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header Section */}
        <header className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1 text-sm font-medium bg-orange-100 text-orange-700 border-orange-200"
            >
              Beta
            </Badge>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Pilih Mode
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 md:text-xl">
            Mulai dengan mode penyusunan (Drafter) atau pemeriksa dokumen
            (Terminator)
          </p>
        </header>

        {/* Cards Section */}
        <section className="grid gap-8 md:grid-cols-2">
          {/* Drafter Card */}
          <Card className="group relative overflow-hidden border-l-4 border-l-orange-500 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute right-4 top-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <FileTextIcon className="h-5 w-5" />
              </div>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                Drafter
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Menyusun peraturan dengan template, auto-referencing, dan
                toolbar lengkap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Link href="/drafter">
                  Mulai Drafter
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Terminator Card */}
          <Card className="group relative overflow-hidden border-l-4 border-l-orange-500 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute right-4 top-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <CheckCircledIcon className="h-5 w-5" />
              </div>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                Terminator
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Unggah dokumen untuk cek kesalahan input: penomoran duplikat,
                referensi hilang, dan lainnya.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="secondary"
                className="w-full gap-2 border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800"
              >
                <Link href="/terminator">
                  Buka Terminator
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
            >
              Login di sini
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
