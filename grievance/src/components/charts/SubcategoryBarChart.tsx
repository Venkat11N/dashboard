import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { supabase } from "../../lib/supabase";
import { CURRENT_USER } from "../../lib/currentUser";

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
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.rpc(
        "grievance_count_by_subcategory",
        { uid: CURRENT_USER.id }
      );
      if (data) setRows(data);
    }
    load();
  }, []);

  const labels = rows.map((r: any) => r.subcategory);
  const values = rows.map((r: any) => r.total);

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
