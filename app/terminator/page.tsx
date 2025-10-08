"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, BookOpen, Upload, CheckCircle, ChevronDown, Plus, Trash2, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Correction {
  id: string;
  word: string;
  suggestion: string;
  source: string;
  order: number;
  meta: {
    note: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  meta: {
    message: string;
  };
  data: Correction[];
}

interface TypoIssue {
  type: 'typo';
  original: string;
  suggestion: string;
  position: number;
  context: string;
}

function checkTypos(text: string, dictionary: Record<string, string>): TypoIssue[] {
  const issues: TypoIssue[] = [];
  const words = text.split(/\b/);
  
  words.forEach((word, idx) => {
    const lower = word.toLowerCase().trim();
    if (dictionary[lower]) {
      const start = Math.max(0, idx - 5);
      const end = Math.min(words.length, idx + 6);
      const context = words.slice(start, end).join('');
      
      issues.push({
        type: 'typo',
        original: word,
        suggestion: dictionary[lower],
        position: idx,
        context: context
      });
    }
  });
  
  return issues;
}

export default function TerminatorApp() {
  const [activeTab, setActiveTab] = useState('check');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCorrection, setExpandedCorrection] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Dictionary management - hanya dari backend
  const [dictionary, setDictionary] = useState<Record<string, string>>({});
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newCorrection, setNewCorrection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const typoIssues = useMemo(() => checkTypos(text, dictionary), [text, dictionary]);

  // Fetch dictionary from backend
  const fetchDictionary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://terminator-production-46a6.up.railway.app/api/corrections');
      if (!response.ok) {
        throw new Error('Failed to fetch dictionary');
      }
      const data: ApiResponse = await response.json();
      
      // Convert backend data to dictionary format
      const dict: Record<string, string> = {};
      data.data.forEach((correction: Correction) => {
        dict[correction.word.toLowerCase()] = correction.suggestion;
      });
      
      setDictionary(dict);
      setCorrections(data.data);
    } catch (error) {
      console.error('Error fetching dictionary:', error);
      toast.error('Gagal mengambil data kamus dari server');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new word to backend
  const addToDictionary = async (word: string, correction: string) => {
    setIsAdding(true);
    try {
      const response = await fetch('https://terminator-production-46a6.up.railway.app/api/corrections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: word.toLowerCase(),
          suggestion: correction,
          source: 'admin',
          order: corrections.length + 1,
          meta: { note: 'Ditambahkan melalui aplikasi' }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add word');
      }

      // Refresh the dictionary
      await fetchDictionary();
      return true;
    } catch (error) {
      console.error('Error adding word:', error);
      toast.error('Gagal menambahkan kata ke server');
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  // Delete word from backend
  const deleteFromDictionary = async (id: string) => {
    try {
      const response = await fetch(`https://terminator-production-46a6.up.railway.app/api/corrections/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete word');
      }

      // Refresh the dictionary
      await fetchDictionary();
      return true;
    } catch (error) {
      console.error('Error deleting word:', error);
      toast.error('Gagal menghapus kata dari server');
      return false;
    }
  };

  // Load dictionary on component mount and when tab changes to dictionary
  useEffect(() => {
    fetchDictionary();
  }, [activeTab]);

  const addNewWord = async () => {
    if (!newWord.trim() || !newCorrection.trim()) {
      toast.error('Mohon isi kata dan koreksi yang benar');
      return;
    }
    
    const lowerWord = newWord.toLowerCase();
    
    if (dictionary[lowerWord]) {
      toast.error('Kata sudah ada dalam kamus');
      return;
    }
    
    const success = await addToDictionary(newWord, newCorrection);
    if (success) {
      setNewWord('');
      setNewCorrection('');
      toast.success('Kata berhasil ditambahkan ke kamus');
    }
  };

  // Fungsi untuk menghapus kata dengan konfirmasi toast
  const removeWord = async (id: string, word: string, suggestion: string) => {
    // Tampilkan toast konfirmasi
    toast.custom((t) => (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-3 h-3 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Hapus Kata?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Anda akan menghapus kata <span className="font-medium">"{word}"</span> → <span className="font-medium">"{suggestion}"</span>
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.dismiss(t)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  toast.dismiss(t);
                  const success = await deleteFromDictionary(id);
                  if (success) {
                    toast.success(`Kata "${word}" berhasil dihapus`);
                  }
                }}
                className="text-xs"
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 10000, // Toast akan tampil lebih lama untuk konfirmasi
    });
  };

  // Alternatif: Versi sederhana dengan toast promise
  const removeWordSimple = async (id: string, word: string) => {
    toast.promise(
      deleteFromDictionary(id),
      {
        loading: `Menghapus kata "${word}"...`,
        success: `Kata "${word}" berhasil dihapus`,
        error: `Gagal menghapus kata "${word}"`
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.some(type => fileExt === type)) {
      toast.error('Format file tidak didukung. Gunakan file PDF, DOC, DOCX, atau TXT');
      return;
    }
    
    setFileName(file.name);
    setUploadedFile(file);
    setIsUploading(true);
    
    if (fileExt === '.pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
    
    // Untuk demo, kita hanya handle PDF preview
    setIsUploading(false);
    toast.success('Dokumen berhasil diunggah');
  };

  const applySuggestion = (original: string, suggestion: string) => {
    setText(text.replace(new RegExp(`\\b${original}\\b`, 'g'), suggestion));
    toast.success(`Kata "${original}" diganti dengan "${suggestion}"`);
  };

  const applyAllSuggestions = () => {
    let newText = text;
    typoIssues.forEach(issue => {
      newText = newText.replace(new RegExp(`\\b${issue.original}\\b`, 'g'), issue.suggestion);
    });
    setText(newText);
    toast.success(`Semua ${typoIssues.length} koreksi telah diterapkan`);
  };

  const highlightedText = useMemo(() => {
    if (!text || typoIssues.length === 0) return text;
    
    let result = text;
    const sortedIssues = [...typoIssues].sort((a, b) => b.position - a.position);
    
    sortedIssues.forEach((issue) => {
      const regex = new RegExp(`\\b${issue.original}\\b`, 'g');
      result = result.replace(regex, `<mark class="bg-red-200 text-red-900">${issue.original}</mark>`);
    });
    
    return result;
  }, [text, typoIssues]);

  const filteredCorrections = useMemo(() => {
    if (!searchTerm) return corrections;
    const lower = searchTerm.toLowerCase();
    return corrections.filter(
      (item) => 
        item.word.toLowerCase().includes(lower) || 
        item.suggestion.toLowerCase().includes(lower)
    );
  }, [searchTerm, corrections]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Tombol Kembali dan Home */}
            <div className="flex items-center gap-2 mr-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
            </div>
            
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TERMINATOR</h1>
              <p className="text-xs text-gray-500">Presisi dalam Kata, Profesional dalam Tindakan</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">RS</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Ribka Novita Sari</p>
                <p className="text-xs text-gray-500">Staf Pengembangan Pegawai</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen p-4">
          <nav className="space-y-2">
            {/* Tombol Home di Sidebar */}
            <Link href="/">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 mb-4 border border-gray-200"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Kembali ke Home</span>
              </button>
            </Link>
            
            <button
              onClick={() => setActiveTab('check')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'check'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Dokumen</span>
            </button>
            <button
              onClick={() => setActiveTab('dictionary')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dictionary'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Kamus Kata & Frasa</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex">
          {activeTab === 'check' ? (
            <>
              {/* Document Area */}
              <div className="flex-1 p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isUploading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-orange-500 hover:bg-orange-600 cursor-pointer'
                        } text-white`}>
                          <Upload className="w-4 h-4" />
                          <span>{isUploading ? 'Mengunggah...' : 'Unggah Dokumen'}</span>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                      {fileName && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          {fileName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Card className="h-[calc(100vh-180px)]">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Halaman 1 dari 1 · {text.split(/\s+/).filter(w => w).length} kata · Bahasa Indonesia
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline" 
                          onClick={() => {
                            setText('');
                            setFileName(null);
                            setPdfUrl(null);
                            setUploadedFile(null);
                            toast.info('Dokumen telah dibersihkan');
                          }}
                        >
                          Bersihkan
                        </Button>
                        {typoIssues.length > 0 && (
                          <Button 
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={applyAllSuggestions}
                          >
                            Ubah Semua
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {pdfUrl ? (
                      <iframe
                        src={pdfUrl}
                        className="flex-1 w-full border rounded-lg"
                        title="PDF Preview"
                      />
                    ) : text ? (
                      <div 
                        className="flex-1 p-4 border rounded-lg bg-white overflow-y-auto text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: highlightedText }}
                      />
                    ) : (
                      <div className="flex-1 flex items-center justify-center border rounded-lg bg-gray-50">
                        <div className="text-center">
                          <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">Unggah dokumen untuk memulai</p>
                          <p className="text-sm text-gray-400 mt-2">Format: PDF, DOC, DOCX, TXT</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations Sidebar */}
              <aside className="w-96 bg-white border-l p-6 overflow-y-auto h-[calc(100vh-80px)]">
                <div className="mb-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer mb-2"
                    onClick={() => setExpandedCorrection(!expandedCorrection)}
                  >
                    <h3 className="text-lg font-bold">REKOMENDASI</h3>
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedCorrection ? '' : 'rotate-180'}`} />
                  </div>
                  <p className="text-sm text-gray-600">Usulan Perbaikan</p>
                </div>

                {expandedCorrection && (
                  <div className="space-y-3">
                    {typoIssues.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                        <p className="text-gray-600 font-medium">Tidak ada koreksi</p>
                        <p className="text-sm text-gray-500 mt-1">Dokumen terlihat baik</p>
                      </div>
                    ) : (
                      typoIssues.map((issue, idx) => (
                        <div key={idx} className="border-b pb-3">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="mb-1">
                                <span className="text-xs text-gray-500">Koreksi kata/frasa</span>
                              </div>
                              <div className="font-medium text-sm mb-1">
                                <span className="text-red-600 line-through">{issue.original}</span>
                                <span className="mx-1">→</span>
                                <span className="text-green-600">{issue.suggestion}</span>
                              </div>
                              <div className="text-xs text-gray-500 italic mb-2 line-clamp-2">
                                {issue.context}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applySuggestion(issue.original, issue.suggestion)}
                                className="h-7 text-xs"
                              >
                                Terapkan
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {typoIssues.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={applyAllSuggestions}
                    >
                      Ubah Semua
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => {
                        setText('');
                        setFileName(null);
                        setPdfUrl(null);
                        setUploadedFile(null);
                        toast.info('Dokumen telah dibersihkan');
                      }}
                    >
                      Kembali
                    </Button>
                  </div>
                )}
              </aside>
            </>
          ) : (
            <div className="flex-1 p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">Kamus Kata & Frasa</h2>
                  <BookOpen className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-6">
                  Kamus terpusat dari server. Semua perubahan akan disimpan ke database.
                </p>

                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDictionary}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Memuat...' : 'Refresh Data'}
                  </Button>
                  <div className="text-sm text-gray-500">
                    Total: {corrections.length} kata/frasa
                  </div>
                </div>

                {/* Add New Word Form */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Tambah Kata Baru</p>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="Kata yang salah..."
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addNewWord()}
                      />
                      <Input
                        type="text"
                        placeholder="Koreksi yang benar..."
                        value={newCorrection}
                        onChange={(e) => setNewCorrection(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addNewWord()}
                      />
                      <Button 
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={addNewWord}
                        disabled={isAdding}
                      >
                        {isAdding ? (
                          'Menambah...'
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Search and List */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Daftar Kata & Frasa</h3>
                  <Input
                    type="text"
                    placeholder="Cari Kata..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {isLoading ? (
                        <div className="p-12 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                          <p className="text-gray-500 font-medium">Memuat kamus...</p>
                        </div>
                      ) : filteredCorrections.length === 0 ? (
                        <div className="p-12 text-center">
                          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">Tidak ada kata ditemukan</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? 'Coba kata kunci lain' : 'Tambahkan kata baru di atas'}
                          </p>
                        </div>
                      ) : (
                        filteredCorrections.map((correction, idx) => (
                          <div key={correction.id} className="p-4 hover:bg-gray-50 flex items-center justify-between group">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{correction.word}</span>
                                <span className="text-gray-400">→</span>
                                <span className="text-gray-600">{correction.suggestion}</span>
                                <Badge 
                                  variant="outline" 
                                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                >
                                  Server
                                </Badge>
                              </div>
                              {correction.meta?.note && (
                                <p className="text-xs text-gray-500">{correction.meta.note}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeWord(correction.id, correction.word, correction.suggestion)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-2"
                              title="Hapus kata"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}