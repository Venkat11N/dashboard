
import { Grid3x3, ChevronRight, Search, FolderOpen, LucideIcon } from "lucide-react";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface QuickActionsPanelProps {
  onTrackStatus: () => void;
  onViewDocuments: () => void;
}

export default function QuickActionsPanel({ onTrackStatus, onViewDocuments }: QuickActionsPanelProps) {
  const quickActions: QuickAction[] = [
    {
      label: 'Track Status',
      icon: Search,
      onClick: onTrackStatus
    },
    {
      label: 'View Documents',
      icon: FolderOpen,
      onClick: onViewDocuments
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-900">Quick Actions</h3>
      </div>
      
      <div className="space-y-2">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
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
  );
}