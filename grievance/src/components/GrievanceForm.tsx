import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../src/lib/supabase";
import { useNavigate } from "react-router-dom";
import { 
  Upload, ShieldCheck, FileText, ChevronRight, 
  Bold, Italic, List, ListOrdered, X, CloudUpload,
  User, Mail, Hash, CreditCard, Search, Check, ChevronDown,
  AlertCircle, Paperclip
} from "lucide-react";
import { getAllCategories, getSubcategories } from "../services/CategoryService";
import type { Category, Subcategory } from "../services/CategoryService";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

const CHARACTER_LIMIT = 4000;

// ============ RICH TEXT TOOLBAR ============
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const buttons = [
    { action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), icon: Bold, label: 'Bold' },
    { action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), icon: Italic, label: 'Italic' },
    { action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), icon: List, label: 'Bullet List' },
    { action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), icon: ListOrdered, label: 'Ordered List' },
  ];

  const characterCount = editor.storage.characterCount.characters();
  const percentage = Math.round((characterCount / CHARACTER_LIMIT) * 100);

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/80">
      <div className="flex items-center gap-1">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            title={btn.label}
            className={`p-2 rounded-md transition-all ${
              btn.isActive 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
          >
            <btn.icon size={16} />
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-slate-400'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${
            percentage > 90 ? 'text-red-500' : percentage > 70 ? 'text-amber-500' : 'text-slate-400'
          }`}>
            {characterCount}/{CHARACTER_LIMIT}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============ SEARCHABLE DROPDOWN ============
type SearchableDropdownProps = {
  items: { id: number; name: string }[];
  selectedItem: { id: number; name: string } | null;
  onSelect: (item: any) => void;
  label: string;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  autoOpen?: boolean;
  onAutoOpenComplete?: () => void;
};

const SearchableDropdown = ({ 
  items, 
  selectedItem, 
  onSelect, 
  label, 
  placeholder,
  disabled = false,
  loading = false,
  autoOpen = false,
  onAutoOpenComplete
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredItems = searchTerm.length >= 1
    ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;

  // Auto-open when triggered
  useEffect(() => {
    if (autoOpen && !disabled && items.length > 0 && !loading) {
      setIsOpen(true);
      setSearchTerm("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      if (onAutoOpenComplete) {
        onAutoOpenComplete();
      }
    }
  }, [autoOpen, disabled, items.length, loading]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredItems.length]);

  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const highlighted = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlighted) highlighted.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (item: any) => {
    onSelect(item);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      else setHighlightedIndex(prev => prev < filteredItems.length - 1 ? prev + 1 : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : filteredItems.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && filteredItems[highlightedIndex]) handleSelect(filteredItems[highlightedIndex]);
      else setIsOpen(true);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const openDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearchTerm("");
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search) return text;
    const index = text.toLowerCase().indexOf(search.toLowerCase());
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="font-semibold underline">
          {text.slice(index, index + search.length)}
        </span>
        {text.slice(index + search.length)}
      </>
    );
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-center gap-3 px-4 h-12 rounded-lg border border-slate-200 bg-slate-50 animate-pulse">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading options...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={`relative space-y-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>

      {!isOpen ? (
        <button
          type="button"
          onClick={openDropdown}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 h-12 rounded-lg border transition-all text-left ${
            selectedItem 
              ? 'border-slate-300 bg-white' 
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {selectedItem ? (
              <>
                <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center flex-shrink-0">
                  <Check size={14} />
                </div>
                <span className="font-medium text-slate-800 truncate">{selectedItem.name}</span>
              </>
            ) : (
              <span className="text-slate-400">{disabled ? 'Select category first' : placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {selectedItem && (
              <span
                role="button"
                onClick={handleClear}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </span>
            )}
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </button>
      ) : (
        <div className="border border-slate-300 rounded-lg bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 h-12 border-b border-slate-100">
            <Search size={16} className="text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="flex-1 outline-none text-sm text-slate-800 placeholder:text-slate-400 bg-transparent"
              autoComplete="off"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")} className="p-1 hover:bg-slate-100 rounded">
                <X size={14} className="text-slate-400" />
              </button>
            )}
          </div>

          <div ref={listRef} className="max-h-52 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-6 text-center text-slate-400 text-sm">
                No results found
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors text-sm ${
                    index === highlightedIndex ? 'bg-slate-100' : 'hover:bg-slate-50'
                  } ${selectedItem?.id === item.id ? 'font-medium text-slate-900' : 'text-slate-700'}`}
                >
                  <span className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                    selectedItem?.id === item.id
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {selectedItem?.id === item.id ? <Check size={12} /> : item.name.charAt(0)}
                  </span>
                  <span className="truncate">{highlightMatch(item.name, searchTerm)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ FILE DROP ZONE ============
const FileDropZone = ({ 
  files, 
  onFilesAdd, 
  onFileRemove 
}: { 
  files: File[], 
  onFilesAdd: (files: File[]) => void, 
  onFileRemove: (index: number) => void 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onFilesAdd(Array.from(e.dataTransfer.files));
  }, [onFilesAdd]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdd(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileType = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['pdf'].includes(ext || '')) return 'pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'doc';
    return 'file';
  };

  const fileTypeColors: Record<string, string> = {
    image: 'bg-purple-100 text-purple-600',
    pdf: 'bg-red-100 text-red-600',
    doc: 'bg-blue-100 text-blue-600',
    file: 'bg-slate-100 text-slate-600'
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer text-center ${
          isDragging 
            ? 'border-slate-400 bg-slate-50' 
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        
        <div className="flex flex-col items-center gap-2">
          <div className={`p-3 rounded-full ${isDragging ? 'bg-slate-200' : 'bg-slate-100'}`}>
            <CloudUpload size={24} className={isDragging ? 'text-slate-600' : 'text-slate-400'} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">or click to browse • Max 5MB per file</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group"
            >
              <div className={`p-2 rounded ${fileTypeColors[getFileType(file.name)]}`}>
                <Paperclip size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              </div>
              <button 
                type="button" 
                onClick={() => onFileRemove(index)} 
                className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ MAIN FORM ============
export default function GrievanceForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [autoOpenSubcategory, setAutoOpenSubcategory] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: 'Provide a detailed description of your grievance. Include relevant dates, names, locations, and any other important information...',
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount.configure({
        limit: CHARACTER_LIMIT,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-sm max-w-none focus:outline-none min-h-[180px] p-4 text-slate-700',
      },
    },
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getText());
    },
  });

  useEffect(() => {
    async function prepareForm() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) setProfile(profileData);
      const cats = await getAllCategories();
      setCategories(cats);
    }
    prepareForm();
  }, []);

  // Fetch subcategories when category changes and trigger auto-open
  useEffect(() => {
    async function fetchSubcategories() {
      if (!selectedCategory) {
        setSubcategories([]);
        setAutoOpenSubcategory(false);
        return;
      }
      
      setSubLoading(true);
      setSelectedSubcategory(null);
      setAutoOpenSubcategory(false);
      
      const subs = await getSubcategories(selectedCategory.id);
      setSubcategories(subs);
      setSubLoading(false);
      
      // Trigger auto-open after subcategories are loaded
      if (subs.length > 0) {
        setTimeout(() => {
          setAutoOpenSubcategory(true);
        }, 50);
      }
    }
    fetchSubcategories();
  }, [selectedCategory]);

  const handleCategorySelect = (category: Category | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setAutoOpenSubcategory(false);
  };

  const handleSubcategorySelect = (subcategory: Subcategory | null) => {
    setSelectedSubcategory(subcategory);
  };

  const handleAutoOpenComplete = () => {
    setAutoOpenSubcategory(false);
  };

  const handleFilesAdd = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.size <= 5 * 1024 * 1024);
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    if (!profile || !editor || !selectedCategory || !selectedSubcategory) return;
    setLoading(true);
    setShowConfirm(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired. Please log in.");

      const refNo = `GRV-${Date.now().toString().slice(-6)}`;

      const { data: grievance, error: gError } = await supabase
        .from('grievances')
        .insert({
          reference_number: refNo,
          user_id: session.user.id,
          indos_number: profile.indos_number,
          first_name: profile.first_name,
          last_name: profile.last_name,
          category_id: selectedCategory.id,
          subcategory_id: selectedSubcategory.id,
          description: editor.getHTML(),
          status: 'SUBMITTED'
        })
        .select().single();

      if (gError) throw gError;

      if (files.length > 0 && grievance) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${grievance.id}/${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('grievance-attachments')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('grievance-attachments')
              .getPublicUrl(fileName);

            await supabase.from('grievance_files').insert({
              grievance_id: grievance.id,
              file_url: publicUrl
            });
          }
        }
      }

      navigate("/dashboard/application-status", { state: { 
        refNumber: refNo,
        categoryName: selectedCategory.name
      } });
    } catch (err: any) {
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fixed validation - using editorContent state instead of editor.getText()
  const isFormValid = Boolean(
    profile && 
    selectedCategory && 
    selectedSubcategory && 
    editorContent.trim().length >= 10
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-xl shadow-lg">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Submit Grievance</h1>
              <p className="text-slate-500 text-sm">File a new complaint or grievance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-6">
          
          {/* Applicant Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-slate-300" size={20} />
                <span className="text-white font-semibold">Applicant Information</span>
              </div>
              <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-full font-medium">
                Verified
              </span>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Hash, label: 'INDoS Number', value: profile?.indos_number },
                  { icon: CreditCard, label: 'CDC Number', value: profile?.cdc_number },
                  { icon: User, label: 'Full Name', value: profile ? `${profile.first_name} ${profile.last_name}` : null },
                  { icon: Mail, label: 'Email Address', value: profile?.email },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <item.icon size={12} />
                      <span className="text-[11px] font-medium uppercase tracking-wide">{item.label}</span>
                    </div>
                    <p className="font-semibold text-slate-800 truncate">{item.value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grievance Classification */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Grievance Classification</h2>
              <p className="text-sm text-slate-500 mt-0.5">Select the category that best describes your issue</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SearchableDropdown
                  items={categories}
                  selectedItem={selectedCategory}
                  onSelect={handleCategorySelect}
                  label="Category"
                  placeholder="Select category..."
                />
                
                <SearchableDropdown
                  items={subcategories}
                  selectedItem={selectedSubcategory}
                  onSelect={handleSubcategorySelect}
                  label="Sub-Category"
                  placeholder="Select sub-category..."
                  disabled={!selectedCategory}
                  loading={subLoading}
                  autoOpen={autoOpenSubcategory}
                  onAutoOpenComplete={handleAutoOpenComplete}
                />
              </div>
              
              {/* Selection Summary */}
              {selectedCategory && selectedSubcategory && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                  <Check size={16} className="text-slate-600" />
                  <span className="text-sm text-slate-700">
                    <span className="font-medium">{selectedCategory.name}</span>
                    <span className="mx-2 text-slate-400">→</span>
                    <span className="font-medium">{selectedSubcategory.name}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Grievance Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800">Grievance Details</h2>
                <p className="text-sm text-slate-500 mt-0.5">Provide a comprehensive description (min 10 characters)</p>
              </div>
              <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertCircle size={12} />
                Required
              </span>
            </div>
            
            <div className="border-b border-slate-200">
              <MenuBar editor={editor} />
            </div>
            <EditorContent editor={editor} />
            
            {/* Character limit warning */}
            {editor && editor.storage.characterCount.characters() >= CHARACTER_LIMIT * 0.9 && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-200">
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {editor.storage.characterCount.characters() >= CHARACTER_LIMIT 
                    ? 'Character limit reached' 
                    : `Approaching character limit (${CHARACTER_LIMIT - editor.storage.characterCount.characters()} remaining)`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Supporting Documents */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800">Supporting Documents</h2>
                <p className="text-sm text-slate-500 mt-0.5">Upload any relevant files or evidence</p>
              </div>
              <span className="text-xs text-slate-400 font-medium">Optional</span>
            </div>
            
            <div className="p-6">
              <FileDropZone 
                files={files}
                onFilesAdd={handleFilesAdd}
                onFileRemove={handleFileRemove}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm">
              {!profile && (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Loading profile...
                </span>
              )}
              {profile && !isFormValid && (
                <span className="flex items-center gap-1.5 text-amber-600">
                  <AlertCircle size={14} />
                  Complete all required fields to submit
                </span>
              )}
              {isFormValid && (
                <span className="flex items-center gap-1.5 text-green-600">
                  <Check size={14} />
                  Ready to submit
                </span>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={!isFormValid || loading} 
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-slate-200 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit Grievance
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 bg-slate-800 text-center">
              <div className="inline-flex p-3 bg-white/10 rounded-full mb-3">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white">Review & Submit</h3>
              <p className="text-slate-300 text-sm mt-1">Please verify your submission details</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Category</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedCategory?.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Sub-Category</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedSubcategory?.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Description</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {editorContent.length} / {CHARACTER_LIMIT} characters
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500">Attachments</span>
                  <span className="text-sm font-semibold text-slate-800">{files.length} file(s)</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Once submitted, this grievance will be assigned a reference number and forwarded for review.</span>
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setShowConfirm(false)} 
                className="py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Go Back
              </button>
              <button 
                type="button"
                onClick={handleFinalSubmit} 
                disabled={loading}
                className="py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 transition-colors"
              >
                {loading ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror:focus { outline: none; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; }
        .ProseMirror ul { list-style-type: disc; }
        .ProseMirror ol { list-style-type: decimal; }
        .ProseMirror li { margin: 0.25rem 0; }
        
        @keyframes zoom-in-95 {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-in { animation: zoom-in-95 0.2s ease-out; }
      `}</style>
    </div>
  );
}























// import { useState, useEffect, useRef } from "react";
// import { supabase } from "../../src/lib/supabase";
// import { useNavigate } from "react-router-dom";
// import { Upload, ShieldCheck, X, Search, FileText, Trash2, ShieldAlert, FileCheck, ChevronRight } from 'lucide-react';
// import { getAllCategories, getSubcategories } from "../services/CategoryService";

// export default function GrievanceForm() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [profile, setProfile] = useState<any>(null);
//   const [categories, setCategories] = useState<any[]>([]);
//   const [subcategories, setSubcategories] = useState<any[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [showConfirm, setShowConfirm] = useState(false);
  
//   const [formData, setFormData] = useState({
//     description: "",
//     subCategoryId: "",
//   });

//   const [files, setFiles] = useState<File[]>([]);


//   useEffect(() => {
//     async function prepareForm() {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) return;


//       const { data: profileData } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', user.id)
//         .single();
      
//       if (profileData) setProfile(profileData);


//       const cats = await getAllCategories();
//       setCategories(cats);
//     }
//     prepareForm();
//   }, []);


//   useEffect(() => {
//     async function fetchSubs() {
//       if (selectedCategory) {
//         setFormData(prev => ({ ...prev, subCategoryId: "" }));
//         const subs = await getSubcategories(Number(selectedCategory));
//         setSubcategories(subs);
//       } else {
//         setSubcategories([]);
//       }
//     }
//     fetchSubs();
//   }, [selectedCategory]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files);
//       setFiles(prev => [...prev, ...newFiles]);
//     }
//   };

//   const removeFile = (index: number) => {
//     setFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleFinalSubmit = async () => {
//     if (!profile) return alert("Profile not loaded.");
//     setLoading(true);
//     setShowConfirm(false);

//     try {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) throw new Error("Session expired. Please log in.");

//       const refNo = `GRV-${Date.now().toString().slice(-6)}`;


//       const { data: grievance, error: gError } = await supabase
//         .from('grievances')
//         .insert({
//           reference_number: refNo,
//           user_id: session.user.id,
//           indos_number: profile.indos_number,
//           first_name: profile.first_name,
//           last_name: profile.last_name,
//           category_id: Number(selectedCategory),
//           subcategory_id: Number(formData.subCategoryId),
//           description: formData.description,
//           status: 'SUBMITTED'
//         })
//         .select().single();

//       if (gError) throw gError;


//       if (files.length > 0 && grievance) {
//         for (const file of files) {
//           const fileExt = file.name.split('.').pop();
//           const fileName = `${grievance.id}/${Math.random().toString(36).substring(7)}.${fileExt}`;
          
//           const { error: uploadError } = await supabase.storage
//             .from('grievance-attachments')
//             .upload(fileName, file);

//           if (!uploadError) {
//             const { data: { publicUrl } } = supabase.storage
//               .from('grievance-attachments')
//               .getPublicUrl(fileName);

//             await supabase.from('grievance_files').insert({
//               grievance_id: grievance.id,
//               file_url: publicUrl
//             });
//           }
//         }
//       }

//       navigate("/dashboard/application-status", { state: { 
//         refNumber: refNo,
//         categoryName: categories.find(c => c.id == selectedCategory)?.name
//       } });
//     } catch (err: any) {
//       alert("Submission Error: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100 relative">
//       <h1 className="text-2xl font-black mb-6 text-gray-900 tracking-tight">Submit New Grievance</h1>

//       <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-6">
        
//         {/* Profile Card */}
//         <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div className="space-y-1">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INDoS Number</label>
//             <p className="font-mono font-bold text-blue-600 text-lg">{profile?.indos_number || '---'}</p>
//           </div>
//           <div className="space-y-1">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CDC Number</label>
//             <p className="font-mono font-bold text-blue-600 text-lg">{profile?.cdc_number || '---'}</p>
//           </div>
//           <div className="space-y-1">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
//             <p className="font-bold text-slate-800 truncate">{profile ? `${profile.first_name} ${profile.last_name}` : '---'}</p>
//           </div>
//           <div className="space-y-1">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
//             <p className="font-bold text-slate-800 truncate">{profile?.email || '---'}</p>
//           </div>
//         </div>


//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="flex flex-col gap-2">
//             <label className="text-xs font-bold text-gray-700 uppercase px-1">Category</label>
//             <select
//               className="border-none ring-1 ring-slate-200 p-4 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               required
//             >
//               <option value="">Select Category</option>
//               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//             </select>
//           </div>

//           <div className="flex flex-col gap-2">
//             <label className="text-xs font-bold text-gray-700 uppercase px-1">Sub-Category</label>
//             <select
//               className="border-none ring-1 ring-slate-200 p-4 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 font-medium"
//               disabled={!selectedCategory}
//               value={formData.subCategoryId}
//               onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
//               required
//             >
//               <option value="">Select Sub-category</option>
//               {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//             </select>
//           </div>
//         </div>


//         <div className="flex flex-col gap-2">
//           <label className="text-xs font-bold text-gray-700 uppercase px-1">Detailed Description</label>
//           <textarea
//             rows={5}
//             className="border-none ring-1 ring-slate-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium"
//             placeholder="Provide details about your issue..."
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             required
//           />
//         </div>


//         <div className="space-y-3">
//           <label className="text-xs font-bold text-gray-700 uppercase px-1">Attachments</label>
//           <div className="border-2 border-dashed border-slate-200 p-8 rounded-3xl flex flex-col items-center gap-3 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer relative group">
//             <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
//               <Upload size={20} />
//             </div>
//             <p className="text-sm text-slate-500 font-bold text-center">Click to upload multiple documents</p>
//             <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
//           </div>

//           <div className="flex flex-col gap-2">
//             {files.map((f, index) => (
//               <div key={index} className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
//                 <div className="flex items-center gap-3 truncate">
//                   <FileText size={18} className="text-blue-500" />
//                   <span className="text-sm font-medium text-slate-700 truncate">{f.name}</span>
//                 </div>
//                 <button type="button" onClick={() => removeFile(index)} className="p-1 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         <button type="submit" disabled={!profile} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed">
//           {!profile ? "Loading Profile..." : "Proceed to Confirmation"}
//         </button>
//       </form>


//       {showConfirm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
//           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95">
//             <div className="flex items-center gap-3 text-blue-600 mb-6">
//               <ShieldCheck size={28} />
//               <h3 className="text-2xl font-black tracking-tight">Confirm Submission</h3>
//             </div>
//             <div className="space-y-4 mb-8">
//               <div className="flex justify-between border-b pb-2">
//                 <span className="text-[10px] font-bold text-slate-400 uppercase">Files</span>
//                 <span className="text-sm font-bold">{files.length} Attachments</span>
//               </div>
//               <div className="flex justify-between border-b pb-2">
//                 <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
//                 <span className="text-sm font-bold">{categories.find(c => c.id == selectedCategory)?.name}</span>
//               </div>
//             </div>
//             <div className="flex gap-4">
//               <button onClick={() => setShowConfirm(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-bold text-slate-600">Back</button>
//               <button onClick={handleFinalSubmit} disabled={loading} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold">
//                 {loading ? "Submitting..." : "Confirm & Submit"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }