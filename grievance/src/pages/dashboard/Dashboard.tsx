import DashboardLayout from "../../components/layout/DashboardLayout";
import MetricsRow from "../../components/dashboard/MetricsRow";
import CategoryPieChart from "../../components/charts/CategoryPieChart"
import SubcategoryBarChart from "../../components/charts/SubCategoryBarChart"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <MetricsRow />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <CategoryPieChart />
        <SubcategoryBarChart/>

      </div>
    </DashboardLayout>
  )
}