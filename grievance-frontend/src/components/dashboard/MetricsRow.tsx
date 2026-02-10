import { MessageSquare, AlertTriangle, FileText, Clock, CheckCircle, Search } from 'lucide-react';
import { useGovernance } from '../../core/GovernanceContext'; //

const colorStyles: Record<string, { bg: string; text: string; hex: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", hex: "#3b82f6" },
  red: { bg: "bg-red-50", text: "text-red-600", hex: "#ef4444" },
  green: { bg: "bg-green-50", text: "text-green-600", hex: "#10b981" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", hex: "#f59e0b" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", hex: "#a855f7" },
};

export default function MetricsRow() {
  const { user } = useGovernance(); //
  const isInternal = user.actorGroup === 'DGS_OFFICER';

  // DIMENSION: Data changes based on Actor Group
  const internalMetrics = [
    { label: "Total Grievances", value: "128", trend: "+12%", icon: MessageSquare, color: "blue" },
    { label: "Active Crisis", value: "02", trend: "-5%", icon: AlertTriangle, color: "red" },
    { label: "Pending Review", value: "45", trend: "+18%", icon: Search, color: "amber" },
    { label: "Resolved Cases", value: "892", trend: "+4%", icon: CheckCircle, color: "green" },
  ];

  const seafarerMetrics = [
    { label: "My Drafts", value: "01", trend: "Latest", icon: FileText, color: "purple" },
    { label: "Under Review", value: "02", trend: "Live", icon: Clock, color: "blue" },
    { label: "Queries Raised", value: "01", trend: "Action Required", icon: AlertTriangle, color: "red" },
    { label: "Resolved", value: "14", trend: "Total", icon: CheckCircle, color: "green" },
  ];

  const activeMetrics = isInternal ? internalMetrics : seafarerMetrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {activeMetrics.map((m) => {
        const style = colorStyles[m.color] || colorStyles.blue;
        return (
          <div key={m.label} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300">
            <div className={`p-3 rounded-2xl ${style.bg} ${style.text} w-fit mb-4 transition-transform group-hover:scale-110 shadow-sm`}>
              <m.icon size={20} />
            </div>
            
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {m.label}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                  {m.value}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                  m.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {m.trend}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}