import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

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

export const SearchableDropdown = ({ 
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