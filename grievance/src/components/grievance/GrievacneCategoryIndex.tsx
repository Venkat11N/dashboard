import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { CURRENT_USER_ID } from "../../lib/currentUser";

interface Row {
  category: string;
  total: number;
}

export default function GrievanceCategoryChart() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.rpc(
        "grievance_count_by_category",
        { uid: CURRENT_USER_ID }
      );
      if (data) setRows(data);
    }
    load();
  }, []);

  return (
    <div className="bg-white p-6 mt-6 rounded shadow">
      <h2 className="font-semibold mb-4">
        Grievance Category Distribution
      </h2>

      <table className="w-full text-sm">
        <thead className="text-left text-gray-500">
          <tr>
            <th>Category</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.category} className="border-t">
              <td className="py-2">{r.category}</td>
              <td>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
