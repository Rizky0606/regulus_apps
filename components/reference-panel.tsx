"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

interface Definition {
  id: string;
  term: string;
  meaning: string;
  createdAt: string;
  updatedAt: string;
}

export function ReferencePanel({
  reference,
  onAddReference,
}: {
  reference?: any;
  onAddReference?: (ref: any) => void;
}) {
  const [showRefForm, setShowRefForm] = useState(false);
  const [refForm, setRefForm] = useState({
    title: "",
    year: "",
    number: "",
    text: "",
    url: "",
  });

  // State untuk referensi definisi
  const [defTerm, setDefTerm] = useState("");
  const [defResults, setDefResults] = useState<Definition[]>([]);
  const [allDefinitions, setAllDefinitions] = useState<Definition[]>([]);
  const [defLoading, setDefLoading] = useState(false);
  const [showDefModal, setShowDefModal] = useState(false);

  // State untuk referensi peraturan
  const [regTerm, setRegTerm] = useState("");
  const [regResults, setRegResults] = useState<Regulation[]>([]);
  const [allRegulations, setAllRegulations] = useState<Regulation[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);

  // Load semua data definisi ketika modal dibuka
  useEffect(() => {
    if (showDefModal && allDefinitions.length === 0) {
      loadAllDefinitions();
    }
  }, [showDefModal]);

  // Load semua data peraturan ketika modal dibuka
  useEffect(() => {
    if (showRegModal && allRegulations.length === 0) {
      loadAllRegulations();
    }
  }, [showRegModal]);

  // Fungsi untuk load semua definisi
  const loadAllDefinitions = async () => {
    setDefLoading(true);
    try {
      const res = await fetch(
        `https://terminator-production-46a6.up.railway.app/api/definition`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      const definitions = Array.isArray(data.data) ? data.data : [];
      setAllDefinitions(definitions);
      setDefResults(definitions); // Set hasil awal dengan semua data
    } catch (err) {
      toast.error("Gagal memuat data definisi.");
      console.error(err);
    } finally {
      setDefLoading(false);
    }
  };

  // Fungsi untuk load semua peraturan
  const loadAllRegulations = async () => {
    setRegLoading(true);
    try {
      const res = await fetch(
        `https://terminator-production-46a6.up.railway.app/api/references`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      const regulations = Array.isArray(data.data) ? data.data : [];
      setAllRegulations(regulations);
      setRegResults(regulations); // Set hasil awal dengan semua data
    } catch (err) {
      toast.error("Gagal memuat data peraturan.");
      console.error(err);
    } finally {
      setRegLoading(false);
    }
  };

  const handleRefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...refForm };
      const res = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menambahkan referensi.");
      const saved = await res.json();
      onAddReference?.(saved);
      toast.success("Referensi berhasil ditambahkan!");
      setRefForm({ title: "", year: "", number: "", text: "", url: "" });
      setShowRefForm(false);
    } catch (err) {
      toast.error("Gagal menambahkan referensi.");
      console.error(err);
    }
  };

  // Fungsi untuk mencari definisi
  const handleSearchDefinition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (defTerm.trim().length === 0) {
      // Jika pencarian kosong, tampilkan semua data
      setDefResults(allDefinitions);
      return;
    }

    if (defTerm.trim().length < 2) {
      toast.error("Masukkan minimal 2 huruf untuk mencari definisi.");
      return;
    }

    setDefLoading(true);
    try {
      const res = await fetch(
        `https://terminator-production-46a6.up.railway.app/api/definition?filter=${defTerm}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      setDefResults(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      toast.error("Gagal mencari definisi.");
      console.error(err);
    } finally {
      setDefLoading(false);
    }
  };

  // Fungsi untuk mencari peraturan
  const handleSearchRegulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regTerm.trim().length === 0) {
      // Jika pencarian kosong, tampilkan semua data
      setRegResults(allRegulations);
      return;
    }

    if (regTerm.trim().length < 2) {
      toast.error("Masukkan minimal 2 huruf untuk mencari peraturan.");
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch(
        `https://terminator-production-46a6.up.railway.app/api/references?filter=${regTerm}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      setRegResults(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      toast.error("Gagal mencari peraturan.");
      console.error(err);
    } finally {
      setRegLoading(false);
    }
  };

  // Fungsi untuk reset pencarian definisi dan tampilkan semua data
  const handleResetDefinitionSearch = () => {
    setDefTerm("");
    setDefResults(allDefinitions);
  };

  // Fungsi untuk reset pencarian peraturan dan tampilkan semua data
  const handleResetRegulationSearch = () => {
    setRegTerm("");
    setRegResults(allRegulations);
  };

  // Fungsi untuk copy meaning definisi
  const handleCopyDefinition = async (meaning: string) => {
    try {
      await navigator.clipboard.writeText(meaning);
      toast.success("Definisi berhasil disalin!");
    } catch (err) {
      toast.error("Gagal menyalin definisi.");
    }
  };

  // Fungsi untuk copy text peraturan
  const handleCopyRegulation = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Teks peraturan berhasil disalin!");
    } catch (err) {
      toast.error("Gagal menyalin teks peraturan.");
    }
  };

  // Fungsi untuk copy judul peraturan
  const handleCopyRegulationTitle = async (regulation: Regulation) => {
    try {
      const title = formatRegulationTitle(regulation);
      await navigator.clipboard.writeText(title);
      toast.success("Judul peraturan berhasil disalin!");
    } catch (err) {
      toast.error("Gagal menyalin judul peraturan.");
    }
  };

  // Fungsi untuk format judul peraturan
  const formatRegulationTitle = (regulation: Regulation) => {
    return `${regulation.title} No. ${regulation.number} Tahun ${regulation.year}`;
  };

  // Fungsi untuk menambahkan referensi peraturan yang dipilih
  const handleSelectRegulation = (regulation: Regulation) => {
    onAddReference?.(regulation);
    toast.success("Referensi peraturan berhasil ditambahkan!");
    setShowRegModal(false);
  };

  // Fungsi untuk menambahkan referensi definisi yang dipilih
  const handleSelectDefinition = (definition: Definition) => {
    onAddReference?.(definition);
    toast.success("Referensi definisi berhasil ditambahkan!");
    setShowDefModal(false);
  };

  // Fungsi untuk menempelkan definisi ke editor
  const handleInsertDefinition = (definition: Definition) => {
    // Format teks yang akan dimasukkan ke editor
    const definitionText = `${definition.term}: ${definition.meaning}`;

    // Trigger custom event untuk menempelkan teks ke editor
    const event = new CustomEvent("insertTextToEditor", {
      detail: { text: definitionText },
    });
    window.dispatchEvent(event);

    toast.success(
      `Definisi "${definition.term}" berhasil dimasukkan ke editor`
    );
    setShowDefModal(false);
  };

  // Fungsi untuk menempelkan peraturan ke editor
  const handleInsertRegulation = (regulation: Regulation) => {
    // Format teks yang akan dimasukkan ke editor
    const regulationText = `${formatRegulationTitle(regulation)}: ${
      regulation.text
    }`;

    // Trigger custom event untuk menempelkan teks ke editor
    const event = new CustomEvent("insertTextToEditor", {
      detail: { text: regulationText },
    });
    window.dispatchEvent(event);

    toast.success(`Peraturan berhasil dimasukkan ke editor`);
    setShowRegModal(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg text-[#282828]">📎 Referensi</h2>

      {/* REFERENSI PERATURAN */}
      <div className="border border-[#A4A4A4] rounded-md p-3 bg-[#F7F7F7]">
        <h3 className="font-medium text-sm mb-2 text-[#282828]">
          Referensi Peraturan
        </h3>

        {!showRefForm ? (
          <>
            <div className="flex gap-2 mb-3">
              <Button
                onClick={() => setShowRegModal(true)}
                variant="outline"
                className="flex-1 text-sm border-[#DB8928] text-[#DB8928] hover:bg-[#DB8928]/10"
              >
                🔍 Cari Peraturan
              </Button>
            </div>
            {/* <Button
              variant="outline"
              onClick={() => setShowRefForm(true)}
              className="w-full text-sm border-[#DB8928] text-[#DB8928] hover:bg-[#DB8928]/10"
            >
              + Tambah Referensi Manual
            </Button> */}
            {/* {reference && (
              <ul className="mt-3 list-disc ml-5 text-sm text-[#282828] space-y-1">
                <li>{reference.title}</li>
              </ul>
            )} */}
          </>
        ) : (
          <form onSubmit={handleRefSubmit} className="space-y-2 mt-2">
            <Input
              placeholder="Judul Peraturan"
              value={refForm.title}
              onChange={(e) =>
                setRefForm({ ...refForm, title: e.target.value })
              }
              required
              className="border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Input
              placeholder="Nomor Peraturan"
              value={refForm.number}
              onChange={(e) =>
                setRefForm({ ...refForm, number: e.target.value })
              }
              required
              className="border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Input
              placeholder="Tahun Peraturan"
              value={refForm.year}
              onChange={(e) => setRefForm({ ...refForm, year: e.target.value })}
              required
              className="border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Textarea
              placeholder="Teks Peraturan"
              value={refForm.text}
              onChange={(e) => setRefForm({ ...refForm, text: e.target.value })}
              required
              className="border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Input
              placeholder="URL Peraturan"
              value={refForm.url}
              onChange={(e) => setRefForm({ ...refForm, url: e.target.value })}
              className="border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
              >
                Simpan
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowRefForm(false)}
                className="flex-1 border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
              >
                Batal
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* REFERENSI DEFINISI */}
      <div className="border border-[#A4A4A4] rounded-md p-3 bg-[#F7F7F7]">
        <h3 className="font-medium text-sm mb-2 text-[#282828]">
          Referensi Definisi
        </h3>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowDefModal(true)}
            variant="outline"
            className="flex-1 text-sm border-[#DB8928] text-[#DB8928] hover:bg-[#DB8928]/10"
          >
            🔍 Cari Definisi
          </Button>
        </div>
      </div>

      {/* KOMENTAR */}
      <div className="border border-[#A4A4A4] rounded-md p-3 bg-[#F7F7F7]">
        <h3 className="font-medium text-sm mb-2 text-[#282828]">Komentar</h3>
        <Textarea
          placeholder="Tambahkan komentar..."
          className="text-sm border-[#A4A4A4] focus:border-[#DB8928]"
        />
      </div>

      {/* MODAL PENCARIAN DEFINISI */}
      <Dialog open={showDefModal} onOpenChange={setShowDefModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col border border-[#A4A4A4]">
          <DialogHeader>
            <DialogTitle className="text-[#282828]">
              Cari Referensi Definisi
            </DialogTitle>
          </DialogHeader>

          {/* Form Pencarian Definisi */}
          <form onSubmit={handleSearchDefinition} className="flex gap-2">
            <Input
              placeholder="Masukkan kata kunci istilah (minimal 2 huruf)..."
              value={defTerm}
              onChange={(e) => setDefTerm(e.target.value)}
              className="flex-1 border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Button
              type="submit"
              disabled={defLoading}
              className="bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
            >
              {defLoading ? "Mencari..." : "Cari"}
            </Button>
            {defTerm && (
              <Button
                type="button"
                variant="outline"
                onClick={handleResetDefinitionSearch}
                className="border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
              >
                Reset
              </Button>
            )}
          </form>

          {/* Hasil Pencarian Definisi */}
          <div className="flex-1 overflow-y-auto space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm text-[#282828]">
                {defTerm ? `Hasil Pencarian: "${defTerm}"` : "Semua Definisi"}
              </h3>
              <span className="text-xs text-[#A4A4A4]">
                {defResults.length} hasil ditemukan
              </span>
            </div>

            {defLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#A4A4A4]">Memuat data...</p>
              </div>
            ) : defResults.length > 0 ? (
              defResults.map((item, i) => (
                <div
                  key={i}
                  className="p-4 border border-[#A4A4A4] rounded-md bg-white hover:bg-[#F7F7F7] transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#DB8928] mb-2">
                        {item.term}
                      </p>
                      <p className="text-sm text-[#282828] leading-relaxed">
                        {item.meaning}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs cursor-pointer whitespace-nowrap bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
                        onClick={() => handleInsertDefinition(item)}
                      >
                        Tempel ke Editor
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs cursor-pointer whitespace-nowrap border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
                        onClick={() => handleCopyDefinition(item.meaning)}
                      >
                        Copy
                      </Button>
                      {/* <Button
                        size="sm"
                        variant="outline"
                        className="text-xs cursor-pointer whitespace-nowrap border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
                        onClick={() => handleSelectDefinition(item)}
                      >
                        Pilih sebagai Referensi
                      </Button> */}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#A4A4A4]">
                  {defTerm
                    ? "Tidak ditemukan hasil definisi."
                    : "Belum ada data definisi."}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDefModal(false)}
              className="border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL PENCARIAN PERATURAN */}
      <Dialog open={showRegModal} onOpenChange={setShowRegModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col border border-[#A4A4A4]">
          <DialogHeader>
            <DialogTitle className="text-[#282828]">
              Cari Referensi Peraturan
            </DialogTitle>
          </DialogHeader>

          {/* Form Pencarian Peraturan */}
          <form onSubmit={handleSearchRegulation} className="flex gap-2">
            <Input
              placeholder="Masukkan kata kunci peraturan (minimal 2 huruf)..."
              value={regTerm}
              onChange={(e) => setRegTerm(e.target.value)}
              className="flex-1 border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Button
              type="submit"
              disabled={regLoading}
              className="bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
            >
              {regLoading ? "Mencari..." : "Cari"}
            </Button>
            {regTerm && (
              <Button
                type="button"
                variant="outline"
                onClick={handleResetRegulationSearch}
                className="border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
              >
                Reset
              </Button>
            )}
          </form>

          {/* Hasil Pencarian Peraturan */}
          <div className="flex-1 overflow-y-auto space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm text-[#282828]">
                {regTerm ? `Hasil Pencarian: "${regTerm}"` : "Semua Peraturan"}
              </h3>
              <span className="text-xs text-[#A4A4A4]">
                {regResults.length} hasil ditemukan
              </span>
            </div>

            {regLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#A4A4A4]">Memuat data...</p>
              </div>
            ) : regResults.length > 0 ? (
              regResults.map((regulation, i) => (
                <div
                  key={regulation.id}
                  className="p-4 border border-[#A4A4A4] rounded-md bg-white hover:bg-[#F7F7F7] transition"
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-[#282828] mb-1">
                        {formatRegulationTitle(regulation)}
                      </h4>
                      <p className="text-xs text-[#A4A4A4] mb-2">
                        {regulation.url && (
                          <a
                            href={regulation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#DB8928] hover:underline break-all"
                          >
                            {regulation.url}
                          </a>
                        )}
                      </p>
                      <p className="text-sm text-[#282828] leading-relaxed line-clamp-3">
                        {regulation.text}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs cursor-pointer whitespace-nowrap bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
                        onClick={() => handleInsertRegulation(regulation)}
                      >
                        Tempel ke Editor
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs cursor-pointer whitespace-nowrap border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
                        onClick={() => handleCopyRegulation(regulation.text)}
                      >
                        Copy Teks
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs cursor-pointer whitespace-nowrap border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
                        onClick={() => handleCopyRegulationTitle(regulation)}
                      >
                        Copy Judul
                      </Button>
                      {/* <Button
                        size="sm"
                        variant="outline"
                        className="text-xs cursor-pointer whitespace-nowrap border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
                        onClick={() => handleSelectRegulation(regulation)}
                      >
                        Pilih sebagai Referensi
                      </Button> */}
                    </div>
                  </div>
                  <div className="text-xs text-[#A4A4A4] mt-2">
                    Diperbarui:{" "}
                    {new Date(regulation.updatedAt).toLocaleDateString("id-ID")}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#A4A4A4]">
                  {regTerm
                    ? "Tidak ditemukan hasil peraturan."
                    : "Belum ada data peraturan."}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRegModal(false)}
              className="border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
