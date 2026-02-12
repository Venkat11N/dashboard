import { useEffect, useState } from "react";
import { Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function RecentSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      try {
        // 1. Retrieve the token from storage
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setLoading(false);
          return;
        }

        // 2. Fetch the grievances from your Node.js API
        const response = await fetch(`${API_BASE_URL}/my-grievances`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.status === 'ok') {
          // Slice to show only the 5 most recent items
          setSubmissions(result.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch recent submissions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecent();
  }, []);

  const getStatusIcon = (status: string) => {
    // Matching your MySQL ENUM values
    switch (status) {
      case 'RESOLVED': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'IN_PROGRESS': return <Clock size={16} className="text-amber-500" />;
      default: return <AlertCircle size={16} className="text-blue-500" />;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading history...</div>;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Recent Submissions</h3>
        <button className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline">View All</button>
      </div>

      <div className="divide-y divide-slate-50">
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm italic">
            No recent submissions found.
          </div>
        ) : (
          submissions.map((item, index) => (
            <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.subject}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{item.reference_number}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{item.status}</p>
                <ArrowRight size={14} className="text-slate-300 ml-auto" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}