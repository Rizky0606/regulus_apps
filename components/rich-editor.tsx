"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useSWRMutation from "swr/mutation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { runBasicTypoFixes } from "@/lib/typo"
import { toast } from "sonner"

interface TypoCorrection {
  queue: number
  text: string
  referencess: string
}

type Props = {
  storageKey: string
  requestInsert?: string | null
  onInsertConsumed?: () => void
  requestFix?: boolean
  fixFn?: (s: string) => string
  onChange?: (v: string) => void
  savedAt?: Date | null
  requestAutoRef?: boolean
  onAutoRefConsumed?: () => void
}

export function RichEditor({
  storageKey,
  requestInsert,
  onInsertConsumed,
  requestFix,
  fixFn,
  onChange,
  savedAt,
  requestAutoRef,
  onAutoRefConsumed,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<any>(null)

  const [html, setHtml] = useState<string>("<p><br/></p>")
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const { trigger, isMutating } = useSWRMutation("/api/import-url", importUrl)

  // Fungsi untuk cek typo menggunakan backend
  const checkTypos = async (text: string): Promise<TypoCorrection[]> => {
    try {
      const response = await fetch("https://terminator-production-46a6.up.railway.app/api/check_correction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error("Gagal melakukan pengecekan typo")
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error("Error checking typos:", error)
      toast.error("Gagal melakukan pengecekan typo")
      return []
    }
  }

  // Fungsi untuk mengganti teks dalam editor DENGAN MEMPERTAHANKAN FORMATTING
  const replaceTextInEditor = (original: string, replacement: string) => {
    if (!quillRef.current) return

    const q = quillRef.current
    const text = q.getText()
    const searchText = original.toLowerCase()
    const textLower = text.toLowerCase()
    let startIndex = 0
    let replaced = false
    
    // Cari semua kemunculan teks
    while ((startIndex = textLower.indexOf(searchText, startIndex)) !== -1) {
      // Dapatkan format pada posisi tersebut
      const formats = q.getFormat(startIndex, original.length)
      
      // Hapus teks lama
      q.deleteText(startIndex, original.length)
      
      // Insert teks baru dengan format yang sama
      q.insertText(startIndex, replacement, formats)
      
      // Update posisi pencarian
      startIndex += replacement.length
      replaced = true
    }
    
    if (replaced) {
      toast.success(`Kata "${original}" diganti dengan "${replacement}"`)
    }
  }

  // Helper function untuk escape regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Fungsi untuk handle cek typo
  const handleCheckTypos = async () => {
    if (!quillRef.current) {
      toast.error("Editor belum siap")
      return
    }

    const text = quillRef.current.getText()
    if (!text.trim()) {
      toast.error("Tidak ada teks untuk diperiksa")
      return
    }

    toast.info("Sedang memeriksa typo...")
    
    try {
      const corrections = await checkTypos(text)
      
      // Trigger modal melalui custom event
      const event = new CustomEvent('showTypoModal', {
        detail: {
          originalText: text,
          corrections: corrections,
          onReplace: replaceTextInEditor
        }
      })
      window.dispatchEvent(event)
      
      if (corrections.length === 0) {
        toast.success("Tidak ada typo ditemukan!")
      }
    } catch (error) {
      console.error("Error in typo check:", error)
    }
  }

  // Event listeners untuk custom events
  useEffect(() => {
    const handleTriggerTypoCheck = () => {
      handleCheckTypos()
    }

    const handleReplaceText = (event: any) => {
      const { original, replacement } = event.detail
      replaceTextInEditor(original, replacement)
    }

    window.addEventListener('triggerTypoCheck', handleTriggerTypoCheck)
    window.addEventListener('replaceText', handleReplaceText)

    return () => {
      window.removeEventListener('triggerTypoCheck', handleTriggerTypoCheck)
      window.removeEventListener('replaceText', handleReplaceText)
    }
  }, [])

  // --- Helper untuk load Quill ---
  function ensureLink(id: string, href: string) {
    if (document.getElementById(id)) return
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = href
    document.head.appendChild(link)
  }

  function loadScript(id: string, src: string) {
    return new Promise<void>((resolve, reject) => {
      if (document.getElementById(id)) return resolve()
      const s = document.createElement("script")
      s.id = id
      s.src = src
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error("Gagal memuat Quill"))
      document.body.appendChild(s)
    })
  }

  // --- Inisialisasi Quill ---
  useEffect(() => {
    let disposed = false
    ;(async () => {
      try {
        ensureLink("quill-snow-css", "https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css")
        await loadScript("quill-js", "https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js")
        if (disposed || !editorRef.current) return

        // Tunggu sebentar untuk memastikan script benar-benar terload
        await new Promise(resolve => setTimeout(resolve, 100))

        const Quill = (window as any).Quill
        
        if (typeof Quill !== "function") {
          console.error("❌ Quill tidak terdeteksi dengan benar")
          toast.error("Gagal memuat editor. Muat ulang halaman.")
          return
        }

        console.log("✅ Quill berhasil dimuat:", typeof Quill)

        const toolbarOptions = [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["blockquote", "code-block", "link"],
          ["clean"],
        ]

        const q = new Quill(editorRef.current, {
          theme: "snow",
          modules: { 
            toolbar: toolbarOptions, 
            clipboard: { 
              matchVisual: true 
            } 
          },
        })
        quillRef.current = q

        // Force black color untuk semua teks
        q.clipboard.addMatcher(Node.ELEMENT_NODE, (node: any, delta: any) => {
          if (node.style && node.style.color) {
            // Hapus warna custom, biarkan menggunakan default (hitam)
            delete node.style.color;
          }
          return delta;
        });

        const saved = localStorage.getItem(storageKey)
        const initialHtml = saved || html
        
        // Clean HTML dari warna sebelum di-paste
        const cleanHtml = initialHtml.replace(/style="[^"]*color:[^";]*[;"]?/gi, '')
        q.clipboard.dangerouslyPasteHTML(0, cleanHtml, "silent")
        onChange?.(q.root.innerHTML)

        q.on("text-change", () => {
          const newHtml = q.root.innerHTML
          setHtml(newHtml)
          onChange?.(newHtml)
        })

        console.log("✅ Editor Quill berhasil diinisialisasi")

      } catch (err) {
        console.error("❌ Gagal inisialisasi Quill:", err)
        toast.error("Editor gagal dimuat.")
      }
    })()
    return () => {
      disposed = true
    }
  }, [storageKey])

  // --- Autosave ke localStorage ---
  useEffect(() => {
    const t = setInterval(() => {
      localStorage.setItem(storageKey, html)
      setLastSavedAt(new Date())
    }, 1500)
    return () => clearInterval(t)
  }, [html, storageKey])

  // --- Notify parent ---
  useEffect(() => {
    onChange?.(html)
  }, [html, onChange])

  // --- Insert snippet eksternal ---
  useEffect(() => {
    if (!requestInsert || !quillRef.current) return
    const q = quillRef.current
    const idx = q.getSelection()?.index ?? q.getLength()
    
    // Clean snippet dari warna sebelum di-insert
    const cleanSnippet = requestInsert.replace(/style="[^"]*color:[^";]*[;"]?/gi, '')
    q.clipboard.dangerouslyPasteHTML(idx, textToHtml(cleanSnippet), "user")
    q.setSelection(idx + 1)
    onInsertConsumed?.()
  }, [requestInsert])

  // --- Auto fix typo ---
  useEffect(() => {
    if (!requestFix || !quillRef.current) return
    const q = quillRef.current
    const fixed = (fixFn ?? runBasicTypoFixes)(q.getText())
    q.setText(fixed)
  }, [requestFix])

  // --- Auto Reference Highlight ---
  useEffect(() => {
    if (!requestAutoRef || !quillRef.current) return
    const q = quillRef.current
    const text = q.root.innerHTML

    const refs = [
      "Investasi Pemerintah",
      "Islamic Development Bank",
      "Asian Infrastructure Investment Bank",
      "Peraturan Presiden",
      "Kementerian Keuangan",
    ]

    let newHtml = text
    refs.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi")
      newHtml = newHtml.replace(
        regex,
        `<span class="auto-highlight animate-highlight">$1</span>`
      )
    })

    q.root.innerHTML = newHtml
    localStorage.setItem("auto-ref-result", JSON.stringify(refs))
    onAutoRefConsumed?.()
  }, [requestAutoRef])

  const savedMsg = useMemo(() => {
    if (!lastSavedAt) return "Menunggu perubahan…"
    return `Draft terakhir disimpan otomatis pada ${lastSavedAt.toLocaleTimeString("id-ID", {
      hour12: false,
    })}.`
  }, [lastSavedAt])

  return (
    <div ref={wrapperRef} className="grid gap-3">
      {/* Toolbar Import dan Ekspor */}
      <div className="flex flex-wrap items-center gap-2">
        <Input id="url" placeholder="Tempel URL sumber materi…" className="max-w-xl" />
        <Button
          variant="secondary"
          onClick={async () => {
            const el = document.getElementById("url") as HTMLInputElement | null
            if (!el?.value || !quillRef.current) return
            const txt = await trigger(el.value)
            const q = quillRef.current
            const idx = q.getSelection()?.index ?? q.getLength()
            
            // Clean imported text dari warna
            const cleanTxt = txt.replace(/style="[^"]*color:[^";]*[;"]?/gi, '')
            q.clipboard.dangerouslyPasteHTML(idx, textToHtml(cleanTxt), "user")
            q.setSelection(idx + 1)
          }}
        >
          {isMutating ? "Mengambil…" : "Ambil Materi"}
        </Button>
        
        {/* Tombol Cek Typo */}
        <Button
          variant="outline"
          onClick={handleCheckTypos}
          disabled={isMutating}
        >
          🔍 Cek Typo
        </Button>
      </div>

      {/* Quill Editor dengan CSS untuk warna hitam */}
      <div className="rounded-md border bg-background overflow-hidden">
        <div 
          ref={editorRef} 
          className="ql-container ql-snow rounded-b-md min-h-[300px] text-black"
          style={{ color: 'black' }}
        />
      </div>

      <p className="text-xs text-muted-foreground">{savedMsg}</p>
    </div>
  )
}

// --- Helper Functions ---
async function importUrl(_: string, { arg }: { arg: string }) {
  const res = await fetch("/api/import-url", { method: "POST", body: JSON.stringify({ url: arg }) })
  if (!res.ok) throw new Error("Gagal mengambil konten")
  const data = await res.json()
  return data.text as string
}

function textToHtml(txt: string) {
  const safe = txt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  const blocks = safe
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (blocks.length === 0) return "<p><br/></p>"
  return blocks.map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("")
}