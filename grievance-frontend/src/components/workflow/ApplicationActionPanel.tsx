import { useGovernance } from "../../core/GovernanceContext";
import { CheckCircle, XCircle, HelpCircle, ShieldAlert } from 'lucide-react';


interface ActionPanelProps {
  applicationId: string;
  currentStatus: string;
  onAction: (action: string, remarks: string) => void;
}

export default function ApplicationActionPanel({ applicationId, currentStatus, onAction}:ActionPanelProps) {
  const { user } = useGovernance();
  const isOfficer = user.actorGroup === 'DGS_OFFICER';

  if (!isOfficer) return null;

  return (
    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 animate-in slide-in-from-right-4">
      <div className="mb-6">
        <h3 className="text-lg font-bold">Process Application</h3>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mt-1">Ref: {applicationId}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() =>onAction('FLAG_CRISIS', 'Escalating to Crisis Workflow')}
          className="flex item-center justify-between p-4 rounded-2xl bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white transition-all group"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} />
            <span className="font-bold text-sm">Flag as Crisis</span>
          </div>
          <span className="text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Escalate</span>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onAction('RAISE_QUERY', '')}
            className="flex-item-center gap-2 p-4 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors text-sm font-bold"
          
          >
            <HelpCircle size={18} className="text-blue-400" />
            Raise Query
          </button>
          
          <button
            onClick={() => onAction('REJECT', '')}
            className="flex items-center gap-2 p-4 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-bold"
          >
            <XCircle size={18} className="text-red-500"/>
            Reject
          </button>
        </div>
        <button
          onClick={() => onAction('APPROVE', 'Final Approval Granted')}
          className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-900/40"
        >
          <CheckCircle size={18} />
          Approve Application
        </button>
      </div>
    </div>
  )
}
