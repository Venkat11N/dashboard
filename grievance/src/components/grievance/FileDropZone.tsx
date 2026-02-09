import { useState, useCallback } from "react";
import { CloudUpload, Paperclip, X } from "lucide-react";

export const FileDropZone = ({ 
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