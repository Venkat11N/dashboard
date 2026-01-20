import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardCard from "../../components/ui/DashboardCard";
import { useAuthRole } from "../../hooks/useAuthRole";


export default function Dashboard() {
  const { role, loading } = useAuthRole();

  if (loading) return null;
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {role === "SEAFARER" && (
          <DashboardCard title="Total Grievances" value={12} />
        )}

        {role === "ADMIN" && (
          <>
            <DashboardCard title="Total Grievances" value={120} />
            <DashboardCard title="Pending" value={30} />
            <DashboardCard title="Resolved" value={90} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
