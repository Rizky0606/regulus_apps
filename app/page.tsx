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
    <main className="min-h-screen bg-gradient-to-br from-[#F7F7F7] to-[#A4A4A4]/30 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header Section */}
        <header className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1 text-sm font-medium bg-[#DB8928] text-white border-[#DB8928]"
            >
              Beta
            </Badge>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#282828] md:text-5xl">
            Pilih Mode
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#A4A4A4] md:text-xl">
            Mulai dengan mode penyusunan (Drafter) atau pemeriksa dokumen
            (Terminator)
          </p>
        </header>

        {/* Cards Section */}
        <section className="grid gap-8 md:grid-cols-2">
          {/* Drafter Card */}
          <Card className="group relative overflow-hidden border-l-4 border-l-[#DB8928] bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute right-4 top-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DB8928]/10 text-[#DB8928]">
                <FileTextIcon className="h-5 w-5" />
              </div>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-[#282828]">
                Drafter
              </CardTitle>
              <CardDescription className="text-base text-[#A4A4A4]">
                Menyusun peraturan dengan template, auto-referencing, dan
                toolbar lengkap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full gap-2 bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
              >
                <Link href="/drafter">
                  Mulai Drafter
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Terminator Card */}
          <Card className="group relative overflow-hidden border-l-4 border-l-[#DB8928] bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute right-4 top-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DB8928]/10 text-[#DB8928]">
                <CheckCircledIcon className="h-5 w-5" />
              </div>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-[#282828]">
                Terminator
              </CardTitle>
              <CardDescription className="text-base text-[#A4A4A4]">
                Unggah dokumen untuk cek kesalahan input: penomoran duplikat,
                referensi hilang, dan lainnya.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="secondary"
                className="w-full gap-2 border border-[#DB8928] bg-[#DB8928]/10 text-[#DB8928] hover:bg-[#DB8928]/20 hover:text-[#DB8928]"
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
          <p className="text-sm text-[#A4A4A4]">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-medium text-[#DB8928] hover:text-[#DB8928]/80 hover:underline"
            >
              Login di sini
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
