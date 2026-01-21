import DashboardLayout from "../components/layout/DashboardLayout";
import { CURRENT_USER } from "../lib/currentUser";
import { SIDEBAR_ITEMS } from "../config/SidebarMenu";
import { hasModuleAccess } from "../rbac/hasAccess";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const role = CURRENT_USER.role;

  const modules = SIDEBAR_ITEMS.filter(
    (item) => hasModuleAccess(role, item.module)
  );

  return (
    <DashboardLayout>
      <h1 className="text-xl font-semibold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div
            key={module.label}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition"
            onClick={() => navigate(module.path)}
          >
            <h2 className="text-lg font-medium mb-2">
              {module.label}
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Access {module.label} module
            </p>

            <button className="text-blue-600 text-sm font-medium">
              View →
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
