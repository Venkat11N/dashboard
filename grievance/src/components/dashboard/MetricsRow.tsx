import { MessageSquare, AlertTriangle, GraduationCap, UserPlus } from 'lucide-react';
import Sparkline from '../dashboard/Sparkline';

const colorStyles: Record<string, { bg: string; text: string; hex: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", hex: "#3b82f6" },
  red: { bg: "bg-red-50", text: "text-red-600", hex: "#ef4444" },
  green: { bg: "bg-green-50", text: "text-green-600", hex: "#10b981" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", hex: "#a855f7" },
};

const metrics = [
  { label: "Grievances", value: "128", trend: "+12%", icon: MessageSquare, color: "blue", data: [{value: 10}, {value: 15}, {value: 8}, {value: 12}, {value: 20}] },
  { label: "Crisis Alerts", value: "02", trend: "-5%", icon: AlertTriangle, color: "red", data: [{value: 5}, {value: 2}, {value: 4}, {value: 1}, {value: 2}] },
  { label: "Certifications", value: "45", trend: "+18%", icon: GraduationCap, color: "green", data: [{value: 20}, {value: 25}, {value: 30}, {value: 35}, {value: 45}] },
  { label: "Active Recruits", value: "12", trend: "+4%", icon: UserPlus, color: "purple", data: [{value: 8}, {value: 10}, {value: 9}, {value: 11}, {value: 12}] },
];

export default function MetricsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((m) => {
        const style = colorStyles[m.color];
        return (
          <div key={m.label} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
            <div>
              <div className={`p-2.5 rounded-xl ${style.bg} ${style.text} w-fit mb-4 transition-transform group-hover:scale-110`}>
                <m.icon size={22} />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">{m.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{m.value}</h3>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${m.trend.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {m.trend}
                </span>
              </div>
            </div>
            <Sparkline data={m.data} color={style.hex} />
          </div>
        )
      })}
    </div>
  );
}