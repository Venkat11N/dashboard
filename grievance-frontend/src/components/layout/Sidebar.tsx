import { NavLink } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { useGovernance } from '../../core/GovernanceContext';
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, 
  ShieldAlert, FileCheck, Users, Anchor 
} from "lucide-react";

export default function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const { hasModuleAccess, user } = useGovernance();

  return (
    <aside
      className={`bg-slate-900 text-slate-400 h-screen sticky top-0 transition-all duration-300 flex flex-col border-r border-slate-800 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Anchor size={18} className="text-white" />
            </div>
          </div>
        )}
        <button 
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-4">
            Menu
          </p>
        )}
        
        <SidebarLink
          to="/dashboard"
          icon={<LayoutDashboard size={20}/>}
          label="Dashboard"
          collapsed={collapsed}
        />

        {hasModuleAccess('GRIEVANCE') && (
          <SidebarLink
            to="/dashboard/grievances"
            icon={<Users size={20}/>}
            label="Grievances"
            collapsed={collapsed}
          />
        )}
          
        {hasModuleAccess('CRISIS') && (
          <SidebarLink
            to="/dashboard/crisis"
            icon={<ShieldAlert size={20} />}
            label="Crisis Management"
            collapsed={collapsed}
            isCrisis={true}
          />
        )}

        {hasModuleAccess('MTI_COMPLIANCE') && (
          <SidebarLink
            to="/dashboard/compliance"
            icon={<FileCheck size={20} />}
            label="Compliance"
            collapsed={collapsed}
          />
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-full bg-slate-700 flex flex-shrink-0 items-center justify-center text-white font-medium">
            {user.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">{user.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate capitalize">
                {user.actorGroup?.toLowerCase().replace('_', ' ') || 'Guest'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon, label, collapsed, isCrisis = false} : any) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"} // Only exact match for dashboard home
      className={({ isActive }) => `
        flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group mb-1
        ${isActive 
          ? "bg-blue-600 text-white shadow-sm" 
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        }
        ${isCrisis && isActive ? "bg-amber-600" : ""}
      `}
    >
      <div className={`${collapsed ? "mx-auto" : ""}`}>{icon}</div>
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </NavLink>
  );
}