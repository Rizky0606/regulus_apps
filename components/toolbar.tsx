"use client"
import { Button } from "@/components/ui/button"

type Props = {
  onInsert: (snippet: string) => void
  onFixTypos: () => void
}

export function EditorToolbar({ onInsert, onFixTypos }: Props) {
  const items = [
    { label: "Tambah Bab", code: "BAB I\nJudul Bab\n\n" },
    { label: "Tambah Pasal", code: "Pasal 1\n(1) ...\n(2) ...\n\n" },
    { label: "Tambah Ayat", code: "(1) ...\n" },
    { label: "Tambah Bagian", code: "Bagian Kesatu\nKetentuan Umum\n\n" },
    { label: "Tambah Paragraf", code: "Paragraf 1\n—\n\n" },
    { label: "Tambah Angka", code: "1.\n" },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((it) => (
        <Button key={it.label} size="sm" variant="secondary" onClick={() => onInsert(it.code)}>
          {it.label}
        </Button>
      ))}
      {/* <Button size="sm" variant="outline" onClick={onFixTypos}>
        Cek Typo
      </Button> */}
    </div>
  )
}