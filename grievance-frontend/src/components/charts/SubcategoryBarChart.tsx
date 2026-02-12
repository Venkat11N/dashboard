import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { API_BASE_URL } from "../../config/api.ts"; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SubcategoryBarChart() {
  const [rows, setRows] = useState<{ subcategory: string; total: number }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(`${API_BASE_URL}/my-grievances`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.status === 'ok' && result.data) {

          const counts: Record<string, number> = {};
          
          result.data.forEach((item: any) => {
            const name = item.subcategory_name || "Unknown";
            counts[name] = (counts[name] || 0) + 1;
          });

          const chartData = Object.entries(counts).map(([subcategory, total]) => ({
            subcategory,
            total
          }));

          setRows(chartData);
        }
      } catch (error) {
        console.error("Failed to load chart data:", error);
      }
    }
    load();
  }, []);

  const labels = rows.map((r) => r.subcategory);
  const values = rows.map((r) => r.total);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="font-semibold mb-4">
        Grievance by Sub-category
      </h2>

      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Count",
              data: values,
              backgroundColor: "#1d4ed8",
            },
          ],
        }}
      />
    </div>
  );
}