import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { supabase } from "../../lib/supabase";
import { CURRENT_USER } from "../../lib/currentUser";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.rpc(
        "grievance_count_by_category",
        { uid: CURRENT_USER.id }
      );
      if (data) setRows(data);
    }
    load();
  }, []);

  const labels = rows.map((r: any) => r.category);
  const values = rows.map((r: any) => r.total);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="font-semibold mb-4">
        Grievance by Category
      </h2>

      <Pie
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: ["#1d4ed8", "#9333ea", "#16a34a", "#dc2626"],
            },
          ],
        }}
      />
    </div>
  );
}
