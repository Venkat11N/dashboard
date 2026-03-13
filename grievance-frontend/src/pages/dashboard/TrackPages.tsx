import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { 
  Search, ArrowLeft, Loader2, AlertCircle, 
  CheckCircle2, Clock, XCircle, FileText,
  ChevronRight, Hash, Calendar, Tag, User
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dashboard-production-a92e.up.railway.app/api';

export default function TrackStatus() {
  const navigate = useNavigate();
  
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('accessToken');
  };

  const handleTrack = async () => {
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

  const handleReset = () => {
    setReference('');
    setResult(null);
    setError(null);
    setSearched(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return { 
          icon: CheckCircle2, 
          color: 'text-green-600', 
          bg: 'bg-green-50 border-green-200',
          badge: 'bg-green-100 text-green-700',
          label: 'Resolved'
        };
      case 'IN_PROGRESS':
        return { 
          icon: Clock, 
          color: 'text-amber-600', 
          bg: 'bg-amber-50 border-amber-200',
          badge: 'bg-amber-100 text-amber-700',
          label: 'In Progress'
        };
      case 'REJECTED':
        return { 
          icon: XCircle, 
          color: 'text-red-600', 
          bg: 'bg-red-50 border-red-200',
          badge: 'bg-red-100 text-red-700',
          label: 'Rejected'
        };
      default:
        return { 
          icon: Clock, 
          color: 'text-blue-600', 
          bg: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
          label: 'Submitted'
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'bg-red-100 text-red-700';
      case 'LOW': return 'bg-green-100 text-green-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const statusConfig = result ? getStatusConfig(result.status) : null;

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
                <div className="p-2.5 bg-indigo-600 rounded-xl">
                  <Search className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Track Grievance</h1>
                  <p className="text-sm text-slate-500">Enter your reference number to check status</p>
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
                      className="w-full pl-11 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none font-mono text-lg"
                      onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    />
                  </div>
                  <button
                    onClick={handleTrack}
                    disabled={loading}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">Track</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Your reference number was provided when you submitted the grievance
                </p>
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
                <h3 className="text-lg font-bold text-slate-800 mb-2">Grievance Not Found</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">{error}</p>
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
          {result && statusConfig && (
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className={`rounded-2xl border p-6 ${statusConfig.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full bg-white shadow-sm`}>
                      <statusConfig.icon className={`w-8 h-8 ${statusConfig.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Current Status</p>
                      <p className={`text-2xl font-bold ${statusConfig.color}`}>{statusConfig.label}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusConfig.badge}`}>
                    {result.status}
                  </span>
                </div>
              </div>

              {/* Grievance Details */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-800">
                  <h2 className="text-lg font-bold text-white">{result.subject}</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    {result.category_name}
                    {result.subcategory_name && ` → ${result.subcategory_name}`}
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Hash size={16} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Reference</p>
                        <p className="font-mono font-semibold text-slate-800 text-sm">
                          {result.reference_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Calendar size={16} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Submitted</p>
                        <p className="font-semibold text-slate-800 text-sm">
                          {new Date(result.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Tag size={16} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Priority</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityColor(result.priority)}`}>
                          {result.priority || 'MEDIUM'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <User size={16} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Applicant</p>
                        <p className="font-semibold text-slate-800 text-sm">
                          {result.first_name} {result.last_name}
                        </p>
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
                        {result.description}
                      </p>
                    </div>
                  </div>

                  {/* Documents */}
                  {result.files && result.files.length > 0 && (
                    <div className="border-t border-slate-100 pt-6 mt-6">
                      <h3 className="font-semibold text-slate-800 mb-3">
                        Attached Documents ({result.files.length})
                      </h3>
                      <div className="space-y-2">
                        {result.files.map((file: any) => (
                          <div 
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">
                                {file.file_type?.includes('pdf') ? '📄' : 
                                 file.file_type?.includes('image') ? '🖼️' : '📎'}
                              </span>
                              <span className="text-sm font-medium text-slate-800">{file.file_name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Full Details Button */}
                  <div className="border-t border-slate-100 pt-6 mt-6">
                    <button
                      onClick={() => navigate(`/dashboard/grievances/${result.grievance_id}`)}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      View Full Details
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Clock size={18} />
                    Status Timeline
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="w-0.5 h-8 bg-slate-200"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Grievance Submitted</p>
                        <p className="text-sm text-slate-500">
                          {new Date(result.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          result.status === 'SUBMITTED' 
                            ? 'bg-blue-500 animate-pulse' 
                            : 'bg-green-500'
                        }`}></div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {statusConfig.label}
                        </p>
                        <p className="text-sm text-slate-500">Current Status</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result && !error && !loading && !searched && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Track Your Grievance</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Enter your grievance reference number above to view the current status and details of your submission.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

