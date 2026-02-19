import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ShieldCheck, FileText, ChevronRight, 
  Bold, Italic, List, ListOrdered, X, CloudUpload,
  User, Mail, Hash, CreditCard, Search, Check, ChevronDown,
  AlertCircle, Paperclip
} from "lucide-react";
import { getAllCategories, getSubcategories } from "../../services/CategoryService";
import type { Category, Subcategory } from "../../services/CategoryService";

// TipTap Imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

const CHARACTER_LIMIT = 4000;
const MIN_DESCRIPTION_LENGTH = 10;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// ==========================================
// 1. COMPONENT: RICH TEXT MENU BAR
// ==========================================
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/80">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-400">
          {editor.storage.characterCount.characters()} / {CHARACTER_LIMIT}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 2. COMPONENT: SEARCHABLE DROPDOWN
// ==========================================
type SearchableDropdownProps = {
  items: { id?: number; category_id?: number; subcategory_id?: number; name: string }[];
  selectedItem: any;
  onSelect: (item: any) => void;
  label: string;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  forceOpen?: boolean;
};

const SearchableDropdown = ({ 
  items, selectedItem, onSelect, label, placeholder, disabled = false, loading = false, forceOpen = false
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = searchTerm.length >= 1
    ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;

  useEffect(() => {
    if (forceOpen && !disabled && items.length > 0 && !loading) {
      setIsOpen(true);
      setSearchTerm("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [forceOpen, disabled, items.length, loading]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    onSelect(item);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={wrapperRef} className={`relative space-y-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <label className="block text-sm font-medium text-slate-700">
        {label} <span className="text-red-500 ml-1">*</span>
      </label>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 h-12 rounded-lg border transition-all text-left ${
            selectedItem ? 'border-slate-300 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'
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
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      ) : (
        <div className="border border-slate-300 rounded-lg bg-white shadow-lg overflow-hidden z-50 absolute w-full mt-1">
          <div className="flex items-center gap-2 px-3 h-10 border-b border-slate-100">
            <Search size={14} className="text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="flex-1 outline-none text-sm bg-transparent"
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-3 text-center text-slate-400 text-sm">No results</div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id || item.category_id || item.subcategory_id || Math.random()}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors text-sm hover:bg-slate-50 ${
                    selectedItem?.name === item.name ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                    selectedItem?.name === item.name ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {selectedItem?.name === item.name ? <Check size={12} /> : item.name.charAt(0)}
                  </span>
                  <span className="truncate">{item.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. COMPONENT: FILE DROP ZONE
// ==========================================
const FileDropZone = ({ files, onFilesAdd, onFileRemove }: { files: File[], onFilesAdd: (files: File[]) => void, onFileRemove: (index: number) => void }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false);
    if (e.dataTransfer.files) onFilesAdd(Array.from(e.dataTransfer.files));
  };

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
    return 'file';
  };

  const fileTypeColors: Record<string, string> = {
    image: 'bg-purple-100 text-purple-600',
    pdf: 'bg-red-100 text-red-600',
    file: 'bg-slate-100 text-slate-600'
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer text-center ${
          isDragging ? 'border-slate-400 bg-slate-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <input type="file" multiple onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
        <div className="flex flex-col items-center gap-2">
          <div className={`p-3 rounded-full ${isDragging ? 'bg-slate-200' : 'bg-slate-100'}`}><CloudUpload size={24} className="text-slate-400" /></div>
          <p className="text-sm font-medium text-slate-700">{isDragging ? 'Drop files here' : 'Drag & drop files here'}</p>
          <p className="text-xs text-slate-400">Max 5MB per file</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
              <div className={`p-2 rounded ${fileTypeColors[getFileType(file.name)]}`}><Paperclip size={14} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              </div>
              <button type="button" onClick={() => onFileRemove(index)} className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. MAIN FORM COMPONENT
// ==========================================

export default function GrievanceForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State
  const [profile, setProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [shouldOpenSubcategory, setShouldOpenSubcategory] = useState(false);

  // Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false }),
      Placeholder.configure({ placeholder: 'Provide a detailed description of your grievance...' }),
      CharacterCount.configure({ limit: CHARACTER_LIMIT }),
    ],
    content: '',
    editorProps: { attributes: { class: 'prose prose-slate prose-sm max-w-none focus:outline-none min-h-[180px] p-4 text-slate-700' } },
    onUpdate: ({ editor }) => setDescriptionLength(editor.getText().trim().length),
  });

  // ✅ INITIAL DATA FETCH (Profile & Categories)
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) { navigate('/login'); return; }

      const authHeader = { headers: { Authorization: `Bearer ${token}` } };

      try {
        // 1. Get Profile
        try {
          const profileRes = await axios.get(`${API_BASE_URL}/profile`, authHeader);
          if (profileRes.data.status === 'ok') setProfile(profileRes.data.user);
        } catch { setProfileError(true); }

        // 2. Get Categories
        try {
          const catRes = await getAllCategories();
          setCategories(catRes);
        } catch (e) { console.error("Category fetch error", e); }

      } catch (e) { console.error("Init error", e); }
    };
    initData();
  }, [navigate]);

  // ✅ FETCH SUBCATEGORIES
  useEffect(() => {
    if (!selectedCategory) { setSubcategories([]); return; }
    
    let isMounted = true;
    async function fetchSubs() {
      setSubLoading(true);
      try {
        // Handle ID mismatch (id vs category_id)
        const catId = selectedCategory.id || selectedCategory.category_id;
        const subs = await getSubcategories(catId);
        if (isMounted) {
          setSubcategories(subs);
          if (subs.length > 0) setTimeout(() => isMounted && setShouldOpenSubcategory(true), 150);
        }
      } catch { if (isMounted) setSubcategories([]); } 
      finally { if (isMounted) setSubLoading(false); }
    }
    fetchSubs();
    return () => { isMounted = false; };
  }, [selectedCategory]);

  // HANDLERS
  const handleCategorySelect = (cat: Category | null) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
  };

  const handleFilesAdd = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles.filter(f => f.size <= 5 * 1024 * 1024)]);
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isFormValid = !!profile && !!selectedCategory && !!selectedSubcategory && descriptionLength >= MIN_DESCRIPTION_LENGTH;

  // ✅ FINAL SUBMIT HANDLER
  const handleFinalSubmit = async () => {
    if (!isFormValid) return;
    setLoading(true); setShowConfirm(false);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login');
        return;
      }

      // 🔍 FIX: Ensure we send plain ID numbers, not objects or NaN
      const categoryId = selectedCategory.id || selectedCategory.category_id;
      const subcategoryId = selectedSubcategory.id || selectedSubcategory.subcategory_id;

      // Logic check
      if(!categoryId || !subcategoryId) {
        throw new Error("Invalid Category or Subcategory Selection");
      }

      let response;

      // ✅ Use HTML for rich text
      const desc = editor?.getHTML() || '';

      if (files.length > 0) {
        // 📁 Upload WITH files (FormData)
        const formData = new FormData();
        formData.append('indos_number', profile.indos_number || 'N/A');
        formData.append('first_name', profile.first_name || '');
        formData.append('last_name', profile.last_name || '');
        // Convert numbers to string for FormData
        formData.append('category_id', String(categoryId));
        formData.append('subcategory_id', String(subcategoryId));
        formData.append('description', desc);
        formData.append('priority', 'MEDIUM');
        files.forEach(f => formData.append('files', f));

        response = await axios.post(`${API_BASE_URL}/grievances/upload`, formData, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // 📄 Upload WITHOUT files (JSON)
        const payload = {
          indos_number: profile.indos_number || 'N/A',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          category_id: categoryId,     // Send as number
          subcategory_id: subcategoryId, // Send as number
          description: desc,
          priority: 'MEDIUM'
        };
        
        response = await axios.post(`${API_BASE_URL}/grievances`, payload, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      }

      if (response.data.status === 'ok') {
        window.dispatchEvent(new Event('grievanceSubmitted'));
        navigate("/dashboard/application-status", { 
          state: { 
            refNumber: response.data.data.reference_number,
            categoryName: selectedCategory.name,
            filesUploaded: response.data.data.files_uploaded || 0
          } 
        });
      }
    } catch (err: any) {
      console.error("Submit Error:", err);
      alert("Submission Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-xl shadow-lg">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Submit Grievance</h1>
            <p className="text-slate-500 text-sm">File a new complaint or grievance</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
        {profileError && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
            <AlertCircle size={16} /> Unable to load profile. Please verify your connection.
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          
          {/* 1. Applicant Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-slate-300" size={20} />
                <span className="text-white font-semibold">Applicant Information</span>
              </div>
              <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-full font-medium">
                {profile ? 'Verified' : 'Loading...'}
              </span>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Hash, label: 'INDoS Number', value: profile?.indos_number || 'N/A' },
                { icon: CreditCard, label: 'CDC Number', value: profile?.cdc_number || 'N/A' },
                { icon: User, label: 'Full Name', value: profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...' },
                { icon: Mail, label: 'Email Address', value: profile?.email || 'N/A' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <item.icon size={12} /> <span className="text-[11px] font-medium uppercase">{item.label}</span>
                  </div>
                  <p className="font-semibold text-slate-800 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Classification Card (FIXED Z-INDEX) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative z-20">
            <h2 className="font-semibold text-slate-800 mb-6">Grievance Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative z-30">
                <SearchableDropdown
                  items={categories}
                  selectedItem={selectedCategory}
                  onSelect={handleCategorySelect}
                  label="Category"
                  placeholder="Select category..."
                />
              </div>
              <div className="relative z-20">
                <SearchableDropdown
                  items={subcategories}
                  selectedItem={selectedSubcategory}
                  onSelect={(item) => setSelectedSubcategory(item)}
                  label="Sub-Category"
                  placeholder="Select sub-category..."
                  disabled={!selectedCategory}
                  loading={subLoading}
                  forceOpen={shouldOpenSubcategory}
                />
              </div>
            </div>
          </div>

          {/* 3. Details Card (RICH TEXT EDITOR) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between">
              <h2 className="font-semibold text-slate-800">Grievance Details</h2>
              <span className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle size={12} /> Required</span>
            </div>
            {/* RICH TEXT MENU AND EDITOR */}
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>

          {/* 4. Documents Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Supporting Documents</h2>
            <FileDropZone 
              files={files}
              onFilesAdd={handleFilesAdd}
              onFileRemove={handleFileRemove}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button 
              type="button"
              onClick={() => isFormValid && setShowConfirm(true)}
              disabled={!isFormValid || loading} 
              className={`inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg ${
                isFormValid && !loading ? 'bg-slate-900 text-white cursor-pointer hover:bg-slate-800' : 'bg-slate-300 text-white cursor-not-allowed'
              }`}
            >
              {loading ? 'Processing...' : <>Submit Grievance <ChevronRight size={18} /></>}
            </button>
          </div>
        </form>
      </div>

      {/* Styles for Rich Text */}
      <style>{`
        .ProseMirror { outline: none; min-height: 180px; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #9ca3af; pointer-events: none; height: 0; }
        .ProseMirror ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 1em 0 !important; }
        .ProseMirror ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 1em 0 !important; }
        .ProseMirror li { margin-bottom: 0.5em !important; }
      `}</style>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-slate-100 rounded-full mb-3">
                <ShieldCheck className="text-slate-800" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Confirm Submission</h3>
              <p className="text-slate-500 text-sm">Please verify your details before submitting.</p>
            </div>
            
            <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 text-sm">Category</span>
                <span className="font-semibold text-sm text-slate-800">{selectedCategory?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 text-sm">Sub-Category</span>
                <span className="font-semibold text-sm text-slate-800">{selectedSubcategory?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Attachments</span>
                <span className="font-semibold text-sm text-slate-800">{files.length} file(s)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="py-2.5 rounded-lg font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleFinalSubmit} 
                disabled={loading} 
                className="py-2.5 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}