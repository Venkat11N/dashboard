import { useAuthRole } from "../../hooks/useAuthRole";
import { useSidebar } from "../../context/SidebarContext";

export default function Sidebar() {
  const { role, loading } = useAuthRole();
  const { collapsed } = useSidebar();

  if (loading) return null;

  return (
    <aside
      className={`bg-white border-r h-screen transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <nav className="p-4 space-y-4">
        <SidebarItem label="Grievance" collapsed={collapsed} visible />

        {(role === "ORGANIZATION_USER" || role === "ADMIN") && (
          <SidebarItem label="MTI" collapsed={collapsed} visible />
        )}

        {role === "ADMIN" && (
          <>
            <SidebarItem label="Crisis" collapsed={collapsed} visible />
            <SidebarItem label="RPSL" collapsed={collapsed} visible />
          </>
        )}
      </nav>
    </aside>
  );
}

function SidebarItem({
  label,
  collapsed,
  visible,
}: {
  label: string;
  collapsed: boolean;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
      {/* Icon placeholder */}
      <div className="w-6 h-6 bg-gray-400 rounded" />
      {!collapsed && <span className="font-medium">{label}</span>}
    </div>
  );
}
