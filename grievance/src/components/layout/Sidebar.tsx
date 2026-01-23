import { NavLink } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { CURRENT_USER } from "../../lib/currentUser";
import { SIDEBAR_ITEMS } from "../../config/SidebarMenu";
import { hasModuleAccess } from "../../rbac/hasAccess";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const role = CURRENT_USER.role;

  return (
    <aside
      className={`bg-slate-900 text-slate-300 h-screen sticky top-0 transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* 1. Header & Toggle */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        {!collapsed && <span className="font-bold text-white tracking-wider">PLATFORM</span>}
        <button 
          onClick={toggle}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* 2. Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {SIDEBAR_ITEMS.map((item) => {
          if (!hasModuleAccess(role, item.module)) return null;

          return (
            <div key={item.label} className="mb-1">
              <NavLink
                to={item.path}
                end={item.path === "/dashboard"} // Ensures Main Dashboard doesn't stay active on sub-pages
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                {item.icon && (
                  <item.icon 
                    size={20} 
                    className={`${collapsed ? "mx-auto" : ""} flex-shrink-0 transition-transform group-hover:scale-110`} 
                  />
                )}
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>

              {/* Child Items (If any) */}
              {!collapsed && item.children && (
                <div className="mt-1 ml-9 space-y-1">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          isActive ? "text-blue-400 font-semibold" : "text-slate-500 hover:text-slate-300"
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 3. Footer / User Profile */}
      <div className="p-4 bg-slate-950/40 border-t border-slate-800">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
            {CURRENT_USER.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{CURRENT_USER.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}