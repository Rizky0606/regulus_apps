"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface TypoCorrection {
  queue: number
  text: string
  referencess: string
}

interface TypoModalProps {
  isOpen: boolean
  onClose: () => void
  originalText: string
  corrections: TypoCorrection[]
  onReplace: (original: string, replacement: string) => void
}

export function TypoModal({ isOpen, onClose, originalText, corrections, onReplace }: TypoModalProps) {
  // Fungsi untuk mengganti semua kemunculan kata yang salah
  const handleReplaceAll = () => {
    corrections.forEach(correction => {
      onReplace(correction.text, correction.referencess)
    })
    onClose()
  }

  // Fungsi untuk mengganti kata tertentu
  const handleReplaceSingle = (original: string, replacement: string) => {
    onReplace(original, replacement)
    // Hapus koreksi yang sudah direplace dari daftar
    const updatedCorrections = corrections.filter(corr => corr.text !== original)
    if (updatedCorrections.length === 0) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🔍 Hasil Pengecekan Typo</span>
            {corrections.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {corrections.length} kata perlu diperbaiki
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Teks Asli */}
          <div>
            <h3 className="font-medium mb-2">Teks yang diperiksa:</h3>
            <div className="p-4 bg-gray-50 rounded-md border text-sm max-h-32 overflow-y-auto">
              {originalText || "Tidak ada teks untuk ditampilkan"}
            </div>
          </div>

          {/* Daftar Koreksi */}
          {corrections.length > 0 ? (
            <div>
              <h3 className="font-medium mb-3">Kata yang mungkin salah:</h3>
              <div className="space-y-3">
                {corrections.map((correction) => (
                  <div
                    key={correction.queue}
                    className="flex items-center justify-between p-3 border rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                        {correction.queue}
                      </Badge>
                      <div>
                        <span className="text-red-500 font-medium line-through">
                          {correction.text}
                        </span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-green-600 font-medium">
                          {correction.referencess}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReplaceSingle(correction.text, correction.referencess)}
                    >
                      Ganti
                    </Button>
                  </div>
                ))}
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Tutup
                </Button>
                <Button onClick={handleReplaceAll}>
                  Ganti Semua
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h3 className="font-medium text-lg mb-2">Tidak ada typo ditemukan!</h3>
              <p className="text-gray-500">Teks Anda sudah baik.</p>
              <Button className="mt-4" onClick={onClose}>
                Tutup
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}