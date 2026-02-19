import { AlertCircle } from "lucide-react";

export default function DescriptionEditor({ description, onDescriptionChange }: any) {
  const charLimit = 4000;
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
      <div className="flex justify-between items-center mb-2">
        <label className="font-semibold text-slate-800">Grievance Description</label>
        <span className={`text-xs font-bold ${description.length > charLimit ? 'text-red-500' : 'text-slate-400'}`}>
          {description.length} / {charLimit}
        </span>
      </div>

      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        rows={8}
        placeholder="Please provide full details of your concern..."
        className="w-full p-5 rounded-3xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium leading-relaxed"
      />
      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium italic">
        <AlertCircle size={14} />
        Required field. Be as specific as possible.
      </div>
    </div>
  );
}