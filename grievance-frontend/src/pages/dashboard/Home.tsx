import DashboardLayout from "../../components/layout/DashboardLayout";
import GrievanceTable from "../../components/grievance/GrievanceTable";
import { useGovernance } from "../../core/GovernanceContext";
import { 
  FileText, TrendingUp, ChevronRight, Sparkles, 
  Grid3x3, Search, FolderOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useGovernance();

  // Quick Actions Configuration
  const quickActions = [
    {
      label: 'Track Status',
      icon: Search,
      path: '/dashboard/track'
    },
    {
      label: 'View Documents',
      icon: FolderOpen,
      path: '/dashboard/documents'
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold opacity-90">Maritime Governance Portal</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user.name?.split(" ")[0] || 'User'}!
              </h1>
              <p className="text-lg opacity-90 mb-8 max-w-2xl">
                Your centralized hub for maritime grievance management and resolution tracking.
              </p>
              <button
                onClick={() => navigate('/dashboard/grievances/new')}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Submit New Grievance
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/2 -mb-16 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
          </div>


          {/* Main Content Area */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Grid3x3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(action.path)} // ✅ Use navigate() here
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                        <span className="text-sm font-medium text-slate-700">{action.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-semibold text-slate-900 mb-2">Need Help?</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Our support team responds within 24 hours on working days.
                </p>
                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                  Contact Support
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">Recent Grievances</h3>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/grievances')}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6">
                  <GrievanceTable limit={5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}