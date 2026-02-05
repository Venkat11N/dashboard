import { supabase } from "../../lib/supabase";
import { useGovernance } from "../../core/GovernanceContext";
import { Clock, CheckCircle2, AlertCircle, ArrowRight} from "lucide-react"
import { useEffect, useState } from "react";


export default function RecentSubmissions() {
  const { user } =useGovernance();
  const [submission, setSubmission] = useState<any>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    async function fetchRecent() {
    if (!user?.indosNumber) return;

    const {data, error} = await supabase
      .from('grievance')
      .select('*')
      .eq('indos_number', user.indosNumber)
      .order('created_at', { ascending: false})
      .limit(5);

    if(!error) setSubmissions(data);
    setLoading(false);
  }
  fetchRecent();
}, [user]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading history...</div>;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-black text-slate-50 flex justify-between items-center">Recent Submissions</h3>
        <button className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline">View All</button>
      </div>

      <div className="divide-y divde-sla">

      </div>
    </div>
  )


}

