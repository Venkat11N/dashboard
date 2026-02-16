import { TrendingUp, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GrievanceTable from "../grievance/GrievanceTable";



interface RecentGrievancesCardProps {
  limit?: number;
}

export default function RecentGrievancesCard({ limit = 5 }: RecentGrievancesCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600"/>
          <h3 className="font-semibold text-slate-900">Recent Grievances</h3>
        </div>
        <button
          onClick={() => navigate('/dashbaord/grievacnes')}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4"/>
        </button>
      </div>
      <div className="p-6">
        <GrievanceTable limit={limit} />
      </div>
    </div>
  )
}