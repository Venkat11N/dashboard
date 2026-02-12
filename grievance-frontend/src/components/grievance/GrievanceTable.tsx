import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate, Navigate } from 'react-router-dom';
import { API_BASE_URL } from "../../config/api";

export default function GrievanceTable({ limit }: { limit?: number }) {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const Navigate= useNavigate();

  useEffect(() => {
    async function fetchGrievances() {
      try {
        setLoading(true);
        
        // 1. Get the JWT token from storage
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setErrorState("User session not found. Please log in.");
          return;
        }

        // 2. Standard fetch to your Node.js endpoint
        const response = await fetch(`${API_BASE_URL}/my-grievances`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.status === 'ok') {
          // If a limit is provided, slice the array locally
          const data = limit ? result.data.slice(0, limit) : result.data;
          setGrievances(data || []);
        } else {
          setErrorState(result.message || "Failed to fetch grievances.");
        }
      } catch (err: any) {
        console.error("Fetch Logic Error:", err);
        setErrorState("Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    }

    fetchGrievances();
  }, [limit]); // Removed user.id dependency to rely on JWT

  const getStatusStyle = (status: string) => {
    // Matching the ENUM values in your MySQL schema
    switch (status) {
      case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-100';
      case 'SUBMITTED': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (loading) return (
    <div className="p-12 text-center flex flex-col items-center gap-3">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Checking history...</p>
    </div>
  );

  if (errorState) return (
    <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2">
      <AlertTriangle size={24} />
      <p className="text-sm font-medium">{errorState}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ref No.</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Grievance Details</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {grievances.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                No submissions found. Click 'Submit Grievance' to start.
              </td>
            </tr>
          ) : (
            grievances.map((g, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">
                  {g.reference_number}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">{g.subject}</p>
                  <p className="text-[10px] text-gray-400">{new Date(g.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {/* Using category_name alias from your MySQL controller */}
                  {g.category_name || 'General'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(g.status)}`}>
                    {g.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}