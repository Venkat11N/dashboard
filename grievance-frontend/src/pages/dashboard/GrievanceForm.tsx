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

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

const CHARACTER_LIMIT = 4000;
const MIN_DESCRIPTION_LENGTH = 10;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============ RICH TEXT TOOLBAR ============
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const buttons = [
    { action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), icon: Bold, label: 'Bold' },
    { action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), icon: Italic, label: 'Italic' },
    { action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), icon: List, label: 'Bullet List' },
    { action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), icon: ListOrdered, label: 'Ordered List' },
  ];

  const characterCount = editor.storage.characterCount?.characters() || 0;
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
  forceOpen?: boolean;
};

const SearchableDropdown = ({ 
  items, 
  selectedItem, 
  onSelect, 
  label, 
  placeholder,
  disabled = false,
  loading = false,
  forceOpen = false
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

  // Handle force open from parent
  useEffect(() => {
    if (forceOpen && !disabled && items.length > 0 && !loading) {
      setIsOpen(true);
      setSearchTerm("");
      
      // Focus input after dropdown opens
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [forceOpen, disabled, items.length, loading]);

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

  // Reset highlight when filtered items change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredItems.length]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0 && listRef.current.children[highlightedIndex]) {
      const highlighted = listRef.current.children[highlightedIndex] as HTMLElement;
      highlighted.scrollIntoView({ block: "nearest" });
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
        <div className="flex items-center gap-3 px-4 h-12 rounded-lg border border-slate-200 bg-slate-50">
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
        <div className="border border-slate-300 rounded-lg bg-white shadow-lg overflow-hidden z-50 relative">
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
  const [profileError, setProfileError] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [shouldOpenSubcategory, setShouldOpenSubcategory] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(0);

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
      const text = editor.getText();
      setDescriptionLength(text.trim().length);
    },
  });

  // Sync description length when editor is ready
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setDescriptionLength(text.trim().length);
    }
  }, [editor]);

  // Fetch user profile on mount
  useEffect(() => {
    async function prepareForm() {
      try {
        const storedProfile = sessionStorage.getItem('userProfile') || localStorage.getItem('userProfile');
        
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile(parsedProfile);
        } else {
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          
          if (token) {
            try {
              const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (profileResponse.data.success) {
                const userProfile = profileResponse.data.data;
                setProfile(userProfile);
                sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              setProfileError(true);
              setProfile({
                indos_number: 'DEMO123456',
                cdc_number: 'CDC789012',
                first_name: 'Demo',
                last_name: 'User',
                email: 'demo@example.com'
              });
            }
          } else {
            console.warn('No auth token found, using demo profile');
            setProfile({
              indos_number: 'DEMO123456',
              cdc_number: 'CDC789012',
              first_name: 'Demo',
              last_name: 'User',
              email: 'demo@example.com'
            });
          }
        }

        const cats = await getAllCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error in form preparation:', error);
        setProfile({
          indos_number: 'DEMO123456',
          cdc_number: 'CDC789012',
          first_name: 'Demo',
          last_name: 'User',
          email: 'demo@example.com'
        });
      }
    }
    prepareForm();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      setShouldOpenSubcategory(false);
      return;
    }
    
    let isMounted = true;
    
    async function fetchSubcategories() {
      setSubLoading(true);
      setShouldOpenSubcategory(false);
      
      try {
        const subs = await getSubcategories(selectedCategory.id);
        
        if (isMounted) {
          setSubcategories(subs);
          
          // Trigger auto-open after a delay
          if (subs.length > 0) {
            setTimeout(() => {
              if (isMounted) {
                setShouldOpenSubcategory(true);
              }
            }, 150);
          }
        }
      } catch (error) {
        console.error("Subcategory fetch error:", error);
        if (isMounted) {
          setSubcategories([]);
        }
      } finally {
        if (isMounted) {
          setSubLoading(false);
        }
      }
    }
    
    fetchSubcategories();
    
    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const handleCategorySelect = (category: Category | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSubcategories([]);
    setShouldOpenSubcategory(false);
  };

  const handleSubcategorySelect = (subcategory: Subcategory | null) => {
    setSelectedSubcategory(subcategory);
    setShouldOpenSubcategory(false);
  };

  const handleFilesAdd = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.size <= 5 * 1024 * 1024);
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Check form validity
  const checkFormValidity = (): boolean => {
    const hasProfile = !!profile;
    const hasCategory = !!selectedCategory;
    const hasSubcategory = !!selectedSubcategory;
    const hasDescription = descriptionLength >= MIN_DESCRIPTION_LENGTH;
    
    return hasProfile && hasCategory && hasSubcategory && hasDescription;
  };

  const isFormValid = checkFormValidity();

  // Handle submit button click
  const handleSubmitClick = () => {
    if (isFormValid) {
      setShowConfirm(true);
    }
  };



const handleFinalSubmit = async () => {
  if (!profile || !editor || !selectedCategory || !selectedSubcategory) return;
  
  setLoading(true);
  setShowConfirm(false);

  console.log('=== SUBMITTING GRIEVANCE ===');
  console.log('Selected Category:', selectedCategory);
  console.log('Selected Subcategory:', selectedSubcategory);

  try {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') || 
                  sessionStorage.getItem('token');

    if (!token) {
      alert('You are not logged in. Please login again.');
      navigate('/login');
      return;
    }

    // ✅ FIX: Get the correct ID field
    const categoryId = selectedCategory.id || selectedCategory.category_id;
    const subcategoryId = selectedSubcategory.id || selectedSubcategory.subcategory_id;

    console.log('Category ID:', categoryId);
    console.log('Subcategory ID:', subcategoryId);

    let response;

    if (files.length > 0) {
      console.log('Submitting with files:', files.length);
      
      const formData = new FormData();
      formData.append('indos_number', profile.indos_number || 'N/A');
      formData.append('first_name', profile.first_name || '');
      formData.append('last_name', profile.last_name || '');
      formData.append('category_id', categoryId?.toString() || '');  // ✅ Fixed
      formData.append('subcategory_id', subcategoryId?.toString() || '');  // ✅ Fixed
      formData.append('description', editor.getText());
      formData.append('priority', 'MEDIUM');

      files.forEach((file) => {
        formData.append('files', file);
      });

      response = await axios.post(`${API_BASE_URL}/grievances/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      console.log('Submitting without files');
      
      const payload = {
        indos_number: profile.indos_number || 'N/A',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        category_id: categoryId,  // ✅ Fixed
        subcategory_id: subcategoryId,  // ✅ Fixed
        description: editor.getText(),
        priority: 'MEDIUM'
      };

      response = await axios.post(`${API_BASE_URL}/grievances`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Response:', response.data);

    if (response.data.status === 'ok') {
      const refNumber = response.data.data.reference_number;
      
      console.log('✅ Success! Reference:', refNumber);
      
      window.dispatchEvent(new Event('grievanceSubmitted'));
      
      navigate("/dashboard/application-status", { 
        state: { 
          refNumber: refNumber,
          categoryName: selectedCategory.name,
          filesUploaded: response.data.data.files_uploaded || 0
        } 
      });
    } else {
      throw new Error(response.data.message || 'Submission failed');
    }
  } catch (err: any) {
    console.error('❌ Submission error:', err);
    alert('Submission Error: ' + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};

  const validationStatus = {
    profile: !!profile,
    category: !!selectedCategory,
    subcategory: !!selectedSubcategory,
    description: descriptionLength >= MIN_DESCRIPTION_LENGTH
  };

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
        {profileError && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <AlertCircle size={16} />
              Using demo profile. Some features may be limited.
            </p>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          
          {/* Applicant Information */}
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
                  forceOpen={shouldOpenSubcategory}
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
                <p className="text-sm text-slate-500 mt-0.5">
                  Provide a comprehensive description (min {MIN_DESCRIPTION_LENGTH} characters)
                  {descriptionLength > 0 && (
                    <span className={descriptionLength >= MIN_DESCRIPTION_LENGTH ? 'text-green-600' : 'text-amber-600'}>
                      {' '}— {descriptionLength} entered
                    </span>
                  )}
                </p>
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
            
            {editor && (editor.storage.characterCount?.characters() || 0) >= CHARACTER_LIMIT * 0.9 && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-200">
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {(editor.storage.characterCount?.characters() || 0) >= CHARACTER_LIMIT 
                    ? 'Character limit reached' 
                    : `Approaching character limit (${CHARACTER_LIMIT - (editor.storage.characterCount?.characters() || 0)} remaining)`
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
              type="button"
              onClick={handleSubmitClick}
              disabled={!isFormValid || loading} 
              className={`inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg ${
                isFormValid && !loading
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200 cursor-pointer'
                  : 'bg-slate-300 text-white shadow-none cursor-not-allowed'
              }`}
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
                    {descriptionLength} / {CHARACTER_LIMIT} characters
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