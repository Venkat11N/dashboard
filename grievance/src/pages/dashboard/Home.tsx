import DashboardLayout from "../../components/layout/DashboardLayout";
import MetricsRow from "../../components/dashboard/MetricsRow";
import CategoryPieChart from "../../components/charts/CategoryPieChart";
import SubcategoryBarChart from "../../components/charts/SubcategoryBarChart";
import GrievanceTable from "../../components/grievance/GrievanvceTable";
import { CURRENT_USER } from "../../lib/currentUser";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const isAdmin = CURRENT_USER.role === 'ADMIN' || CURRENT_USER.role === 'ORGANIZATION_USER';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isAdmin ? "System Overview" : "My Dashboard"}
            </h1>
            <p className="text-sm text-gray-500">Welcome back, {CURRENT_USER.name}</p>
          </div>
          
          {/* Quick Action for Seafarers */}
          {!isAdmin && (
            <button 
              onClick={() => navigate('/dashboard/submit')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100"
            >
              <PlusCircle size={18} />
              Submit New Grievance
            </button>
          )}
        </header>

        {/* 1. Metric Cards (Useful for everyone) */}
        <MetricsRow />

        {/* 2. Conditional Section */}
        {isAdmin ? (
          /* ADMIN VIEW: Charts & Analytics */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-md font-bold text-gray-700 mb-6">Grievance Distribution</h3>
              <CategoryPieChart />
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-md font-bold text-gray-700 mb-6">Sub-category Trends</h3>
              <SubcategoryBarChart />
            </div>
          </div>
        ) : (
          /* SEAFARER VIEW: Recent Applications Table */
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end px-2">
              <h3 className="text-lg font-bold text-gray-800">My Recent Submissions</h3>
              <button 
                onClick={() => navigate('/dashboard/application-status')}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>
            <GrievanceTable /> {/* Showing only the user's data */}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}