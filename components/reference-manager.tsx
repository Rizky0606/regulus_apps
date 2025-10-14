"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, BookOpen, Bookmark, Search, Copy, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Regulation, Definition, SelectedReferences } from "@/types/references";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface ReferenceManagerProps {
  selectedReferences: SelectedReferences;
  onReferencesChange: (references: SelectedReferences) => void;
}

export function ReferenceManager({
  selectedReferences,
  onReferencesChange,
}: ReferenceManagerProps) {
  const [showDefModal, setShowDefModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [allDefinitions, setAllDefinitions] = useState<Definition[]>([]);
  const [allRegulations, setAllRegulations] = useState<Regulation[]>([]);
  const [searchDef, setSearchDef] = useState("");
  const [searchReg, setSearchReg] = useState("");

  // State untuk CRUD operations
  const [showDefForm, setShowDefForm] = useState(false);
  const [showRegForm, setShowRegForm] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<Definition | null>(null);
  const [deleteDefinitionId, setDeleteDefinitionId] = useState<string | null>(null);
  const [deleteRegulationId, setDeleteRegulationId] = useState<string | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    definitions: false,
    regulations: false,
    createDefinition: false,
    updateDefinition: false,
    deleteDefinition: false,
    createRegulation: false,
    deleteRegulation: false,
  });

  // Form states
  const [defForm, setDefForm] = useState({
    term: "",
    meaning: "",
  });
  const [regForm, setRegForm] = useState({
    title: "",
    year: "",
    number: "",
    text: "",
    url: "",
  });

  const BASE_URL = "https://terminator-production-46a6.up.railway.app";

  // Load semua data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(prev => ({ ...prev, definitions: true, regulations: true }));
    try {
      const [defRes, regRes] = await Promise.all([
        fetch(`${BASE_URL}/api/definition`),
        fetch(`${BASE_URL}/api/references`),
      ]);

      if (defRes.ok) {
        const defData = await defRes.json();
        setAllDefinitions(Array.isArray(defData.data) ? defData.data : []);
      }

      if (regRes.ok) {
        const regData = await regRes.json();
        setAllRegulations(Array.isArray(regData.data) ? regData.data : []);
      }
    } catch (err) {
      console.error("Error loading references:", err);
      toast.error("Gagal memuat data referensi");
    } finally {
      setLoading(prev => ({ ...prev, definitions: false, regulations: false }));
    }
  };

  // Filter definitions berdasarkan pencarian
  const filteredDefinitions = allDefinitions.filter(
    (def) =>
      def.term.toLowerCase().includes(searchDef.toLowerCase()) ||
      def.meaning.toLowerCase().includes(searchDef.toLowerCase())
  );

  // Filter regulations berdasarkan pencarian
  const filteredRegulations = allRegulations.filter(
    (reg) =>
      reg.title.toLowerCase().includes(searchReg.toLowerCase()) ||
      reg.text.toLowerCase().includes(searchReg.toLowerCase()) ||
      reg.number.toLowerCase().includes(searchReg.toLowerCase())
  );

  // ========== CRUD OPERATIONS ==========

  // Fungsi untuk membuat definisi baru
  const handleCreateDefinition = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, createDefinition: true }));
    try {
      const res = await fetch(`${BASE_URL}/api/definition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defForm),
      });
      
      if (!res.ok) throw new Error("Gagal menambahkan definisi.");
      
      toast.success("Definisi berhasil ditambahkan!");
      setDefForm({ term: "", meaning: "" });
      setShowDefForm(false);
      await loadAllData(); // Reload data
    } catch (err) {
      toast.error("Gagal menambahkan definisi.");
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, createDefinition: false }));
    }
  };

  // Fungsi untuk mengupdate definisi
  const handleUpdateDefinition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDefinition) return;

    setLoading(prev => ({ ...prev, updateDefinition: true }));
    try {
      const res = await fetch(`${BASE_URL}/api/definition/${editingDefinition.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defForm),
      });
      
      if (!res.ok) throw new Error("Gagal mengupdate definisi.");
      
      toast.success("Definisi berhasil diupdate!");
      setEditingDefinition(null);
      setDefForm({ term: "", meaning: "" });
      await loadAllData(); // Reload data
    } catch (err) {
      toast.error("Gagal mengupdate definisi.");
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, updateDefinition: false }));
    }
  };

  // Fungsi untuk menghapus definisi
  const handleDeleteDefinition = async () => {
    if (!deleteDefinitionId) return;

    setLoading(prev => ({ ...prev, deleteDefinition: true }));
    try {
      const res = await fetch(`${BASE_URL}/api/definition/${deleteDefinitionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) throw new Error("Gagal menghapus definisi.");
      
      toast.success("Definisi berhasil dihapus!");
      setDeleteDefinitionId(null);
      await loadAllData(); // Reload data
    } catch (err) {
      toast.error("Gagal menghapus definisi.");
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, deleteDefinition: false }));
    }
  };

  // Fungsi untuk membuat peraturan baru
  const handleCreateRegulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, createRegulation: true }));
    try {
      const res = await fetch(`${BASE_URL}/api/references`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      
      if (!res.ok) throw new Error("Gagal menambahkan peraturan.");
      
      toast.success("Peraturan berhasil ditambahkan!");
      setRegForm({ title: "", year: "", number: "", text: "", url: "" });
      setShowRegForm(false);
      await loadAllData(); // Reload data
    } catch (err) {
      toast.error("Gagal menambahkan peraturan.");
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, createRegulation: false }));
    }
  };

  // Fungsi untuk menghapus peraturan
  const handleDeleteRegulation = async () => {
    if (!deleteRegulationId) return;

    setLoading(prev => ({ ...prev, deleteRegulation: true }));
    try {
      const res = await fetch(`${BASE_URL}/api/references/${deleteRegulationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) throw new Error("Gagal menghapus peraturan.");
      
      toast.success("Peraturan berhasil dihapus!");
      setDeleteRegulationId(null);
      await loadAllData(); // Reload data
    } catch (err) {
      toast.error("Gagal menghapus peraturan.");
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, deleteRegulation: false }));
    }
  };

  // Fungsi untuk membuka form edit definisi
  const handleEditDefinition = (definition: Definition) => {
    setEditingDefinition(definition);
    setDefForm({
      term: definition.term,
      meaning: definition.meaning,
    });
    setShowDefModal(false); // Tutup modal pencarian
  };

  // Fungsi untuk membuka form tambah peraturan
  const handleOpenRegForm = () => {
    setRegForm({ title: "", year: "", number: "", text: "", url: "" });
    setShowRegForm(true);
    setShowRegModal(false); // Tutup modal pencarian
  };

  // Fungsi untuk membuka form tambah definisi dari modal
  const handleOpenDefFormFromModal = () => {
    setDefForm({ term: "", meaning: "" });
    setEditingDefinition(null);
    setShowDefForm(true);
    setShowDefModal(false); // Tutup modal pencarian
  };

  // ========== REFERENCE MANAGEMENT ==========

  // Fungsi untuk copy text ke clipboard
  const copyToClipboard = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch (err) {
      console.error("Gagal menyalin teks:", err);
      toast.error("Gagal menyalin teks");
    }
  };

  // Fungsi untuk menambah definisi yang dipilih
  const addDefinition = (definition: Definition) => {
    const isAlreadySelected = selectedReferences.definitions.some(
      (def) => def.id === definition.id
    );

    if (isAlreadySelected) {
      toast.error("Definisi sudah dipilih");
      return;
    }

    const updatedDefinitions = [...selectedReferences.definitions, definition];
    const updatedReferences = {
      ...selectedReferences,
      definitions: updatedDefinitions,
    };

    onReferencesChange(updatedReferences);

    // Auto copy meaning definisi ke clipboard
    copyToClipboard(
      definition.meaning,
      `Definisi "${definition.term}" berhasil disalin dan ditambahkan ke PDF`
    );

    setShowDefModal(false);
  };

  // Fungsi untuk menambah peraturan yang dipilih
  const addRegulation = (regulation: Regulation) => {
    const isAlreadySelected = selectedReferences.regulations.some(
      (reg) => reg.id === regulation.id
    );

    if (isAlreadySelected) {
      toast.error("Peraturan sudah dipilih");
      return;
    }

    const updatedRegulations = [...selectedReferences.regulations, regulation];
    const updatedReferences = {
      ...selectedReferences,
      regulations: updatedRegulations,
    };

    onReferencesChange(updatedReferences);

    // Auto copy text peraturan ke clipboard
    const regulationText = `${regulation.title} No. ${regulation.number} Tahun ${regulation.year}: ${regulation.text}`;
    copyToClipboard(
      regulationText,
      `Peraturan "${regulation.title}" berhasil disalin dan ditambahkan ke PDF`
    );

    setShowRegModal(false);
  };

  // Fungsi untuk menghapus definisi
  const removeDefinition = (definitionId: string) => {
    const updatedDefinitions = selectedReferences.definitions.filter(
      (def) => def.id !== definitionId
    );
    const updatedReferences = {
      ...selectedReferences,
      definitions: updatedDefinitions,
    };
    onReferencesChange(updatedReferences);
    toast.success("Definisi dihapus dari PDF");
  };

  // Fungsi untuk menghapus peraturan
  const removeRegulation = (regulationId: string) => {
    const updatedRegulations = selectedReferences.regulations.filter(
      (reg) => reg.id !== regulationId
    );
    const updatedReferences = {
      ...selectedReferences,
      regulations: updatedRegulations,
    };
    onReferencesChange(updatedReferences);
    toast.success("Peraturan dihapus dari PDF");
  };

  // Clear semua referensi
  const clearAllReferences = () => {
    onReferencesChange({ regulations: [], definitions: [] });
    toast.success("Semua referensi dihapus");
  };

  // Fungsi untuk copy definisi individual
  const handleCopyDefinition = async (definition: Definition) => {
    await copyToClipboard(
      definition.meaning,
      `Definisi "${definition.term}" berhasil disalin`
    );
  };

  // Fungsi untuk copy peraturan individual
  const handleCopyRegulation = async (regulation: Regulation) => {
    const regulationText = `${regulation.title} No. ${regulation.number} Tahun ${regulation.year}: ${regulation.text}`;
    await copyToClipboard(
      regulationText,
      `Peraturan "${regulation.title}" berhasil disalin`
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-[#282828]">
          📎 Referensi untuk PDF
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-[#DB8928] text-white">
            {selectedReferences.definitions.length +
              selectedReferences.regulations.length}{" "}
            dipilih
          </Badge>
          {(selectedReferences.definitions.length > 0 ||
            selectedReferences.regulations.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllReferences}
              className="h-6 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Hapus Semua
            </Button>
          )}
        </div>
      </div>

      {/* Tombol Pilih Referensi */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setShowDefModal(true)}
          variant="outline"
          className="h-16 flex flex-col gap-1 border-[#DB8928] text-[#DB8928] hover:bg-[#DB8928]/10 relative"
        >
          <Bookmark className="w-4 h-4" />
          <span className="text-xs">Pilih Definisi</span>
          {selectedReferences.definitions.length > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-green-500"
            >
              {selectedReferences.definitions.length}
            </Badge>
          )}
        </Button>

        <Button
          onClick={() => setShowRegModal(true)}
          variant="outline"
          className="h-16 flex flex-col gap-1 border-[#DB8928] text-[#DB8928] hover:bg-[#DB8928]/10 relative"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-xs">Pilih Peraturan</span>
          {selectedReferences.regulations.length > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-green-500"
            >
              {selectedReferences.regulations.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Daftar Definisi yang Dipilih */}
      {selectedReferences.definitions.length > 0 && (
        <Card className="p-4 border-[#A4A4A4]">
          <h3 className="font-medium text-sm mb-3 text-[#282828] flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#DB8928]" />
            Definisi Terpilih ({selectedReferences.definitions.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedReferences.definitions.map((def) => (
              <div
                key={def.id}
                className="flex items-start justify-between p-2 bg-[#F7F7F7] rounded-md group hover:bg-[#F0F0F0]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs text-[#DB8928] truncate">
                    {def.term}
                  </p>
                  <p className="text-xs text-[#282828] line-clamp-2">
                    {def.meaning}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyDefinition(def)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    title="Salin definisi"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDefinition(def.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    title="Hapus dari PDF"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Daftar Peraturan yang Dipilih */}
      {selectedReferences.regulations.length > 0 && (
        <Card className="p-4 border-[#A4A4A4]">
          <h3 className="font-medium text-sm mb-3 text-[#282828] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#DB8928]" />
            Peraturan Terpilih ({selectedReferences.regulations.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedReferences.regulations.map((reg) => (
              <div
                key={reg.id}
                className="flex items-start justify-between p-2 bg-[#F7F7F7] rounded-md group hover:bg-[#F0F0F0]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs text-[#282828]">
                    {reg.title} No. {reg.number}/{reg.year}
                  </p>
                  <p className="text-xs text-[#666666] line-clamp-2">
                    {reg.text}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyRegulation(reg)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    title="Salin peraturan"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRegulation(reg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    title="Hapus dari PDF"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODAL TAMBAH/EDIT DEFINISI */}
      <Dialog open={showDefForm || !!editingDefinition} onOpenChange={(open) => {
        if (!open) {
          setShowDefForm(false);
          setEditingDefinition(null);
          setDefForm({ term: "", meaning: "" });
        }
      }}>
        <DialogContent className="max-w-2xl border border-[#A4A4A4]">
          <DialogHeader>
            <DialogTitle className="text-[#282828]">
              {editingDefinition ? "Edit Definisi" : "Tambah Definisi Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={editingDefinition ? handleUpdateDefinition : handleCreateDefinition} className="space-y-4">
            <Input
              placeholder="Istilah"
              value={defForm.term}
              onChange={(e) => setDefForm({ ...defForm, term: e.target.value })}
              required
              disabled={loading.createDefinition || loading.updateDefinition}
              className="border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Textarea
              placeholder="Makna/Definisi"
              value={defForm.meaning}
              onChange={(e) => setDefForm({ ...defForm, meaning: e.target.value })}
              required
              disabled={loading.createDefinition || loading.updateDefinition}
              className="min-h-[120px] border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDefForm(false);
                  setEditingDefinition(null);
                  setDefForm({ term: "", meaning: "" });
                }}
                disabled={loading.createDefinition || loading.updateDefinition}
                className="border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading.createDefinition || loading.updateDefinition}
                className="bg-[#DB8928] hover:bg-[#DB8928]/90 text-white min-w-20"
              >
                {(loading.createDefinition || loading.updateDefinition) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingDefinition ? (
                  "Update"
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL TAMBAH PERATURAN */}
      <Dialog open={showRegForm} onOpenChange={setShowRegForm}>
        <DialogContent className="max-w-2xl border border-[#A4A4A4]">
          <DialogHeader>
            <DialogTitle className="text-[#282828]">
              Tambah Peraturan Baru
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRegulation} className="space-y-4">
            <Input
              placeholder="Judul Peraturan"
              value={regForm.title}
              onChange={(e) => setRegForm({ ...regForm, title: e.target.value })}
              required
              disabled={loading.createRegulation}
              className="border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Input
              placeholder="Nomor Peraturan"
              value={regForm.number}
              onChange={(e) => setRegForm({ ...regForm, number: e.target.value })}
              required
              disabled={loading.createRegulation}
              className="border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Input
              placeholder="Tahun Peraturan"
              value={regForm.year}
              onChange={(e) => setRegForm({ ...regForm, year: e.target.value })}
              required
              disabled={loading.createRegulation}
              className="border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Textarea
              placeholder="Teks Peraturan"
              value={regForm.text}
              onChange={(e) => setRegForm({ ...regForm, text: e.target.value })}
              required
              disabled={loading.createRegulation}
              className="min-h-[100px] border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <Input
              placeholder="URL Peraturan (opsional)"
              value={regForm.url}
              onChange={(e) => setRegForm({ ...regForm, url: e.target.value })}
              disabled={loading.createRegulation}
              className="border-[#A4A4A4] focus:border-[#DB8928]"
            />
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRegForm(false)}
                disabled={loading.createRegulation}
                className="border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading.createRegulation}
                className="bg-[#DB8928] hover:bg-[#DB8928]/90 text-white min-w-20"
              >
                {loading.createRegulation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL KONFIRMASI HAPUS DEFINISI */}
      <Dialog open={!!deleteDefinitionId} onOpenChange={(open) => {
        if (!open) setDeleteDefinitionId(null);
      }}>
        <DialogContent className="max-w-md border border-[#A4A4A4]">
          <DialogHeader>
            <DialogTitle className="text-[#282828]">Hapus Definisi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus definisi ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDefinitionId(null)}
              disabled={loading.deleteDefinition}
              className="border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
            >
              Batal
            </Button>
            <Button
              onClick={handleDeleteDefinition}
              disabled={loading.deleteDefinition}
              className="bg-red-600 hover:bg-red-700 text-white min-w-20"
            >
              {loading.deleteDefinition ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL KONFIRMASI HAPUS PERATURAN */}
      <Dialog open={!!deleteRegulationId} onOpenChange={(open) => {
        if (!open) setDeleteRegulationId(null);
      }}>
        <DialogContent className="max-w-md border border-[#A4A4A4]">
          <DialogHeader>
            <DialogTitle className="text-[#282828]">Hapus Peraturan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus peraturan ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteRegulationId(null)}
              disabled={loading.deleteRegulation}
              className="border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
            >
              Batal
            </Button>
            <Button
              onClick={handleDeleteRegulation}
              disabled={loading.deleteRegulation}
              className="bg-red-600 hover:bg-red-700 text-white min-w-20"
            >
              {loading.deleteRegulation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Pilih Definisi */}
      {showDefModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#A4A4A4]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  Pilih Definisi untuk PDF
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleOpenDefFormFromModal}
                    className="bg-[#DB8928] hover:bg-[#DB8928]/90 text-white text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Baru
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDefModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A4A4A4] w-4 h-4" />
                <Input
                  placeholder="Cari definisi..."
                  value={searchDef}
                  onChange={(e) => setSearchDef(e.target.value)}
                  className="pl-10 border-[#A4A4A4] focus:border-[#DB8928]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading.definitions ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#DB8928]" />
                  <span className="ml-2 text-sm text-[#666666]">Memuat definisi...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDefinitions.length > 0 ? (
                    filteredDefinitions.map((def) => {
                      const isSelected = selectedReferences.definitions.some(
                        (d) => d.id === def.id
                      );
                      return (
                        <Card
                          key={def.id}
                          className="p-4 border-[#A4A4A4] hover:border-[#DB8928] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4
                                  className={`font-semibold text-sm ${
                                    isSelected
                                      ? "text-[#DB8928]"
                                      : "text-[#282828]"
                                  }`}
                                >
                                  {def.term}
                                </h4>
                                {isSelected && (
                                  <Badge className="bg-green-500 text-white text-xs">
                                    Dipilih
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#282828] mb-3">
                                {def.meaning}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyDefinition(def)}
                                  className="text-xs border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Salin
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditDefinition(def)}
                                  className="text-xs border-blue-500 text-blue-500 hover:bg-blue-50"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteDefinitionId(def.id)}
                                  className="text-xs border-red-500 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Hapus
                                </Button>
                              </div>
                            </div>
                            <Button
                              onClick={() =>
                                isSelected
                                  ? removeDefinition(def.id)
                                  : addDefinition(def)
                              }
                              className={`flex-shrink-0 ${
                                isSelected
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
                              }`}
                            >
                              {isSelected ? "Hapus" : "Pilih & Salin"}
                            </Button>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Bookmark className="w-12 h-12 text-[#A4A4A4] mx-auto mb-3" />
                      <p className="text-sm text-[#666666]">
                        {searchDef
                          ? "Tidak ditemukan definisi yang sesuai"
                          : "Belum ada data definisi"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#A4A4A4] bg-[#F7F7F7]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#666666]">
                  {filteredDefinitions.length} definisi ditemukan •{" "}
                  {selectedReferences.definitions.length} dipilih
                </span>
                <Button
                  onClick={() => setShowDefModal(false)}
                  variant="outline"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pilih Peraturan */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#A4A4A4]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  Pilih Peraturan untuk PDF
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleOpenRegForm}
                    className="bg-[#DB8928] hover:bg-[#DB8928]/90 text-white text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Baru
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRegModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A4A4A4] w-4 h-4" />
                <Input
                  placeholder="Cari peraturan..."
                  value={searchReg}
                  onChange={(e) => setSearchReg(e.target.value)}
                  className="pl-10 border-[#A4A4A4] focus:border-[#DB8928]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading.regulations ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#DB8928]" />
                  <span className="ml-2 text-sm text-[#666666]">Memuat peraturan...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRegulations.length > 0 ? (
                    filteredRegulations.map((reg) => {
                      const isSelected = selectedReferences.regulations.some(
                        (r) => r.id === reg.id
                      );
                      return (
                        <Card
                          key={reg.id}
                          className="p-4 border-[#A4A4A4] hover:border-[#DB8928] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4
                                  className={`font-semibold text-sm ${
                                    isSelected
                                      ? "text-[#DB8928]"
                                      : "text-[#282828]"
                                  }`}
                                >
                                  {reg.title} No. {reg.number} Tahun {reg.year}
                                </h4>
                                {isSelected && (
                                  <Badge className="bg-green-500 text-white text-xs">
                                    Dipilih
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-[#666666] mb-2">
                                {reg.url && (
                                  <a
                                    href={reg.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#DB8928] hover:underline break-all"
                                  >
                                    {reg.url}
                                  </a>
                                )}
                              </p>
                              <p className="text-sm text-[#282828] mb-3">
                                {reg.text}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyRegulation(reg)}
                                  className="text-xs border-[#A4A4A4] text-[#282828] hover:bg-[#F7F7F7]"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Salin
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteRegulationId(reg.id)}
                                  className="text-xs border-red-500 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Hapus
                                </Button>
                              </div>
                            </div>
                            <Button
                              onClick={() =>
                                isSelected
                                  ? removeRegulation(reg.id)
                                  : addRegulation(reg)
                              }
                              className={`flex-shrink-0 ${
                                isSelected
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-[#DB8928] hover:bg-[#DB8928]/90 text-white"
                              }`}
                            >
                              {isSelected ? "Hapus" : "Pilih & Salin"}
                            </Button>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-[#A4A4A4] mx-auto mb-3" />
                      <p className="text-sm text-[#666666]">
                        {searchReg
                          ? "Tidak ditemukan peraturan yang sesuai"
                          : "Belum ada data peraturan"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#A4A4A4] bg-[#F7F7F7]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#666666]">
                  {filteredRegulations.length} peraturan ditemukan •{" "}
                  {selectedReferences.regulations.length} dipilih
                </span>
                <Button
                  onClick={() => setShowRegModal(false)}
                  variant="outline"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pesan jika belum ada referensi */}
      {selectedReferences.definitions.length === 0 &&
        selectedReferences.regulations.length === 0 && (
          <Card className="p-6 text-center border-[#A4A4A4] bg-[#F7F7F7]">
            <BookOpen className="w-8 h-8 text-[#A4A4A4] mx-auto mb-2" />
            <p className="text-sm text-[#666666]">
              Belum ada referensi yang dipilih untuk PDF
            </p>
            <p className="text-xs text-[#A4A4A4] mt-1">
              Pilih definisi atau peraturan yang ingin dimasukkan ke dalam PDF
            </p>
          </Card>
        )}
    </div>
  );
}