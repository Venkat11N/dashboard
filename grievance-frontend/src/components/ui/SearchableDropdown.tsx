import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

type Props = {
  items: { id: number; name: string }[];
  selectedItem: { id: number; name: string } | null;
  onSelect: (item: any) => void;
  label: string;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  forceOpen?: boolean;
};

export const SearchableDropdown = ({ items, selectedItem, onSelect, label, placeholder, disabled, loading, forceOpen }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    if (forceOpen && !disabled && items.length > 0) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [forceOpen, disabled, items.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative space-y-2 ${disabled ? 'opacity-50' : ''}`}>
      <label className="block text-sm font-medium text-slate-700">{label}*</label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 h-12 rounded-lg border bg-white text-left"
      >
        <span className={selectedItem ? "text-slate-800" : "text-slate-400"}>
          {loading ? "Loading..." : selectedItem?.name || placeholder}
        </span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl overflow-hidden">
          <input
            ref={inputRef}
            className="w-full p-3 border-b outline-none text-sm"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="max-h-60 overflow-y-auto">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => { onSelect(item); setIsOpen(false); }}
                className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm"
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};