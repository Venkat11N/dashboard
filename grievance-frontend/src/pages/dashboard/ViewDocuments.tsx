import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { 
  FolderOpen, ArrowLeft, Loader2, AlertCircle, 
  Search, Download, Hash, FileText
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;



export default function ViewDocuments() {
  const navigate = useNavigate();
  
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('accessToken');
  };

  const handleSearch = async () => {
    if (!reference.trim()) {
      setError('Please enter a reference number');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${API_BASE_URL}/grievances/track/${reference.trim()}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.status === 'ok') {
        setResult(response.data.data);
      } else {
        setError('Grievance not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Grievance not found. Please check the reference number.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      setDownloadingId(fileId);
      const token = getAuthToken();
      
      const response = await axios.get(
        `${API_BASE_URL}/files/${fileId}/download`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReset = () => {
    setReference('');
    setResult(null);
    setError(null);
    setSearched(false);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('word') || fileType?.includes('doc')) return '📝';
    return '📎';
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType?.includes('pdf')) return 'PDF';
    if (fileType?.includes('jpeg') || fileType?.includes('jpg')) return 'JPEG';
    if (fileType?.includes('png')) return 'PNG';
    if (fileType?.includes('word') || fileType?.includes('doc')) return 'DOC';
    return fileType?.split('/')[1]?.toUpperCase() || 'FILE';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-6 py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600 rounded-xl">
                  <FolderOpen className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">View Documents</h1>
                  <p className="text-sm text-slate-500">Access documents attached to your grievance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          
          {/* Search Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-8">
              <div className="max-w-xl mx-auto">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Grievance Reference Number
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value.toUpperCase())}
                      placeholder="GRV-2026-XXXXXXX"
                      className="w-full pl-11 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none font-mono text-lg"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-200"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden mb-8">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Not Found</h3>
                <p className="text-slate-500 mb-6">{error}</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-6">
              
              {/* Grievance Info */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{result.subject}</h2>
                    <p className="text-slate-300 text-sm font-mono mt-1">{result.reference_number}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/grievances/${result.grievance_id}`)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={18} className="text-purple-600" />
                    <h3 className="font-semibold text-slate-800">Attached Documents</h3>
                  </div>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {result.files?.length || 0} file(s)
                  </span>
                </div>

                <div className="p-6">
                  {result.files && result.files.length > 0 ? (
                    <div className="space-y-3">
                      {result.files.map((file: any) => (
                        <div 
                          key={file.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{getFileIcon(file.file_type)}</div>
                            <div>
                              <p className="font-medium text-slate-800">{file.file_name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                                  {getFileTypeLabel(file.file_type)}
                                </span>
                                {file.created_at && (
                                  <span className="text-xs text-slate-400">
                                    Uploaded {new Date(file.created_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDownload(file.id, file.file_name)}
                            disabled={downloadingId === file.id}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-sm"
                          >
                            {downloadingId === file.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Download size={16} />
                            )}
                            <span className="text-sm font-semibold">Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">No Documents Found</h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        No documents were attached to this grievance.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result && !error && !loading && !searched && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">View Your Documents</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Enter your grievance reference number above to view and download attached documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}