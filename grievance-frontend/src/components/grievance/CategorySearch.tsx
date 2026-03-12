import { useEffect, useState, useRef } from "react";
import { getAllCategories, type Category } from "../../services/CategoryService";
import { Search, ChevronDown } from "lucide-react";

export default function CategorySearch({ onSelect }: { onSelect: (cat: Category) => void }) {
  const [input, setInput] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllCategories().then(setCategories);
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (cat: Category) => {
    setInput(cat.name);
    setIsOpen(false);
    onSelect(cat);
  };

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
      <div className="relative">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setFiltered(categories.filter(c => c.name.toLowerCase().includes(e.target.value.toLowerCase())));
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          placeholder="Search category..."
          className="w-full p-4 pr-12 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-semibold"
        />
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-auto p-2">
          {filtered.map(cat => (
            <li 
              key={cat.id} 
              onClick={() => handleSelect(cat)}
              className="p-3 hover:bg-blue-50 rounded-xl cursor-pointer text-sm font-medium text-slate-700 transition-colors"
            >
              {cat.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}