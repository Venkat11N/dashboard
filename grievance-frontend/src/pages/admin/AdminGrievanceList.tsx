import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Eye, Filter, Loader2, AlertCircle } from "lucide-react";
import axios from 'axios';
import { useNavigate } from "react-router-dom"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminGrievanceList() {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchGrievances();
  }, [filter]);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log("Fetching Admin Grievances...")
      const res = await axios.get(`${API_BASE_URL}/admin/grievances?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` } // Removed extra space in token
      });
      if (res.data.status === 'ok') {
       console.log("Admin Data received:", res.data.data.length); 
        setGrievances(res.data.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-slate-800'>All Grievances</h1>
          <div className='flex items-center gap-2'>
            <Filter size={16} className='text-slate-500'/>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className='bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100'
            >
              <option value="ALL">All Status</option> {/* Fixed Typo */}
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className='bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-slate-50 border-b border-slate-200'>
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Reference</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Applicant</th> {/* Fixed Label */}
                  <th className='px-6 py-4 font-semibold text-slate-700'>Subject</th>
                  <th className='px-6 py-4 font-semibold text-slate-700'>Status</th>
                  <th className='px-6 py-4 font-semibold text-slate-700'>Date</th> {/* Added Date Header */}
                  <th className='px-6 py-4 font-semibold text-slate-700'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {grievances.map((g: any) => (
                  
                  <tr key={g.grievance_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-600">{g.reference_number}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">{g.applicant_name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{g.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        g.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                        g.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'}`}>
                          {g.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-slate-500'>{new Date(g.created_at).toLocaleDateString()}</td>
                      <td className='px-6 py-4'>
                        
                        <button
                          onClick={() => navigate(`/admin/grievances/${g.grievance_id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {grievances.length === 0 && (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <AlertCircle className="w-10 h-10 mb-2 text-slate-300"/>
                <p>No grievances found matching filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}