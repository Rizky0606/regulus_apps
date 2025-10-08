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
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50/20 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header Section */}
        <header className="mb-8">
          {/* Top Bar */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>

            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-xs font-medium border-orange-200 bg-orange-50 text-orange-700"
              >
                <Crown className="w-3 h-3 mr-1" />
                Fitur Tambahan
              </Badge>
              <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full px-3 py-1">
                OMNIBUS LAW
              </Badge>
              <Link
                href="/login"
                className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">
              Pilih Jenis Peraturan
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
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
                className="group relative overflow-hidden border-2 border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-orange-200 hover:bg-orange-50/30"
              >
                {/* Accent Bar */}
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                          {jenis.title}
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium bg-orange-100 text-orange-700"
                          >
                            {jenis.badge}
                          </Badge>
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <p className="text-slate-600 leading-relaxed">
                    {jenis.description}
                  </p>
                </CardContent>

                <CardFooter className="pt-2 border-t border-slate-100">
                  <Button
                    asChild
                    className="ml-auto gap-2 bg-orange-600 hover:bg-orange-700 text-white"
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
          <div className="inline-flex flex-col items-center gap-4 text-sm text-slate-500">
            <p>Butuh bantuan memilih jenis peraturan?</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                Lihat Panduan
              </span>
              <span className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-orange-500" />
                Template Tersedia
              </span>
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-orange-500" />
                Fitur Premium
              </span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
