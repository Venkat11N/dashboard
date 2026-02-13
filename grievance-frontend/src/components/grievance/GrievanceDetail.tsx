import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Clock, 
  User, 
  Tag, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Paperclip,
  Calendar,
  Hash
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface GrievanceFile {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

interface GrievanceDetail {
  id: number;
  grievance_id: number;
  reference_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  indos_number: string;
  first_name: string;
  last_name: string;
  category_id: number;
  subcategory_id: number;
  category_name: string;
  subcategory_name: string;
  files: GrievanceFile[];
}

export default function GrievanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [grievance, setGrievance] = useState<GrievanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);

  useEffect(() => {
    fetchGrievanceDetail();
  }, [id]);

  const fetchGrievanceDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/grievances/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'ok') {
        setGrievance(response.data.data);
      } else {
        setError('Failed to load grievance details');
      }
    } catch (err: any) {
      console.error('Error fetching grievance:', err);
      setError(err.response?.data?.message || 'Failed to load grievance');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      setDownloadingFile(fileId);
      
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_BASE_URL}/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Failed to download file');
    } finally {
      setDownloadingFile(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 'IN_PROGRESS':
        return <Clock className="text-amber-500" size={20} />;
      case 'REJECTED':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-blue-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-700';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700';
      case 'LOW':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('word') || fileType?.includes('doc')) return '📝';
    return '📎';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-slate-600 text-lg">Loading grievance details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Grievance</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!grievance) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Grievance Not Found</h2>
          <p className="text-slate-600 mb-6">The grievance you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard/grievances')}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            View All Grievances
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-800">Grievance Details</h1>
              <p className="text-sm text-slate-500 font-mono">{grievance.reference_number}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(grievance.status)}`}>
              {getStatusIcon(grievance.status)}
              <span className="font-semibold text-sm">{grievance.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* Main Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-800">
            <h2 className="text-lg font-bold text-white">{grievance.subject}</h2>
            <p className="text-slate-300 text-sm mt-1">
              {grievance.category_name}
              {grievance.subcategory_name && (
                <span> → {grievance.subcategory_name}</span>
              )}
            </p>
          </div>

          <div className="p-6">
            {/* Meta Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Hash size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Reference</p>
                  <p className="font-mono font-semibold text-slate-800 text-sm">{grievance.reference_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Calendar size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Submitted</p>
                  <p className="font-semibold text-slate-800 text-sm">
                    {new Date(grievance.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Tag size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Priority</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityColor(grievance.priority)}`}>
                    {grievance.priority || 'MEDIUM'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <User size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">INDOS</p>
                  <p className="font-mono font-semibold text-slate-800 text-sm">{grievance.indos_number}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileText size={16} />
                Description
              </h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {grievance.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Applicant Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <User size={18} />
              Applicant Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Full Name</p>
                <p className="font-semibold text-slate-800">
                  {grievance.first_name} {grievance.last_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">INDOS Number</p>
                <p className="font-mono font-semibold text-slate-800">{grievance.indos_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Submitted On</p>
                <p className="font-semibold text-slate-800">{formatDate(grievance.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attached Documents */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Paperclip size={18} />
              Attached Documents
            </h3>
            <span className="text-sm text-slate-500">
              {grievance.files?.length || 0} file(s)
            </span>
          </div>
          
          <div className="p-6">
            {grievance.files && grievance.files.length > 0 ? (
              <div className="space-y-3">
                {grievance.files.map((file) => (
                  <div 
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.file_type)}</span>
                      <div>
                        <p className="font-medium text-slate-800">{file.file_name}</p>
                        <p className="text-xs text-slate-500">
                          {file.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                          {file.created_at && ` • ${new Date(file.created_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(file.id, file.file_name)}
                      disabled={downloadingFile === file.id}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                      {downloadingFile === file.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      <span className="text-sm font-medium">Download</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Paperclip className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No documents attached</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline / Status History (Optional - for future) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock size={18} />
              Status Timeline
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-0.5 h-12 bg-slate-200"></div>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Grievance Submitted</p>
                <p className="text-sm text-slate-500">{formatDate(grievance.created_at)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  grievance.status === 'SUBMITTED' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                }`}></div>
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {grievance.status === 'SUBMITTED' ? 'Awaiting Review' : grievance.status}
                </p>
                <p className="text-sm text-slate-500">Current Status</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}