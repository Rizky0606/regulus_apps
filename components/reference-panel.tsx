"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Regulation {
  id: string
  title: string
  year: string
  number: string
  text: string
  url: string
  createdAt: string
  updatedAt: string
}

interface Definition {
  id: string
  term: string
  meaning: string
  createdAt: string
  updatedAt: string
}

export function ReferencePanel({
  reference,
  onAddReference,
}: {
  reference?: any
  onAddReference?: (ref: any) => void
}) {
  const [showRefForm, setShowRefForm] = useState(false)
  const [refForm, setRefForm] = useState({
    title: "",
    year: "",
    number: "",
    text: "",
    url: "",
  })

  // State untuk referensi definisi
  const [defTerm, setDefTerm] = useState("")
  const [defResults, setDefResults] = useState<Definition[]>([])
  const [defLoading, setDefLoading] = useState(false)
  const [showDefModal, setShowDefModal] = useState(false)

  // State untuk referensi peraturan
  const [regTerm, setRegTerm] = useState("")
  const [regResults, setRegResults] = useState<Regulation[]>([])
  const [regLoading, setRegLoading] = useState(false)
  const [showRegModal, setShowRegModal] = useState(false)

  const handleRefSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...refForm }
      const res = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Gagal menambahkan referensi.")
      const saved = await res.json()
      onAddReference?.(saved)
      toast.success("Referensi berhasil ditambahkan!")
      setRefForm({ title: "", year: "", number: "", text: "", url: "" })
      setShowRefForm(false)
    } catch (err) {
      toast.error("Gagal menambahkan referensi.")
      console.error(err)
    }
  }

  // Fungsi untuk mencari definisi
  const handleSearchDefinition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (defTerm.trim().length < 2) {
      toast.error("Masukkan minimal 2 huruf untuk mencari definisi.")
      return
    }
    setDefLoading(true)
    try {
      const res = await fetch(
        `https://terminator-production-46a6.up.railway.app/api/definition?filter=${defTerm}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
      const data = await res.json()
      setDefResults(Array.isArray(data.data) ? data.data : [])
      setShowDefModal(true)
    } catch (err) {
      toast.error("Gagal mencari definisi.")
      console.error(err)
    } finally {
      setDefLoading(false)
    }
  }

  // Fungsi untuk mencari peraturan
  const handleSearchRegulation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (regTerm.trim().length < 2) {
      toast.error("Masukkan minimal 2 huruf untuk mencari peraturan.")
      return
    }
    setRegLoading(true)
    try {
      const res = await fetch(
        `https://terminator-production-46a6.up.railway.app/api/references?filter=${regTerm}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
      const data = await res.json()
      setRegResults(Array.isArray(data.data) ? data.data : [])
      setShowRegModal(true)
    } catch (err) {
      toast.error("Gagal mencari peraturan.")
      console.error(err)
    } finally {
      setRegLoading(false)
    }
  }

  // Fungsi untuk copy meaning definisi
  const handleCopyDefinition = async (meaning: string) => {
    try {
      await navigator.clipboard.writeText(meaning)
      toast.success("Definisi berhasil disalin!")
    } catch (err) {
      toast.error("Gagal menyalin definisi.")
    }
  }

  // Fungsi untuk copy text peraturan
  const handleCopyRegulation = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Teks peraturan berhasil disalin!")
    } catch (err) {
      toast.error("Gagal menyalin teks peraturan.")
    }
  }

  // Fungsi untuk format judul peraturan
  const formatRegulationTitle = (regulation: Regulation) => {
    return `${regulation.title} No. ${regulation.number} Tahun ${regulation.year}`
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">📎 Referensi</h2>

      {/* REFERENSI PERATURAN */}
      <div className="border rounded-md p-3 bg-gray-50">
        <h3 className="font-medium text-sm mb-2">Referensi Peraturan</h3>

        {!showRefForm ? (
          <>
            <form onSubmit={handleSearchRegulation} className="flex gap-2 mb-3">
              <Input
                placeholder="Cari referensi peraturan..."
                value={regTerm}
                onChange={(e) => setRegTerm(e.target.value)}
                className="text-sm flex-1"
              />
              <Button type="submit" disabled={regLoading} size="sm">
                {regLoading ? "..." : "Cari"}
              </Button>
            </form>
            <Button
              variant="outline"
              onClick={() => setShowRefForm(true)}
              className="w-full text-sm"
            >
              + Tambah Referensi Manual
            </Button>
            {reference && (
              <ul className="mt-3 list-disc ml-5 text-sm text-gray-700 space-y-1">
                <li>{reference.title}</li>
              </ul>
            )}
          </>
        ) : (
          <form onSubmit={handleSearchRegulation} className="space-y-2 mt-2">
            <Input
              placeholder="Judul Peraturan"
              value={refForm.title}
              onChange={(e) => setRefForm({ ...refForm, title: e.target.value })}
              required
            />
            <Input
              placeholder="Nomor Peraturan"
              value={refForm.number}
              onChange={(e) =>
                setRefForm({ ...refForm, number: e.target.value })
              }
              required
            />
            <Input
              placeholder="Tahun Peraturan"
              value={refForm.year}
              onChange={(e) => setRefForm({ ...refForm, year: e.target.value })}
              required
            />
            <Textarea
              placeholder="Teks Peraturan"
              value={refForm.text}
              onChange={(e) => setRefForm({ ...refForm, text: e.target.value })}
              required
            />
            <Input
              placeholder="URL Peraturan"
              value={refForm.url}
              onChange={(e) => setRefForm({ ...refForm, url: e.target.value })}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Simpan
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowRefForm(false)}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* REFERENSI DEFINISI */}
      <div className="border rounded-md p-3 bg-gray-50">
        <h3 className="font-medium text-sm mb-2">Referensi Definisi</h3>

        <form onSubmit={handleSearchDefinition} className="flex gap-2">
          <Input
            placeholder="Kata kunci istilah..."
            value={defTerm}
            onChange={(e) => setDefTerm(e.target.value)}
            className="text-sm flex-1"
          />
          <Button type="submit" disabled={defLoading} size="sm">
            {defLoading ? "..." : "Cari"}
          </Button>
        </form>
      </div>

      {/* KOMENTAR */}
      <div className="border rounded-md p-3 bg-gray-50">
        <h3 className="font-medium text-sm mb-2">Komentar</h3>
        <Textarea placeholder="Tambahkan komentar..." className="text-sm" />
      </div>

      {/* MODAL HASIL PENCARIAN DEFINISI */}
      <Dialog open={showDefModal} onOpenChange={setShowDefModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Hasil Pencarian Definisi: "{defTerm}"</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 mt-2">
            {defResults.length > 0 ? (
              defResults.map((item, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-md bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-blue-600 mb-1">
                        {item.term}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.meaning}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs cursor-pointer whitespace-nowrap"
                      onClick={() => handleCopyDefinition(item.meaning)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">Tidak ditemukan hasil.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDefModal(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL HASIL PENCARIAN PERATURAN */}
      <Dialog open={showRegModal} onOpenChange={setShowRegModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Hasil Pencarian Peraturan: "{regTerm}"</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 mt-2">
            {regResults.length > 0 ? (
              regResults.map((regulation, i) => (
                <div
                  key={regulation.id}
                  className="p-4 border rounded-md bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-green-700 mb-1">
                        {formatRegulationTitle(regulation)}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {regulation.url && (
                          <a 
                            href={regulation.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {regulation.url}
                          </a>
                        )}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {regulation.text}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs cursor-pointer whitespace-nowrap"
                        onClick={() => handleCopyRegulation(regulation.text)}
                      >
                        Copy Teks
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs cursor-pointer whitespace-nowrap"
                        onClick={() => handleCopyRegulation(formatRegulationTitle(regulation))}
                      >
                        Copy Judul
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Diperbarui: {new Date(regulation.updatedAt).toLocaleDateString('id-ID')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">Tidak ditemukan hasil peraturan.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegModal(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}