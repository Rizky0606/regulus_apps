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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { runBasicTypoFixes } from "@/lib/typo";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { MyDocument } from "@/components/pdf-document";
import { toast } from "sonner";
import { User, Edit, Plus, Search } from "lucide-react";
import Image from "next/image";
import LogoLPS from "@/assets/logo/logo-lps.png";

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

// Types untuk modal auto reference - SESUAI RESPONSE API BARU
interface Regulation {
  id: string;
  title: string;
  year: string;
  number: string;
  text: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  meta: {
    message: string;
  };
  data: Regulation[];
}

interface SelectedReferences {
  regulations: Regulation[];
  definitions: any[];
}

interface AutoReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegulation: (regulation: Regulation) => void;
  onEditRegulation: (regulation: Regulation) => void;
}

// Modal untuk Auto Reference menggunakan Dialog
const AutoReferenceModal: React.FC<AutoReferenceModalProps> = ({
  isOpen,
  onClose,
  onSelectRegulation,
  onEditRegulation,
}) => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [filteredRegulations, setFilteredRegulations] = useState<Regulation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);

  const fetchRegulations = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://terminator-production-46a6.up.railway.app/api/references');
      const result: ApiResponse = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        setRegulations(result.data);
        setFilteredRegulations(result.data);
      } else {
        // Fallback data jika response tidak sesuai
        const fallbackData: Regulation[] = [
          {
            id: "1",
            title: "Undang-Undang Ketenagakerjaan",
            year: "2003",
            number: "13",
            text: "Undang-Undang No. 13 Tahun 2003 tentang Ketenagakerjaan",
            url: "https://peraturan.go.id/uu-13-2003",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            title: "Undang-Undang Perseroan Terbatas",
            year: "2007",
            number: "40",
            text: "Undang-Undang No. 40 Tahun 2007 tentang Perseroan Terbatas",
            url: "https://peraturan.go.id/uu-40-2007",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setRegulations(fallbackData);
        setFilteredRegulations(fallbackData);
      }
    } catch (error) {
      console.error('Error fetching regulations:', error);
      toast.error('Gagal memuat daftar peraturan');
      // Fallback data untuk error
      const fallbackData: Regulation[] = [
        {
          id: "1",
          title: "Undang-Undang Ketenagakerjaan",
          year: "2003",
          number: "13",
          text: "Undang-Undang No. 13 Tahun 2003 tentang Ketenagakerjaan",
          url: "https://peraturan.go.id/uu-13-2003",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "2",
          title: "Undang-Undang Perseroan Terbatas",
          year: "2007",
          number: "40",
          text: "Undang-Undang No. 40 Tahun 2007 tentang Perseroan Terbatas",
          url: "https://peraturan.go.id/uu-40-2007",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setRegulations(fallbackData);
      setFilteredRegulations(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRegulations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = regulations.filter(regulation =>
        regulation.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        regulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        regulation.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRegulations(filtered);
    } else {
      setFilteredRegulations(regulations);
    }
  }, [searchTerm, regulations]);

  const handleSelect = (regulation: Regulation) => {
    setSelectedRegulation(regulation);
  };

  const handleEdit = (regulation: Regulation) => {
    onEditRegulation(regulation);
  };

  // Helper function untuk generate key dari regulation
  const generateRegulationKey = (regulation: Regulation): string => {
    return `UU${regulation.number}/${regulation.year}`;
  };

  // Helper function untuk menentukan jenis peraturan berdasarkan title/number
  const getRegulationType = (regulation: Regulation): string => {
    if (regulation.title.includes('Undang-Undang')) return 'law';
    if (regulation.title.includes('Peraturan Pemerintah')) return 'government';
    if (regulation.title.includes('Peraturan Menteri')) return 'ministerial';
    if (regulation.title.includes('Peraturan Daerah')) return 'regional';
    return 'law'; // default
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Auto Reference</DialogTitle>
          <DialogDescription>
            Pilih peraturan untuk ditambahkan sebagai referensi
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#A4A4A4]" />
            <Input
              placeholder="Cari peraturan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <p>Memuat daftar peraturan...</p>
            </div>
          ) : !filteredRegulations || !Array.isArray(filteredRegulations) || filteredRegulations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#A4A4A4]">Tidak ada peraturan ditemukan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRegulations.map((regulation: Regulation) => (
                <div
                  key={regulation.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRegulation?.id === regulation.id
                      ? 'border-[#DB8928] bg-[#DB8928]/5'
                      : 'border-[#E5E5E5] hover:border-[#DB8928]/50'
                  }`}
                  onClick={() => handleSelect(regulation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-[#282828] text-white text-xs rounded">
                          {generateRegulationKey(regulation)}
                        </span>
                        <span className="text-xs text-[#A4A4A4]">
                          {getRegulationType(regulation)} • {regulation.year}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#282828] mb-1">
                        {regulation.title}
                      </h3>
                      <p className="text-sm text-[#282828]">
                        {regulation.text}
                      </p>
                      {regulation.url && (
                        <p className="text-xs text-[#A4A4A4] mt-1 truncate">
                          {regulation.url}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(regulation);
                      }}
                      className="h-8 w-8 flex-shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Batal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Modal untuk Edit Regulation
interface EditRegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  regulation: Regulation | null;
  onSave: (regulation: Regulation) => void;
}

const EditRegulationModal: React.FC<EditRegulationModalProps> = ({
  isOpen,
  onClose,
  regulation,
  onSave,
}) => {
  const [formData, setFormData] = useState<Regulation>({
    id: '',
    title: '',
    year: new Date().getFullYear().toString(),
    number: '',
    text: '',
    url: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (regulation) {
      setFormData(regulation);
    }
  }, [regulation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`https://terminator-production-46a6.up.railway.app/api/references/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          year: formData.year,
          number: formData.number,
          text: formData.text,
          url: formData.url
        }),
      });

      if (response.ok) {
        const updatedRegulation = await response.json();
        onSave(updatedRegulation.data || formData);
        toast.success('Peraturan berhasil diperbarui');
        onClose();
      } else {
        throw new Error('Gagal menyimpan perubahan');
      }
    } catch (error) {
      console.error('Error updating regulation:', error);
      toast.error('Gagal menyimpan perubahan peraturan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Peraturan</DialogTitle>
          <DialogDescription>
            Edit detail peraturan yang dipilih
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#282828] mb-2 block">
                Judul Peraturan
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Undang-Undang Ketenagakerjaan"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#282828] mb-2 block">
                  Tahun
                </label>
                <Input
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  type="number"
                  min="1900"
                  max="2100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#282828] mb-2 block">
                  Nomor
                </label>
                <Input
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Contoh: 13"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#282828] mb-2 block">
                Teks Peraturan
              </label>
              <Input
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Contoh: Undang-Undang No. 13 Tahun 2003 tentang Ketenagakerjaan"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#282828] mb-2 block">
                URL
              </label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://peraturan.go.id/uu-13-2003"
                type="url"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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
  const [selectedReferences, setSelectedReferences] = useState<SelectedReferences>({
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

  // State untuk modal auto reference
  const [autoReferenceModalOpen, setAutoReferenceModalOpen] = useState(false);
  const [editRegulationModalOpen, setEditRegulationModalOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);

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
    toast.info("Gunakan Reference Manager untuk memilih referensi PDF");
  };

  // Fungsi untuk handle cek typo dari toolbar
  const handleCheckTypos = () => {
    const event = new CustomEvent("triggerTypoCheck");
    window.dispatchEvent(event);
  };

  // Fungsi untuk mengganti teks di editor
  const handleReplaceText = (original: string, replacement: string) => {
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

  // Fungsi untuk handle select regulation
  const handleSelectRegulation = (regulation: Regulation) => {
    setSelectedReferences((prev: SelectedReferences) => ({
      ...prev,
      regulations: [...prev.regulations, regulation]
    }));
    toast.success(`Referensi ${regulation.title} berhasil ditambahkan`);
  };

  // Fungsi untuk handle edit regulation
  const handleEditRegulation = (regulation: Regulation) => {
    setSelectedRegulation(regulation);
    setEditRegulationModalOpen(true);
  };

  // Fungsi untuk handle save regulation setelah edit
  const handleSaveRegulation = (updatedRegulation: Regulation) => {
    setSelectedReferences((prev: SelectedReferences) => ({
      ...prev,
      regulations: prev.regulations.map((ref: Regulation) => 
        ref.id === updatedRegulation.id ? updatedRegulation : ref
      )
    }));
  };

  // Fungsi untuk detect alignment dari element HTML
  const detectAlignment = (
    element: HTMLElement
  ): "left" | "center" | "right" | "justify" => {
    const style = element.getAttribute("style") || "";
    const classList = element.classList;

    if (classList.contains("ql-align-right")) {
      return "right";
    } else if (classList.contains("ql-align-center")) {
      return "center";
    } else if (classList.contains("ql-align-justify")) {
      return "justify";
    }

    if (style.includes("text-align: right")) {
      return "right";
    } else if (style.includes("text-align: center")) {
      return "center";
    } else if (style.includes("text-align: justify")) {
      return "justify";
    }

    return "left";
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
                onClick={() => setAutoReferenceModalOpen(true)}
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

        {/* Modal untuk Auto Reference */}
        <AutoReferenceModal
          isOpen={autoReferenceModalOpen}
          onClose={() => setAutoReferenceModalOpen(false)}
          onSelectRegulation={handleSelectRegulation}
          onEditRegulation={handleEditRegulation}
        />

        {/* Modal untuk Edit Regulation */}
        <EditRegulationModal
          isOpen={editRegulationModalOpen}
          onClose={() => setEditRegulationModalOpen(false)}
          regulation={selectedRegulation}
          onSave={handleSaveRegulation}
        />
      </main>
    </div>
  );
}