import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyGrievances, type Grievance } from '../../components/grievance/GrievanceService';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ChevronRight,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';

type GrievanceTableProps = {
  limit?: number;
};

export default function GrievanceTable({ limit }: GrievanceTableProps) {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrievances = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyGrievances(limit);
      setGrievances(data);
    } catch (err: any) {
      console.error('Error fetching grievances:', err);
      setError('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [limit]);

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUBMITTED':
        return {
          icon: <Clock size={14} />,
          label: 'Submitted',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return {
          icon: <Loader2 size={14} className="animate-spin" />,
          label: 'In Progress',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200'
        };
      case 'RESOLVED':
      case 'COMPLETED':
        return {
          icon: <CheckCircle size={14} />,
          label: 'Resolved',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'REJECTED':
      case 'CLOSED':
        return {
          icon: <XCircle size={14} />,
          label: 'Closed',
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-600',
          borderColor: 'border-slate-200'
        };
      case 'PENDING':
        return {
          icon: <AlertCircle size={14} />,
          label: 'Pending',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          icon: <Clock size={14} />,
          label: status || 'Unknown',
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-600',
          borderColor: 'border-slate-200'
        };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
      case 'URGENT':
        return 'bg-red-100 text-red-700';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700';
      case 'LOW':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">Loading grievances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={fetchGrievances}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (grievances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Grievances Yet</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          You haven't submitted any grievances. Click below to file your first complaint.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grievances.map((grievance) => {
        const statusConfig = getStatusConfig(grievance.status);
        
        return (
          <div
            key={grievance.id}
            onClick={() => navigate(`/dashboard/grievances/${grievance.id}`)}
            className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <FileText size={18} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
              

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-slate-800 text-sm">
                    {grievance.reference_number}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                  {grievance.priority && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(grievance.priority)}`}>
                      {grievance.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 font-medium truncate">
                  {grievance.subject}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {grievance.category_name || 'Category'} 
                  {grievance.subcategory_name && ` → ${grievance.subcategory_name}`}
                </p>
              </div>
            </div>
            

            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-slate-600">{formatDate(grievance.created_at)}</p>
                <p className="text-xs text-slate-400">{formatTime(grievance.created_at)}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
}