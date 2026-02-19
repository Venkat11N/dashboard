import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Users, FileText, CheckCircle, Clock, Eye } from "lucide-react"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [recentGrievances, setRecentGrievances] = useState([]); // ✅ New state for list

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch ALL grievances (limit 100 for stats)
        const res = await axios.get(`${API_BASE_URL}/admin/grievances?limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.status === 'ok') {
          const data = res.data.data;
          
          // 1. Calculate Stats
          setStats({
            total: data.length,
            pending: data.filter((g: any) => g.status === 'SUBMITTED' || g.status === 'IN_PROGRESS').length,
            resolved: data.filter((g: any) => g.status === 'RESOLVED').length
          });

          // 2. Set Recent Pending Items (Action Required)
          const pendingItems = data
            .filter((g: any) => g.status === 'SUBMITTED' || g.status === 'IN_PROGRESS')
            .slice(0, 5); // Take top 5
            
          setRecentGrievances(pendingItems);
        }
      } catch (e) { console.error("Dashboard fetch error:", e); }
    };
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bg}`}>
        <Icon size={24} className={color} />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Overview</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Grievances" value={stats.total} icon={FileText} color="text-blue-600" bg="bg-blue-50" />
          <StatCard title="Pending Action" value={stats.pending} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
          <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
        </div>

        {/* Action Required List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Action Required (Pending)</h2>
            <button onClick={() => navigate('/admin/grievances')} className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {recentGrievances.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No pending actions required.</div>
            ) : (
              recentGrievances.map((g: any) => (
                <div key={g.grievance_id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{g.reference_number}</p>
                      <p className="text-xs text-slate-500">{g.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      {g.status}
                    </span>
                    <button 
                      onClick={() => navigate(`/admin/grievances/${g.grievance_id}`)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}