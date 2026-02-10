import { useEffect, useState } from "react";
import { getSubcategories, type Subcategory } from "../../services/CategoryService";

export default function SubcategoryDropdown({ categoryId, onSelect }: { categoryId: number | null, onSelect: (val: string) => void }) {
  const [subs, setSubs] = useState<Subcategory[]>([]);
  const isDisabled = !categoryId;

  useEffect(() => {
    if (categoryId) getSubcategories(categoryId).then(setSubs);
  }, [categoryId]);

  return (
    <div className={`space-y-2 transition-opacity ${isDisabled ? 'opacity-50' : 'opacity-100'}`}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Subcategory</label>
      <select 
        disabled={isDisabled}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-semibold"
      >
        <option value="">{isDisabled ? "Select category first" : "Select subcategory..."}</option>
        {subs.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
    </div>
  );
}