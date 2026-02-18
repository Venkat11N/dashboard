import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Users, FileText, CheckCircle ,Clock } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  useEffect( () => {
    const fetchStats = async () => {
     try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin/grievacnes?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status === 'ok') {
        const data = res.data.data;
        setStats({
        total: data.length,
        pending: data.filter((g: any) => g.status === 'SUBMITTED' || g.status === 'IN_PROGRESS').length,
        resolved: data.filter((g: any) => g.status === 'RESOLVED' || g.status === 'RESOLVED').length,
        });
      }
     } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bg}`}>
        <Icon size={24} className={color}/>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Overview</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Grievances" value={stats.total} icon={FileText} color="text-blue-600" bg="bg-blue-50"/>
            <StatCard  title="Pending Action" value={stats.resolved} icon={CheckCircle} color="text-green-600" bg="bg-amber-50"/>
            <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="text-green-600" bg="bg-green-50"/>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-800">Action Required</h2>
              <button onClick={() => navigate('/admin/grievances')} className="text-sm text-blue-600 font-medium hover:underline">View All</button>
            </div>
            <div className="text-center py-12 text-slate-500 text-sm">
              Load recent pending grievacnes table here...
            </div>
          </div>
      </div>
    </AdminLayout>
  );
}