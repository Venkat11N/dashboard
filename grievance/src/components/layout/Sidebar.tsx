import { NavLink } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { useGovernance } from '../../core/GovernanceContext';
import { ChevronLeft, ChevronRight, LayoutDashboard, ShieldAlert, FileCheck } from "lucide-react";



export default function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const { hasModuleAccess, user } = useGovernance();

  return (
    <aside
      className={`bg-slate-900 text-slate-300 h-screen sticky top-0 transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >

      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        {!collapsed && <span className="font-bold text-white tracking-wider">GOVERNANCE</span>}
        <button 
          onClick={toggle}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className={`text-[-10px] text-slate-500 uppercase font-bold tracking-widest px-3 mb-4 ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "MOD" : "Functional Modules"}
        </p>

        {hasModuleAccess('GRIEVANCE') && (
          <NavLink to="/dashboard/grievances" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl transition-colors text-sm">
            <LayoutDashboard size={20} className="text-blue-500" />
            {!collapsed && <span>Grievance Mgmt</span>}
          </NavLink>
        )}

        {hasModuleAccess('CRISIS') && (
          <NavLink to="/dashboard/crisis" className="flex items-center gap-3 p-3 bg-amber-900/10 text-amber-500 border border-amber-900/20 rounded-xl transition-coloes text-sm font-semibold">
            <ShieldAlert size={20} />
            {!collapsed && <span>Crisis Mgmt</span>}
          </NavLink>
        )}

        {hasModuleAccess('MTI_COMPLIANCE') && (
          <NavLink to="/dashboard/crisis" className="flex items-center gap-3 p-3 bg-amber-900/10 text-amber-500 border border-amber-900/20 rounded-xl transition-colors text-sm font-semibold">
            <ShieldAlert size={20} />
            {!collapsed && <span>Crisis Mgmt</span>}
          </NavLink>
        )}

        {hasModuleAccess('MTI_COMPLIANCE') && (
          <NavLink to="/dashbaord/compliance" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl transition-colors text-sm">
            <FileCheck size={20} className="text-green-500" />
            {!collapsed && <span>MTI Compliance</span>}
          </NavLink>
        )}
      </nav>


      <div className="p-4 bg-slate-950/40 border-t border-slate-800">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{user.actorGroup}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}