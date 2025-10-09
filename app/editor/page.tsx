"use client";

import { useSearchParams } from "next/navigation";
import { EditorToolbar } from "@/components/toolbar";
import { OutlineTree } from "@/components/outline-tree";
import { ReferencePanel } from "@/components/reference-panel";
import { ReferenceManager } from "@/components/reference-manager";
import { RichEditor } from "@/components/rich-editor";
import { TypoModal } from "@/components/typo-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { runBasicTypoFixes } from "@/lib/typo";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { MyDocument } from "@/components/pdf-document";
import { toast } from "sonner";
import { User } from "lucide-react";
import Image from "next/image";
import LogoLPS from "@/assets/logo/logo-lps.png";
import { SelectedReferences } from "@/types/references";

// Define types untuk PDF content
interface PdfTextItem {
  type: string;
  id: string;
  content?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface PdfContentItem {
  type: string;
  id: string;
  content?: string | PdfTextItem[];
  level?: number;
  ordered?: boolean;
  items?: PdfTextItem[];
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  alignment?: "left" | "center" | "right" | "justify";
}

interface TypoCorrection {
  queue: number;
  text: string;
  referencess: string;
}

export default function EditorPage() {
  const searchParams = useSearchParams();
  const jenis = searchParams.get("jenis") || "Dokumen Regulasi";

  const outline = [
    {
      id: "bab1",
      label: "Bab I - Pendahuluan",
      children: [
        { id: "pasal1", label: "Pasal 1" },
        { id: "pasal2", label: "Pasal 2" },
      ],
    },
    {
      id: "bab2",
      label: "Bab II - Ketentuan Umum",
      children: [{ id: "pasal3", label: "Pasal 3" }],
    },
  ];

  const [insertSnippet, setInsertSnippet] = useState<string | null>(null);
  const [fixToggle, setFixToggle] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [activeReference, setActiveReference] = useState<any | null>(null);
  const [selectedReferences, setSelectedReferences] =
    useState<SelectedReferences>({
      regulations: [],
      definitions: [],
    });
  const [editorContent, setEditorContent] = useState("");

  // State untuk modal typo
  const [typoModalOpen, setTypoModalOpen] = useState(false);
  const [typoData, setTypoData] = useState<{
    originalText: string;
    corrections: TypoCorrection[];
  } | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);

  // Load selected references dari localStorage
  useEffect(() => {
    const savedRefs = localStorage.getItem("selected-references");
    if (savedRefs) {
      setSelectedReferences(JSON.parse(savedRefs));
    }
  }, []);

  // Save selected references ke localStorage ketika berubah
  useEffect(() => {
    localStorage.setItem(
      "selected-references",
      JSON.stringify(selectedReferences)
    );
  }, [selectedReferences]);

  const handleAddReference = async (newRef: any) => {
    // Fungsi ini untuk ReferencePanel yang lama, bisa dipertahankan untuk kompatibilitas
    toast.info("Gunakan Reference Manager untuk memilih referensi PDF");
  };

  // Fungsi untuk handle cek typo dari toolbar
  const handleCheckTypos = () => {
    // Trigger melalui custom event di RichEditor
    const event = new CustomEvent("triggerTypoCheck");
    window.dispatchEvent(event);
  };

  // Fungsi untuk mengganti teks di editor
  const handleReplaceText = (original: string, replacement: string) => {
    // Trigger melalui custom event di RichEditor
    const event = new CustomEvent("replaceText", {
      detail: { original, replacement },
    });
    window.dispatchEvent(event);
  };

  // Effect untuk listen custom events dari RichEditor
  useEffect(() => {
    const handleShowTypoModal = (event: any) => {
      setTypoData(event.detail);
      setTypoModalOpen(true);
    };

    window.addEventListener("showTypoModal", handleShowTypoModal);

    return () => {
      window.removeEventListener("showTypoModal", handleShowTypoModal);
    };
  }, []);

  // Fungsi untuk detect alignment dari element HTML
  const detectAlignment = (
    element: HTMLElement
  ): "left" | "center" | "right" | "justify" => {
    const style = element.getAttribute("style") || "";
    const classList = element.classList;

    // Check Quill alignment classes
    if (classList.contains("ql-align-right")) {
      return "right";
    } else if (classList.contains("ql-align-center")) {
      return "center";
    } else if (classList.contains("ql-align-justify")) {
      return "justify";
    }

    // Check inline styles
    if (style.includes("text-align: right")) {
      return "right";
    } else if (style.includes("text-align: center")) {
      return "center";
    } else if (style.includes("text-align: justify")) {
      return "justify";
    }

    return "left"; // default
  };

  // Fungsi untuk detect heading level dari tag HTML
  const detectHeadingLevel = (tagName: string): number | null => {
    switch (tagName.toLowerCase()) {
      case "h1":
        return 1;
      case "h2":
        return 2;
      case "h3":
        return 3;
      case "h4":
        return 4;
      case "h5":
        return 5;
      case "h6":
        return 6;
      default:
        return null;
    }
  };

  // Helper function untuk parse HTML ke format PDF dengan alignment dan heading
  const parseHtmlToPdfContent = (html: string): PdfContentItem[] => {
    try {
      console.log("🔍 Original HTML:", html);

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const editorElement = doc.querySelector(".ql-editor") || doc.body;

      if (!editorElement) {
        console.error("❌ Tidak dapat menemukan editor element");
        return [];
      }

      const result: PdfContentItem[] = [];

      // Process semua child nodes
      const processNode = (node: Node): void => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tagName = el.tagName.toLowerCase();

          // Deteksi alignment
          const alignment = detectAlignment(el);

          // Deteksi heading level dari tag name
          const headingLevel = detectHeadingLevel(tagName);

          if (headingLevel) {
            // Ini adalah heading
            const headingText = el.textContent?.trim() || "";
            if (headingText && headingText !== "") {
              console.log(
                `🎯 Found heading level ${headingLevel}: "${headingText}"`
              );
              result.push({
                type: "heading",
                content: headingText,
                level: headingLevel,
                alignment: alignment,
                id: `heading-${Date.now()}-${Math.random()}`,
              });
            }
            return; // Jangan process children untuk heading
          }

          // Handle indentasi dari Quill
          let indentSpaces = "";
          for (let i = 1; i <= 8; i++) {
            if (el.classList.contains(`ql-indent-${i}`)) {
              indentSpaces = " ".repeat(i * 4);
              break;
            }
          }

          if (tagName === "p" || tagName === "div") {
            // Process paragraph/div
            const paragraphContent: PdfTextItem[] = [];

            // Tambahkan indent jika ada
            if (indentSpaces) {
              paragraphContent.push({
                type: "text",
                content: indentSpaces,
                id: `indent-${Date.now()}`,
              });
            }

            // Process child nodes untuk inline formatting
            const processChildNodes = (childNodes: NodeList) => {
              Array.from(childNodes).forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                  const text = child.textContent || "";
                  if (text) {
                    const processedText = text.replace(/\t/g, "    ");
                    paragraphContent.push({
                      type: "text",
                      content: processedText,
                      id: `text-${Date.now()}-${Math.random()}`,
                    });
                  }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                  const childEl = child as HTMLElement;
                  const childTagName = childEl.tagName.toLowerCase();

                  // Handle formatting
                  const isBold =
                    childEl.classList.contains("ql-bold") ||
                    childTagName === "strong" ||
                    childTagName === "b";
                  const isItalic =
                    childEl.classList.contains("ql-italic") ||
                    childTagName === "em" ||
                    childTagName === "i";
                  const isUnderline =
                    childEl.classList.contains("ql-underline") ||
                    childTagName === "u";

                  if (childTagName === "br") {
                    paragraphContent.push({
                      type: "line-break",
                      id: `br-${Date.now()}-${Math.random()}`,
                    });
                  } else {
                    const childText = childEl.textContent || "";
                    if (childText.trim()) {
                      paragraphContent.push({
                        type: "text",
                        content: childText,
                        bold: isBold,
                        italic: isItalic,
                        underline: isUnderline,
                        id: `formatted-${Date.now()}-${Math.random()}`,
                      });
                    }
                  }
                }
              });
            };

            processChildNodes(el.childNodes);

            if (paragraphContent.length > 0) {
              result.push({
                type: "paragraph",
                content: paragraphContent,
                alignment: alignment,
                id: `p-${Date.now()}-${Math.random()}`,
              });
            }
          } else if (tagName === "br") {
            // Line break standalone
            result.push({
              type: "line-break",
              id: `br-standalone-${Date.now()}-${Math.random()}`,
            });
          } else {
            // Untuk element lain, process children secara langsung
            processChildNodes(el.childNodes);
          }
        }
      };

      // Helper untuk process child nodes
      const processChildNodes = (childNodes: NodeList) => {
        Array.from(childNodes).forEach((child) => {
          processNode(child);
        });
      };

      // Mulai processing dari root element
      processChildNodes(editorElement.childNodes);

      return result;
    } catch (error) {
      console.error("Error parsing HTML:", error);

      // Fallback parsing
      const plainText = html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/\t/g, "    ")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (plainText) {
        const lines = plainText.split("\n").filter((line) => line.trim());
        return lines.map((line, index) => ({
          type: "paragraph",
          content: line,
          alignment: "left",
          id: `fallback-${index}`,
        }));
      }

      return [];
    }
  };

  // HANDLE EXPORT PDF dengan referensi yang dipilih
  const handleExportPDF = async () => {
    try {
      const content =
        editorContent || localStorage.getItem("draft-editor") || "";

      if (!content || content === "<p><br></p>" || content === "<p><br/></p>") {
        toast.error("Editor kosong, tidak ada konten untuk diekspor.");
        return;
      }

      // Parse HTML content untuk PDF
      const parsedContent = parseHtmlToPdfContent(content);

      // Buat PDF document dengan referensi yang dipilih
      const blob = await pdf(
        <MyDocument content={parsedContent} references={selectedReferences} />
      ).toBlob();

      // Download PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `draft-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      // Tampilkan summary referensi yang diexport
      const totalRefs =
        selectedReferences.definitions.length +
        selectedReferences.regulations.length;
      if (totalRefs > 0) {
        toast.success(`PDF berhasil diekspor dengan ${totalRefs} referensi!`);
      } else {
        toast.success("PDF berhasil diekspor (tanpa referensi)");
      }
    } catch (err) {
      console.error("❌ Gagal ekspor PDF:", err);
      toast.error("Gagal mengekspor PDF");
    }
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white border-b border-[#A4A4A4] shadow-sm">
        <div className="max-w-full">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <div className="bg-white rounded-lg border border-[#A4A4A4] shadow-sm p-3">
                    <Image
                      src={LogoLPS}
                      alt="LPS Logo"
                      width={120}
                      height={40}
                      className="object-contain"
                      style={{
                        width: "120px",
                        height: "40px",
                        minWidth: "120px",
                        minHeight: "40px",
                      }}
                    />
                  </div>
                </Link>
                <div className="h-8 w-px bg-[#A4A4A4]"></div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-[#282828] leading-tight">
                    LD 1.0 - Aplikasi Penyusunan Peraturan
                  </h1>
                  <p className="text-xs text-[#A4A4A4] leading-tight">
                    Jenis: {jenis}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-[#282828]">
                      Putri Amalia
                    </p>
                    <p className="text-xs text-[#A4A4A4]">Staf Pengembangan</p>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#DB8928] to-[#DB8928]/80 rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl py-6">
        {/* Toolbar dan Controls */}
        <div className="mb-3 flex justify-between items-center gap-2">
          <EditorToolbar
            onInsert={(snippet) => setInsertSnippet(snippet)}
            onFixTypos={handleCheckTypos}
          />
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline">Buka</Button>
            </Link>
            <Button
              onClick={() => {
                const data = localStorage.getItem("draft-editor");
                if (!data) return;
                setSavedAt(new Date());
                toast.success("Draft berhasil disimpan.");
              }}
              className="bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
            >
              Simpan
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                const txt = localStorage.getItem("draft-editor") || "";
                const a = document.createElement("a");
                a.href =
                  "data:text/html;charset=utf-8," +
                  encodeURIComponent(`<pre>${txt}</pre>`);
                a.download = "draft.html";
                a.click();
              }}
            >
              Ekspor HTML
            </Button>

            <Button
              variant="default"
              className="bg-[#282828] hover:bg-[#282828]/90 text-white"
              onClick={handleExportPDF}
            >
              Ekspor PDF
            </Button>

            <Input placeholder="Cari..." className="w-40" />
          </div>
        </div>

        {/* Layout utama */}
        <div className="grid gap-4 md:grid-cols-12">
          {/* Struktur Dokumen */}
          <Card className="md:col-span-3 p-4 bg-gradient-to-b from-[#F7F7F7] to-white">
            <h2 className="font-semibold text-lg mb-3 text-[#282828]">
              📘 Struktur Dokumen
            </h2>
            <OutlineTree nodes={outline} />
            <div className="mt-6 space-y-3">
              <Button
                variant="secondary"
                className="w-full bg-[#DB8928]/10 text-[#DB8928] hover:bg-[#DB8928]/20 border-[#DB8928]"
              >
                Auto Referencing
              </Button>
            </div>
          </Card>

          {/* Editor */}
          <Card className="md:col-span-6 p-4" ref={editorRef}>
            <style jsx global>{`
              .ql-editor {
                color: #282828 !important;
              }
              .ql-container .ql-editor p,
              .ql-container .ql-editor h1,
              .ql-container .ql-editor h2,
              .ql-container .ql-editor h3 {
                color: #282828 !important;
              }
            `}</style>
            <RichEditor
              storageKey="draft-editor"
              requestInsert={insertSnippet}
              onInsertConsumed={() => setInsertSnippet(null)}
              requestFix={fixToggle}
              fixFn={runBasicTypoFixes}
              savedAt={savedAt}
              onChange={handleEditorChange}
            />
            <div className="mt-3 text-xs text-[#A4A4A4] border-t border-[#F7F7F7] pt-2">
              ✏️ Draft terakhir disimpan otomatis 2 menit lalu.
            </div>
          </Card>

          {/* Panel Referensi */}
          <div className="md:col-span-3 space-y-4">
            {/* Reference Manager untuk PDF */}
            <Card className="p-4">
              <ReferenceManager
                selectedReferences={selectedReferences}
                onReferencesChange={setSelectedReferences}
              />
            </Card>

            {/* Reference Panel lama (opsional) */}
            {/* <Card className="p-4">
              <ReferencePanel
                reference={activeReference}
                onAddReference={handleAddReference}
              />
            </Card> */}
          </div>
        </div>

        {/* Modal untuk menampilkan hasil cek typo */}
        <TypoModal
          isOpen={typoModalOpen}
          onClose={() => setTypoModalOpen(false)}
          originalText={typoData?.originalText || ""}
          corrections={typoData?.corrections || []}
          onReplace={handleReplaceText}
        />
      </main>
    </div>
  );
}
