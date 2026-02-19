import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminGrievanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/grievances/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'ok') {
          setGrievance(res.data.data);
          setStatus(res.data.data.status);
        }
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admin/grievances/${id}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Status updated successfully!");
    } catch (e) { alert("Failed to update"); }
    finally { setUpdating(false); }
  };

  if (loading) return <AdminLayout><div className="p-8 text-center">Loading...</div></AdminLayout>;
  if (!grievance) return <AdminLayout><div className="p-8 text-center">Not Found</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800">{grievance.reference_number}</h1>
            <span className="text-sm text-slate-500">{new Date(grievance.created_at).toLocaleString()}</span>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Subject</label>
                <p className="font-semibold text-slate-800">{grievance.subject}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Applicant</label>
                <p className="font-semibold text-slate-800">{grievance.first_name} {grievance.last_name}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
              <div className="mt-2 p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap">
                {grievance.description}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-bold text-slate-800 mb-4">Update Status</h3>
              <div className="flex items-center gap-4">
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <button 
                  onClick={handleUpdate}
                  disabled={updating}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}