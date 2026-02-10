import DashboardLayout from "../../components/layout/DashboardLayout";
import GrievanceTable from "../../components/grievance/GrievanceTable";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AllSubmissions() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Grievance History</h1>
              <p className="text-sm text-slate-500 font-medium">Complete record of your submitted applications</p>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          
          <GrievanceTable /> 
        </div>
      </div>
    </DashboardLayout>
  );
}