import { NavLink } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { CURRENT_USER } from "../../lib/currentUser";
import { SIDEBAR_ITEMS } from "../../config/SidebarMenu";
import { hasModuleAccess } from "../../rbac/hasAccess";

export default function Sidebar() {
  const { collapsed } = useSidebar();
  const role = CURRENT_USER.role;

  return (
    <aside
      className={`bg-white border-r h-screen transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 border-b">
        {!collapsed && (
          <>
            <p className="font-semibold">User Profile</p>
            <p className="text-xs text-gray-500">{role}</p>
          </>
        )}
      </div>

      <nav className="p-2 space-y-1 text-sm">
        {SIDEBAR_ITEMS.map((item) => {
          if (!hasModuleAccess(role, item.module)) return null;

          return (
            <div key={item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100"
                  }`
                }
              >
                {!collapsed && item.label}
              </NavLink>

              {!collapsed &&
                item.children?.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      `block ml-4 px-3 py-1 rounded text-xs ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-50"
                      }`
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
