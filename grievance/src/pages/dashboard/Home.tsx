import DashboardLayout from "../../components/layout/DashboardLayout";
import MetricsRow from "../../components/dashboard/MetricsRow";
import CategoryPieChart from "../../components/charts/CategoryPieChart";
import SubcategoryBarChart from "../../components/charts/SubcategoryBarChart";
import GrievanceTable from "../../components/grievance/GrievanvceTable";
import ModuleGrid from "../dashboard/ModuleGrid";
import { useGovernance } from "../../core/GovernanceContext"; 
import { PlusCircle, ShieldAlert, Zap, Clock, CheckCircle2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const { user, hasModuleAccess } = useGovernance(); 
  
 
  const isInternal = user.actorGroup === 'DGS_OFFICER';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isInternal ? "Officer Command Center" : "Seafarer Portal"}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {user.organization ? `${user.organization} • ` : ''} 
              Logged in as {user.name}
            </p>
          </div>
{/* 
          {!isInternal && (
            <button 
              onClick={() => navigate('/dashboard/grievances/new')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200"
            >
              <PlusCircle size={18} />
              Submit Grievance
            </button>
          )} */}
        </header>

        
        {hasModuleAccess('CRISIS') && isInternal && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex items-center justify-between text-amber-900 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500 p-2 rounded-xl text-white">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="font-bold leading-tight">Crisis Alerts Active</p>
                <p className="text-xs text-amber-700 font-medium">Internal Note: These override normal processing timelines.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard/crisis')} 
              className="bg-white border border-amber-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-colors"
            >
              View Queue
            </button>
          </div>
        )}


        {/* <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-blue-600" />
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {isInternal ? "System-Wide Performance" : "Personal Tracking Summary"}
            </h2>
          </div>
          <MetricsRow />
        </section> */}

        {isInternal ? (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2">
                <CheckCircle2 size={16} /> Distribution By Category
              </h3>
              <CategoryPieChart />
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2">
                <Clock size={16} /> Resolution Time Analysis
              </h3>
              <SubcategoryBarChart />
            </div>
          </div>
        ) : (

          <div className="space-y-10">
            {/* Historical Progress Metrics */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PersonalProgressCard title=" Tasks" value="2" subtitle="Current Applications" />
              <PersonalProgressCard title="Avg. Resolution" value="5 Days" subtitle="Category specific" />
              <PersonalProgressCard title="Success Rate" value="92%" subtitle="Traceable closures" />
            </div> */}


            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Application Portal</h2>
                <div className="group relative">
                  <Info size={14} className="text-slate-300 cursor-help" />
                  <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl leading-relaxed">
                    Submit all concerns here. A Nodal Officer will categorize urgent cases as "Crisis".
                  </div>
                </div>
              </div>
              
              <ModuleGrid />
            </section>


            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-end px-2">
                <h3 className="text-lg font-bold text-gray-800">Recent Submissions</h3>
                <button
                  onClick={() => navigate('/dashboard/application-status')}
                  className="text-sm font-bold text-blue-600 hover:underline"
                >
                  View Full History
                </button>
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <GrievanceTable />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function PersonalProgressCard({ title, value, subtitle }: { title: string, value: string, subtitle: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-blue-400 transition-colors">{title}</p>
      <p className="text-5xl font-black text-slate-900 mb-1 tracking-tighter group-hover:text-blue-600 transition-colors">{value}</p>
      <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
    </div>
  );
}