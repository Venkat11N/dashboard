import DashboardLayout from "../../components/layout/DashboardLayout";
import MetricsRow from "../../components/dashboard/MetricsRow";
import CategoryPieChart from "../../components/charts/CategoryPieChart"
import SubcategoryBarChart from "../../components/charts/SubcategoryBarChart"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">System Performance Overview</h2>
          <MetricsRow />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-md font-medium text-gray-600 mb-6">Distribution by Category</h3>
            <CategoryPieChart />
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-md font-medium text-gray-600 mb-6">Monthly Subcategory Analysis</h3>
            <SubcategoryBarChart />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}