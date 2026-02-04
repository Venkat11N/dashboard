import { NavLink } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { useGovernance } from '../../core/GovernanceContext';
import { ChevronLeft, ChevronRight, LayoutDashboard, ShieldAlert, FileCheck, Anchor, Users } from "lucide-react";



export default function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const { hasModuleAccess, user } = useGovernance();

  return (
    <aside
      className={`bg-slate-900 text-slate-300 h-screen sticky top-0 transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >

      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-950/20">
        {!collapsed && (
          <div className="flex items-center gap-2 animate-in fade-in duration-300">
           
            <span className="font-bold text-white tracking-tighter"></span>
          </div>
        )}
        <button 
          onClick={toggle}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {!collapsed && (
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] px-3 mb-4">
              Main Modules
            </p>
          )}

        
        <SidebarLink
          to="/dashbaord"
          icon={<LayoutDashboard size={20}/>}
          label="Command Center"
          collapsed={collapsed}
        />

        {hasModuleAccess('GRIEVANCE') && (
          <SidebarLink
            to="/dashbaord/grievances"
            icon={<Users size={20}/>}
            label="Grievances"
            collapsed={collapsed}
          />
        )}
          
        {hasModuleAccess('CRISIS') && (
          <SidebarLink
            to="/dashbaord/crisis"
            icon={<ShieldAlert size={20} />}
            label="Crisis Management"
            collapsed={collapsed}
            isCrisis={true}
          />
        )}

        {hasModuleAccess('MTI_COMPLIANCE') && (
          <SidebarLink
            to="/dashbaord/compliance"
            icon={<FileCheck size={20} />}
            label="MTI Compliance"
            collapsed={collapsed}
          />
        )}
      </nav>


      <div className="p-4 bg-slate-950/40 border-t border-slate-800/50">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-blue-800 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="overflow-hidden animate-in slide-in-from-left-2">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-blue-500 font-black">
                {user.actorGroup.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon, label, collapsed, isCrisis = false} : any) {
  const baseClass = "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group mb-1";
  const activeClass = isCrisis
    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
    : "bg-blue-600 text-white shadow-lg shadow-blue-900/20";
  const idleClass = "text-slate-400 hover:bg-slate-800 hover:text-white";

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${baseClass} ${isActive ? activeClass : idleClass}`}
    >
      <div className={`${collapsed ? "mx-auto" : ""}`}>{icon}</div>
      {!collapsed && <span className="text-sm font-semibold tracking-wide">{label}</span>}
      {isCrisis && !collapsed && (
        <span className="ml-auto w-2 h-2 rounded-full bg-amber-500 animate-pulse"/>
      )}
    </NavLink>
  );
}