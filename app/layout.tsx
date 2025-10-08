import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Suspense } from "react"
import { Toaster } from "sonner" // ✅ Tambahkan ini
import "./globals.css"

export const metadata: Metadata = {
  title: "Aplikasi Penyusunan Peraturan",
  description: "Aplikasi Penyusunan Peraturan",
}

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body
        className="font-sans bg-background text-foreground min-h-screen"
        suppressHydrationWarning
      >
        <Suspense fallback={null}>{children}</Suspense>

        {/* ✅ Tambahkan komponen Toaster agar toast dari sonner muncul */}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            classNames: {
              toast: "border border-gray-200 shadow-md",
              title: "font-medium",
              description: "text-sm text-gray-600",
            },
          }}
        />
      </body>
    </html>
  )
}
