import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { ArrowLeft, Save, Loader2, Download, FileText, User, History, MessageSquare } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dashboard-production-a92e.up.railway.app/api';

export default function AdminGrievanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [grievance, setGrievance] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]); // ✅ New state
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState(''); // ✅ New state
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. Fetch Details
      const res = await axios.get(`${API_BASE_URL}/admin/grievances/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.status === 'ok') {
        setGrievance(res.data.data);
        setStatus(res.data.data.status);
      }

      // 2. Fetch History
      const histRes = await axios.get(`${API_BASE_URL}/admin/grievances/${id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (histRes.data.status === 'ok') {
        setTimeline(histRes.data.data);
      }

    } catch (e: any) { 
      console.error(e);
      if (e.response?.status === 401) navigate('/login'); 
    } 
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if(!remarks.trim()) {
      alert("Please enter remarks before updating status.");
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admin/grievances/${id}/status`, 
        { status, remarks }, // ✅ Sending remarks
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRemarks(""); // Clear input
      fetchData(); // Refresh data to show new timeline entry
      alert("Status updated successfully!");
    } catch (e) { alert("Failed to update"); }
    finally { setUpdating(false); }
  };

  if (loading) return <AdminLayout><div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div></AdminLayout>;
  if (!grievance) return <AdminLayout><div className="p-8 text-center text-red-500">Grievance Not Found</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - DETAILS (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
            <ArrowLeft size={18} /> Back
          </button>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-slate-800">{grievance.reference_number}</h1>
                <p className="text-xs text-slate-500 mt-1">Submitted: {new Date(grievance.created_at).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                grievance.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 
                grievance.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {grievance.status}
              </span>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Applicant Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Applicant</label><p className="font-semibold">{grievance.applicant_name}</p></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">INDOS</label><p className="font-mono">{grievance.indos_number}</p></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Contact</label><p>{grievance.applicant_phone}</p></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">CDC</label><p className="font-mono">{grievance.cdc_number}</p></div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                <div className="mt-2 p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap border border-slate-100" dangerouslySetInnerHTML={{ __html: grievance.description }} />
              </div>

              {/* Files */}
              {grievance.files?.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Attachments</label>
                  <div className="grid gap-2">
                    {grievance.files.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <FileText className="text-blue-500" size={20} />
                          <span className="text-sm font-medium">{file.file_name}</span>
                        </div>
                        <a href={`${API_BASE_URL}/files/${file.id}/download`} className="p-2 text-slate-400 hover:text-blue-600"><Download size={18} /></a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - ACTIONS & HISTORY (1/3 width) */}
        <div className="space-y-6 lg:mt-12">
          
          {/* Action Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} /> Update Status
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">New Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Remarks (Required)</label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter reason for update..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 text-sm"
                />
              </div>

              <button 
                onClick={handleUpdate} 
                disabled={updating} 
                className="w-full flex justify-center items-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update
              </button>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <History size={18} /> Processing History
            </h3>
            
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
              {/* Initial Submission */}
              <div className="ml-6 relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                <p className="text-sm font-semibold text-slate-800">Grievance Submitted</p>
                <p className="text-xs text-slate-500">{new Date(grievance.created_at).toLocaleString()}</p>
              </div>

              {/* History Items */}
              {timeline.map((item: any) => (
                <div key={item.history_id} className="ml-6 relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-slate-400"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">
                      Changed to <span className="uppercase">{item.new_status}</span>
                    </span>
                    <span className="text-xs text-slate-500 mb-1">
                      by {item.action_by_name} • {new Date(item.created_at).toLocaleString()}
                    </span>
                    <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 border border-slate-100 flex gap-2">
                      <MessageSquare size={12} className="shrink-0 mt-0.5" />
                      {item.remarks}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}