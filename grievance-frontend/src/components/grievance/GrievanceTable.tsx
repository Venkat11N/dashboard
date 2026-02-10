import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Eye, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGovernance } from "../../core/GovernanceContext";

export default function GrievanceTable({ limit }: { limit?: number }) {
  const { user } = useGovernance();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGrievances() {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        const activeUserId = user?.id || session?.user?.id;

        if (!activeUserId) {
          console.warn("No active user ID found for grievance fetch.");

          setTimeout(() => setLoading(false), 3000);
          return;
        }

        console.log("Fetching for UID:", activeUserId);

        let query = supabase
          .from('grievances')
          .select(`
            id,
            reference_number,
            subject,
            status,
            created_at,
            grievance_categories!category_id (name)
          `)
          .eq('user_id', activeUserId)
          .order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Database Error:", error);
          setErrorState(error.message);
        } else {
          setGrievances(data || []);
        }
      } catch (err: any) {
        console.error("Fetch Logic Error:", err);
        setErrorState("Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    }

    fetchGrievances();
  }, [user?.id, limit]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-100';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
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
    <div className="bg-white rounded-3xl overflow-hidden">
      <table className="w-full text-left border-collapse">

        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ref No.</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Grievance Details</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
            {/* <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th> */}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {grievances.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                No submissions found. Click 'Submit Grievance' to start.
              </td>
            </tr>
          ) : (
            grievances.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">
                  {g.reference_number || 'PENDING'}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">{g.subject}</p>
                  <p className="text-[10px] text-gray-400">{new Date(g.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {g.grievance_categories?.name || 'General'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(g.status)}`}>
                    {g.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => navigate(`/dashboard/grievances/${g.id}`)}
                    className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    {/* <Eye size={18} /> */}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}