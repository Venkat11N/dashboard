import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Eye, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function GrievanceTable() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrievances() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('grievances')
        .select(`
          id,
          reference_number,
          subject,
          status,
          created_at,
          grievance_categories (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setGrievances(data);
      setLoading(false);
    }
    fetchGrievances();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-100';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading grievances...</div>;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Reference No.</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {grievances.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No grievances submitted yet.</td>
            </tr>
          ) : (
            grievances.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">{g.reference_number}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{g.subject}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{g.grievance_categories?.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(g.status)}`}>
                    {g.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye size={18} />
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