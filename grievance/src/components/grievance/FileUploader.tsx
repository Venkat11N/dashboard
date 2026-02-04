import { Paperclip, X } from "lucide-react";
import { useState } from "react";

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Attachments</label>
      <div className="relative group p-8 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3">
        <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:text-blue-600 group-hover:scale-110 transition-all">
          <Paperclip size={20} />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">Click or drag files to upload</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">PDF, JPG, or PNG (Max 5MB per file)</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-600">
              <span className="truncate max-w-[150px]">{f.name}</span>
              <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}