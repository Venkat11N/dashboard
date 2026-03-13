
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, AlertCircle, ArrowRight, Loader2, FileText, RefreshCw } from "lucide-react";


const API_URL = 'https://dashboard-production-a92e.up.railway.app/api';

export default function RecentSubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const fetchRecent = async () => {
    console.log('=== FETCHING GRIEVANCES ===');
    
    // Get token
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    console.log('Token found:', !!token);
    setDebugInfo(`Token: ${token ? 'Found' : 'NOT FOUND'}`);
    
    if (!token) {
      setError('No auth token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/my-grievances?limit=5&_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setDebugInfo(`Status: ${response.status}, Count: ${data.count || 0}`);
      
      if (data.status === 'ok' && data.data) {
        console.log('Setting submissions:', data.data);
        setSubmissions(data.data);
      } else {
        console.log('Unexpected response format:', data);
        setError('Unexpected response format');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
    

    const handleRefresh = () => fetchRecent();
    window.addEventListener('grievanceSubmitted', handleRefresh);
    return () => window.removeEventListener('grievanceSubmitted', handleRefresh);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
      case 'COMPLETED':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return <Clock size={16} className="text-amber-500" />;
      case 'REJECTED':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
      case 'COMPLETED':
        return 'text-green-600';
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'text-amber-600';
      case 'REJECTED':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Recent Submissions</h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRecent}
            className="text-slate-400 hover:text-indigo-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={() => navigate('/dashboard/grievances')}
            className="text-indigo-600 text-xs font-bold uppercase tracking-widest hover:underline"
          >
            View All
          </button>
        </div>
      </div>

   
      <div className="p-2 bg-yellow-50 text-xs text-yellow-800">
        Debug: {debugInfo} | Items: {submissions.length}
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="ml-2 text-slate-400">Loading...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 text-sm">
          {error}
          <button onClick={fetchRecent} className="block mx-auto mt-2 text-indigo-600">
            Retry
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {submissions.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No submissions yet</p>
              <button
                onClick={() => navigate('/dashboard/grievances/new')}
                className="mt-4 text-indigo-600 text-sm font-semibold hover:underline"
              >
                Submit your first grievance
              </button>
            </div>
          ) : (
            submissions.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/dashboard/grievances/${item.id}`)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getStatusIcon(item.status)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {item.subject}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {item.reference_number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <p className={`text-xs font-bold uppercase ${getStatusColor(item.status)}`}>
                    {item.status}
                  </p>
                  <ArrowRight size={14} className="text-slate-300" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}