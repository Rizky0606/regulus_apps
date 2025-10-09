import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Edit, Plus, Crown } from "lucide-react";

const jenisList = [
  {
    id: "rplps-baru",
    title: "RPLPS Baru",
    description:
      "Membuat Rencana Pembangunan dan Lingkungan Pesisir dan Pulau-Pulau Kecil baru",
    icon: Plus,
    badge: "New",
  },
  {
    id: "rplps-perubahan",
    title: "RPLPS Perubahan",
    description: "Mengubah atau merevisi RPLPS yang sudah ada",
    icon: Edit,
    badge: "Update",
  },
  {
    id: "rpdk-baru",
    title: "RPDK Baru",
    description: "Membuat Rencana Pembangunan Daerah Khusus baru",
    icon: FileText,
    badge: "Featured",
  },
  {
    id: "rpdk-perubahan",
    title: "RPDK Perubahan",
    description: "Mengubah atau merevisi RPDK yang sudah ada",
    icon: Edit,
    badge: "Updated",
  },
];

export default function DrafterIndex() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F7F7F7] to-[#A4A4A4]/20 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header Section */}
        <header className="mb-8">
          {/* Top Bar */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm text-[#A4A4A4] hover:text-[#282828] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>

            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-xs font-medium border-[#DB8928] bg-[#DB8928]/10 text-[#DB8928]"
              >
                <Crown className="w-3 h-3 mr-1" />
                Fitur Tambahan
              </Badge>
              <Badge className="bg-gradient-to-r from-[#DB8928] to-[#DB8928]/80 text-white rounded-full px-3 py-1">
                OMNIBUS LAW
              </Badge>
              <Link
                href="/login"
                className="text-sm font-medium text-[#DB8928] hover:text-[#DB8928]/80 hover:underline"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-[#282828] mb-3">
              Pilih Jenis Peraturan
            </h1>
            <p className="text-lg text-[#A4A4A4] max-w-2xl mx-auto">
              Pilih jenis dokumen peraturan yang ingin Anda susun atau edit
            </p>
          </div>
        </header>

        {/* Cards Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {jenisList.map((jenis) => {
            const IconComponent = jenis.icon;
            return (
              <Card
                key={jenis.id}
                className="group relative overflow-hidden border-2 border-[#F7F7F7] bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#DB8928] hover:bg-[#DB8928]/5"
              >
                {/* Accent Bar */}
                <div className="absolute top-0 left-0 w-1 h-full bg-[#DB8928]" />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#DB8928] text-white">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-[#282828]">
                          {jenis.title}
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium bg-[#DB8928]/10 text-[#DB8928]"
                          >
                            {jenis.badge}
                          </Badge>
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <p className="text-[#A4A4A4] leading-relaxed">
                    {jenis.description}
                  </p>
                </CardContent>

                <CardFooter className="pt-2 border-t border-[#F7F7F7]">
                  <Button
                    asChild
                    className="ml-auto gap-2 bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
                  >
                    <Link
                      href={`/editor?jenis=${encodeURIComponent(jenis.title)}`}
                    >
                      Pilih Jenis Ini
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </section>

        {/* Additional Info */}
        <footer className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 text-sm text-[#A4A4A4]">
            <p>Butuh bantuan memilih jenis peraturan?</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#DB8928]" />
                Lihat Panduan
              </span>
              <span className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#DB8928]" />
                Template Tersedia
              </span>
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#DB8928]" />
                Fitur Premium
              </span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
